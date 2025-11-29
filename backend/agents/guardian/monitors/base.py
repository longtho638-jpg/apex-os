from abc import ABC, abstractmethod
from supabase import Client
from colorama import Fore, Style

class BaseMonitor(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def check(self, supabase: Client):
        """
        Perform the monitoring check.
        Should query Supabase and create alerts if necessary.
        """
        pass

    def log(self, message: str, level: str = "INFO"):
        color = Fore.WHITE
        if level == "ALERT":
            color = Fore.RED
        elif level == "SUCCESS":
            color = Fore.GREEN
        elif level == "WARNING":
            color = Fore.YELLOW
            
        print(f"{color}[{self.name}] {message}{Style.RESET_ALL}")

    def create_alert(self, supabase: Client, type: str, severity: str, details: dict):
        """
        Helper to insert an alert into security_alerts table.
        """
        try:
            data = {
                "type": type,
                "severity": severity,
                "details": details,
                "status": "OPEN"
            }
            supabase.table("security_alerts").insert(data).execute()
            self.log(f"🚨 Alert Created: {type} ({severity})", "ALERT")
        except Exception as e:
            self.log(f"❌ Failed to create alert: {e}", "ALERT")
