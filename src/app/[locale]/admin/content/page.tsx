'use client';

import { BarChart, Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ContentDashboard() {
  const router = useRouter();
  const [stats] = useState([
    { label: 'Total Posts', value: '124', icon: FileText, color: 'text-blue-500' },
    { label: 'Published', value: '89', icon: Eye, color: 'text-emerald-500' },
    { label: 'Drafts', value: '35', icon: Edit, color: 'text-amber-500' },
    { label: 'Total Views', value: '45.2K', icon: BarChart, color: 'text-purple-500' },
  ]);

  const [recentPosts] = useState([
    { id: 1, title: 'Top 5 Trading Strategies for 2026', status: 'Published', date: '2 hours ago', views: 1205 },
    { id: 2, title: 'Understanding Market Volatility', status: 'Draft', date: '5 hours ago', views: 0 },
    { id: 3, title: 'ApexOS v2.0 Release Notes', status: 'Published', date: '1 day ago', views: 3400 },
    { id: 4, title: 'How to use the Smart Switch', status: 'Published', date: '2 days ago', views: 890 },
  ]);

  return (
    <div className="p-6 space-y-6 bg-[#030303] min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-zinc-400">Manage your blog posts, pages, and media.</p>
        </div>
        <Button onClick={() => router.push('/admin/content/posts/new')} className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" /> Create New
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 bg-zinc-900 border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-zinc-400">30d</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-zinc-500">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent Content Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Recent Content</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 font-medium">{post.title}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        post.status === 'Published'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400 text-sm">{post.date}</td>
                  <td className="p-4 text-zinc-400 text-sm">{post.views.toLocaleString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-blue-400">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
