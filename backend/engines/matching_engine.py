import asyncio
import json
from datetime import datetime
from backend.core.event_bus import event_bus

class MatchingEngine:
    def __init__(self):
        self.name = "matching_engine"

    async def start(self):
        print(f"[{self.name}] Started. Listening for RISK_CHECK_RESULT...")
        await event_bus.subscribe_loop("RISK_CHECK_RESULT", self.process_order)

    async def process_order(self, event):
        payload = event.get('payload', {})
        status = payload.get('status')
        order_id = payload.get('order_id')

        if not order_id:
            print(f"[{self.name}] Error: Missing order_id in event")
            return

        if status == 'REJECTED':
            print(f"[{self.name}] Order {order_id} Rejected by Risk. Updating DB...")
            event_bus.client.table('orders').update({'status': 'rejected'}).eq('id', order_id).execute()
            return

        # Fetch Order Details
        response = event_bus.client.table('orders').select('*').eq('id', order_id).execute()
        if not response.data:
            print(f"[{self.name}] Error: Order {order_id} not found in DB")
            return
        
        order = response.data[0]
        order_type = order['type']
        price = float(order['price']) if order['price'] else 0
        quantity = float(order['quantity'])

        print(f"[{self.name}] Processing {order_type.upper()} Order {order_id}...")

        # SIMULATION LOGIC
        if order_type == 'market':
            # Instant Fill
            fill_price = 95000.0 if order['symbol'] == 'BTC/USDT' else 100.0 # Mock Price
            self.execute_trade(order, fill_price, quantity)
        
        elif order_type == 'limit':
            # Place in Book (Open)
            # In simulation, we assume if Price matches current market, we fill.
            # For now, just mark as OPEN.
            event_bus.client.table('orders').update({'status': 'open'}).eq('id', order_id).execute()
            print(f"[{self.name}] Limit Order {order_id} is OPEN.")

        elif order_type in ['stop_loss', 'stop_limit']:
            # Mark as Open (Active Watch)
            event_bus.client.table('orders').update({'status': 'open'}).eq('id', order_id).execute()
            print(f"[{self.name}] Stop Order {order_id} is WATCHING.")

    def execute_trade(self, order, price, quantity):
        try:
            # 1. Create Trade Record
            event_bus.client.table('trades').insert({
                'order_id': order['id'],
                'user_id': order['user_id'],
                'symbol': order['symbol'],
                'side': order['side'],
                'price': price,
                'quantity': quantity,
                'fee': quantity * price * 0.001, # 0.1% fee
                'fee_currency': 'USDT'
            }).execute()

            # 2. Update Order Status
            event_bus.client.table('orders').update({
                'status': 'filled',
                'filled_quantity': quantity,
                'average_fill_price': price,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', order['id']).execute()

            print(f"[{self.name}] Order {order['id']} FILLED at {price}")
            
            # 3. Publish Event
            event_bus.publish("ORDER_FILLED", self.name, {
                "order_id": order['id'],
                "price": price,
                "quantity": quantity
            })

        except Exception as e:
            print(f"[{self.name}] Execution Error: {e}")

if __name__ == "__main__":
    engine = MatchingEngine()
    try:
        asyncio.run(engine.start())
    except KeyboardInterrupt:
        print("Matching Engine Stopped")