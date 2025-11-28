#!/bin/bash

# 🚀 GEMINI CLI - REALTIME COMMISSION + AUTO PAYOUT TASK
# Critical financial task - extreme security required

set -e

echo "=================================================="
echo "🎯 GEMINI TASK: REALTIME COMMISSION + AUTO PAYOUT"
echo "=================================================="
echo ""
echo "⚠️  CRITICAL WARNINGS:"
echo "  - This task handles REAL MONEY"
echo "  - Security is paramount"
echo "  - Test in sandbox ONLY initially"
echo "  - Read all docs before starting"
echo ""
echo "📋 TASK OVERVIEW:"
echo "  - Phase 1: Database foundation (Week 1)"
echo "  - Phase 2: Realtime commission (Week 1-2)"
echo "  - Phase 3: Withdrawal + agent check (Week 2)"
echo "  - Phase 4: NOWPayments integration (Week 3)"
echo "  - Phase 5: Realtime dashboard (Week 3-4)"
echo ""
echo "📚 REQUIRED READING:"
echo "  1. docs/COMMISSION_PAYOUT_ALTERNATIVES.md"
echo "  2. docs/WITHDRAWAL_AUTOMATION_SECURITY.md"
echo "  3. GEMINI_TASK_REALTIME_PAYOUT.md"
echo ""
echo "🔒 SECURITY REQUIREMENTS:"
echo "  - Checksums on all withdrawals"
echo "  - Agent fraud detection"
echo "  - Admin 2FA approval"
echo "  - Immutable audit trail"
echo "  - >90% test coverage"
echo ""
echo "=================================================="
echo ""
echo "Ready to start? This will run Gemini CLI with the full task."
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."
echo ""

# Display the prompt
cat << 'EOF'

==================================================
GEMINI CLI PROMPT (Copy this entire block)
==================================================

You are implementing a critical financial system for Apex OS. This is a 4-week task with EXTREME security requirements.

**CRITICAL**: Read GEMINI_TASK_REALTIME_PAYOUT.md COMPLETELY before starting.

**Your Mission**:
Implement a realtime commission system with automated anonymous payouts:
1. REALTIME balance updates (<1 second after trade)
2. AUTOMATED withdrawal execution (admin approves → system auto-executes)
3. ANONYMOUS payouts (via NOWPayments, no KYC/KYB)
4. FRAUD-PROOF (checksums, agent checks, separation of duties)
5. TRANSPARENT (blockchain tx_hash for every payout)

**Phases** (Follow IN ORDER):

Phase 1 (Week 1): Database Foundation
- Create migration: supabase/migrations/20251127_realtime_wallet_system.sql
- Tables: user_wallets, commission_events, withdrawal_requests, withdrawal_audit_log
- PostgreSQL functions: credit_user_balance_realtime, reserve_balance_for_withdrawal
- RLS policies (users see only their own data)
- TEST: Migration runs successfully, functions work

Phase 2 (Week 1-2): Realtime Commission
- Create: src/lib/viral-economics/realtime-commission.ts
- Hook into trade events → instant balance credit
- Calculate L1-L4 referral commissions instantly
- Emit realtime events via Supabase Realtime
- TEST: Trade → balance updates <1 second

Phase 3 (Week 2): Withdrawal + Agent Check
- Create: src/app/api/v1/wallet/withdraw/route.ts
- Create: src/lib/agents/withdrawal-agent.ts
- Implement: Checksum verification, fraud detection, AML screening
- Risk score calculation (0-100)
- TEST: Withdrawal request → agent check passes/fails correctly

Phase 4 (Week 3): NOWPayments Integration
- Sign up: https://nowpayments.io (SANDBOX mode)
- Create: src/lib/payments/nowpayments-client.ts
- Create: src/lib/agents/execution-agent.ts
- Admin approval endpoint → triggers auto-execution
- Poll for payout completion, save tx_hash
- TEST: Full flow in SANDBOX (approve → execute → tx_hash returned)

Phase 5 (Week 3-4): Realtime Dashboard
- Create: src/components/dashboard/RealtimeWallet.tsx
- Subscribe to Supabase Realtime for balance updates
- Show commission events in realtime
- Display withdrawal history with tx_hash links
- TEST: User sees updates <1 second, can click tx_hash → TronScan

**SECURITY CHECKLIST** (All must be ✅ before production):
□ Checksums on all withdrawals (data_checksum field)
□ RLS policies on all tables
□ Immutable audit log (withdrawal_audit_log)
□ Admin 2FA required for approval
□ Separation of duties (approve ≠ execute)
□ Input validation (SQL injection, XSS prevention)
□ Rate limiting (max 5 withdrawals/day)
□ AML screening (address blacklist)
□ Fraud detection (risk score)
□ Balance reconciliation (total_earned = withdrawn + balance)
□ NOWPayments SANDBOX testing first
□ >90% test coverage (unit + integration)

**BEFORE PRODUCTION**:
□ All unit tests passing
□ All integration tests passing
□ Security penetration testing done
□ Code review completed
□ Monitoring alerts configured
□ Rollback plan documented

**DELIVERABLES**:
1. Database migration file
2. All TypeScript files as specified in GEMINI_TASK_REALTIME_PAYOUT.md
3. Unit tests (>90% coverage)
4. API documentation
5. Admin guide
6. Testing report

**IF YOU ENCOUNTER BLOCKERS**:
- NOWPayments sandbox issues → Notify immediately
- Security concerns → STOP and notify
- Test coverage <90% → Add more tests
- Any financial logic uncertainty → ASK before proceeding

**IMPORTANT PRINCIPLES**:
- 兵貴神速 (Speed): Realtime UX, instant feedback
- 不戰而屈人之兵 (No fighting): Remove admin from execution = no fraud possible
- 知彼知己 (Know enemy): Users want transparency, we give blockchain proof

Read GEMINI_TASK_REALTIME_PAYOUT.md for complete details.

Execute Phase 1 first. Report completion before moving to Phase 2.

GO! 🚀

==================================================
END OF PROMPT
==================================================

EOF

echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Copy the prompt above"
echo "2. Open new terminal"
echo "3. Run: gemini"
echo "4. Paste the prompt"
echo "5. Let Gemini work through all 5 phases"
echo ""
echo "OR use this one-liner (if gemini CLI supports stdin):"
echo ""
echo "gemini --project=/Users/macbookprom1/apex-os --prompt=\"\$(cat GEMINI_TASK_REALTIME_PAYOUT.md | head -100)\""
echo ""
echo "=================================================="
echo "Task packaged! Ready for Gemini CLI execution."
echo "=================================================="
