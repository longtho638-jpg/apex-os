import { AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react';

interface RelinkInfoCardProps {
  exchange: string;
  message: string;
  referralLink: string;
}

export function RelinkInfoCard({ exchange, message, referralLink }: RelinkInfoCardProps) {
  const formatExchangeName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="mt-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-amber-300 mb-1">Account Not Linked to Apex</h4>
            <p className="text-sm text-gray-300">{message}</p>
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-white/5">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">📋 Follow These Steps:</p>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Click the referral link below to open {formatExchangeName(exchange)}</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Create a new account OR transfer your existing account to Apex's referral program</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>After completing, return here and link your account again</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-lg transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group"
            >
              <span>Open Apex Referral Link</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              title="Copy referral link"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">Copy Link</span>
            </button>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-400 bg-black/20 rounded-lg p-3 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-emerald-400">Why is this needed?</span> Apex can only provide rebates
              for accounts registered under our referral program. This ensures your trading volume is tracked and
              rewarded properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
