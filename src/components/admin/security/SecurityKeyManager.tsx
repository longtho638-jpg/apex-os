'use client';

import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Shield, Plus, Trash2, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityKey {
    id: string;
    credential_id: string;
    nickname: string;
    created_at: string;
    last_used_at: string | null;
}

export default function SecurityKeyManager() {
    const { user } = useAuth();
    const [keys, setKeys] = useState<SecurityKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const response = await fetch('/api/v1/admin/auth/webauthn/keys');
            if (response.ok) {
                const data = await response.json();
                setKeys(data.keys);
            }
        } catch (err) {
            logger.error('Failed to fetch keys', err);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Get options from server
            const resp = await fetch('/api/v1/admin/auth/webauthn/register/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: user?.id,
                    email: user?.email
                })
            });

            if (!resp.ok) throw new Error('Failed to start registration');
            const options = await resp.json();

            // 2. Pass options to browser authenticator
            const attResp = await startRegistration(options);

            // 3. Send response to server for verification
            const verificationResp = await fetch('/api/v1/admin/auth/webauthn/register/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId: user?.id,
                    response: attResp,
                    expectedChallenge: options.challenge // Note: In a real app, this should be session-bound
                })
            });

            const verificationJSON = await verificationResp.json();

            if (verificationJSON.verified) {
                alert('Security Key registered successfully!');
                fetchKeys();
            } else {
                setError(verificationJSON.error || 'Registration failed');
            }

        } catch (err: any) {
            logger.error("Error occurred", err);
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (keyId: string) => {
        if (!confirm('Are you sure you want to remove this security key?')) return;

        try {
            const response = await fetch(`/api/v1/admin/auth/webauthn/keys/${keyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchKeys();
            } else {
                alert('Failed to delete key');
            }
        } catch (err) {
            logger.error("Error occurred", err);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#00FF94]/20 flex items-center justify-center border border-[#00FF94]/30">
                        <Key className="h-5 w-5 text-[#00FF94]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Security Keys</h3>
                        <p className="text-sm text-gray-400">Manage your YubiKeys and Passkeys</p>
                    </div>
                </div>
                <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00FF94] text-black font-bold rounded-lg hover:bg-[#00CC76] transition-colors disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Key</span>
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {keys.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
                        No security keys registered yet.
                    </div>
                ) : (
                    keys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-[#00FF94]/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-[#00FF94]" />
                                <div>
                                    <div className="font-medium text-white">{key.nickname || 'Security Key'}</div>
                                    <div className="text-xs text-gray-500 font-mono">Added: {new Date(key.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(key.id)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
