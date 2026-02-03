'use client';

import { logger } from '@/lib/logger';
import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Key, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you might want to use context or just direct API

interface WebAuthnLoginButtonProps {
    email: string;
    onSuccess?: () => void;
}

export default function WebAuthnLoginButton({ email, onSuccess }: WebAuthnLoginButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email) {
            alert('Please enter your email first');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Get options from server
            const resp = await fetch('/api/v1/admin/auth/webauthn/login/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to start login');
            }

            const { options, adminId } = await resp.json();

            // 2. Pass options to browser authenticator
            const asseResp = await startAuthentication(options);

            // 3. Verify response with server
            const verificationResp = await fetch('/api/v1/admin/auth/webauthn/login/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminId,
                    response: asseResp,
                    expectedChallenge: options.challenge
                })
            });

            const verificationJSON = await verificationResp.json();

            if (verificationJSON.verified) {
                // Handle successful login (store token, redirect)
                // In a real app, you'd use your AuthContext here to set the user/token
                // For now, let's assume we manually set it or reload

                // Example:
                // localStorage.setItem('apex_token', verificationJSON.token);
                // document.cookie = `sb-access-token=${verificationJSON.token}; path=/; max-age=604800`;

                // Better: Call a prop or context method
                if (onSuccess) {
                    onSuccess();
                } else {
                    // Default fallback
                    window.location.href = '/dashboard';
                }
            } else {
                alert('Login failed: ' + (verificationJSON.error || 'Unknown error'));
            }

        } catch (err: any) {
            logger.error("Error occurred", err);
            alert(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#00FF94]" />
            ) : (
                <>
                    <Key className="h-5 w-5 text-[#00FF94] group-hover:scale-110 transition-transform" />
                    <span>Sign in with Security Key</span>
                </>
            )}
        </button>
    );
}
