import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { getSupabaseClient } from '@/lib/supabase';

export const revalidate = 3600; // Revalidate every hour

async function getBlogPosts() {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data || [];
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            ApexOS Trading Insights
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Master the markets with AI-driven analysis, trading strategies, and crypto education.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <GlassCard
              key={post.id}
              className="flex flex-col h-full hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-emerald-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString()}
                </div>

                <h2 className="text-xl font-bold mb-3 line-clamp-2 hover:text-emerald-400 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-zinc-400 mb-6 line-clamp-3 flex-1">{post.meta_description}</p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-white font-medium hover:gap-3 transition-all"
                >
                  Read Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No articles found yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
