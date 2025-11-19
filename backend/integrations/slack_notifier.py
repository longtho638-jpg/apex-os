"""
Slack Webhook Integration
Send notifications to Slack for critical events
"""

import requests
import os
from typing import Optional, Dict, List
from datetime import datetime


class SlackNotifier:
    """
    Send notifications to Slack workspace
    
    Setup:
    1. Create Slack App: https://api.slack.com/apps
    2. Enable Incoming Webhooks
    3. Copy Webhook URL to .env as SLACK_WEBHOOK_URL
    """
    
    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url or os.getenv('SLACK_WEBHOOK_URL')
        
        if not self.webhook_url:
            print("⚠️  SLACK_WEBHOOK_URL not set. Notifications disabled.")
    
    def send_message(self, text: str, blocks: Optional[List[Dict]] = None) -> bool:
        """
        Send message to Slack
        
        Args:
            text: Plain text message (fallback)
            blocks: Rich formatting blocks (optional)
        
        Returns:
            True if sent successfully
        """
        if not self.webhook_url:
            print(f"[Slack Disabled] {text}")
            return False
        
        try:
            payload = {"text": text}
            if blocks:
                payload["blocks"] = blocks
            
            response = requests.post(self.webhook_url, json=payload)
            return response.status_code == 200
            
        except Exception as e:
            print(f"Slack send error: {e}")
            return False
    
    def notify_liquidation_risk(self, user_email: str, symbol: str, distance: str, liquidation_price: float):
        """
        Alert: User position at risk of liquidation
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🚨 LIQUIDATION RISK ALERT",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*User:*\n{user_email}"},
                    {"type": "mrkdwn", "text": f"*Symbol:*\n{symbol}"},
                    {"type": "mrkdwn", "text": f"*Distance:*\n{distance}"},
                    {"type": "mrkdwn", "text": f"*Liq Price:*\n${liquidation_price}"}
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                    }
                ]
            }
        ]
        
        return self.send_message(
            f"⚠️ Liquidation risk: {user_email} - {symbol} ({distance} from liquidation)",
            blocks
        )
    
    def notify_over_leverage(self, user_email: str, current_leverage: float, max_leverage: float):
        """
        Alert: User is over-leveraged
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "⚠️ OVER-LEVERAGE DETECTED",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*User:*\n{user_email}"},
                    {"type": "mrkdwn", "text": f"*Current:*\n{current_leverage}x"},
                    {"type": "mrkdwn", "text": f"*Max Allowed:*\n{max_leverage}x"},
                    {"type": "mrkdwn", "text": f"*Status:*\n❌ Exceeded"}
                ]
            }
        ]
        
        return self.send_message(
            f"⚠️ Over-leverage: {user_email} using {current_leverage}x (max: {max_leverage}x)",
            blocks
        )
    
    def notify_high_funding(self, user_email: str, symbol: str, daily_cost: float):
        """
        Alert: High funding rate costs
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "💸 HIGH FUNDING RATE ALERT",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*User:*\n{user_email}"},
                    {"type": "mrkdwn", "text": f"*Symbol:*\n{symbol}"},
                    {"type": "mrkdwn", "text": f"*Daily Cost:*\n${daily_cost}"},
                    {"type": "mrkdwn", "text": f"*Action:*\nConsider closing position"}
                ]
            }
        ]
        
        return self.send_message(
            f"💸 High funding: {user_email} - {symbol} costing ${daily_cost}/day",
            blocks
        )
    
    def notify_fee_discrepancy(self, user_email: str, expected: float, actual: float, discrepancy_pct: float):
        """
        Alert: Fee discrepancy detected (potential overcharge)
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🔍 FEE DISCREPANCY DETECTED",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*User:*\n{user_email}"},
                    {"type": "mrkdwn", "text": f"*Expected:*\n${expected}"},
                    {"type": "mrkdwn", "text": f"*Actual:*\n${actual}"},
                    {"type": "mrkdwn", "text": f"*Discrepancy:*\n{discrepancy_pct}%"}
                ]
            }
        ]
        
        return self.send_message(
            f"🔍 Fee issue: {user_email} charged ${actual} vs ${expected} expected ({discrepancy_pct}% difference)",
            blocks
        )
    
    def notify_new_user(self, user_email: str, user_id: str):
        """
        Alert: New user signed up
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🎉 NEW USER SIGNUP",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Email:*\n{user_email}"},
                    {"type": "mrkdwn", "text": f"*User ID:*\n`{user_id}`"},
                    {"type": "mrkdwn", "text": f"*Time:*\n{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"}
                ]
            }
        ]
        
        return self.send_message(
            f"🎉 New signup: {user_email}",
            blocks
        )
    
    def notify_exchange_connected(self, user_email: str, exchange: str, balance: float):
        """
        Alert: User connected exchange
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🔗 EXCHANGE CONNECTED",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*User:*\n{user_email}"},
                    {"type": "mrkdwn", "text": f"*Exchange:*\n{exchange.upper()}"},
                    {"type": "mrkdwn", "text": f"*Balance:*\n${balance:,.2f}"}
                ]
            }
        ]
        
        return self.send_message(
            f"🔗 {user_email} connected {exchange} (${balance:,.2f})",
            blocks
        )
    
    def notify_system_error(self, error_message: str, component: str):
        """
        Alert: System error occurred
        """
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "❌ SYSTEM ERROR",
                    "emoji": True
                }
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*Component:*\n{component}"},
                    {"type": "mrkdwn", "text": f"*Error:*\n```{error_message}```"}
                ]
            }
        ]
        
        return self.send_message(
            f"❌ Error in {component}: {error_message}",
            blocks
        )


# Singleton instance
_slack_notifier = None

def get_slack_notifier() -> SlackNotifier:
    """Get global Slack notifier instance"""
    global _slack_notifier
    if _slack_notifier is None:
        _slack_notifier = SlackNotifier()
    return _slack_notifier
