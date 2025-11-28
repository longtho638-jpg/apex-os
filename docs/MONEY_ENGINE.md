# 💸 Money Engine Feature Documentation

## Overview
The Money Engine is the core financial reconciliation and payout system for Apex OS. It handles user wallets, transaction history, withdrawal requests, and admin approvals.

## Architecture

### Database Schema
- **wallets**: Stores user balances (USDT). One wallet per user per currency.
- **transactions**: Ledger of all balance changes (credits/debits). Immutable.
- **withdrawals**: Requests for payouts. State machine: `pending` -> `processing` -> `completed` | `rejected`.
- **payment_methods**: Saved user withdrawal destinations (Crypto/Bank).

### Key Components

#### Backend (API Routes)
- `/api/v1/user/finance/*`: User-facing endpoints (Wallet, Transactions, Withdrawals).
- `/api/v1/admin/finance/*`: Admin-facing endpoints (Approvals, Rejections).

#### Frontend (Next.js)
- `src/app/[locale]/finance/`: Main finance dashboard.
- `WithdrawalForm`: Component for requesting payouts.
- `TransactionTable`: Component for viewing history.

### Security Features
1. **Row Level Security (RLS)**: Users can only access their own data.
2. **Frozen Wallets**: `is_frozen` flag prevents withdrawals at the database level (Trigger).
3. **Rate Limiting**: Redis-based limiter (5 req/min) on withdrawal requests.
4. **Validation**: Zod schemas ensure data integrity.
5. **SSR Safety**: Safe access to browser APIs.

## Workflows

### 1. Withdrawal Request
1. User submits amount & payment method.
2. API validates input (Zod) & checks rate limit (Redis).
3. `WalletService` creates withdrawal record.
4. Database trigger locks wallet row & deducts balance (pending_payout).

### 2. Admin Approval
1. Admin reviews pending withdrawal.
2. Admin approves with transaction hash.
3. Database function updates withdrawal status to `completed`.
4. `pending_payout` is cleared.

### 3. Admin Rejection
1. Admin rejects with reason.
2. Database function refunds amount to wallet balance.
3. Withdrawal status set to `rejected`.

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/services/__tests__/wallet.service.test.ts
```

### Adding New Payment Methods
Extend `PaymentMethodSchema` in `src/lib/validations/finance.ts` and update the database enum if necessary.

## API Reference
See `API_DOCUMENTATION.md` for full endpoint details.
