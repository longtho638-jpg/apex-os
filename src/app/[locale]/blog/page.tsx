import { getSortedPostsData } from '@/lib/blog/posts';
import { BlogCard } from '@/components/blog/BlogCard';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';

export default async function BlogIndexPage() {
  const posts = getSortedPostsData();

  // Map posts to BlogCard props
  const mappedPosts = posts.map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.description, // using description as excerpt
    date: post.date,
    readTime: post.readTime,
    author: post.author,
    authorImage: post.authorImage,
    coverImage: post.coverImage,
    category: post.category
  }));

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      <ParticleBackground />
      <SiteHeader />

      <div className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Trading <span className="text-emerald-400">Intelligence</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Deep dives into algorithmic trading strategies, market analysis, and the future of autonomous finance.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mappedPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
