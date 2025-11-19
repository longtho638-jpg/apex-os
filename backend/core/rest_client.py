"""
REST API helper to bypass Supabase SDK dependency conflicts.
Use pure HTTP requests instead of SDK.
"""

import os
import requests
from typing import Optional, List, Dict

def get_supabase_rest_client():
    """Get REST API configuration"""
    return {
        'url': os.getenv('SUPABASE_URL', ''),
        'key': os.getenv('SUPABASE_SERVICE_KEY', ''),
        'headers': {
            'apikey': os.getenv('SUPABASE_SERVICE_KEY', ''),
            'Authorization': f"Bearer {os.getenv('SUPABASE_SERVICE_KEY', '')}",
            'Content-Type': 'application/json'
        }
    }

def query_table(table: str, filters: Dict = None, order_by: str = None, limit: int = None) -> List[Dict]:
    """
    Query Supabase table via REST API.
    
    Args:
        table: Table name
        filters: Dict of column=value filters
        order_by: Column to order by (e.g., 'created_at.desc')
        limit: Max rows to return
    
    Returns:
        List of rows
    """
    config = get_supabase_rest_client()
    url = f"{config['url']}/rest/v1/{table}"
    
    params = []
    if filters:
        for key, value in filters.items():
            params.append(f"{key}=eq.{value}")
    
    if order_by:
        params.append(f"order={order_by}")
    
    if limit:
        params.append(f"limit={limit}")
    
    if params:
        url += "?" + "&".join(params)
    
    try:
        response = requests.get(url, headers=config['headers'])
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"REST API Error: {e}")
        return []
