'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Building2, Users, Plus, Copy, TrendingUp, Bot, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { RAAS_CONFIG } from '@apex-os/vibe-payment';

interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'trader' | 'viewer';
  volume30d: number;
  agentsDeployed: number;
}

export default function OrgDashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orgName, setOrgName] = useState('');

  // Mock org data — in production, fetch from /api/v1/org
  const org = {
    id: 'org_001',
    name: 'Alpha Trading Group',
    slug: 'alpha-trading',
    inviteCode: 'APEX-ALPHA-7K3M',
    totalVolume: 285_000,
    tier: 'ARCHITECT',
    membersCount: 5,
    agentSlots: 7,
    agentsUsed: 4,
  };

  const members: OrgMember[] = [
    { id: '1', name: 'Nguyen Van A', email: 'a@apex.io', role: 'owner', volume30d: 120_000, agentsDeployed: 2 },
    { id: '2', name: 'Tran Thi B', email: 'b@apex.io', role: 'admin', volume30d: 85_000, agentsDeployed: 1 },
    { id: '3', name: 'Le Van C', email: 'c@apex.io', role: 'trader', volume30d: 45_000, agentsDeployed: 1 },
    { id: '4', name: 'Pham D', email: 'd@apex.io', role: 'trader', volume30d: 25_000, agentsDeployed: 0 },
    { id: '5', name: 'Hoang E', email: 'e@apex.io', role: 'viewer', volume30d: 10_000, agentsDeployed: 0 },
  ];

  const copyInviteCode = () => {
    navigator.clipboard.writeText(org.inviteCode);
    toast.success('Invite code copied!');
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim()) return;
    toast.success(`Organization "${orgName}" created!`);
    setShowCreateModal(false);
    setOrgName('');
  };

  const roleColors: Record<string, string> = {
    owner: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    trader: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    viewer: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">
      <Sidebar />

      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full flex flex-col overflow-y-auto custom-scrollbar">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Building2 className="h-7 w-7 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{org.name}</h1>
                  <p className="text-sm text-zinc-400">
                    Multi-Org · Volume Pooling {RAAS_CONFIG.multiOrg.volumePooling ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> New Organization
              </button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Pooled Volume (30d)', value: `$${(org.totalVolume / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Org Tier', value: org.tier, icon: Crown, color: 'text-amber-400' },
                { label: 'Members', value: `${org.membersCount} / ${RAAS_CONFIG.multiOrg.maxOrgsPerUser * 10}`, icon: Users, color: 'text-cyan-400' },
                { label: 'AI Agents', value: `${org.agentsUsed} / ${org.agentSlots}`, icon: Bot, color: 'text-purple-400' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-xs text-zinc-500">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Invite Code */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Invite Code</div>
                  <div className="font-mono text-lg font-bold text-white tracking-wider">{org.inviteCode}</div>
                </div>
                <button
                  onClick={copyInviteCode}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
            </GlassCard>

            {/* Members Table */}
            <GlassCard className="overflow-hidden p-0">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> Members
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 border-b border-white/5 text-zinc-400 font-medium uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Member</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Volume (30d)</th>
                      <th className="px-6 py-3">Agents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((member, i) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{member.name}</div>
                              <div className="text-zinc-500 text-xs">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold border ${roleColors[member.role]}`}>
                            {member.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400">
                          ${member.volume30d.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Bot className="w-3 h-3 text-purple-400" />
                            <span>{member.agentsDeployed}</span>
                          </div>
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

      {/* Create Org Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-4">Create Organization</h2>
            <input
              type="text"
              placeholder="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrg}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-bold transition-colors"
              >
                Create
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
