'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { Save, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface ExchangeConfig {
    exchange_name: string;
    standard_maker_fee: number;
    standard_taker_fee: number;
    apex_partner_rate: number;
    partner_uuid: string; // New field
    is_active: boolean;
}

export default function ExchangeConfigPage() {
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState<ExchangeConfig[]>([]);
    const supabase = getSupabaseClientSide();

    const fetchConfigs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('exchange_configs')
            .select('*')
            .order('exchange_name');
        
        if (error) {
            console.error('Error fetching configs:', error);
            // Mock data
            setConfigs([
                { exchange_name: 'Binance', standard_maker_fee: 0.001, standard_taker_fee: 0.001, apex_partner_rate: 0.20, partner_uuid: '', is_active: true },
                { exchange_name: 'OKX', standard_maker_fee: 0.0008, standard_taker_fee: 0.001, apex_partner_rate: 0.45, partner_uuid: '', is_active: true },
                { exchange_name: 'Bybit', standard_maker_fee: 0.001, standard_taker_fee: 0.001, apex_partner_rate: 0.40, partner_uuid: '', is_active: true },
            ]);
        } else if (data) {
            setConfigs(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const updateConfig = (index: number, field: keyof ExchangeConfig, value: any) => {
        const newConfigs = [...configs];
        newConfigs[index] = { ...newConfigs[index], [field]: value };
        setConfigs(newConfigs);
    };

    const handleSave = async () => {
        setLoading(true);
        // Ensure we only save fields that exist in the table
        const updates = configs.map(cfg => ({
            exchange_name: cfg.exchange_name,
            standard_maker_fee: cfg.standard_maker_fee,
            standard_taker_fee: cfg.standard_taker_fee,
            apex_partner_rate: cfg.apex_partner_rate,
            partner_uuid: cfg.partner_uuid,
            is_active: cfg.is_active
        }));

        const { error } = await supabase
            .from('exchange_configs')
            .upsert(updates, { onConflict: 'exchange_name' });
        
        if (error) {
            console.error('Error saving configs:', error);
            alert('Failed to save changes');
        } else {
            alert('Changes saved successfully');
        }
        setLoading(false);
    };

    return (
        <div className="p-8 bg-[#030303] min-h-screen text-white font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Exchange Revenue Management
                    </h1>
                    <p className="text-zinc-400">Configure fee structures and partner rates globally</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={fetchConfigs}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        Sync
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Exchange</th>
                                <th className="px-6 py-4">Partner UUID (Ref ID)</th>
                                <th className="px-6 py-4">Maker Fee</th>
                                <th className="px-6 py-4">Taker Fee</th>
                                <th className="px-6 py-4 text-emerald-400 font-bold">Partner Rate (%)</th>
                                <th className="px-6 py-4">Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {configs.map((cfg, idx) => (
                                <tr key={cfg.exchange_name} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white">{cfg.exchange_name}</td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="text" 
                                            value={cfg.partner_uuid || ''}
                                            onChange={(e) => updateConfig(idx, 'partner_uuid', e.target.value)}
                                            placeholder="e.g. LIMITLESS_V2"
                                            className="bg-transparent border border-white/10 rounded px-2 py-1 w-40 text-white focus:border-emerald-500 focus:outline-none"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number" 
                                            value={cfg.standard_maker_fee}
                                            onChange={(e) => updateConfig(idx, 'standard_maker_fee', parseFloat(e.target.value))}
                                            className="bg-transparent border border-white/10 rounded px-2 py-1 w-20 text-right focus:border-emerald-500 focus:outline-none"
                                            step="0.0001"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="number" 
                                            value={cfg.standard_taker_fee}
                                            onChange={(e) => updateConfig(idx, 'standard_taker_fee', parseFloat(e.target.value))}
                                            className="bg-transparent border border-white/10 rounded px-2 py-1 w-20 text-right focus:border-emerald-500 focus:outline-none"
                                            step="0.0001"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative w-24">
                                            <input 
                                                type="number" 
                                                value={(cfg.apex_partner_rate * 100).toFixed(1)}
                                                onChange={(e) => updateConfig(idx, 'apex_partner_rate', parseFloat(e.target.value) / 100)}
                                                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded px-2 py-1 w-full text-right focus:border-emerald-500 focus:outline-none pr-6"
                                                step="0.1"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 text-xs">%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            checked={cfg.is_active}
                                            onChange={(e) => updateConfig(idx, 'is_active', e.target.checked)}
                                            className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-zinc-500 text-xs">
                    <AlertCircle size={14} />
                    <span>Changes affect all users on standard tier. Enterprise clients have separate overrides.</span>
                </div>
        </div>
    );
}