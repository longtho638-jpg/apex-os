'use client';

import { Activity, AlertCircle, Plus, Search, TrendingUp, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import ProviderAnalyticsModal from './components/ProviderAnalyticsModal';
import ProviderImportModal from './components/ProviderImportModal';
import ProviderList from './components/ProviderList';

interface Provider {
  id: string;
  provider_code: string;
  provider_name: string;
  asset_class: string;
  partner_uuid: string;
  referral_link_template: string;
  status: string;
  health_status: string | null;
  last_health_check: string | null;
  version: number;
  created_at: string;
  asset_config?: Record<string, any>;
  regulatory_info?: Record<string, any>;
}

interface ProviderStats {
  total_active: number;
  by_asset_class: Record<string, number>;
  by_status: Record<string, number>;
}

export default function ProvidersPage() {
  const { token, loading: authLoading } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [_showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [_showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null);
  const [_showAuditModal, setShowAuditModal] = useState(false);
  const [_auditProvider, setAuditProvider] = useState<Provider | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Filters
  const [assetFilter, setAssetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProviders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (assetFilter !== 'all') params.append('asset_class', assetFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/v1/admin/providers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token invalid or expired, let the auth context handle it
        }
        throw new Error('Failed to fetch providers');
      }

      const data = await res.json();
      setProviders(data.providers || []);
      setStats(data.stats);
    } catch (error) {
      logger.error('Fetch providers error:', error);
    } finally {
      setLoading(false);
    }
  }, [token, assetFilter, statusFilter, searchTerm]);

  useEffect(() => {
    if (!authLoading) {
      if (token) {
        fetchProviders();
      } else {
        setLoading(false);
      }
    }

    const interval = setInterval(() => {
      if (!authLoading && token) fetchProviders();
    }, 60000);
    return () => clearInterval(interval);
  }, [authLoading, token, fetchProviders]);

  async function handleHealthCheck(providerId: string) {
    try {
      const res = await fetch(`/api/v1/admin/providers/${providerId}/health`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchProviders(); // Refresh to show updated health status
      }
    } catch (error) {
      logger.error('Health check error:', error);
    }
  }

  async function _handleDeleteProvider() {
    if (!deletingProvider || !token) return;

    try {
      const res = await fetch(`/api/v1/admin/providers/${deletingProvider.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete provider');
      }

      fetchProviders(); // Refresh list
    } catch (error) {
      logger.error('Delete provider error:', error);
      throw error;
    }
  }

  // Bulk Actions Handlers
  // Selection logic moved to ProviderList

  const handleBulkAction = async (ids: string[], action: 'activate' | 'deactivate' | 'delete') => {
    if (ids.length === 0 || !token) return;

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${ids.length} providers?`)) {
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/providers/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids,
          action,
        }),
      });

      if (!res.ok) throw new Error('Bulk action failed');

      fetchProviders();
    } catch (error) {
      logger.error('Bulk action error:', error);
      alert('Failed to perform bulk action');
    }
  };

  // Helpers moved to ProviderList
  // function getStatusBadgeColor(status: string) { ... }
  // function getAssetClassIcon(assetClass: string) { ... }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Provider Management</h1>
            <p className="text-zinc-400">Manage multi-asset providers, referral links, and health monitoring</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg flex items-center gap-2 transition-colors border border-white/10"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </button>
            <button
              onClick={() => {
                setEditingProvider(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Provider
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Active Providers</p>
                  <p className="text-2xl font-bold text-white">{stats.total_active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Total Providers</p>
                  <p className="text-2xl font-bold text-white">{providers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <span className="text-xl">🔷</span>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Crypto Exchanges</p>
                  <p className="text-2xl font-bold text-white">{stats.by_asset_class.crypto || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Testing</p>
                  <p className="text-2xl font-bold text-white">{stats.by_status.testing || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Asset Class Filter */}
            <div className="flex-1">
              <label className="block text-sm text-zinc-400 mb-2">Asset Class</label>
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Assets</option>
                <option value="crypto">Crypto</option>
                <option value="forex">Forex</option>
                <option value="stocks">Stocks</option>
                <option value="commodities">Commodities</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm text-zinc-400 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="testing">Testing</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm text-zinc-400 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search providers..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 border-b border-white/10">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!stats ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-gray-300'}`}
            onClick={() => setStats(null)} // Hack to force re-render or just use state
          >
            Overview
          </button>
        </div>

        {/* Provider List */}
        <ProviderList
          providers={providers}
          loading={loading}
          onEdit={(provider) => {
            setEditingProvider(provider);
            setShowModal(true);
          }}
          onDelete={(provider) => {
            setDeletingProvider(provider);
            setShowDeleteModal(true);
          }}
          onHealthCheck={handleHealthCheck}
          onAudit={(provider) => {
            setAuditProvider(provider);
            setShowAuditModal(true);
          }}
          onViewAnalytics={(provider) => {
            setEditingProvider(provider);
            setShowAnalyticsModal(true);
          }}
          onBulkAction={handleBulkAction}
        />

        <ProviderAnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          providerId={editingProvider?.id || null}
          providerName={editingProvider?.provider_name || ''}
        />

        <ProviderImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            fetchProviders();
          }}
          token={token || ''}
        />
      </div>
    </div>
  );
}
