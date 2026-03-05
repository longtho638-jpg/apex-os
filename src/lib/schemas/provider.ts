import * as z from 'zod';

export const providerBaseSchema = z.object({
  provider_code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .regex(/^[a-z0-9_-]+$/, 'Must be lowercase alphanumeric with dashes/underscores'),
  provider_name: z.string().min(1, 'Provider name is required'),
  asset_class: z.enum(['crypto', 'forex', 'stocks', 'commodities', 'options', 'futures']),
  status: z.enum(['testing', 'active', 'inactive', 'deprecated']),
  partner_uuid: z.string().optional().or(z.literal('')),
  referral_link_template: z.string().optional().or(z.literal('')),
});

// Schema for the React Hook Form (Textareas for JSON)
export const providerFormSchema = providerBaseSchema.extend({
  asset_config: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
  regulatory_info: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON format'),
});

// Schema for the API Request Body (Parsed JSON objects)
export const providerApiSchema = providerBaseSchema.extend({
  asset_config: z.record(z.any()).optional().default({}),
  regulatory_info: z.record(z.any()).optional().default({}),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
});

export type ProviderFormData = z.infer<typeof providerFormSchema>;
export type ProviderApiPayload = z.infer<typeof providerApiSchema>;
