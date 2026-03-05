import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface ExchangeStatusBadgeProps {
  status: string;
}

export function ExchangeStatusBadge({ status }: ExchangeStatusBadgeProps) {
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case 'pending':
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
          title="Verification in progress"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Pending
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertCircle className="w-3 h-3" />
          Failed
        </span>
      );
    case 'needs_relink':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
          <AlertTriangle className="w-3 h-3" />
          Relink Needed
        </span>
      );
    default:
      return <span className="text-gray-500 text-xs">{status}</span>;
  }
}
