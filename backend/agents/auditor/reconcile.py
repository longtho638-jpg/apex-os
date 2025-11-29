from decimal import Decimal
from datetime import datetime
from supabase import Client
from colorama import Fore, Style
from collections import defaultdict # Import defaultdict

class Reconciler:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def run(self):
        print(f"{Fore.CYAN}🔍 Starting Daily Reconciliation...{Style.RESET_ALL}")
        
        try:
            # 1. Fetch all wallets
            wallets_response = self.supabase.table("wallets").select("*").execute()
            wallets = wallets_response.data
            
            if not wallets:
                print(f"{Fore.YELLOW}⚠️ No wallets found to reconcile.{Style.RESET_ALL}")
                # Log this event instead of just returning silently
                self.supabase.table("daily_reconciliation_logs").insert({
                    "date": datetime.utcnow().date().isoformat(),
                    "total_system_balance": 0.0,
                    "total_transaction_sum": 0.0,
                    "discrepancy": 0.0,
                    "status": "NO_WALLETS",
                    "details": {"message": "No wallets found for reconciliation"}
                }).execute()
                return

            # OPTIMIZATION: Fetch all transactions for relevant wallets and sum them up by wallet_id
            wallet_ids = [wallet['id'] for wallet in wallets]
            all_transactions_response = self.supabase.table("transactions") \
                .select("wallet_id, amount, type") \
                .in_('wallet_id', wallet_ids) \
                .execute()
            
            if all_transactions_response.data is None:
                all_transactions_response.data = [] # Ensure it's an iterable list

            # Compute sums in memory
            wallet_tx_sums = defaultdict(Decimal)
            for tx in all_transactions_response.data:
                wallet_id = tx['wallet_id']
                amount = Decimal(str(tx['amount']))
                
                # Apply logic for transaction types
                # Assuming 'amount' is SIGNED in the DB, or we apply logic based on type.
                # Here, applying logic based on type if amount is positive (e.g., withdrawal/fee values stored as positive)
                if tx['type'] in ['WITHDRAWAL', 'FEE'] and amount > 0:
                    wallet_tx_sums[wallet_id] -= amount
                else:
                    wallet_tx_sums[wallet_id] += amount
            
            total_system_balance = Decimal(0)
            total_tx_sum = Decimal(0)
            discrepancy = Decimal(0)
            mismatches = []

            print(f"Checking {len(wallets)} wallets...")

            for wallet in wallets:
                wallet_id = wallet['id']
                user_id = wallet['user_id']
                currency = wallet['currency']
                wallet_balance = Decimal(str(wallet['balance'])) # Convert to Decimal for precision
                
                tx_sum = wallet_tx_sums.get(wallet_id, Decimal(0)) # Get sum from pre-calculated dictionary

                # 3. Compare
                diff = wallet_balance - tx_sum
                
                total_system_balance += wallet_balance
                total_tx_sum += tx_sum
                
                if abs(diff) > Decimal("0.00000001"): # Tolerance for float math if any, though Decimal handles it
                    print(f"{Fore.RED}❌ Mismatch found! Wallet {wallet_id} (User {user_id}){Style.RESET_ALL}")
                    print(f"   Balance: {wallet_balance}, Tx Sum: {tx_sum}, Diff: {diff}")
                    mismatches.append({
                        "wallet_id": wallet_id,
                        "user_id": user_id,
                        "currency": currency,
                        "wallet_balance": float(wallet_balance),
                        "tx_sum": float(tx_sum),
                        "diff": float(diff)
                    })
                    discrepancy += abs(diff)

            # 4. Log Result
            status = "MISMATCH" if mismatches else "MATCH"
            
            log_data = {
                "date": datetime.utcnow().date().isoformat(),
                "total_system_balance": float(total_system_balance),
                "total_transaction_sum": float(total_tx_sum),
                "discrepancy": float(discrepancy),
                "status": status,
                "details": {"mismatches": mismatches}
            }
            
            self.supabase.table("daily_reconciliation_logs").insert(log_data).execute()
            
            if status == "MATCH":
                print(f"{Fore.GREEN}✅ Reconciliation Successful. System Balanced.{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}🚨 Reconciliation FAILED. Discrepancy: {discrepancy}{Style.RESET_ALL}")
                
                # Create Security Alert
                self.supabase.table("security_alerts").insert({
                    "type": "FINANCIAL_MISMATCH",
                    "severity": "CRITICAL",
                    "details": log_data,
                    "status": "OPEN"
                }).execute()
                print(f"{Fore.RED}🚨 Critical Alert Created!{Style.RESET_ALL}")

        except Exception as e:
            print(f"{Fore.RED}❌ Reconciliation Error: {e}{Style.RESET_ALL}")
            raise e