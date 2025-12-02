"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { EXCHANGES } from '@/types/exchange';

export default function APIKeyManager() {
    const [keys, setKeys] = useState<{ id: string, exchange: string, label: string, lastUsed: string }[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [exchange, setExchange] = useState(EXCHANGES[0]);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [label, setLabel] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/exchange/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exchange, apiKey, apiSecret, label })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMessage({ type: 'success', text: 'API Key connected successfully!' });
                // Mock adding to list for UI feedback
                setKeys(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    exchange,
                    label: label || `${exchange} Account`,
                    lastUsed: 'Just now'
                }]);
                setShowForm(false);
                setApiKey('');
                setApiSecret('');
                setLabel('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to connect exchange' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white">Exchange API Keys</h2>
                    <p className="text-sm text-zinc-400">Connect your exchange accounts for portfolio syncing.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Connect Exchange
                    </button>
                )}
            </div>

            {/* Add Key Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-5 bg-black/20 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">New Connection</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block">Exchange</label>
                            <select 
                                value={exchange}
                                onChange={(e) => setExchange(e.target.value as any)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                            >
                                {EXCHANGES.map(ex => (
                                    <option key={ex} value={ex}>{ex.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-400 mb-1.5 block">Label (Optional)</label>
                            <input 
                                type="text" 
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="e.g. Main Trading Account"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-zinc-400 mb-1.5 block">API Key</label>
                            <input 
                                type="text" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-zinc-400 mb-1.5 block">API Secret</label>
                            <input 
                                type="password" 
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 text-xs ${
                            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? 'Verifying...' : 'Save Connection'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Key List */}
            <div className="space-y-3">
                {keys.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                            <p className="text-2xl">🔑</p>
                        </div>
                        <p className="text-zinc-500 text-sm">No API keys connected yet.</p>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center font-bold text-zinc-500">
                                    {key.exchange.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{key.label}</h4>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span className="uppercase">{key.exchange}</span>
                                        <span>•</span>
                                        <span>Last synced: {key.lastUsed}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
