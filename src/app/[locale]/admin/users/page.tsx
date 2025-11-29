'use client';

import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, MoreHorizontal, Shield, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsersPage() {
  // Enhanced mock users data from God Mode
  const users = [
    { id: 'UID-001', name: 'Nguyen Van Hung', email: 'hung.whale@gmail.com', role: 'User', status: 'Active', tier: 'PRO', volume: '$12.5M' },
    { id: 'UID-002', name: 'Tran Thi Linh', email: 'linh.kol@crypto.vn', role: 'Admin', status: 'Active', tier: 'ELITE', volume: '$4.2M' },
    { id: 'UID-003', name: 'Le Hoang Nam', email: 'nam.fund@capital.com', role: 'User', status: 'Active', tier: 'BASIC', volume: '$8.9M' },
    { id: 'UID-004', name: 'Pham Minh Tuan', email: 'tuan.bot@gmail.com', role: 'User', status: 'Banned', tier: 'BASIC', volume: '$0.00' },
    { id: 'UID-005', name: 'Doan Van Hau', email: 'hau.trader@yahoo.com', role: 'User', status: 'Active', tier: 'PRO', volume: '$150K' },
    { id: 'UID-006', name: 'Sarah Jenkins', email: 'sarah.j@global.com', role: 'User', status: 'Active', tier: 'ELITE', volume: '$2.1M' },
    { id: 'UID-007', name: 'Michael Chen', email: 'm.chen@asia.net', role: 'User', status: 'Active', tier: 'PRO', volume: '$5.6M' },
    { id: 'UID-008', name: 'Bot Network 01', email: 'bot01@scam.net', role: 'User', status: 'Banned', tier: 'BASIC', volume: '$12K' },
    { id: 'UID-009', name: 'Kevin Durant', email: 'kd.sniper@nba.com', role: 'User', status: 'Active', tier: 'ELITE', volume: '$3.4M' },
    { id: 'UID-010', name: 'Elon Musk', email: 'doge.father@x.com', role: 'User', status: 'Active', tier: 'LIFETIME', volume: '$42.0B' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">

      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <Users className="h-7 w-7 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">User Management</h1>
                  <p className="text-sm text-zinc-400">Manage users, roles, and permissions</p>
                </div>
              </div>
              <div className="text-sm text-zinc-400">
                Total Users: <span className="text-white font-bold">1,248</span>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <GlassCard className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/5 text-zinc-400 font-medium uppercase">
                    <tr>
                      <th className="px-6 py-4">UID</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Volume (30d)</th>
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
                        <td className="px-6 py-4 font-mono text-zinc-500">{user.id}</td>
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
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${user.tier === 'PRO' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                            user.tier === 'ELITE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              user.tier === 'LIFETIME' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                            }`}>
                            {user.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400">
                          {user.volume}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
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