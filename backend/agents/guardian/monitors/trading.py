import json
import threading
import time
from collections import defaultdict, deque
import redis
from colorama import Fore, Style
from supabase import Client
from ..config import settings

class TradingMonitor:
    def __init__(self):
        self.name = "TradingMonitor"
        self.redis_client = redis.from_url(settings.REDIS_URL)
        self.pubsub = self.redis_client.pubsub()
        self.pubsub.subscribe('trade_events')
        
        # HFT Tracking: userId -> deque of timestamps
        self.trade_history = defaultdict(deque)
        self.running = False
        self.thread = None

    def start(self, supabase: Client):
        if self.running:
            return
        self.running = True
        self.supabase = supabase
        self.thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.thread.start()
        print(f"{Fore.GREEN}✅ TradingMonitor started (Redis Listener){Style.RESET_ALL}")

    def _listen_loop(self):
        print(f"{Fore.CYAN}🎧 Listening for trade events...{Style.RESET_ALL}")
        while self.running:
            try:
                message = self.pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    data = json.loads(message['data'])
                    self._process_event(data)
            except Exception as e:
                print(f"{Fore.RED}❌ Redis Error: {e}{Style.RESET_ALL}")
                time.sleep(5)

    def _process_event(self, event):
        user_id = event.get('userId')
        price = float(event.get('price', 0))
        quantity = float(event.get('quantity', 0))
        symbol = event.get('symbol')
        total_value = price * quantity
        
        # 1. Whale Check
        if total_value >= settings.WHALE_THRESHOLD_USDT:
            self._alert(
                "WHALE_ALERT", 
                f"Large order detected: {quantity} {symbol} (${total_value:,.2f})", 
                "HIGH", 
                {"order_id": event.get('orderId'), "value": total_value}
            )

        # 2. HFT Check
        now = time.time()
        self.trade_history[user_id].append(now)
        
        # Remove trades older than 60 seconds
        while self.trade_history[user_id] and self.trade_history[user_id][0] < now - 60:
            self.trade_history[user_id].popleft()
            
        if len(self.trade_history[user_id]) > settings.HFT_LIMIT:
            self._alert(
                "HFT_ALERT",
                f"High frequency trading detected: {len(self.trade_history[user_id])} trades/min",
                "MEDIUM",
                {"user_id": user_id, "rate": len(self.trade_history[user_id])}
            )

    def _alert(self, alert_type, message, severity, metadata):
        print(f"{Fore.YELLOW}⚠️  {alert_type}: {message}{Style.RESET_ALL}")
        try:
            self.supabase.table('security_alerts').insert({
                "type": alert_type,
                "message": message,
                "severity": severity,
                "details": metadata,
                "status": "OPEN"
            }).execute()
        except Exception as e:
            print(f"{Fore.RED}❌ Failed to log alert: {e}{Style.RESET_ALL}")

    def check(self, supabase: Client):
        # Heartbeat check, main logic is in thread
        pass
