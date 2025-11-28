'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, Lock, Activity, Search } from 'lucide-react';

const suspiciousUsers = [
    { id: 'USR-9928', risk: 'CRITICAL', reason: 'Multiple IP logins (CN, US, RU) in 10m', volume: '$2.4M' },
    { id: 'USR-1102', risk: 'HIGH', reason: 'Withdrawal > 500% of avg deposit', volume: '$150k' },
    { id: 'USR-3341', risk: 'MEDIUM', reason: 'Rapid high-frequency trading pattern', volume: '$890k' },
];

export default function RiskManagement() {
    const t = useTranslations('AdminRisk');
    const [killSwitchActive, setKillSwitchActive] = useState(false);

    return (
        <div className="space-y-8">
            {/* Kill Switch Section */}
            <Card className={`border-2 transition-all duration-500 ${killSwitchActive ? 'bg-red-950/30 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 'bg-black border-gray-800'}`}>
                <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${killSwitchActive ? 'bg-red-500 animate-pulse shadow-[0_0_30px_#ef4444]' : 'bg-gray-900 border border-gray-800'}`}>
                        <Lock className={`w-10 h-10 ${killSwitchActive ? 'text-white' : 'text-gray-600'}`} />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase">{t('kill_switch.title')}</h2>
                    <p className="text-gray-400 mb-8 max-w-md">
                        {t('kill_switch.description')}
                    </p>

                    <Button
                        size="lg"
                        onClick={() => setKillSwitchActive(!killSwitchActive)}
                        className={`h-16 px-12 text-lg font-bold tracking-widest transition-all duration-300 ${killSwitchActive
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                            : 'bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50'
                            }`}
                    >
                        {killSwitchActive ? t('kill_switch.restore') : t('kill_switch.activate')}
                    </Button>

                    {killSwitchActive && (
                        <div className="mt-6 flex items-center gap-2 text-red-500 font-mono animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            {t('kill_switch.lockdown')}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Suspicious Activity */}
            <Card className="bg-black border border-gray-800">
                <CardHeader className="border-b border-gray-800 flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        {t('suspicious_activity.title')}
                    </CardTitle>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">
                        <Activity className="w-3 h-3" />
                        <span>{t('suspicious_activity.live_scanning')}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm font-mono">
                        <thead>
                            <tr className="text-gray-600 border-b border-gray-900">
                                <th className="text-left p-4">{t('suspicious_activity.user_id')}</th>
                                <th className="text-left p-4">{t('suspicious_activity.risk_level')}</th>
                                <th className="text-left p-4">{t('suspicious_activity.reason')}</th>
                                <th className="text-right p-4">{t('suspicious_activity.volume')}</th>
                                <th className="text-right p-4">{t('suspicious_activity.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suspiciousUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-900 hover:bg-gray-900/50 transition-colors">
                                    <td className="p-4 font-bold text-white">{user.id}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                                            user.risk === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {user.risk}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400">{user.reason}</td>
                                    <td className="p-4 text-right text-white">{user.volume}</td>
                                    <td className="p-4 text-right">
                                        <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                            {t('suspicious_activity.freeze')}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
