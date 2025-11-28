import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { getPostData, getAllPostIds } from '@/lib/blog/posts';
import { remark } from 'remark';
import html from 'remark-html';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Calendar, Clock, ChevronLeft, Share2 } from 'lucide-react';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    const post = await getPostData(slug);
    
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(post.content);
    const contentHtml = processedContent.toString();

    return (
      <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30">
        <ParticleBackground />
        <SiteHeader />

        <article className="pt-32 pb-20 relative z-10">
          {/* Hero Header */}
          <div className="relative h-[50vh] min-h-[400px] w-full mb-12">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8">
              <div className="container mx-auto max-w-4xl">
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 mb-6 transition-colors text-sm font-medium uppercase tracking-wider"
                >
                  <ChevronLeft size={16} /> Back to Intelligence
                </Link>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                  {post.title}
                </h1>

                <div className="flex items-center gap-6 text-zinc-400 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-700">
                      <Image
                        src={post.authorImage || '/images/default-avatar.png'}
                        alt={post.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-white font-medium">{post.author}</span>
                  </div>
                  <span className="flex items-center gap-2">
                    <Calendar size={16} />
                    {format(new Date(post.date), 'MMMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={16} />
                    {post.readTime} read
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                <div 
                  className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-strong:text-white prose-code:text-emerald-400 prose-code:bg-emerald-900/20 prose-code:px-1 prose-code:rounded prose-blockquote:border-l-emerald-500 prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-lg"
                  dangerouslySetInnerHTML={{ __html: contentHtml }} 
                />
              </div>
              
              {/* Sidebar (Share) */}
              <aside className="hidden lg:block w-16 shrink-0">
                <div className="sticky top-32 flex flex-col gap-4">
                  <button className="p-3 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors border border-white/10">
                    <Share2 size={20} />
                  </button>
                  {/* Add more share buttons here */}
                </div>
              </aside>
            </div>
          </div>
        </article>

        <SiteFooter />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
