from typing import Dict, List

class GuardianAgent:
    def __init__(self):
        self.name = "The Guardian"
        self.risk_threshold = 0.8

    def analyze_risk(self, portfolio: Dict) -> Dict:
        """
        Analyzes portfolio for high-risk metrics (e.g., over-leverage).
        """
        risk_score = 0.0
        alerts = []

        # Mock logic for risk analysis
        margin_used = portfolio.get('margin_used', 0)
        buying_power = portfolio.get('buying_power', 1)
        
        if buying_power > 0:
            leverage_ratio = margin_used / buying_power
            if leverage_ratio > 0.5:
                risk_score += 0.5
                alerts.append("High leverage detected (>50% margin used)")
        
        return {
            "risk_score": risk_score,
            "status": "safe" if risk_score < self.risk_threshold else "danger",
            "alerts": alerts
        }

    def check_funding_fees(self, positions: List[Dict]) -> List[str]:
        """
        Checks for high negative funding fees.
        """
        warnings = []
        for pos in positions:
            if pos.get('funding_rate', 0) < -0.001: # -0.1%
                warnings.append(f"High funding fee on {pos['symbol']}")
        return warnings

# Example usage
if __name__ == "__main__":
    guardian = GuardianAgent()
    print(f"{guardian.name} is watching")
