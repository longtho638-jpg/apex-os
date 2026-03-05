'use client';

import { motion } from 'framer-motion';

import { AlertCircle, ArrowLeft, CheckCircle, ChevronRight, Mail, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const locale = params.locale as string;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use Custom API to send branded email
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send recovery email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-white font-sans flex items-center justify-center p-4 overflow-hidden relative selection:bg-[#00FF94]/20">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#00FF94]/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00FF94] via-[#8B5CF6] to-[#06B6D4]" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00FF94]/20 to-[#06B6D4]/20 border border-[#00FF94]/30 mb-6 shadow-[0_0_20px_rgba(0,255,148,0.2)]">
              <Terminal className="h-8 w-8 text-[#00FF94]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Reset Password</h1>
            <p className="text-gray-400 text-sm">Enter your email to receive a password reset link</p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Check your email</h3>
              <p className="text-zinc-400 text-sm mb-6">
                We've sent a password reset link to <br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center text-[#00FF94] hover:text-[#00CC76] font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#00FF94] transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF94]/50 focus:bg-black/60 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00FF94] to-[#06B6D4] hover:from-[#00CC76] hover:to-[#0596A6] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,148,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center mt-6">
                <Link
                  href={`/${locale}/login`}
                  className="text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
