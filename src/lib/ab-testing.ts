import { PRICING_VARIANTS, PricingVariant } from './pricing-config';

// Simple hash-based A/B assignment (deterministic)
export function getPricingVariant(userId?: string): PricingVariant {
  if (!userId) {
    // No user ID yet, default to control
    return 'control';
  }
  
  // Simple hash: sum char codes mod 3
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variants: PricingVariant[] = ['control', 'variant_a', 'variant_b'];
  
  return variants[hash % 3];
}

export function getPricingForVariant(variant: PricingVariant) {
  return PRICING_VARIANTS[variant];
}
