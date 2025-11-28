import React from 'react';
import { DollarSign, PieChart, Download } from 'lucide-react';

interface CommissionDashboardProps {
  totalEarned: number;
  pending: number;
  history: Array<{ month: string; amount: number; status: string }>;
}

export function CommissionDashboard({ totalEarned, pending, history }: CommissionDashboardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 text-white border border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Total Earned</span>
          </div>
          <div className="text-3xl font-bold">${totalEarned.toLocaleString()}</div>
        </div>
        
        <div className="p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <PieChart className="w-4 h-4 text-blue-500" />
            <span>Pending Payout</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">${pending.toLocaleString()}</div>
        </div>

        <div className="flex items-center justify-center">
          <button 
            disabled={pending < 50}
            className={`px-6 py-3 rounded-lg font-bold w-full ${
              pending >= 50 
                ? 'bg-emerald-600 hover:bg-emerald-500' 
                : 'bg-gray-700 cursor-not-allowed text-gray-500'
            }`}
          >
            {pending >= 50 ? 'Withdraw Funds' : 'Min. $50 to Withdraw'}
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-4">Commission History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="pb-3">Month</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {history.map((item, i) => (
              <tr key={i} className="hover:bg-gray-800/50">
                <td className="py-3">{item.month}</td>
                <td className="py-3 font-mono">${item.amount.toFixed(2)}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'paid' ? 'bg-emerald-900 text-emerald-400' : 'bg-yellow-900 text-yellow-400'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-gray-400 hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
