'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Lock, Globe, Activity } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
    const t = useTranslations();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approval Queue - High Priority */}
            <div className="lg:col-span-2">
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h2 className="text-lg font-bold text-white mb-4">Security Management</h2>
                    <p className="text-zinc-400">Manage security settings and protocols</p>
                </div>
            </div>

            {/* Quick Links / Status Section */}
            <div className="space-y-6">
                <div className="glass-panel p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Security Settings</h3>
                    <div className="space-y-2">
                        <Link href="/admin/security/mfa/setup" className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                                    <Lock className="h-4 w-4 text-[#8B5CF6]" />
                                </div>
                                <div>
                                    <div className="font-medium text-white group-hover:text-[#00FF94] transition-colors">Two-Factor Authentication</div>
                                    <div className="text-xs text-zinc-500">Manage TOTP and Recovery Codes</div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/security/ip-whitelist" className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                                    <Globe className="h-4 w-4 text-[#06B6D4]" />
                                </div>
                                <div>
                                    <div className="font-medium text-white group-hover:text-[#00FF94] transition-colors">IP Whitelist</div>
                                    <div className="text-xs text-zinc-500">Manage allowed IP addresses</div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/security/audit-logs" className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
                                    <Activity className="h-4 w-4 text-[#F59E0B]" />
                                </div>
                                <div>
                                    <div className="font-medium text-white group-hover:text-[#00FF94] transition-colors">Audit Logs</div>
                                    <div className="text-xs text-zinc-500">View system activity history</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
