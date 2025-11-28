'use client';

import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, MoreHorizontal, Shield, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsersPage() {
  // Mock users data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active', tier: 'PRO' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active', tier: 'ELITE' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Inactive', tier: 'BASIC' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        
        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Users className="h-7 w-7 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-sm text-zinc-400">Manage users, roles, and permissions</p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <GlassCard className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/5 text-zinc-400 font-medium uppercase">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user, i) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.name}</div>
                              <div className="text-zinc-500 text-xs">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.role === 'Admin' && <Shield className="w-3 h-3 text-amber-400" />}
                            <span>{user.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                            user.tier === 'PRO' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                            user.tier === 'ELITE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                          }`}>
                            {user.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {user.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}