import time
import sys
from colorama import init, Fore, Style
from supabase import create_client, Client
from .config import settings

# Import Monitors
from .monitors.volume import VolumeSpikeMonitor
from .monitors.withdrawal import WithdrawalMonitor
from .monitors.trading import TradingMonitor

# Initialize colorama
init(autoreset=True)

def get_supabase() -> Client:
    return create_client(
        settings.NEXT_PUBLIC_SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )

def run_guardian():
    print(f"{Fore.CYAN}🛡️  Guardian Agent Starting...{Style.RESET_ALL}")
    print(f"{Fore.GREEN}✅ Configuration Loaded{Style.RESET_ALL}")
    
    try:
        supabase = get_supabase()
        print(f"{Fore.GREEN}✅ Supabase Connection Established{Style.RESET_ALL}")
    except Exception as e:
        print(f"{Fore.RED}❌ Failed to connect to Supabase: {e}{Style.RESET_ALL}")
        sys.exit(1)

    # Initialize Monitors
    trading_monitor = TradingMonitor()
    trading_monitor.start(supabase)

    monitors = [
        VolumeSpikeMonitor(),
        WithdrawalMonitor(),
        trading_monitor
    ]
    
    print(f"{Fore.CYAN}🚀 Guardian is active. Monitoring system... (Interval: {settings.GUARDIAN_CHECK_INTERVAL}s){Style.RESET_ALL}")
    print(f"{Fore.CYAN}   Loaded Monitors: {[m.name for m in monitors]}{Style.RESET_ALL}")

    try:
        while True:
            print(f"{Style.DIM}❤️  Heartbeat... Checking {len(monitors)} monitors{Style.RESET_ALL}")
            
            # Send Heartbeat to DB
            try:
                supabase.table('agent_heartbeats').upsert({
                    "agent_id": "guardian",
                    "status": "RUNNING",
                    "last_heartbeat": "now()",
                    "metadata": {"monitors": len(monitors)},
                    "error_message": None
                }).execute()
            except Exception as hb_error:
                print(f"{Fore.RED}⚠️  Failed to send heartbeat: {hb_error}{Style.RESET_ALL}")

            for monitor in monitors:
                monitor.check(supabase)
            
            time.sleep(settings.GUARDIAN_CHECK_INTERVAL)
            
    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}🛑 Guardian Agent stopping...{Style.RESET_ALL}")
        # Update status to STOPPED
        try:
            supabase.table('agent_heartbeats').upsert({
                "agent_id": "guardian",
                "status": "STOPPED",
                "last_heartbeat": "now()"
            }).execute()
        except:
            pass
        sys.exit(0)
    except Exception as e:
        print(f"{Fore.RED}❌ Unexpected Error: {e}{Style.RESET_ALL}")
        # Update status to ERROR
        try:
            supabase.table('agent_heartbeats').upsert({
                "agent_id": "guardian",
                "status": "ERROR",
                "last_heartbeat": "now()",
                "error_message": str(e)
            }).execute()
        except:
            pass
        sys.exit(1)

if __name__ == "__main__":
    run_guardian()
