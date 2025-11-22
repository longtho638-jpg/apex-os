'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [supabase, setSupabase] = useState<any>(null);

    useEffect(() => {
        const initSupabase = async () => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
            const client = createClient(supabaseUrl, supabaseKey);

            setSupabase(client);

            // Check if we have a recovery token in the URL hash
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            const type = hashParams.get('type');

            console.log('Hash params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

            if (accessToken && type === 'recovery') {
                try {
                    // Set the session with the recovery tokens
                    const { data, error: sessionError } = await client.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (sessionError) {
                        console.error('Session error:', sessionError);
                        setError('Invalid or expired reset link');
                        return;
                    }

                    console.log('Session set successfully:', data);
                    setSessionReady(true);
                } catch (err) {
                    console.error('Error setting session:', err);
                    setError('Failed to initialize session');
                }
            } else {
                console.error('Missing required tokens or wrong type');
                setError('Invalid reset link. Please request a new password reset.');
            }
        };

        initSupabase();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!sessionReady || !supabase) {
            setError('Session not ready. Please try again.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                console.error('Update error:', updateError);
                setError(updateError.message);
                return;
            }

            setSuccess(true);

            // Sign out and redirect to login
            await supabase.auth.signOut();
            setTimeout(() => {
                router.push('/login?message=password_updated');
            }, 2000);
        } catch (err) {
            console.error('Reset error:', err);
            setError('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
                    <div className="text-center">
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
                        <p className="text-gray-400">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">
                    Reset Password
                </h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {!sessionReady && !error && (
                    <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 p-3 rounded-lg mb-4">
                        Initializing session...
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-medium">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                            placeholder="Enter new password (min 8 characters)"
                            required
                            minLength={8}
                            disabled={!sessionReady}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 text-sm font-medium">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                            placeholder="Confirm new password"
                            required
                            minLength={8}
                            disabled={!sessionReady}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !sessionReady}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/50"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-gray-400 hover:text-yellow-500 text-sm transition"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
