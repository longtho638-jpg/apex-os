'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export function APIKeyManager() {
    const [keys, setKeys] = useState<any[]>([]);
    const [exchange, setExchange] = useState('binance');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [label, setLabel] = useState('');

    const fetchKeys = async () => {
        const res = await fetch('/api/v1/trading/keys');
        if (res.ok) {
            const data = await res.json();
            setKeys(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/v1/trading/keys', {
            method: 'POST',
            body: JSON.stringify({ exchange, key: apiKey, secret: apiSecret, label }),
        });
        if (res.ok) {
            alert('API Key added successfully');
            setApiKey('');
            setApiSecret('');
            setLabel('');
            fetchKeys();
        } else {
            alert('Failed to add API Key');
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Exchange API Keys</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={exchange}
                            onChange={(e) => setExchange(e.target.value)}
                        >
                            <option value="binance">Binance</option>
                            <option value="bybit">Bybit</option>
                        </select>
                        <input
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Label (e.g. Main Account)"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <input
                        type="password"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="API Secret"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                    />
                    <Button type="submit">Add Key</Button>
                </form>

                <div className="space-y-2">
                    {keys.map((k) => (
                        <div key={k.id} className="flex justify-between p-3 border rounded bg-slate-900/50">
                            <div>
                                <span className="font-bold uppercase">{k.exchange}</span>
                                <span className="ml-2 text-muted-foreground">{k.label}</span>
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                                {k.key.substring(0, 8)}...
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
