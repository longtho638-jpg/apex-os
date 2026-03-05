import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorImage?: string;
  description: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  readTime: string;
}

export function getSortedPostsData(): BlogPost[] {
  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Calculate read time (rough estimate: 200 words per minute)
      const wordCount = matterResult.content.split(/\s+/).length;
      const readTime = `${Math.ceil(wordCount / 200)} min`;

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || new Date().toISOString(),
        author: matterResult.data.author || 'Apex Team',
        authorImage: matterResult.data.authorImage || '/images/default-avatar.png',
        description: matterResult.data.description || '',
        content: matterResult.content,
        coverImage: matterResult.data.coverImage || '/images/blog/default-cover.jpg',
        category: matterResult.data.category || 'Trading',
        tags: matterResult.data.tags || [],
        readTime,
      } as BlogPost;
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        slug: fileName.replace(/\.md$/, ''),
      };
    });
}

export async function getPostData(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Calculate read time
  const wordCount = matterResult.content.split(/\s+/).length;
  const readTime = `${Math.ceil(wordCount / 200)} min`;

  // Combine the data with the slug and content
  return {
    slug,
    title: matterResult.data.title || slug,
    date: matterResult.data.date || new Date().toISOString(),
    author: matterResult.data.author || 'Apex Team',
    authorImage: matterResult.data.authorImage || '/images/default-avatar.png',
    description: matterResult.data.description || '',
    content: matterResult.content,
    coverImage: matterResult.data.coverImage || '/images/blog/default-cover.jpg',
    category: matterResult.data.category || 'Trading',
    tags: matterResult.data.tags || [],
    readTime,
  };
}
