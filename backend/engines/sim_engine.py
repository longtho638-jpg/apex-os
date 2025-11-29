import asyncio
import uuid
from backend.core.event_bus import event_bus

async def simulate_trading():
    print("[Trading Engine] Simulating incoming orders...")

    # Case 1: Valid Order
    order_id_1 = str(uuid.uuid4())
    event_bus.publish(
        event_type="TRADE_REQUEST",
        source="trading_engine",
        payload={
            "order_id": order_id_1,
            "user_id": "user_123",
            "symbol": "BTC/USD",
            "amount": 5000,
            "side": "buy"
        }
    )
    print(f"[Trading Engine] Sent Order {order_id_1} (5000 USD)")

    # Case 2: High Risk Order
    order_id_2 = str(uuid.uuid4())
    event_bus.publish(
        event_type="TRADE_REQUEST",
        source="trading_engine",
        payload={
            "order_id": order_id_2,
            "user_id": "user_999",
            "symbol": "ETH/USD",
            "amount": 50000, # Exceeds limit
            "side": "sell"
        }
    )
    print(f"[Trading Engine] Sent Order {order_id_2} (50000 USD)")

    # Listen for results (Mocking the engine listening back)
    print("[Trading Engine] Waiting for Risk Checks...")
    
    # We use a simple loop here just to show it receiving events
    # In reality, this would be another subscribe_loop
    await event_bus.subscribe_loop("RISK_CHECK_RESULT", handle_risk_result)

async def handle_risk_result(event):
    payload = event.get('payload', {})
    status = payload.get('status')
    reason = payload.get('reason', '')
    print(f"[Trading Engine] Received Risk Result: {status} {reason}")

if __name__ == "__main__":
    try:
        asyncio.run(simulate_trading())
    except KeyboardInterrupt:
        pass
