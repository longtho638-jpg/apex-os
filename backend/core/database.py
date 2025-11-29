from supabase import create_client, Client
from .config import settings

class Database:
    client: Client = None

    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        else:
            print("Warning: Supabase credentials not found. DB features will be disabled.")

db = Database()
