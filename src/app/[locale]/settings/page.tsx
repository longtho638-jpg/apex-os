"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Settings, User, Key, Bell, Shield, Save, Trash2, Plus } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'api-keys' | 'preferences' | 'security';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [showAddKeyModal, setShowAddKeyModal] = useState(false);
    const [newKey, setNewKey] = useState({ exchange: '', apiKey: '', apiSecret: '', label: '' });

    const {
        profile,
        apiKeys,
        preferences,
        loading,
        profileLoading,
        keysLoading,
        preferencesLoading,
        error,
        updateProfile,
        addAPIKey,
        removeAPIKey,
        updatePrefs
    } = useUserSettings();

    React.useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setAvatarUrl(profile.avatar_url || '');
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        try {
            await updateProfile({ display_name: displayName, avatar_url: avatarUrl });
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const handleAddKey = async () => {
        try {
            await addAPIKey({
                exchange: newKey.exchange,
                api_key: newKey.apiKey,
                api_secret: newKey.apiSecret,
                label: newKey.label || undefined
            });
            setShowAddKeyModal(false);
            setNewKey({ exchange: '', apiKey: '', apiSecret: '', label: '' });
            alert('API key added successfully!');
        } catch (err) {
            alert('Failed to add API key');
        }
    };

    const handleDeleteKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;
        try {
            await removeAPIKey(keyId);
            alert('API key deleted successfully!');
        } catch (err) {
            alert('Failed to delete API key');
        }
    };

    const handleTogglePref = async (key: keyof typeof preferences) => {
        if (!preferences) return;
        try {
            await updatePrefs({ [key]: !preferences[key] });
        } catch (err) {
            alert('Failed to update preferences');
        }
    };

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'api-keys', label: 'API Keys', icon: Key },
        { id: 'preferences', label: 'Preferences', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Settings className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Cài Đặt</h1>
                            <p className="text-xs text-gray-400">Account Settings</p>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {error && (
                        <div className="glass-card rounded-xl p-4 border-red-500/20 bg-red-500/5 mb-6">
                            <p className="text-red-400 text-sm">{error.message}</p>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b border-white/10">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2",
                                    activeTab === tab.id
                                        ? "text-[#00FF94] border-[#00FF94]"
                                        : "text-gray-400 border-transparent hover:text-white"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading && !profile ? (
                        <div className="glass-card rounded-xl p-8 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-48 mb-4" />
                            <div className="h-8 bg-white/10 rounded w-full" />
                        </div>
                    ) : (
                        <>
                            {/* Profile Tab */}
                            {activeTab === 'profile' && profile && (
                                <div className="glass-card rounded-xl p-6 max-w-2xl">
                                    <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-2">Email (read-only)</label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={e => setDisplayName(e.target.value)}
                                                placeholder="Your name..."
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400 block mb-2">Avatar URL</label>
                                            <input
                                                type="url"
                                                value={avatarUrl}
                                                onChange={e => setAvatarUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={profileLoading}
                                            className="flex items-center gap-2 px-6 py-3 bg-[#00FF94]/20 hover:bg-[#00FF94]/30 text-[#00FF94] rounded-lg font-bold transition-all disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4" />
                                            {profileLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* API Keys Tab */}
                            {activeTab === 'api-keys' && (
                                <div className="glass-card rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold">API Keys</h2>
                                        <button
                                            onClick={() => setShowAddKeyModal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#00FF94]/20 hover:bg-[#00FF94]/30 text-[#00FF94] rounded-lg font-medium transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Key
                                        </button>
                                    </div>

                                    {apiKeys.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                        <th className="pb-3">Exchange</th>
                                                        <th className="pb-3">Label</th>
                                                        <th className="pb-3">Created</th>
                                                        <th className="pb-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {apiKeys.map(key => (
                                                        <tr key={key.id} className="border-b border-white/5">
                                                            <td className="py-3 font-medium">{key.exchange}</td>
                                                            <td className="py-3 text-gray-400">{key.label || '-'}</td>
                                                            <td className="py-3 text-gray-400">{new Date(key.created_at).toLocaleDateString()}</td>
                                                            <td className="py-3 text-right">
                                                                <button
                                                                    onClick={() => handleDeleteKey(key.id)}
                                                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-gray-400">
                                            <Key className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                            <p>No API keys configured yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && preferences && (
                                <div className="glass-card rounded-xl p-6 max-w-2xl">
                                    <h2 className="text-xl font-bold mb-6">Preferences</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                            <div>
                                                <p className="font-medium">Email Notifications</p>
                                                <p className="text-sm text-gray-400">Receive email updates</p>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePref('email_notifications')}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative",
                                                    preferences.email_notifications ? "bg-[#00FF94]" : "bg-gray-600"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    preferences.email_notifications ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                            <div>
                                                <p className="font-medium">Push Notifications</p>
                                                <p className="text-sm text-gray-400">Browser push alerts</p>
                                            </div>
                                            <button
                                                onClick={() => handleTogglePref('push_notifications')}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-all relative",
                                                    preferences.push_notifications ? "bg-[#00FF94]" : "bg-gray-600"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    preferences.push_notifications ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>

                                        <div className="p-4 rounded-lg bg-white/5">
                                            <label className="text-sm text-gray-400 block mb-2">Language</label>
                                            <select
                                                value={preferences.language}
                                                onChange={e => updatePrefs({ language: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                            >
                                                <option value="en">English</option>
                                                <option value="vi">Tiếng Việt</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="glass-card rounded-xl p-6 max-w-2xl">
                                    <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <p className="text-yellow-500 font-medium mb-2">Change Password</p>
                                            <p className="text-sm text-gray-400 mb-4">Update your account password</p>
                                            <p className="text-xs text-gray-500">Coming Soon</p>
                                        </div>

                                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <p className="text-blue-400 font-medium mb-2">Two-Factor Authentication</p>
                                            <p className="text-sm text-gray-400 mb-4">Add extra security layer</p>
                                            <p className="text-xs text-gray-500">Coming Soon</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Add Key Modal */}
            {showAddKeyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="glass-card rounded-xl p-6 w-full max-w-md m-4">
                        <h3 className="text-xl font-bold mb-4">Add API Key</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Exchange</label>
                                <select
                                    value={newKey.exchange}
                                    onChange={e => setNewKey({ ...newKey, exchange: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                >
                                    <option value="">Select exchange...</option>
                                    <option value="binance">Binance</option>
                                    <option value="okx">OKX</option>
                                    <option value="bybit">Bybit</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">API Key</label>
                                <input
                                    type="text"
                                    value={newKey.apiKey}
                                    onChange={e => setNewKey({ ...newKey, apiKey: e.target.value })}
                                    placeholder="Enter API key..."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">API Secret</label>
                                <input
                                    type="password"
                                    value={newKey.apiSecret}
                                    onChange={e => setNewKey({ ...newKey, apiSecret: e.target.value })}
                                    placeholder="Enter API secret..."
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Label (optional)</label>
                                <input
                                    type="text"
                                    value={newKey.label}
                                    onChange={e => setNewKey({ ...newKey, label: e.target.value })}
                                    placeholder="E.g. Main Trading Account"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF94]/50"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddKey}
                                    disabled={!newKey.exchange || !newKey.apiKey || !newKey.apiSecret || keysLoading}
                                    className="flex-1 px-4 py-2 bg-[#00FF94]/20 hover:bg-[#00FF94]/30 text-[#00FF94] rounded-lg font-bold transition-all disabled:opacity-50"
                                >
                                    {keysLoading ? 'Adding...' : 'Add Key'}
                                </button>
                                <button
                                    onClick={() => setShowAddKeyModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
