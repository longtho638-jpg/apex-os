/**
 * Thin wrapper — injects app HTTP client into vibe-payment billing API factory.
 */
import { createBillingApi } from '@apex-os/vibe-payment';
import { get } from './client';

export type { RaaSBillingInfo } from '@apex-os/vibe-payment';

const billingApi = createBillingApi(get);
export const fetchBillingInfo = billingApi.fetchBillingInfo;
