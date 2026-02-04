# Research Report: Payment & Billing Solutions for ApexOS

## 1. Executive Summary & Quick Wins
**Status:** ✅ **Already Implemented** (mostly)
The codebase already utilizes a hybrid architecture:
- **Fiat/Cards:** **Polar** (`@polar-sh/sdk`) is fully integrated for subscriptions (Pro, Trader, Elite).
- **Crypto:** **NOWPayments** is integrated for both payments and **payouts/withdrawals**.
- **Internal:** Wallet-based payments via Supabase RPC.

**Quick Wins (1-2 Weeks):**
1.  **Enhance Invoice Access:** Instead of building a custom PDF generator, utilize Polar's built-in customer portal/invoice emails. If custom branding is strictly required, use `react-pdf` to generate receipts from the `payment_transactions` table.
2.  **Activate Crypto Payouts:** The `createPayout` function in `src/lib/payments/nowpayments-client.ts` exists but needs UI integration for the "Withdraw" flow.
3.  **Tier Logic Refinement:** Ensure `src/config/unified-tiers.ts` product IDs match the live Polar/NOWPayments configuration.

## 2. Solution Comparison

| Feature | **Polar** (Current) | **Stripe Direct** | **Paddle** |
| :--- | :--- | :--- | :--- |
| **Role** | Merchant of Record (MoR)* | Payment Processor | Merchant of Record (MoR) |
| **Tax Compliance** | Handles VAT/Sales Tax | Manual (or Stripe Tax $) | **Best** (Handles all global tax) |
| **Integration** | ✅ Existing SDK | High effort | Medium effort |
| **Crypto Support** | No | Limited (USDC on some chains) | No |
| **Fee Structure** | Platform fee + Processing | ~2.9% + 30¢ | ~5% + 50¢ |
| **Trading Fit** | Good for SaaS subscriptions | Standard, high control | Good for avoiding tax headaches |

*\*Polar allows you to be your own MoR or use them. Current implementation uses them as a layer over Stripe.*

**Recommendation:** **Stick with Polar.** It wraps Stripe, simplifies subscription management for SaaS (tiers), and is already integrated. Switching to raw Stripe now would be regression.

## 3. Trading Platform Specifics

### A. Deposit/Withdrawal Flows
- **Deposits:** Handled via subscription purchase (Fiat/Crypto).
- **Withdrawals:** Critical for a trading platform (affiliate payouts, self-rebates).
  - **Current Setup:** `src/lib/payments/nowpayments-client.ts` supports withdrawals (`createPayout`).
  - **Action:** Build a "Withdraw Funds" modal in the dashboard that calls this existing backend function.

### B. Fee Structures & Refunds
- **Fees:** Handled via Tier logic (`unified-tiers.ts`).
- **Refunds:**
  - **Fiat:** Trigger via Polar Dashboard (manual) or API.
  - **Crypto:** Harder to reverse. Implement a strict "No Refund" policy for crypto or manual processing via NOWPayments dashboard.

## 4. Code Implementation Details

### A. Invoice Generation (Quick Win)
Since custom invoices were requested, here is a lightweight approach using `react-pdf` if Polar's native invoices aren't enough.

```tsx
// src/components/invoices/InvoiceGenerator.tsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 20, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  total: { borderTopWidth: 1, paddingTop: 10, marginTop: 10, fontWeight: 'bold' }
});

const InvoicePDF = ({ transaction }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>ApexOS Receipt</Text>
      <View style={styles.row}>
        <Text>Item:</Text>
        <Text>{transaction.product_name}</Text>
      </View>
      <View style={styles.row}>
        <Text>Date:</Text>
        <Text>{new Date(transaction.created_at).toLocaleDateString()}</Text>
      </View>
      <View style={styles.row}>
        <Text>Payment Method:</Text>
        <Text>{transaction.gateway.toUpperCase()}</Text>
      </View>
      <View style={[styles.row, styles.total]}>
        <Text>Total:</Text>
        <Text>{transaction.currency.toUpperCase()} {transaction.amount}</Text>
      </View>
    </Page>
  </Document>
);
```

### B. Existing Integrations (Reference)

**Polar (Subscription):**
*Already implemented in `src/lib/payments/polar-client.ts`*
```typescript
// Usage in API route
const checkout = await polarClient.checkouts.create({
  product_price_id: tierConfig.polar.productPriceId,
  customer_email: userEmail,
  success_url: `${process.env.PAYMENT_SUCCESS_URL}&tier=${tier}`,
  metadata: { userId, tier }
} as any);
```

**NOWPayments (Crypto Gateway):**
*Already implemented in `src/lib/payments/nowpayments-client.ts`*
```typescript
// Usage for Crypto Payment
const invoice = await createNOWPaymentsInvoice({
  userId,
  tier: tier as PaymentTier,
  amountOverride: finalPrice
});
// Returns invoice_url for redirection
```

## 5. Next Steps (Action Plan)
1.  **Frontend Integration:** Connect the "Withdraw" button in the User Dashboard to the `createPayout` logic in `nowpayments-client.ts`.
2.  **Invoice UI:** Add a "Download Invoice" button in the Billing History section using the `react-pdf` snippet above.
3.  **Environment Variables:** Verify `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, and `NOWPAYMENTS_API_KEY` are set in Vercel.

**Unresolved Questions:**
- Do we need to automate tax calculation for crypto payments? (NOWPayments handles some, but reporting is manual).
- Is the "Wallet" payment method (internal balance) fully funded? (RPC `pay_with_wallet` exists but needs funding logic).
