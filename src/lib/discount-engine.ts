import 'server-only';
import { getSupabaseClient } from '@/lib/supabase';

interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  applicable_tiers: string[] | null;
  valid_until: string | null;
}

export async function validateDiscountCode(
  code: string,
  tier: string,
  userId: string,
): Promise<{ valid: boolean; discount?: number; error?: string }> {
  const supabase = getSupabaseClient();

  // Fetch discount code
  const { data: discountCode, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !discountCode) {
    return { valid: false, error: 'Invalid discount code' };
  }

  // Check if expired
  if (discountCode.valid_until && new Date(discountCode.valid_until) < new Date()) {
    return { valid: false, error: 'Discount code expired' };
  }

  // Check max uses
  if (discountCode.max_uses && discountCode.current_uses >= discountCode.max_uses) {
    return { valid: false, error: 'Discount code fully redeemed' };
  }

  // Check if applicable to tier
  if (discountCode.applicable_tiers && !discountCode.applicable_tiers.includes(tier)) {
    return { valid: false, error: 'Discount not applicable to this tier' };
  }

  // Check if user already used this code
  const { data: existingRedemption } = await supabase
    .from('discount_redemptions')
    .select('id')
    .eq('discount_code_id', discountCode.id)
    .eq('user_id', userId)
    .single();

  if (existingRedemption) {
    return { valid: false, error: 'You have already used this code' };
  }

  return { valid: true, discount: discountCode.discount_value };
}

export async function applyDiscount(
  originalPrice: number,
  discountCode: string,
  tier: string,
  userId: string,
): Promise<{ finalPrice: number; saved: number }> {
  const validation = await validateDiscountCode(discountCode, tier, userId);

  if (!validation.valid || !validation.discount) {
    return { finalPrice: originalPrice, saved: 0 };
  }

  const supabase = getSupabaseClient();

  // Calculate discount
  const discount = validation.discount;
  const saved = (originalPrice * discount) / 100;
  const finalPrice = originalPrice - saved;

  // Record redemption
  const { data: code } = await supabase
    .from('discount_codes')
    .select('id')
    .eq('code', discountCode.toUpperCase())
    .single();

  if (code) {
    await supabase.from('discount_redemptions').insert({
      discount_code_id: code.id,
      user_id: userId,
      original_price: originalPrice,
      discounted_price: finalPrice,
      saved_amount: saved,
    });

    // Increment usage count
    await supabase.rpc('increment_discount_usage', { code_id: code.id });
    // Fallback if RPC doesn't exist
    /*
    await supabase
      .from('discount_codes')
      .update({ current_uses: current_uses + 1 }) // Need current value for this, RPC is safer
      .eq('id', code.id);
    */
  }

  return { finalPrice, saved };
}
