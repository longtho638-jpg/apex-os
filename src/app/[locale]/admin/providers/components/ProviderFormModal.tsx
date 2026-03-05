'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// --- Zod Schema ---
import { type ProviderFormData, providerFormSchema } from '@/lib/schemas/provider';

// --- Zod Schema ---
// Imported from @/lib/schemas/provider

interface Provider {
  id?: string;
  provider_code: string;
  provider_name: string;
  asset_class: string;
  partner_uuid: string;
  referral_link_template: string;
  status: string;
  asset_config?: Record<string, any>;
  regulatory_info?: Record<string, any>;
}

interface ProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider?: Provider | null;
  token: string;
}

export default function ProviderFormModal({ isOpen, onClose, onSuccess, provider, token }: ProviderFormModalProps) {
  const isEditMode = !!provider;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      provider_code: '',
      provider_name: '',
      asset_class: 'crypto',
      status: 'testing',
      partner_uuid: '',
      referral_link_template: '',
      asset_config: '{}',
      regulatory_info: '{}',
    },
  });

  // Watch fields for Test Link button
  const referralTemplate = watch('referral_link_template');
  const partnerUuid = watch('partner_uuid');

  // Reset form when provider changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setSubmitError(null);
      if (provider) {
        reset({
          provider_code: provider.provider_code,
          provider_name: provider.provider_name,
          asset_class: provider.asset_class as any,
          status: provider.status as any,
          partner_uuid: provider.partner_uuid || '',
          referral_link_template: provider.referral_link_template || '',
          asset_config: JSON.stringify(provider.asset_config || {}, null, 2),
          regulatory_info: JSON.stringify(provider.regulatory_info || {}, null, 2),
        });
      } else {
        reset({
          provider_code: '',
          provider_name: '',
          asset_class: 'crypto',
          status: 'testing',
          partner_uuid: '',
          referral_link_template: '',
          asset_config: '{}',
          regulatory_info: '{}',
        });
      }
    }
  }, [isOpen, provider, reset]);

  const onSubmit = async (data: ProviderFormData) => {
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        asset_config: JSON.parse(data.asset_config),
        regulatory_info: JSON.parse(data.regulatory_info),
      };

      const url = isEditMode ? `/api/v1/admin/providers/${provider?.id}` : '/api/v1/admin/providers';

      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to save provider');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setSubmitError(err.message);
    }
  };

  const handleTestLink = () => {
    if (!referralTemplate) return;

    const url = referralTemplate.replace('{locale}', 'en').replace('{partner_uuid}', partnerUuid || 'PLACEHOLDER_UUID');

    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 shrink-0">
          <h2 className="text-2xl font-bold text-white">{isEditMode ? '✏️ Edit Provider' : '➕ Add New Provider'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Provider {isEditMode ? 'updated' : 'created'} successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Provider Code */}
          <div>
            <label htmlFor="provider_code" className="block text-sm font-medium text-gray-300 mb-2">
              Provider Code * <span className="text-gray-500 text-xs">(lowercase, alphanumeric)</span>
            </label>
            <input
              id="provider_code"
              {...register('provider_code')}
              disabled={isEditMode || isSubmitting}
              className={`w-full px-4 py-2 bg-white/5 border ${
                errors.provider_code ? 'border-red-500' : 'border-white/10'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="e.g., binance, okx, kraken"
            />
            {errors.provider_code && <p className="text-red-400 text-sm mt-1">{errors.provider_code.message}</p>}
          </div>

          {/* Provider Name */}
          <div>
            <label htmlFor="provider_name" className="block text-sm font-medium text-gray-300 mb-2">
              Provider Name *
            </label>
            <input
              id="provider_name"
              {...register('provider_name')}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 bg-white/5 border ${
                errors.provider_name ? 'border-red-500' : 'border-white/10'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., Binance, OKX, Kraken"
            />
            {errors.provider_name && <p className="text-red-400 text-sm mt-1">{errors.provider_name.message}</p>}
          </div>

          {/* Asset Class & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Asset Class */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Asset Class *</label>
              <select
                {...register('asset_class')}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="crypto">Crypto</option>
                <option value="forex">Forex</option>
                <option value="stocks">Stocks</option>
                <option value="commodities">Commodities</option>
                <option value="options">Options</option>
                <option value="futures">Futures</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                {...register('status')}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="testing">Testing</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
          </div>

          {/* Partner UUID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Partner UUID</label>
            <input
              {...register('partner_uuid')}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., APEX_BINANCE_PARTNER"
            />
          </div>

          {/* Referral Link Template */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Referral Link Template</label>
            <div className="flex gap-2">
              <input
                {...register('referral_link_template')}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/{locale}/register?ref={partner_uuid}"
              />
              <button
                type="button"
                onClick={handleTestLink}
                disabled={!referralTemplate}
                className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Test Link"
              >
                <ExternalLink className="w-4 h-4" />
                Test
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Variables: <code className="bg-white/10 px-1 rounded">{'{locale}'}</code>,{' '}
              <code className="bg-white/10 px-1 rounded">{'{partner_uuid}'}</code>
            </p>
          </div>

          {/* Asset Config JSON */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Asset Config (JSON)</label>
            <textarea
              {...register('asset_config')}
              disabled={isSubmitting}
              rows={4}
              className={`w-full px-4 py-2 bg-white/5 border ${
                errors.asset_config ? 'border-red-500' : 'border-white/10'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm`}
              placeholder='{"exchange_type": "centralized", "supports_margin": true}'
            />
            {errors.asset_config && <p className="text-red-400 text-sm mt-1">{errors.asset_config.message}</p>}
          </div>

          {/* Regulatory Info JSON */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Regulatory Info (JSON)</label>
            <textarea
              {...register('regulatory_info')}
              disabled={isSubmitting}
              rows={3}
              className={`w-full px-4 py-2 bg-white/5 border ${
                errors.regulatory_info ? 'border-red-500' : 'border-white/10'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm`}
              placeholder='{"license_country": "US", "regulatory_body": "SEC"}'
            />
            {errors.regulatory_info && <p className="text-red-400 text-sm mt-1">{errors.regulatory_info.message}</p>}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-gray-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(onSubmit)()}
            disabled={isSubmitting || success}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditMode ? 'Update Provider' : 'Create Provider'}
          </button>
        </div>
      </div>
    </div>
  );
}
