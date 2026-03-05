import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/types/finance';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-800 rounded"></div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-gray-400">No transactions found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-800/50 text-gray-200 uppercase font-medium">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.created_at)}</td>
              <td className="px-4 py-3">
                <Badge variant={tx.type === 'rebate' ? 'success' : tx.type === 'withdrawal' ? 'warning' : 'default'}>
                  {tx.type}
                </Badge>
              </td>
              <td className="px-4 py-3 max-w-xs truncate" title={tx.description}>
                {tx.description || '-'}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}
                {formatCurrency(tx.amount)}
              </td>
              <td className="px-4 py-3 text-right text-white">{formatCurrency(tx.balance_after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
