from datetime import datetime, timedelta
from supabase import Client
from .base import BaseMonitor

class VolumeSpikeMonitor(BaseMonitor):
    def __init__(self):
        super().__init__("VolumeSpike")
        self.THRESHOLD_MULTIPLIER = 5.0  # 500% increase
        self.MIN_VOLUME_THRESHOLD = 1000 # Minimum volume to trigger check (avoid noise on low volume)

    def check(self, supabase: Client):
        # 1. Get volume for the last 5 minutes
        # Note: This assumes we have a 'transactions' or 'orders' table. 
        # Since we might not have real trading data yet, this is a placeholder implementation
        # that checks the 'audit_logs' count as a proxy for system activity for now,
        # OR we can assume an 'orders' table exists.
        
        # Let's use 'audit_logs' activity as a proxy for "System Activity Spike" for this demo,
        # since we don't have a live trading engine DB schema fully defined in this context yet.
        # TODO: Switch to 'orders' table when available.
        
        now = datetime.utcnow()
        five_mins_ago = now - timedelta(minutes=5)
        one_day_ago = now - timedelta(hours=24)

        try:
            # Get recent count (last 5 mins)
            recent_response = supabase.table("audit_logs") \
                .select("id", count="exact") \
                .gte("created_at", five_mins_ago.isoformat()) \
                .execute()
            recent_count = recent_response.count or 0

            # Get daily average (approximate by taking total last 24h / (24*12))
            # 24 hours * 12 (5-min slots) = 288 slots
            daily_response = supabase.table("audit_logs") \
                .select("id", count="exact") \
                .gte("created_at", one_day_ago.isoformat()) \
                .execute()
            daily_total = daily_response.count or 0
            
            # Avoid division by zero
            if daily_total == 0:
                average_5min = 0
            else:
                average_5min = daily_total / 288.0

            # Check for spike
            # Only trigger if recent activity is significant (> 10 actions) to avoid noise
            if recent_count > 10 and recent_count > (average_5min * self.THRESHOLD_MULTIPLIER):
                self.create_alert(
                    supabase,
                    type="VOLUME_SPIKE",
                    severity="HIGH",
                    details={
                        "recent_count": recent_count,
                        "average_5min": round(average_5min, 2),
                        "multiplier": round(recent_count / average_5min if average_5min > 0 else 0, 1),
                        "message": "Unusual spike in system activity (Audit Logs)"
                    }
                )
            else:
                # self.log(f"Activity Normal. Recent: {recent_count}, Avg: {average_5min:.2f}")
                pass

        except Exception as e:
            self.log(f"Check failed: {e}", "WARNING")
