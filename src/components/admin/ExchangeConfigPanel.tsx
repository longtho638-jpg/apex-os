'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Lock, Eye, EyeOff, Check, AlertTriangle, Loader2 } from 'lucide-react';

interface ExchangeConfig {
    exchange: string;
    partner_uuid: string | null;
    is_configured: boolean;
    updated_at: string;
}

export function ExchangeConfigPanel() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'binance' | 'bybit' | 'okx' | 'coinbase' | 'kraken' | 'kucoin' | 'gateio' | 'huobi' | 'bitfinex' | 'phemex' | 'deribit' | 'mexc'>('binance');
    const [configs, setConfigs] = useState<ExchangeConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [partnerUuid, setPartnerUuid] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showApiSecret, setShowApiSecret] = useState(false);

    useEffect(() => {
        if (token) {
            fetchConfigs();
        } else {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        // Reset form when switching tabs
        const config = configs.find(c => c.exchange === activeTab);
        setPartnerUuid(config?.partner_uuid || '');
        setApiKey('');
        setApiSecret('');
        setShowApiKey(false);
        setShowApiSecret(false);
        setError('');
        setShowSuccess(false);
    }, [activeTab, configs]);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/v1/admin/exchange-config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setConfigs(data.configs);
            }
        } catch (err) {
            console.error('Failed to fetch exchange configs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!apiKey || !apiSecret) {
            setError('API Key and Secret are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/v1/admin/exchange-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange: activeTab,
                    partner_uuid: partnerUuid || null,
                    api_key: apiKey,
                    api_secret: apiSecret
                })
            });

            const data = await res.json();

            if (data.success) {
                setShowSuccess(true);
                setApiKey('');
                setApiSecret('');
                fetchConfigs();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                setError(data.message || 'Failed to save configuration');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const currentConfig = configs.find(c => c.exchange === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Exchange Configuration</h2>
                        <p className="text-sm text-gray-400">Manage IB/Partner API Keys (AES-256 Encrypted)</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto pb-2">
                {(['binance', 'bybit', 'okx', 'coinbase', 'kraken', 'kucoin', 'gateio', 'huobi', 'bitfinex', 'phemex', 'deribit', 'mexc'] as const).map((exchange) => {
                    const config = configs.find(c => c.exchange === exchange);
                    return (
                        <button
                            key={exchange}
                            onClick={() => setActiveTab(exchange)}
                            className={`px-6 py-3 font-medium transition-colors relative whitespace-nowrap ${activeTab === exchange
                                ? 'text-white border-b-2 border-emerald-500'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <span className="capitalize">{exchange === 'gateio' ? 'Gate.io' : exchange === 'okx' ? 'OKX' : exchange === 'kucoin' ? 'KuCoin' : exchange}</span>
                            {config?.is_configured && (
                                <div className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Form */}
            <div className="glass-card rounded-xl p-6 space-y-6">
                {/* Status Badge */}
                {currentConfig?.is_configured && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Active Configuration</span>
                        <span className="text-xs text-gray-400 ml-auto">
                            Updated {new Date(currentConfig.updated_at).toLocaleDateString()}
                        </span>
                    </div>
                )}

                {/* Partner UUID */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Partner UUID (Optional)
                    </label>
                    <input
                        type="text"
                        value={partnerUuid}
                        onChange={(e) => setPartnerUuid(e.target.value)}
                        placeholder="Enter Partner UUID or IB Code"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Used for referral tracking on {activeTab}
                    </p>
                </div>

                {/* API Key */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Master API Key *
                    </label>
                    <div className="relative">
                        <input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={currentConfig?.is_configured ? '••••••••••••••••' : 'Enter API Key'}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* API Secret */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Master API Secret *
                    </label>
                    <div className="relative">
                        <input
                            type={showApiSecret ? 'text' : 'password'}
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            placeholder={currentConfig?.is_configured ? '••••••••••••••••' : 'Enter API Secret'}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                        />
                        <button
                            type="button"
                            onClick={() => setShowApiSecret(!showApiSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200">
                    <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                        <p className="font-medium mb-1">Security Notice</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
                            <li>Keys are encrypted with AES-256 before storage</li>
                            <li>Never sent back to frontend after saving</li>
                            <li>Only stored encrypted values can be retrieved</li>
                        </ul>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Success Message */}
                {showSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 animate-pulse">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Configuration saved securely!</span>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving || !apiKey || !apiSecret}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Encrypting & Saving...
                        </>
                    ) : (
                        <>
                            <Lock className="h-4 w-4" />
                            Save Configuration
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
