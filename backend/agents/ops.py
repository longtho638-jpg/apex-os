import asyncio
from backend.core.event_bus import event_bus

class OpsAgent:
    def __init__(self):
        self.name = "ops_agent"
        self.auto_approve_limit = 1000.0 # USD

    async def start(self):
        print(f"[{self.name}] Started. Listening for WITHDRAWAL_REQUEST...")
        await event_bus.subscribe_loop("WITHDRAWAL_REQUEST", self.handle_withdrawal)

    async def handle_withdrawal(self, event):
        payload = event.get('payload', {})
        amount = float(payload.get('amount', 0))
        withdrawal_id = payload.get('withdrawal_id')
        
        print(f"[{self.name}] Processing Withdrawal {withdrawal_id}: {amount} USDT")

        if amount < self.auto_approve_limit:
            print(f"[{self.name}] ✅ AUTO-APPROVING Withdrawal {withdrawal_id}")
            
            # 1. Update DB (via Supabase Client in EventBus or new client)
            # For simplicity, we assume EventBus client is accessible or we use a dedicated Service
            try:
                event_bus.client.table('withdrawals').update({
                    'status': 'approved',
                    'approved_at': 'NOW()' # Let Postgres handle timestamp or use isoformat
                }).eq('id', withdrawal_id).execute()

                # 2. Publish Result
                event_bus.publish("WITHDRAWAL_APPROVED", self.name, { "withdrawal_id": withdrawal_id })

            except Exception as e:
                print(f"[{self.name}] Database Error: {e}")
                # Publish failure?
        else:
            print(f"[{self.name}] ⚠️ FLAGGED for Manual Review (Amount > {self.auto_approve_limit})")
            event_bus.publish("WITHDRAWAL_MANUAL_REVIEW", self.name, { "withdrawal_id": withdrawal_id })

if __name__ == "__main__":
    agent = OpsAgent()
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        print("Ops Agent Stopped")
