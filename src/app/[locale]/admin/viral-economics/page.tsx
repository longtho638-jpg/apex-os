'use client';

// Simple admin dashboard for Viral Economics
export default function ViralAdminPage() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-8">Viral Economics Command Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Commission Pool */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="text-lg font-bold mb-4">Commission Pool Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Rebate Pool</span>
              <span className="font-mono">$1,250,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Allocated</span>
              <span className="font-mono text-yellow-400">$1,100,000 (88%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Scaling Factor</span>
              <span className="font-mono text-green-400">1.0</span>
            </div>
          </div>
          <button className="mt-6 bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 w-full">
            Run Monthly Calculation
          </button>
        </div>

        {/* Tier Distribution */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h2 className="text-lg font-bold mb-4">Tier Distribution</h2>
          <div className="space-y-3">
            {['FREE', 'BASIC', 'TRADER', 'PRO', 'ELITE', 'APEX'].map((tier) => (
              <div key={tier} className="flex items-center gap-2">
                <span className="w-20 text-xs text-zinc-500">{tier}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.random() * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
