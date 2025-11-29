import asyncio
from backend.core.event_bus import event_bus

class GuardianAgent:
    def __init__(self):
        self.name = "guardian_agent"
        self.max_order_size = 10000.0 # USD

    async def start(self):
        print(f"[{self.name}] Started. Listening for TRADE_REQUEST...")
        await event_bus.subscribe_loop("TRADE_REQUEST", self.handle_trade_request)

    async def handle_trade_request(self, event):
        payload = event.get('payload', {})
        amount = float(payload.get('amount', 0))
        user_id = payload.get('user_id')
        order_id = payload.get('order_id')
        
        print(f"[{self.name}] Analyzing Trade: Order {order_id}, User {user_id}, Amount {amount}")

        # Risk Logic
        if amount > self.max_order_size:
            reason = f"Amount {amount} exceeds max limit {self.max_order_size}"
            print(f"[{self.name}] ❌ BLOCKED: {reason}")
            
            event_bus.publish(
                event_type="RISK_CHECK_RESULT",
                source=self.name,
                payload={
                    "original_event_id": event['id'],
                    "order_id": order_id,
                    "status": "REJECTED",
                    "reason": reason
                }
            )
        else:
            print(f"[{self.name}] ✅ APPROVED")
            event_bus.publish(
                event_type="RISK_CHECK_RESULT",
                source=self.name,
                payload={
                    "original_event_id": event['id'],
                    "order_id": order_id,
                    "status": "APPROVED"
                }
            )

if __name__ == "__main__":
    # Test Run
    agent = GuardianAgent()
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        print("Guardian Stopped")