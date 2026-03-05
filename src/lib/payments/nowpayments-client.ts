/**
 * Re-export wrapper — NOWPayments client now lives in @apex-os/vibe-payment.
 */

export type {
  CreateInvoiceParams,
  CreatePayoutParams,
  NOWPaymentsInvoiceResponse,
  PayoutResult,
  PayoutStatus,
} from '@apex-os/vibe-payment';
export {
  createNOWPaymentsInvoice,
  nowPayments,
} from '@apex-os/vibe-payment';
