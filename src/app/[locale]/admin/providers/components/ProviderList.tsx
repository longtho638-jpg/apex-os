import { Activity, CheckSquare, History, MinusSquare, MoreVertical, RefreshCw, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import HealthStatusBadge from './HealthStatusBadge';

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

interface ProviderListProps {
  providers: Provider[];
  loading: boolean;
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  onHealthCheck: (id: string) => void;
  onAudit: (provider: Provider) => void;
  onViewAnalytics: (provider: Provider) => void;
  onBulkAction: (ids: string[], action: 'activate' | 'deactivate' | 'delete') => Promise<void>;
}

export default function ProviderList({
  providers,
  loading,
  onEdit,
  onDelete,
  onHealthCheck,
  onAudit,
  onViewAnalytics,
  onBulkAction,
}: ProviderListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset selection when providers change (e.g. filter)
  useEffect(() => {
    setSelectedIds(new Set());
  }, []);

  // Close menu dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === providers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(providers.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkActionClick = async (action: 'activate' | 'deactivate' | 'delete') => {
    setIsBulkActionLoading(true);
    try {
      await onBulkAction(Array.from(selectedIds), action);
      setSelectedIds(new Set());
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'testing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'deprecated':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  function getAssetClassIcon(assetClass: string) {
    switch (assetClass) {
      case 'crypto':
        return '🔷';
      case 'forex':
        return '💱';
      case 'stocks':
        return '📈';
      case 'commodities':
        return '🌾';
      default:
        return '📊';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <p className="text-gray-400">No providers found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="px-6 py-4 text-sm font-medium text-gray-400 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white transition-colors">
                    {providers.length > 0 && selectedIds.size === providers.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    ) : selectedIds.size > 0 ? (
                      <MinusSquare className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Provider</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Asset Class</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Partner UUID</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Health</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr
                  key={provider.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedIds.has(provider.id) ? 'bg-blue-500/10' : ''}`}
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleSelect(provider.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {selectedIds.has(provider.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getAssetClassIcon(provider.asset_class)}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{provider.provider_name}</div>
                        <div className="text-sm text-gray-400">{provider.provider_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      {provider.asset_class}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-300 font-mono">{provider.partner_uuid || '-'}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusBadgeColor(provider.status)}`}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <HealthStatusBadge status={provider.health_status} lastCheck={provider.last_health_check} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">v{provider.version}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onEdit(provider)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <div className="relative" ref={openMenuId === provider.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === provider.id ? null : provider.id)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === provider.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10">
                            <button
                              onClick={() => {
                                onHealthCheck(provider.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2 rounded-t-lg"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Run Health Check
                            </button>
                            <button
                              onClick={() => {
                                onAudit(provider);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                            >
                              <History className="w-4 h-4" />
                              View Audit Logs
                            </button>
                            <button
                              onClick={() => {
                                onViewAnalytics(provider);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                            >
                              <Activity className="w-4 h-4" />
                              View Analytics
                            </button>
                            <button
                              onClick={() => {
                                onDelete(provider);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Provider
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/10 shadow-2xl rounded-xl px-6 py-3 flex items-center gap-4 z-40 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <span className="text-sm font-medium text-white bg-white/10 px-3 py-1 rounded-full">
            {selectedIds.size} selected
          </span>
          <div className="h-6 w-px bg-white/10"></div>
          <button
            onClick={() => handleBulkActionClick('activate')}
            disabled={isBulkActionLoading}
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            Activate
          </button>
          <button
            onClick={() => handleBulkActionClick('deactivate')}
            disabled={isBulkActionLoading}
            className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
          >
            Deactivate
          </button>
          <button
            onClick={() => handleBulkActionClick('delete')}
            disabled={isBulkActionLoading}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
