'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getSupabaseClientSide } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClientSide();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      router.push('/login');
    } catch (error: unknown) {
      logger.error('Error updating password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      toast.error(errorMessage);
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

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00FF94]/20 to-[#06B6D4]/20 border border-[#00FF94]/30 mb-6 shadow-[0_0_20px_rgba(0,255,148,0.2)]">
              <Lock className="h-8 w-8 text-[#00FF94]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Set New Password</h1>
            <p className="text-gray-400 text-sm">Secure your account with a new password</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00FF94] transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF94]/50 focus:bg-black/60 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00FF94] transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF94]/50 focus:bg-black/60 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00FF94] to-[#06B6D4] hover:from-[#00CC76] hover:to-[#0596A6] text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,148,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
