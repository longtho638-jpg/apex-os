# Risk Register & Mitigation Strategy

**Date**: 2025-11-27
**Objective**: Identify and neutralize threats to the $1M goal.

## 🚨 Critical Risks (High Impact)

### 1. AI Hallucination (Bad Trades)
**Description**: AI Signal Generator gives a "BUY" signal, market crashes. Users lose money.
**Probability**: Medium (30%) | **Impact**: Critical (Trust destroyed, Lawsuits)
**Mitigation**:
- [ ] **Paper Trading Only**: Default setting for new users.
- [ ] **Disclaimer**: Mandatory "Not Financial Advice" checkbox.
- [ ] **Confidence Score**: Only display signals with >85% confidence.
- [ ] **Kill Switch**: Automated halt if model accuracy drops below 60% in 24h.
**Residual Risk**: Low.

### 2. Platform Dependency (Binance/Polar)
**Description**: Binance API changes or Polar bans the account.
**Probability**: Low (10%) | **Impact**: High (Revenue freeze)
**Mitigation**:
- [ ] **Multi-Exchange**: Integrate Bybit, OKX immediately (don't rely solely on Binance).
- [ ] **Payment Backup**: Keep Stripe integration code ready as fallback.
- [ ] **Self-Custody**: Encourage users to use decentralized wallets.
**Residual Risk**: Low.

### 3. Regulatory Crackdown (SEC/VN Gov)
**Description**: Regulations change regarding crypto trading bots/signals.
**Probability**: Medium (20%) | **Impact**: High (Cease & Desist)
**Mitigation**:
- [ ] **Software License**: Position as "Analysis Tool", not "Financial Advisor".
- [ ] **Geo-Fencing**: Block IP addresses from restricted jurisdictions (e.g., USA, sanctioned countries).
- [ ] **Legal Entity**: Offshore incorporation (if needed later).
**Residual Risk**: Medium.

### 4. Technical Failure (Downtime)
**Description**: System crashes during viral launch.
**Probability**: Medium (20%) | **Impact**: Medium (Churn)
**Mitigation**:
- [ ] **Sentry**: Real-time error alerting (P0 priority).
- [ ] **Database Backups**: Daily PITR (Point-in-Time Recovery).
- [ ] **Rate Limiting**: Strict API limits to prevent overload.
**Residual Risk**: Low.

## ⚠️ Operational Risks (Medium Impact)

### 5. Key Person Risk (Anh)
**Description**: Founder burnout or unavailability.
**Mitigation**:
- [ ] **Documentation**: "Bus Factor" = 1. Document everything in `docs/`.
- [ ] **Agent Autonomy**: Ensure Growth Loop runs without daily input.

### 6. Copycat Competitor
**Description**: Someone forks the code or copies the UI.
**Mitigation**:
- [ ] **Data Moat**: The AI model's historical training is the secret sauce.
- [ ] **Brand**: Build a community that can't be forked.

---
*Next: Phase 5 - Execution Plan*
