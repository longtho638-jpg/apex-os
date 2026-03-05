import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentMethod } from '@/types/finance';

interface WithdrawalFormProps {
  balance: number;
  paymentMethods: PaymentMethod[];
  onSuccess: () => void;
}

export function WithdrawalForm({ balance, paymentMethods, onSuccess }: WithdrawalFormProps) {
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !methodId) return;

    const numAmount = parseFloat(amount);
    if (numAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/user/finance/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numAmount,
          payment_method_id: methodId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Withdrawal requested successfully');
        setAmount('');
        onSuccess();
      } else {
        toast.error(data.message || 'Failed to request withdrawal');
      }
    } catch (_error) {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <label htmlFor="amount" className="text-sm font-medium text-gray-300">
          Amount (USDT)
        </label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="10" // Min withdrawal
          step="0.01"
          className="bg-gray-900 border-gray-700"
          aria-describedby="balance-hint"
        />
        <p id="balance-hint" className="text-xs text-gray-500">
          Available: {balance} USDT
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="payment-method" className="text-sm font-medium text-gray-300">
          Payment Method
        </label>
        <Select value={methodId} onValueChange={setMethodId}>
          <SelectTrigger id="payment-method" className="bg-gray-900 border-gray-700" aria-label="Select payment method">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((pm) => (
              <SelectItem key={pm.id} value={pm.id}>
                {pm.name} ({pm.type === 'crypto_wallet' ? 'Crypto' : 'Bank'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {paymentMethods.length === 0 && (
          <p className="text-xs text-yellow-500" role="alert">
            Please add a payment method first.
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isSubmitting || !amount || !methodId || parseFloat(amount) > balance}
      >
        {isSubmitting ? <span aria-live="polite">Processing...</span> : 'Request Withdrawal'}
      </Button>
    </form>
  );
}
