'use client';

import { AlertTriangle, Bell, Key, Link, Save, Shield, User } from 'lucide-react';
import { useState } from 'react';
import APIKeyManager from '@/components/dashboard/APIKeyManager';
import ConnectExchange from '@/components/dashboard/ConnectExchange';
import { useRisk } from '@/hooks/useRisk';
import { useUserTier } from '@/hooks/useUserTier';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'api' | 'connections' | 'risk'>(
    'connections',
  );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
              <TabButton
                icon={<Link size={18} />}
                label="Connections"
                active={activeTab === 'connections'}
                onClick={() => setActiveTab('connections')}
              />
              <TabButton
                icon={<User size={18} />}
                label="Account"
                active={activeTab === 'account'}
                onClick={() => setActiveTab('account')}
              />
              <TabButton
                icon={<Shield size={18} />}
                label="Security"
                active={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
              />
              <TabButton
                icon={<Bell size={18} />}
                label="Notifications"
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
              />
              <TabButton
                icon={<AlertTriangle size={18} />}
                label="Risk Management"
                active={activeTab === 'risk'}
                onClick={() => setActiveTab('risk')}
              />
              <TabButton
                icon={<Key size={18} />}
                label="API Keys"
                active={activeTab === 'api'}
                onClick={() => setActiveTab('api')}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pb-20">
            {activeTab === 'connections' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-6">Exchange Connections</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Verify your exchange account UID to activate rebate tracking and unlock Viral Tiers.
                </p>
                <ConnectExchange />
              </div>
            )}
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'risk' && <RiskSettings />}
            {activeTab === 'api' && <APIKeyManager />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function AccountSettings() {
  const { tier: currentTier } = useUserTier();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-6">Account Information</h2>
      <div className="space-y-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider">Current Tier</p>
            <p className="text-2xl font-bold text-white">{currentTier}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-black">
            {currentTier.charAt(0)}
          </div>
        </div>
        <FormField label="Email" value="user@example.com" />
        <FormField label="Username" value="trader_pro" />
        <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

function RiskSettings() {
  const { dailyLoss, maxDrawdown } = useRisk();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-6">Risk Management (Circuit Breaker)</h2>
      <div className="space-y-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <p className="text-red-400 font-bold">Current Daily Loss</p>
            <p className="text-xl font-mono text-white">${dailyLoss.toFixed(2)}</p>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-500"
              style={{ width: `${Math.min((dailyLoss / maxDrawdown) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">Limit: ${maxDrawdown}</p>
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Daily Loss Limit ($)</label>
          <input
            type="number"
            defaultValue={maxDrawdown}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
          <p className="text-xs text-zinc-500 mt-2">
            If your daily loss exceeds this amount, new trades will be blocked automatically.
          </p>
        </div>

        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
          Update Limits
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-6">Security Settings</h2>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="font-medium mb-1">Two-Factor Authentication</p>
          <p className="text-sm text-zinc-400 mb-3">Add an extra layer of security</p>
          <button className="px-4 py-2 bg-emerald-500 rounded-lg text-sm font-medium">Enable 2FA</button>
        </div>
        <div className="p-4 bg-white/5 rounded-xl">
          <p className="font-medium mb-1">Change Password</p>
          <p className="text-sm text-zinc-400 mb-3">Last changed 30 days ago</p>
          <button className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">Update Password</button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
      <div className="space-y-3">
        <NotificationToggle label="Trading Signals" description="Get notified about new AI signals" enabled />
        <NotificationToggle label="Commission Earned" description="Alerts when you earn commission" enabled />
        <NotificationToggle label="Fee Rebates" description="Alerts when you save on fees" enabled />
        <NotificationToggle label="Risk Alerts" description="Circuit breaker warnings" enabled />
      </div>
    </div>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-zinc-400 mb-2 block">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
      />
    </div>
  );
}

function NotificationToggle({ label, description, enabled }: { label: string; description: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <button className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
