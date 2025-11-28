'use client';

import { useState } from 'react';
import { Key, Bell, Shield, User, Save } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'api'>('account');

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
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
                            icon={<Key size={18} />}
                            label="API Keys"
                            active={activeTab === 'api'}
                            onClick={() => setActiveTab('api')}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'account' && <AccountSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'notifications' && <NotificationSettings />}
                    {activeTab === 'api' && <APIKeySettings />}
                </div>
            </div>
        </div>
    );
}

function TabButton({
    icon,
    label,
    active,
    onClick
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
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
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6">Account Information</h2>
            <div className="space-y-4">
                <FormField label="Email" value="user@example.com" />
                <FormField label="Username" value="trader_pro" />
                <FormField label="Display Name" value="Pro Trader" />
                <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition-colors flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
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
                    <button className="px-4 py-2 bg-emerald-500 rounded-lg text-sm font-medium">
                        Enable 2FA
                    </button>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                    <p className="font-medium mb-1">Change Password</p>
                    <p className="text-sm text-zinc-400 mb-3">Last changed 30 days ago</p>
                    <button className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
                        Update Password
                    </button>
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
                <NotificationToggle label="Price Alerts" description="Crypto price movement alerts" enabled={false} />
                <NotificationToggle label="Weekly Reports" description="Weekly performance summary" enabled />
            </div>
        </div>
    );
}

function APIKeySettings() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-6">API Keys</h2>
            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Production Key</p>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded">Active</span>
                    </div>
                    <p className="text-sm font-mono text-zinc-400">sk_live_••••••••••••••••</p>
                </div>
                <button className="px-4 py-2 bg-white/10 rounded-lg text-sm font-medium">
                    + Create New Key
                </button>
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

function NotificationToggle({
    label,
    description,
    enabled
}: {
    label: string;
    description: string;
    enabled: boolean;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-zinc-400">{description}</p>
            </div>
            <button
                className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
            >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
            </button>
        </div>
    );
}
