'use client';

/**
 * Transaction History with Invoice Generation
 *
 * Displays payment history and allows downloading invoices
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  reference_id?: string;
}

export function TransactionHistory() {
  const t = useTranslations('payments.history');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/v1/payments/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/v1/payments/invoice/${transactionId}`);
      if (!response.ok) {
        toast.error(t('invoiceError', { defaultValue: 'Failed to generate invoice' }));
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('invoiceDownloaded', { defaultValue: 'Invoice downloaded' }));
    } catch (error) {
      toast.error(t('invoiceError', { defaultValue: 'Failed to generate invoice' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        {t('noTransactions', { defaultValue: 'No transactions yet' })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {tx.type}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  tx.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : tx.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}
              >
                {tx.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(tx.created_at).toLocaleDateString()} •{' '}
              {tx.reference_id || tx.id.slice(0, 8)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-900 dark:text-white">
              {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()} {tx.currency}
            </span>
            {tx.status === 'completed' && (
              <button
                onClick={() => downloadInvoice(tx.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title={t('downloadInvoice', { defaultValue: 'Download invoice' })}
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
