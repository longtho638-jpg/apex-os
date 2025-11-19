"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, ChevronRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cursorVisible, setCursorVisible] = useState(true);
    const [sessionId, setSessionId] = useState('');
    const router = useRouter();

    // Generate session ID on client-side only
    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(7).toUpperCase());
    }, []);

    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(v => !v);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black text-[#00FF00] font-mono flex items-center justify-center p-4 selection:bg-[#00FF00] selection:text-black">
            <div className="w-full max-w-md">
                <div
                    className="border border-[#00FF00]/30 bg-black/50 p-8 rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.1)] backdrop-blur-sm"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8 border-b border-[#00FF00]/20 pb-4">
                        <Terminal className="h-6 w-6" />
                        <h1 className="text-xl font-bold tracking-wider">APEX_ACCESS_TERMINAL</h1>
                    </div>

                    {/* Console Output */}
                    <div className="space-y-2 mb-8 text-sm opacity-80">
                        <p>&gt; Initializing secure connection...</p>
                        <p>&gt; Verifying encryption protocols... [OK]</p>
                        <p>&gt; Establishing handshake... [OK]</p>
                        <p className="text-white">&gt; Please identify yourself:</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <span className="absolute left-3 top-3 text-[#00FF00]">&gt;</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black border border-[#00FF00]/30 rounded px-8 py-3 text-[#00FF00] placeholder-[#00FF00]/30 focus:outline-none focus:border-[#00FF00] focus:shadow-[0_0_15px_rgba(0,255,0,0.2)] transition-all"
                                placeholder="enter_email_address"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#00FF00] text-black font-bold py-3 px-4 rounded hover:bg-[#00FF00]/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span>AUTHENTICATING{cursorVisible ? '_' : ''}</span>
                            ) : (
                                <>
                                    <span>ENTER_APEX</span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-xs text-[#00FF00]/40">
                        <p>UNAUTHORIZED ACCESS IS PROHIBITED</p>
                        <p>SESSION ID: {sessionId || '-------'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
