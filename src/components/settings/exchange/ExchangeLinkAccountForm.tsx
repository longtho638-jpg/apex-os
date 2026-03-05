import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Link, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { EXCHANGES, type ExchangeFormValues, type LinkedAccount } from '@/types/exchange';
import { RelinkInfoCard } from './RelinkInfoCard';

const exchangeSchema = z.object({
  exchange: z.enum(
    [
      'binance',
      'bybit',
      'okx',
      'bitget',
      'kucoin',
      'mexc',
      'gate',
      'htx',
      'bingx',
      'phemex',
      'coinex',
      'bitmart',
      'exness',
    ],
    {
      message: 'Please select a valid exchange',
    },
  ),
  user_uid: z
    .string()
    .min(1, 'UID is required')
    .max(100, 'UID is too long')
    .regex(/^[a-zA-Z0-9]+$/, 'UID must be alphanumeric'),
});

interface ExchangeLinkAccountFormProps {
  onAddAccount: (data: ExchangeFormValues) => Promise<any>;
  existingAccounts: LinkedAccount[];
}

export function ExchangeLinkAccountForm({ onAddAccount, existingAccounts }: ExchangeLinkAccountFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [relinkInfo, setRelinkInfo] = useState<{ exchange: string; message: string; referralLink: string } | null>(
    null,
  );

  const form = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      exchange: 'binance',
      user_uid: '',
    },
  });

  const formatExchangeName = (exchange: string) => {
    return exchange.charAt(0).toUpperCase() + exchange.slice(1);
  };

  const onSubmit = async (data: ExchangeFormValues) => {
    // Local validation
    const exists = existingAccounts.find((acc) => acc.exchange === data.exchange);
    if (exists) {
      form.setError('exchange', {
        type: 'manual',
        message: 'You have already linked this exchange.',
      });
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setRelinkInfo(null);

    try {
      const result = await onAddAccount(data);

      if (result.verified) {
        setSuccess(`✅ ${result.message || 'Account verified successfully!'}`);
        form.reset();
      } else if (result.needs_relink) {
        setRelinkInfo({
          exchange: data.exchange,
          message: result.message,
          referralLink: result.referral_link,
        });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 border-b border-white/10 bg-white/[0.02]">
      <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-emerald-500" />
        Link New Account
      </h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
        {/* Exchange Select */}
        <div className="w-full md:w-1/3 space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Exchange</label>
          <select
            {...form.register('exchange')}
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
          >
            {EXCHANGES.map((ex) => (
              <option key={ex} value={ex}>
                {formatExchangeName(ex)}
              </option>
            ))}
          </select>
          {form.formState.errors.exchange && (
            <p className="text-red-400 text-xs">{form.formState.errors.exchange.message}</p>
          )}
        </div>

        {/* UID Input */}
        <div className="w-full md:w-1/3 space-y-1.5">
          <label className="text-xs font-medium text-gray-400">User UID</label>
          <input
            {...form.register('user_uid')}
            type="text"
            placeholder="Enter your Exchange UID"
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {form.formState.errors.user_uid && (
            <p className="text-red-400 text-xs">{form.formState.errors.user_uid.message}</p>
          )}

          {/* Help Text */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/5 rounded-lg p-2 border border-white/5 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold text-gray-400 mb-1">Where to find your UID?</p>
              <ul className="space-y-0.5">
                <li>
                  <span className="text-gray-400">Binance:</span> Account → Dashboard → User ID
                </li>
                <li>
                  <span className="text-gray-400">Bybit:</span> Profile → Account & Security → UID
                </li>
                <li>
                  <span className="text-gray-400">OKX:</span> Profile → User Center → UID
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full md:w-auto mt-auto pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                Connect Exchange
              </>
            )}
          </button>
        </div>
      </form>

      {/* Relink Info */}
      {relinkInfo && (
        <RelinkInfoCard
          exchange={relinkInfo.exchange}
          message={relinkInfo.message}
          referralLink={relinkInfo.referralLink}
        />
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
