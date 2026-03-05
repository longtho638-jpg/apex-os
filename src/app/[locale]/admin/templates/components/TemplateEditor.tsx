'use client';

import { ArrowLeft, Code, Eye, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface TemplateEditorProps {
  templateId?: string; // If provided, we are in edit mode
}

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    html_content:
      '<div class="min-h-screen bg-gray-900 text-white p-8">\n  <h1 class="text-4xl font-bold">{{provider_name}}</h1>\n  <p class="mt-4">Join us today!</p>\n  <a href="{{referral_link}}" class="mt-8 inline-block bg-blue-600 px-6 py-3 rounded-lg">Get Started</a>\n</div>',
    preview_image_url: '',
    is_active: true,
  });

  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFormData(data.template);
      }
    } catch (error) {
      logger.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [templateId, token]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, fetchTemplate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = templateId ? `/api/v1/admin/templates/${templateId}` : '/api/v1/admin/templates';

      const method = templateId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/templates');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      logger.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  }

  // Mock preview by replacing variables
  const getPreviewHtml = () => {
    let html = formData.html_content;
    html = html.replace(/{{provider_name}}/g, 'Apex Financial');
    html = html.replace(/{{referral_link}}/g, '#');
    return html;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/templates" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">{templateId ? 'Edit Template' : 'New Template'}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </div>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </div>
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Settings */}
        <div className="w-80 bg-gray-800 border-r border-white/10 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Dark Modern"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Brief description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Preview Image URL</label>
              <input
                type="text"
                value={formData.preview_image_url}
                onChange={(e) => setFormData({ ...formData, preview_image_url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-900"
              />
              <label htmlFor="is_active" className="text-sm text-gray-300">
                Active
              </label>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Available Variables</h4>
              <div className="space-y-2">
                <code className="block text-xs bg-gray-900 p-2 rounded text-blue-400">{'{{provider_name}}'}</code>
                <code className="block text-xs bg-gray-900 p-2 rounded text-blue-400">{'{{referral_link}}'}</code>
                <code className="block text-xs bg-gray-900 p-2 rounded text-blue-400">{'{{logo_url}}'}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 bg-gray-900 overflow-hidden">
          {activeTab === 'edit' ? (
            <textarea
              value={formData.html_content}
              onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
              className="w-full h-full bg-gray-900 text-gray-300 font-mono p-6 resize-none focus:outline-none"
              spellCheck={false}
            />
          ) : (
            <div className="w-full h-full bg-white overflow-y-auto">
              <iframe srcDoc={getPreviewHtml()} className="w-full h-full border-none" title="Preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
