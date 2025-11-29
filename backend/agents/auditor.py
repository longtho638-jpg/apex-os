import asyncio
import random
from backend.core.event_bus import event_bus

class AuditorAgent:
    def __init__(self):
        self.name = "auditor_agent"

    async def start(self):
        print(f"[{self.name}] Started. Listening for WITHDRAWAL_APPROVED...")
        await event_bus.subscribe_loop("WITHDRAWAL_APPROVED", self.reconcile_withdrawal)

    async def reconcile_withdrawal(self, event):
        payload = event.get('payload', {})
        withdrawal_id = payload.get('withdrawal_id')
        
        print(f"[{self.name}] Reconciling Withdrawal {withdrawal_id}...")

        # 1. Fetch Withdrawal Details from DB
        response = event_bus.client.table('withdrawals').select('*').eq('id', withdrawal_id).execute()
        if not response.data:
            print(f"[{self.name}] Error: Withdrawal not found")
            return

        withdrawal = response.data[0]
        amount = float(withdrawal['amount'])

        # 2. Simulate External Check (e.g. Etherscan or Bank API)
        # In reality, we would check if the Tx Hash exists and matches amount
        external_verified = self.mock_external_verification(amount)

        if external_verified:
            print(f"[{self.name}] ✅ Reconciliation PASSED.")
            event_bus.publish("RECONCILIATION_SUCCESS", self.name, { "withdrawal_id": withdrawal_id })
        else:
            print(f"[{self.name}] 🚨 DISCREPANCY DETECTED!")
            event_bus.publish("RECONCILIATION_ALERT", self.name, { 
                "withdrawal_id": withdrawal_id,
                "issue": "External verification failed" 
            })

    def mock_external_verification(self, amount):
        # Simulate 99% success rate
        return random.random() > 0.01

if __name__ == "__main__":
    agent = AuditorAgent()
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        print("Auditor Agent Stopped")