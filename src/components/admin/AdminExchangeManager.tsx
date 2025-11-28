'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
    Network,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Settings,
    Lock,
    Key,
    Save,
    X
} from 'lucide-react';
import { EXCHANGES } from '@/types/exchange';

interface ExchangeConfig {
    exchange: string;
    partner_uuid: string | null;
    is_configured: boolean;
    updated_at: string;
}

export default function AdminExchangeManager() {
    const t = useTranslations('AdminExchange');
    const { token } = useAuth();

    const [configs, setConfigs] = useState<Record<string, ExchangeConfig>>({});
    const [loading, setLoading] = useState(true);
    const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        partner_uuid: '',
        api_key: '',
        api_secret: ''
    });

    const fetchConfigs = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetch('/api/v1/admin/exchange-config', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                const configMap: Record<string, ExchangeConfig> = {};
                data.configs.forEach((cfg: ExchangeConfig) => {
                    configMap[cfg.exchange] = cfg;
                });
                setConfigs(configMap);
            }
        } catch (err) {
            console.error('Failed to fetch configs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, [token]);

    const handleConfigure = (exchange: string) => {
        const currentConfig = configs[exchange];
        setFormData({
            partner_uuid: currentConfig?.partner_uuid || '',
            api_key: '', // Never fill API key for security
            api_secret: '' // Never fill API secret
        });
        setSelectedExchange(exchange);
    };

    const handleSave = async () => {
        if (!selectedExchange || !token) return;

        try {
            setSaving(true);
            const res = await fetch('/api/v1/admin/exchange-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    exchange: selectedExchange,
                    partner_uuid: formData.partner_uuid,
                    api_key: formData.api_key,
                    api_secret: formData.api_secret
                })
            });

            const data = await res.json();

            if (data.success) {
                await fetchConfigs();
                setSelectedExchange(null);
                alert(t('success_save'));
            } else {
                alert(data.message || t('error_save'));
            }
        } catch (err) {
            console.error('Save error', err);
            alert(t('error_save'));
        } finally {
            setSaving(false);
        }
    };

    const formatExchangeName = (exchange: string) => {
        return exchange.charAt(0).toUpperCase() + exchange.slice(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Network className="w-6 h-6 text-[#00FF94]" />
                        {t('title')}
                    </h2>
                    <p className="text-gray-400 mt-1">{t('subtitle')}</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-32 bg-gray-900/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {EXCHANGES.map((exchange) => {
                        const config = configs[exchange];
                        const isConfigured = config?.is_configured;

                        return (
                            <Card key={exchange} className={`bg-[#111111] border ${isConfigured ? 'border-[#00FF94]/20' : 'border-gray-800'} hover:border-[#00FF94]/50 transition-all`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${isConfigured ? 'bg-[#00FF94]/10 text-[#00FF94]' : 'bg-gray-800 text-gray-400'}`}>
                                                {exchange.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white">{formatExchangeName(exchange)}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {isConfigured ? (
                                                        <span className="text-xs text-[#00FF94] flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {t('status_configured')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            {t('status_not_configured')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isConfigured && config.partner_uuid && (
                                        <div className="mb-4 p-2 bg-black/50 rounded border border-gray-800">
                                            <p className="text-xs text-gray-500 font-mono">UUID: {config.partner_uuid}</p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleConfigure(exchange)}
                                        className={`w-full ${isConfigured ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-[#00FF94]/10 hover:bg-[#00FF94]/20 text-[#00FF94]'}`}
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        {isConfigured ? t('edit') : t('configure')}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Configuration Modal */}
            {selectedExchange && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-[#111111] border-gray-800">
                        <CardHeader className="border-b border-gray-800 flex flex-row items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-[#00FF94]" />
                                {t('configure_modal_title')}
                            </CardTitle>
                            <button onClick={() => setSelectedExchange(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-300 leading-relaxed">
                                    {t('secure_storage_notice')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400">{t('exchange_label')}</Label>
                                <Input
                                    value={formatExchangeName(selectedExchange)}
                                    disabled
                                    className="bg-black border-gray-800 text-gray-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400">{t('partner_uuid_label')}</Label>
                                <Input
                                    value={formData.partner_uuid}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, partner_uuid: e.target.value })}
                                    placeholder="e.g. 12345678"
                                    className="bg-black border-gray-800 text-white focus:border-[#00FF94]"
                                />
                                <p className="text-xs text-gray-600">{t('partner_uuid_desc')}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400">{t('api_key_label')}</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                                    <Input
                                        value={formData.api_key}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, api_key: e.target.value })}
                                        className="bg-black border-gray-800 text-white pl-9 focus:border-[#00FF94]"
                                        placeholder="Enter API Key"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-400">{t('api_secret_label')}</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-600" />
                                    <Input
                                        type="password"
                                        value={formData.api_secret}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, api_secret: e.target.value })}
                                        className="bg-black border-gray-800 text-white pl-9 focus:border-[#00FF94]"
                                        placeholder="Enter API Secret"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedExchange(null)}
                                    className="flex-1 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !formData.api_key || !formData.api_secret}
                                    className="flex-1 bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-bold"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t('saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {t('save_config')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
