'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  Crown,
  Key,
  Link,
  Plus,
  Settings,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/os/sidebar';
import ExchangeLinkingManager from '@/components/settings/ExchangeLinkingManager';
import PaymentMethodsManager from '@/components/settings/PaymentMethodsManager';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserTier } from '@/hooks/useUserTier';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'connections' | 'payment' | 'api-keys' | 'preferences' | 'security';

export default function SettingsPage() {
  const t = useTranslations('Settings');
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
    updateProfile,
    addAPIKey,
    removeAPIKey,
    updatePrefs,
  } = useUserSettings();
  const { tier } = useUserTier();

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ display_name: displayName, avatar_url: avatarUrl });
      alert(t('success_profile'));
    } catch (_err) {
      alert(t('error_profile'));
    }
  };

  const handleAddKey = async () => {
    try {
      await addAPIKey({
        exchange: newKey.exchange,
        api_key: newKey.apiKey,
        api_secret: newKey.apiSecret,
        label: newKey.label || undefined,
      });
      setShowAddKeyModal(false);
      setNewKey({ exchange: '', apiKey: '', apiSecret: '', label: '' });
      alert(t('success_key_add'));
    } catch (_err) {
      alert(t('error_key_add'));
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm(t('confirm_delete_key'))) return;
    try {
      await removeAPIKey(keyId);
      alert(t('success_key_delete'));
    } catch (_err) {
      alert(t('error_key_delete'));
    }
  };

  const handleTogglePref = async (key: 'email_notifications' | 'push_notifications') => {
    if (!preferences) return;
    try {
      await updatePrefs({ [key]: !preferences[key] });
    } catch (_err) {
      alert(t('error_prefs'));
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: t('tab_profile'), icon: User },
    { id: 'connections', label: t('tab_connections'), icon: Link },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'api-keys', label: t('tab_api_keys'), icon: Key },
    { id: 'preferences', label: t('tab_preferences'), icon: Bell },
    { id: 'security', label: t('tab_security'), icon: Shield },
  ];

  // Calculate Setup Progress
  const setupSteps = [
    { id: 'profile', label: 'Complete Profile', done: !!profile?.display_name },
    { id: 'api', label: 'Connect Exchange', done: apiKeys.length > 0 },
    { id: 'payment', label: 'Add Payment Method', done: false }, // Need to check payment methods length, but for now assume false if not checked
    { id: 'security', label: 'Secure Account', done: true }, // Mock
  ];
  const progress = Math.round((setupSteps.filter((s) => s.done).length / setupSteps.length) * 100);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">{t('title')}</h1>
                <p className="text-xs text-blue-400/80 font-medium tracking-wide uppercase">{t('subtitle')}</p>
              </div>
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Setup Progress Widget */}
            {progress < 100 && (
              <GlassCard className="p-6 border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">System Setup Required</h2>
                    <p className="text-sm text-zinc-400 mb-4">
                      Complete these steps to unlock full Money Engine potential.
                    </p>

                    <div className="flex gap-4">
                      {setupSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {step.done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
                          )}
                          <span className={cn('text-sm', step.done ? 'text-gray-300' : 'text-white font-medium')}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{progress}%</div>
                    <div className="text-xs text-zinc-500">Completed</div>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </GlassCard>
            )}

            <div className="flex gap-8">
              {/* Sidebar Navigation */}
              <div className="w-64 shrink-0 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                      activeTab === tab.id
                        ? 'bg-white/10 text-white shadow-lg border border-white/10'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <tab.icon className={cn('h-4 w-4', activeTab === tab.id ? 'text-emerald-400' : 'text-zinc-500')} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'profile' && profile && (
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold mb-6">{t('profile_info')}</h2>
                      <div className="space-y-6 max-w-xl">
                        <div className="flex items-center gap-6 mb-8">
                          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 p-[2px] relative">
                            <div className="h-full w-full rounded-full bg-black overflow-hidden relative">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-white">
                                  {displayName?.[0]?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            {/* Tier Badge */}
                            <div className="absolute -bottom-2 -right-2 bg-black rounded-full p-1 border border-white/10">
                              <div
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1',
                                  tier === 'SOVEREIGN' ? 'bg-purple-500 text-white' : 'bg-emerald-500 text-black',
                                )}
                              >
                                {tier === 'SOVEREIGN' && <Crown className="w-3 h-3" />}
                                {tier}
                              </div>
                            </div>
                          </div>
                          <div>
                            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                              Change Avatar
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-6">
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
                              {t('display_name_label')}
                            </label>
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
                              {t('email_label')}
                            </label>
                            <input
                              type="email"
                              value={profile.email}
                              disabled
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-500 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSaveProfile}
                          disabled={profileLoading}
                          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        >
                          {profileLoading ? t('saving') : t('save_changes')}
                        </button>
                      </div>
                    </GlassCard>
                  )}

                  {activeTab === 'connections' && (
                    <ErrorBoundary>
                      <ExchangeLinkingManager />
                    </ErrorBoundary>
                  )}

                  {activeTab === 'payment' && <PaymentMethodsManager />}

                  {activeTab === 'api-keys' && (
                    <GlassCard className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-2xl font-bold">{t('tab_api_keys')}</h2>
                          <p className="text-zinc-400 mt-1">Manage your exchange API keys for trading.</p>
                        </div>
                        <button
                          onClick={() => setShowAddKeyModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-lg font-medium transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          {t('add_key')}
                        </button>
                      </div>

                      {apiKeys.length > 0 ? (
                        <div className="grid gap-4">
                          {apiKeys.map((key) => (
                            <div
                              key={key.id}
                              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group hover:border-emerald-500/30 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-white/5">
                                  <Key className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                  <div className="font-bold text-white">{key.exchange.toUpperCase()}</div>
                                  <div className="text-sm text-zinc-400">
                                    {key.label || 'No label'} • Added {new Date(key.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteKey(key.id)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-2xl">
                          <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-zinc-400 mb-4">{t('no_keys')}</p>
                          <button onClick={() => setShowAddKeyModal(true)} className="text-emerald-400 hover:underline">
                            Add your first API key
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  )}

                  {activeTab === 'preferences' && preferences && (
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold mb-8">{t('tab_preferences')}</h2>
                      <div className="grid gap-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                              <Bell className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-white">{t('email_notif')}</p>
                              <p className="text-sm text-zinc-400">{t('email_notif_desc')}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleTogglePref('email_notifications')}
                            className={cn(
                              'w-12 h-6 rounded-full transition-all relative',
                              preferences.email_notifications ? 'bg-emerald-500' : 'bg-gray-700',
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm',
                                preferences.email_notifications ? 'left-7' : 'left-1',
                              )}
                            />
                          </button>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <label className="text-xs text-zinc-400 block mb-2 uppercase tracking-wider">
                            {t('language')}
                          </label>
                          <select
                            value={preferences.language}
                            onChange={(e) => updatePrefs({ language: e.target.value })}
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="en">{t('en')}</option>
                            <option value="vi">{t('vi')}</option>
                          </select>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {activeTab === 'security' && (
                    <GlassCard className="p-8">
                      <h2 className="text-2xl font-bold mb-8">{t('security_settings')}</h2>
                      <div className="grid gap-6 max-w-2xl">
                        <div className="p-6 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                          <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0" />
                            <div>
                              <h3 className="text-lg font-bold text-yellow-500 mb-2">{t('change_password')}</h3>
                              <p className="text-zinc-400 mb-4">{t('change_password_desc')}</p>
                              <button
                                disabled
                                className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                              >
                                Coming Soon
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <div className="flex items-start gap-4">
                            <Shield className="h-6 w-6 text-blue-500 shrink-0" />
                            <div>
                              <h3 className="text-lg font-bold text-blue-500 mb-2">{t('2fa')}</h3>
                              <p className="text-zinc-400 mb-4">{t('2fa_desc')}</p>
                              <button
                                disabled
                                className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
                              >
                                Coming Soon
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard className="p-8 w-full max-w-md m-4 border-emerald-500/20">
            <h3 className="text-2xl font-bold mb-6 text-white">{t('add_key_modal_title')}</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">{t('exchange')}</label>
                <select
                  value={newKey.exchange}
                  onChange={(e) => setNewKey({ ...newKey, exchange: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="">{t('select_exchange')}</option>
                  <option value="binance">Binance</option>
                  <option value="okx">OKX</option>
                  <option value="bybit">Bybit</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
                  {t('api_key_label')}
                </label>
                <input
                  type="text"
                  value={newKey.apiKey}
                  onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                  placeholder={t('api_key_placeholder')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
                  {t('api_secret_label')}
                </label>
                <input
                  type="password"
                  value={newKey.apiSecret}
                  onChange={(e) => setNewKey({ ...newKey, apiSecret: e.target.value })}
                  placeholder={t('api_secret_placeholder')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 uppercase tracking-wider">
                  {t('label_optional')}
                </label>
                <input
                  type="text"
                  value={newKey.label}
                  onChange={(e) => setNewKey({ ...newKey, label: e.target.value })}
                  placeholder={t('label_placeholder')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowAddKeyModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddKey}
                  disabled={!newKey.exchange || !newKey.apiKey || !newKey.apiSecret || keysLoading}
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {keysLoading ? t('adding') : t('add_key')}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
