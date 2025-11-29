import sys
from colorama import init, Fore, Style
from supabase import create_client
from .config import settings
from .reconcile import Reconciler

init(autoreset=True)

def run_auditor():
    print(f"{Fore.BLUE}🕵️  Auditor Agent Starting...{Style.RESET_ALL}")
    
    try:
        supabase = create_client(
            settings.NEXT_PUBLIC_SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        print(f"{Fore.GREEN}✅ Supabase Connection Established{Style.RESET_ALL}")
        
        reconciler = Reconciler(supabase)
        reconciler.run()
        
    except Exception as e:
        print(f"{Fore.RED}❌ Fatal Error: {e}{Style.RESET_ALL}")
        sys.exit(1)

if __name__ == "__main__":
    run_auditor()
