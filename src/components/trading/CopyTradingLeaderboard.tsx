'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Star } from 'lucide-react';

interface Leader {
    id: string;
    user_id: string;
    display_name: string;
    description: string;
    total_pnl: number;
    win_rate: number;
    total_trades: number;
    active_followers: number;
}

export function CopyTradingLeaderboard({ userId }: { userId: string }) {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchLeaders();
        fetchFollowing();
    }, []);

    const fetchLeaders = async () => {
        try {
            const res = await fetch('/api/v1/trading/copy-trading?action=leaders');
            const data = await res.json();
            if (data.success) {
                setLeaders(data.leaders || []);
            }
        } catch (error) {
            console.error('Failed to fetch leaders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowing = async () => {
         try {
             const res = await fetch(`/api/v1/trading/copy-trading?action=following&userId=${userId}`);
             const data = await res.json();
             if (data.success) {
                 const followingIds = new Set<string>(data.following.map((f: any) => String(f.leader_id)));
                 setFollowing(followingIds);
             }
         } catch (error) {
             console.error('Failed to fetch following:', error);
         }
     };

    const followLeader = async (leaderId: string) => {
        try {
            const res = await fetch('/api/v1/trading/copy-trading', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'follow',
                    userId,
                    leaderId,
                    copyRatio: 1.0
                })
            });

            const data = await res.json();
            if (data.success) {
                setFollowing(prev => new Set(prev).add(leaderId));
                await fetchLeaders();
            }
        } catch (error) {
            console.error('Failed to follow leader:', error);
        }
    };

    const unfollowLeader = async (leaderId: string) => {
        try {
            const res = await fetch('/api/v1/trading/copy-trading', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, leaderId })
            });

            const data = await res.json();
            if (data.success) {
                setFollowing(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(leaderId);
                    return newSet;
                });
                await fetchLeaders();
            }
        } catch (error) {
            console.error('Failed to unfollow leader:', error);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading leaders...</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Copy Trading Leaders</h2>
                <p className="text-sm text-muted-foreground">
                    Follow successful traders and automatically copy their trades
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leaders.map((leader) => {
                    const isFollowing = following.has(leader.id);
                    const isProfitable = leader.total_pnl >= 0;

                    return (
                        <Card key={leader.id} className="border-border/50">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{leader.display_name}</CardTitle>
                                        {leader.total_trades > 100 && (
                                            <Badge variant="outline" className="mt-1">
                                                <Star className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <div className={`text-2xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                                        {isProfitable ? '+' : ''}${leader.total_pnl.toFixed(0)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {leader.description && (
                                    <p className="text-sm text-muted-foreground">{leader.description}</p>
                                )}

                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Win Rate</p>
                                        <p className="font-semibold">{leader.win_rate.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Trades</p>
                                        <p className="font-semibold">{leader.total_trades}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Followers</p>
                                        <p className="font-semibold flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {leader.active_followers}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    variant={isFollowing ? 'outline' : 'default'}
                                    onClick={() => isFollowing ? unfollowLeader(leader.id) : followLeader(leader.id)}
                                >
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {leaders.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No leaders available yet. Be the first to register!
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
