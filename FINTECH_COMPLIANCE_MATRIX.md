# Fintech Compliance Matrix & IPO Readiness

**Region Scope:** Vietnam (Primary), Southeast Asia (Secondary)
**Target Standard:** Pre-IPO Readiness
**Last Updated:** 2025-11-26

## 1. Regulatory Compliance (Vietnam & SEA)

| Regulation | Requirement | Current Status | Gap/Action | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **VN Cybersecurity Law** | Data localization (Store data in VN). | Supabase (Cloud) - Region check needed. | Verify Supabase region or setup replica in VN. | High |
| **Nghị định 13/2023/NĐ-CP** | Personal Data Protection (PDP). Consent required for processing. | Basic Terms of Service. | Implement explicit Data Processing Agreement (DPA) & Consent UI. | **Critical** |
| **AML/CFT (Luật PCRT)** | KYC (Know Your Customer) mandatory for financial transactions. | Basic email verification. | Integrate eKYC (OCR/Face Liveness) provider (e.g., VNPT/FPT AI). | **Critical** |
| **Payment Services (SBV)** | Intermediary payment service license (if holding funds). | Unlicensed/Reliance on partners. | Partner with licensed gateway or apply for license. | High |
| **Singapore PDPA** | (If scaling to SEA) Strict data handling & breach notification. | Not compliant. | Align with GDPR standards (covers PDPA mostly). | Medium |

## 2. Security Standards (ISO/SOC)

| Control Domain | Requirement | Apex-OS Status | Remediation Plan |
| :--- | :--- | :--- | :--- |
| **Access Control** | MFA, Least Privilege, Periodic Review. | MFA active. RLS used. | Implement quarterly access review automated workflow. |
| **Cryptography** | Encryption at rest & in transit. Key management. | TLS (Transit) ✅. Database Encrypted ✅. | Document Key Rotation Policy. |
| **Incident Response** | Plan for data breach/downtime. | Ad-hoc. | Create `docs/INCIDENT_RESPONSE.md` with contact tree. |
| **SDLC Security** | Code review, SAST/DAST scanning. | Manual review. | Integrate SonarQube/Snyk into CI/CD pipeline. |
| **Logging** | Centralized, immutable logs for 12 months. | Partial (`audit-logs`). | Extend retention & ensure write-once storage (WORM). |

## 3. Agentic Governance (AI Ethics & Control)

| Component | Risk | Governance Control | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Trading Agent** | Flash crash / Runaway algo. | **Kill Switch:** Hard-coded circuit breaker if drawdown > X%. | ⚠️ Pending |
| **Advisory Agent** | Providing financial advice (Licensing required). | **Disclaimer:** Explicit non-advice labels. **Guardrails:** Block specific keywords. | ⚠️ Pending |
| **Ops Agent** | Incorrect withdrawal approval. | **Limits:** Auto-approve only < $1000. Manual review for > $1000. | ⚠️ Pending |
| **Black Box** | Lack of explainability for decisions. | **Decision Logs:** Record *why* an agent took action (inputs + logic). | ⚠️ Pending |

## 4. IPO Readiness Checklist (Technical)

### 4.1 Infrastructure & Scalability
- [ ] **High Availability:** 99.99% SLA proven over 12 months.
- [ ] **Disaster Recovery:** RTO (Recovery Time Objective) < 4 hours. RPO (Recovery Point Objective) < 15 mins.
- [ ] **Scalability:** Demonstrated capacity for 10x current peak load.

### 4.2 Code & Process
- [ ] **Documentation:** Full system architecture, API docs, and runbooks updated.
- [ ] **Testing:** >90% Unit Test coverage, mandatory Integration Tests for finance flows.
- [ ] **Legacy Debt:** Zero "Critical" or "High" severity issues in backlog.

### 4.3 Data Integrity
- [ ] **Reconciliation:** Daily automated reconciliation with 0 discrepancy.
- [ ] **Audit Trail:** Complete, unalterable history of all ledger movements.

## 5. Immediate Action Items

1.  **Implement eKYC:** Select a provider and integrate immediately to satisfy AML/PCRT.
2.  **Data Consent UI:** Update Signup flow to comply with Decree 13/2023/ND-CP.
3.  **Agent Kill Switch:** Implement global "Halt Trading" switch accessible to Admins.
4.  **Incident Response Plan:** Formalize the process for handling security breaches.