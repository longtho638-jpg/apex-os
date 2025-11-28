'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Layout, Eye } from 'lucide-react';
import Link from 'next/link';

interface Template {
    id: string;
    name: string;
    description: string;
    preview_image_url: string;
    is_active: boolean;
    created_at: string;
}

export default function TemplatesPage() {
    const { token } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    async function fetchTemplates() {
        try {
            const res = await fetch('/api/v1/admin/templates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (error) {
            console.error('Fetch templates error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const res = await fetch(`/api/v1/admin/templates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchTemplates();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Template Marketplace
                        </h1>
                        <p className="text-zinc-400">
                            Manage referral page templates for providers
                        </p>
                    </div>
                    <Link
                        href="/admin/templates/new"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Template
                    </Link>
                </div>

                {/* Search */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search templates..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group">
                            {/* Preview Image */}
                            <div className="aspect-video bg-gray-800 relative">
                                {template.preview_image_url ? (
                                    <img
                                        src={template.preview_image_url}
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">
                                        <Layout className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link
                                        href={`/admin/templates/${template.id}`}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${template.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-zinc-400'}`}>
                                        {template.is_active ? 'Active' : 'Draft'}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 line-clamp-2">
                                    {template.description || 'No description'}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredTemplates.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-zinc-500 bg-white/5 border border-white/10 rounded-xl border-dashed">
                            <Layout className="w-12 h-12 mb-4 opacity-50" />
                            <p>No templates found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
