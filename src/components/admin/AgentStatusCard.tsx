import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Power } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AgentStatusProps {
    agentId: string;
    status: 'RUNNING' | 'STOPPED' | 'ERROR' | 'OFFLINE';
    lastHeartbeat: string;
    metadata: any;
    errorMessage?: string;
}

export const AgentStatusCard: React.FC<AgentStatusProps> = ({
    agentId,
    status,
    lastHeartbeat,
    metadata,
    errorMessage,
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RUNNING':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'STOPPED':
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            case 'ERROR':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'OFFLINE':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RUNNING':
                return <CheckCircle className="w-4 h-4" />;
            case 'STOPPED':
                return <Power className="w-4 h-4" />;
            case 'ERROR':
                return <AlertCircle className="w-4 h-4" />;
            case 'OFFLINE':
                return <Clock className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium capitalize">
                    {agentId.replace('_', ' ')} Agent
                </CardTitle>
                <Badge variant="outline" className={getStatusColor(status)}>
                    <span className="flex items-center gap-1">
                        {getStatusIcon(status)}
                        {status}
                    </span>
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Last Heartbeat
                        </span>
                        <span>
                            {lastHeartbeat
                                ? formatDistanceToNow(new Date(lastHeartbeat), { addSuffix: true })
                                : 'Never'}
                        </span>
                    </div>

                    {metadata && Object.keys(metadata).length > 0 && (
                        <div className="p-2 rounded-md bg-muted/50">
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Metrics</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(metadata).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-[10px] uppercase text-muted-foreground">
                                            {key}
                                        </span>
                                        <span className="text-xs font-mono">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-2 text-xs text-red-400 border border-red-500/20 rounded-md bg-red-500/10">
                            <p className="font-semibold">Error:</p>
                            <p className="break-words">{errorMessage}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
