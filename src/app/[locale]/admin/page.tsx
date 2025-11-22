"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Shield, Users, Activity, DollarSign, Search, AlertTriangle } from 'lucide-react';
import { useUserTier } from '@/hooks/useUserTier';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { ExchangeConfigPanel } from '@/components/admin/ExchangeConfigPanel';

export default function AdminPage() {
    const { tier, loading: tierLoading } = useUserTier();
    const { isAuthenticated, token } = useAuth();
    const router = useRouter();
    const t = useTranslations('Admin');
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        systemHealth: 'Healthy'
    });
    const [adminProfile, setAdminProfile] = useState<any>(null);

    useEffect(() => {
        if (!tierLoading && tier !== 'admin') {
            router.push('/dashboard');
        }
    }, [tier, tierLoading, router]);

    useEffect(() => {
        if (token && tier === 'admin') {
            fetchAdminProfile();
        }
    }, [token, tier]);

    const fetchAdminProfile = async () => {
        try {
            console.log('Fetching admin profile...');
            const res = await fetch('/api/v1/admin/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            console.log('Admin profile response:', data);
            if (data.success) {
                setAdminProfile(data.admin);
            }
        } catch (err) {
            console.error('Failed to fetch admin profile', err);
        }
    };

    if (tierLoading || tier !== 'admin') {
        return (
            <div className="flex h-screen w-full bg-[#030303] items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FF94]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="flex-1 overflow-y-auto z-10 p-8">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <Shield className="h-8 w-8 text-red-500" />
                                    {t('title')}
                                </h1>
                                <p className="text-gray-400 mt-1">{t('subtitle')}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
                                <Activity className="h-4 w-4" />
                                <span className="text-sm font-bold">{t('systemOperational')}</span>
                            </div>
                        </div>

                        {/* Security Alert - MFA */}
                        {adminProfile && !adminProfile.mfa_enabled && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Security Risk Detected</h3>
                                        <p className="text-red-200 text-sm">Multi-Factor Authentication (MFA) is disabled. Secure your admin account now.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/admin/security/mfa/setup')}
                                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Enable MFA
                                </button>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="glass-card rounded-xl p-6 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Users</p>
                                        <h3 className="text-2xl font-bold mt-1">1,234</h3>
                                    </div>
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Users className="h-5 w-5 text-blue-500" />
                                    </div>
                                </div>
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                    <span>+12%</span>
                                    <span className="text-gray-500">vs last month</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-6 border-l-4 border-[#00FF94]">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Active Users</p>
                                        <h3 className="text-2xl font-bold mt-1">856</h3>
                                    </div>
                                    <div className="p-2 bg-[#00FF94]/10 rounded-lg">
                                        <Activity className="h-5 w-5 text-[#00FF94]" />
                                    </div>
                                </div>
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                    <span>+5%</span>
                                    <span className="text-gray-500">vs last month</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-6 border-l-4 border-yellow-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Total Revenue</p>
                                        <h3 className="text-2xl font-bold mt-1">$45,230</h3>
                                    </div>
                                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-yellow-500" />
                                    </div>
                                </div>
                                <div className="text-xs text-green-400 flex items-center gap-1">
                                    <span>+8%</span>
                                    <span className="text-gray-500">vs last month</span>
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-6 border-l-4 border-red-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">System Alerts</p>
                                        <h3 className="text-2xl font-bold mt-1">0</h3>
                                    </div>
                                    <div className="p-2 bg-red-500/10 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    All systems normal
                                </div>
                            </div>
                        </div>

                        {/* Exchange API Configuration */}
                        <ExchangeConfigPanel />

                    </div>
                </div>
            </main>
        </div>
    );
}
