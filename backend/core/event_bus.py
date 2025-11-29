import os
import json
import asyncio
from datetime import datetime
from supabase import create_client, Client

class EventBus:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EventBus, cls).__new__(cls)
            cls._instance.init_client()
        return cls._instance

    def init_client(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            # Fallback for dev/test if env not set (should be set in prod)
            print("[EventBus] Warning: SUPABASE_URL or KEY not set.")
            self.client = None
            return
        self.client: Client = create_client(url, key)

    def publish(self, event_type: str, source: str, payload: dict):
        if not self.client:
            print(f"[EventBus] Mock Publish: {event_type} from {source}")
            return None

        try:
            data = self.client.table("agent_events").insert({
                "type": event_type,
                "source": source,
                "payload": payload,
                "status": "pending"
            }).execute()
            
            if data.data:
                return data.data[0]['id']
            return None
        except Exception as e:
            print(f"[EventBus] Publish Error: {e}")
            return None

    async def subscribe_loop(self, event_type: str, callback):
        """
        Simple polling subscriber for Python workers (Realtime WS is complex in blocking Python)
        For production, use a proper Async Realtime client or Redis.
        Here we implement a 'Pull' based consumer for simplicity and reliability.
        """
        if not self.client:
            return

        print(f"[EventBus] Subscribing to {event_type}...")
        while True:
            try:
                # Fetch pending events
                response = self.client.table("agent_events")\
                    .select("*")\
                    .eq("type", event_type)\
                    .eq("status", "pending")\
                    .execute()

                events = response.data
                for event in events:
                    # Lock event
                    self.client.table("agent_events")\
                        .update({"status": "processing"})\
                        .eq("id", event['id'])\
                        .execute()
                    
                    # Process
                    try:
                        await callback(event)
                        # Complete
                        self.client.table("agent_events")\
                            .update({"status": "completed", "processed_at": datetime.utcnow().isoformat()})\
                            .eq("id", event['id'])\
                            .execute()
                    except Exception as handler_err:
                        print(f"[EventBus] Handler Error: {handler_err}")
                        self.client.table("agent_events")\
                            .update({"status": "failed"})\
                            .eq("id", event['id'])\
                            .execute()

                await asyncio.sleep(1) # Poll every second
            except Exception as e:
                print(f"[EventBus] Loop Error: {e}")
                await asyncio.sleep(5)

# Global instance
event_bus = EventBus()
