import { CreditCard, Landmark, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentMethod } from '@/types/finance';

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  onUpdate: () => void;
}

export function PaymentMethodsList({ methods, onUpdate }: PaymentMethodsListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newMethod, setNewMethod] = useState({ type: 'crypto_wallet', name: '', address: '', network: 'TRC20' });

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/v1/user/finance/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newMethod.type,
          name: newMethod.name,
          details: {
            address: newMethod.address,
            network: newMethod.network,
          },
        }),
      });

      if (res.ok) {
        toast.success('Payment method added');
        setIsOpen(false);
        onUpdate();
      } else {
        toast.error('Failed to add method');
      }
    } catch (_e) {
      toast.error('Error adding method');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Saved Methods</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>Type</label>
                <Select value={newMethod.type} onValueChange={(v) => setNewMethod({ ...newMethod, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crypto_wallet">Crypto Wallet</SelectItem>
                    {/* <SelectItem value="bank_transfer">Bank Transfer</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Label Name</label>
                <Input
                  placeholder="e.g. My Binance"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label>Network</label>
                <Input
                  value={newMethod.network}
                  onChange={(e) => setNewMethod({ ...newMethod, network: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label>Address</label>
                <Input
                  placeholder="0x..."
                  value={newMethod.address}
                  onChange={(e) => setNewMethod({ ...newMethod, address: e.target.value })}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Save Method
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {methods.map((method) => (
          <Card key={method.id} className="p-4 bg-gray-900 border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {method.type === 'crypto_wallet' ? (
                <CreditCard className="text-purple-400" />
              ) : (
                <Landmark className="text-blue-400" />
              )}
              <div>
                <div className="font-medium text-white">{method.name}</div>
                <div className="text-sm text-gray-400">
                  {method.details.network} • {method.details.address?.substring(0, 8)}...
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
              <Trash2 className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
