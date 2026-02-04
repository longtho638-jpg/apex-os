# Phase 04: Payment Enhancements

**Context**: [Payments Research Report](../reports/researcher-payments.md)
**Priority**: Medium
**Status**: Pending

## Overview
While deposits via Polar and NOWPayments are integrated, users lack a UI to request withdrawals and view invoices/transaction history clearly. This phase fills the loop for financial operations.

## Key Insights
- Withdrawal requests often require manual approval in early stages for security.
- Users need PDF invoices or clear receipts for tax/record-keeping.

## Requirements
### Functional
- **Withdrawal UI**: Form to select asset, amount, and destination address/method.
- **Withdrawal Processing**: Queue withdrawal requests in DB for admin review (or auto-process if small).
- **Transaction History**: Unified view of Deposits (Polar/NOWPayments) and Withdrawals.
- **Invoices**: "Download Invoice" button for completed deposits.

### Non-Functional
- High security on withdrawal form (MFA recommended).
- Idempotency on withdrawal requests.

## Architecture
- **Database**:
  - `withdrawals` table (user_id, amount, currency, status, destination, tx_hash).
  - Update `transactions` view to union deposits and withdrawals.
- **Frontend**:
  - `WithdrawalForm` component with validation.
  - `TransactionHistory` table with filters.
- **Backend**:
  - `/api/withdraw` endpoint.
  - Optional: PDF generator library (or simple HTML print view).

## Related Code Files
- Create: `src/app/(dashboard)/wallet/withdraw/page.tsx`
- Create: `src/components/wallet/WithdrawalForm.tsx`
- Create: `src/components/wallet/TransactionHistory.tsx`
- Modify: `src/lib/supabase/schema.sql` (Withdrawals table)
- Create: `src/app/api/transactions/invoice/[id]/route.ts`

## Implementation Steps
1.  **Schema**: Create `withdrawals` table with RLS (User can insert, view own; Admin can update status).
2.  **Withdrawal API**: Create endpoint to validate balance > withdrawal_amount, deduct balance (hold), and create request record.
3.  **UI Construction**: Build form with max balance selector and address validation.
4.  **History View**: Create a unified component showing both deposits and withdrawals status.
5.  **Invoice Gen**: Simple HTML-to-PDF or print-friendly page for transaction details.

## Todo List
- [ ] Create `withdrawals` table
- [ ] Implement `WithdrawalForm` with Zod validation
- [ ] Create server action/API for withdrawal request
- [ ] Implement balance locking/holding logic
- [ ] Build `TransactionHistory` UI
- [ ] Create Invoice view

## Success Criteria
- User can submit withdrawal request if balance suffices.
- Balance is immediately deducted (or locked) to prevent double-spend.
- User sees "Pending" withdrawal in history.

## Risk Assessment
- **Risk**: Double withdrawal race condition.
- **Mitigation**: Database constraints (check constraints) and serializable transactions for balance updates.

## Security Considerations
- **CRITICAL**: Require recent login or 2FA for withdrawal actions (if 2FA available).
- Sanitize all address inputs.

## Next Steps
- Define Admin UI for approving withdrawals (out of scope for this user-facing plan, but needed).
