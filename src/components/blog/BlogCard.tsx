import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  authorImage?: string;
  coverImage: string;
  category: string;
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
          {post.category}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(post.date), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-emerald-400 transition-colors">
          {post.title}
        </h3>

        <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">{post.excerpt}</p>

        <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-auto">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
            <Image
              src={post.authorImage || '/images/default-avatar.png'}
              alt={post.author}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium text-zinc-300">{post.author}</span>
        </div>
      </div>
    </Link>
  );
}
