import { Link, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LinkedAccount } from '@/types/exchange';
import { ExchangeStatusBadge } from './ExchangeStatusBadge';

interface LinkedAccountsListProps {
  accounts: LinkedAccount[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function LinkedAccountsList({ accounts, loading, onDelete }: LinkedAccountsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatExchangeName = (exchange: string) => {
    return exchange.charAt(0).toUpperCase() + exchange.slice(1);
  };

  const maskUid = (uid: string) => {
    if (uid.length <= 6) return uid;
    return `${uid.slice(0, 3)}...${uid.slice(-3)}`;
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await onDelete(id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500" />
          Linked Accounts
        </h3>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{accounts.length} Connected</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Link className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">No accounts linked yet</p>
          <p className="text-gray-600 text-sm mt-1">Connect an exchange above to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Exchange Icon Placeholder */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-gray-400 text-xs">
                  {account.exchange.substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{formatExchangeName(account.exchange)}</h4>
                    <ExchangeStatusBadge status={account.verification_status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="font-mono bg-black/50 px-1.5 py-0.5 rounded">
                      UID: {maskUid(account.user_uid)}
                    </span>
                    <span>•</span>
                    <span>{new Date(account.created_at).toLocaleDateString()}</span>
                    {account.metadata?.tier && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{account.metadata.tier}</span>
                      </>
                    )}
                    {account.metadata?.error_reason && account.verification_status !== 'verified' && (
                      <>
                        <span>•</span>
                        <span className="text-red-400">{account.metadata.error_reason}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                {deleteConfirm === account.id ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                    <span className="text-xs text-red-400 font-medium">Confirm?</span>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-md transition-colors"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(account.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Disconnect Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
