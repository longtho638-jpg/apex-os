'use client';

import { Building2, CreditCard, Loader2, Plus, Trash2, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { logger } from '@/lib/logger';
import type { PaymentMethod } from '@/types/finance';

export default function PaymentMethodsManager() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'crypto_wallet',
    name: '',
    details: { address: '', network: '', bank_name: '', account_number: '', account_holder: '' },
  });

  const fetchMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/v1/user/finance/payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMethods(data.methods);
    } catch (error) {
      logger.error('Failed to fetch payment methods', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleAdd = async () => {
    if (!newMethod.name) return toast.error('Name is required');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: newMethod.type,
        name: newMethod.name,
        details:
          newMethod.type === 'crypto_wallet'
            ? { address: newMethod.details.address, network: newMethod.details.network }
            : {
                bank_name: newMethod.details.bank_name,
                account_number: newMethod.details.account_number,
                account_holder: newMethod.details.account_holder,
              },
        is_default: methods.length === 0,
      };

      const res = await fetch('/api/v1/user/finance/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Payment method added');
        setIsAdding(false);
        setNewMethod({
          type: 'crypto_wallet',
          name: '',
          details: { address: '', network: '', bank_name: '', account_number: '', account_holder: '' },
        });
        fetchMethods();
      } else {
        toast.error(data.message || 'Failed to add method');
      }
    } catch (_error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/user/finance/payment-methods?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Payment method removed');
      fetchMethods();
    } catch (_error) {
      toast.error('Failed to remove method');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Methods</h2>
          <p className="text-sm text-gray-400">Manage your withdrawal destinations</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 rounded-lg font-medium transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Method
        </button>
      </div>

      {isAdding && (
        <GlassCard className="p-6 border-emerald-500/20">
          <h3 className="font-bold mb-4">Add New Method</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Type</label>
                <select
                  value={newMethod.type}
                  onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="crypto_wallet">Crypto Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Label Name</label>
                <input
                  type="text"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  placeholder="e.g. My USDT Wallet"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {newMethod.type === 'crypto_wallet' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Network</label>
                  <input
                    type="text"
                    value={newMethod.details.network}
                    onChange={(e) =>
                      setNewMethod({ ...newMethod, details: { ...newMethod.details, network: e.target.value } })
                    }
                    placeholder="TRC20, ERC20..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Wallet Address</label>
                  <input
                    type="text"
                    value={newMethod.details.address}
                    onChange={(e) =>
                      setNewMethod({ ...newMethod, details: { ...newMethod.details, address: e.target.value } })
                    }
                    placeholder="0x..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={newMethod.details.bank_name}
                      onChange={(e) =>
                        setNewMethod({ ...newMethod, details: { ...newMethod.details, bank_name: e.target.value } })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={newMethod.details.account_number}
                      onChange={(e) =>
                        setNewMethod({
                          ...newMethod,
                          details: { ...newMethod.details, account_number: e.target.value },
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={newMethod.details.account_holder}
                    onChange={(e) =>
                      setNewMethod({ ...newMethod, details: { ...newMethod.details, account_holder: e.target.value } })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Save Method
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            Loading methods...
          </div>
        ) : methods.length > 0 ? (
          methods.map((method) => (
            <GlassCard key={method.id} className="p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/5 text-emerald-400">
                  {method.type === 'crypto_wallet' ? <Wallet className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {method.name}
                    {method.is_default && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {method.type === 'crypto_wallet'
                      ? `${method.details.network} • ${method.details.address}`
                      : `${method.details.bank_name} • ${method.details.account_number}`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(method.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payment methods added yet.</p>
            <button onClick={() => setIsAdding(true)} className="text-emerald-400 hover:underline mt-2 text-sm">
              Add your first method
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
