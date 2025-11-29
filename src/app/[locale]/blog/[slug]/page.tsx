import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BlogPostParams {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

async function getPost(slug: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data;
}

export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) return {};

  return {
    title: `${post.title} | ApexOS Blog`,
    description: post.meta_description,
    keywords: post.seo_keywords,
    openGraph: {
        title: post.title,
        description: post.meta_description,
        type: 'article',
        publishedTime: post.published_at
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Increment views (fire and forget)
  // Note: Ideally move to a client component or API route to avoid blocking render if critical, 
  // but for simplicity in this stack, we'll skip the DB write on GET render or accept it.
  // Or better: use a client-side effect to track views.

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4">
      <article className="max-w-4xl mx-auto">
        <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <GlassCard className="p-8 md:p-12">
            <header className="mb-10 border-b border-white/10 pb-8">
                <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {post.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                    <span>Published: {new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                    {/* <span>Views: {post.views}</span> */}
                </div>
            </header>

            <div className="prose prose-invert prose-emerald max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
        </GlassCard>
        
        {/* CTA Section */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to trade smarter?</h3>
            <p className="text-zinc-300 mb-6">Get AI-powered signals and advanced tools just like the pros.</p>
            <Link 
                href="/signup"
                className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
            >
                Start Free Trial
            </Link>
        </div>
      </article>
    </div>
  );
}