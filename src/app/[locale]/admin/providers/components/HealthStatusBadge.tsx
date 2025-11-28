interface HealthStatusBadgeProps {
    status: string | null;
    lastCheck: string | null;
}

export default function HealthStatusBadge({ status, lastCheck }: HealthStatusBadgeProps) {
    if (!status) {
        return <span className="text-gray-500 text-xs">-</span>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'degraded':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'down':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return '✅';
            case 'degraded': return '⚠️';
            case 'down': return '❌';
            default: return '❓';
        }
    };

    const getTimeAgo = (timestamp: string | null) => {
        if (!timestamp) return '';
        const now = new Date().getTime();
        const then = new Date(timestamp).getTime();
        const diff = Math.floor((now - then) / 1000 / 60); // minutes

        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(status)} flex items-center gap-1`}>
                <span>{getStatusIcon(status)}</span>
                <span>{status}</span>
            </span>
            {lastCheck && (
                <span className="text-xs text-gray-500">{getTimeAgo(lastCheck)}</span>
            )}
        </div>
    );
}
