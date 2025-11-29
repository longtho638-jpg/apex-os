export interface BlogPost {
  title: string;
  published_at: string;
  seo_keywords: string[];
}

export function BlogPostStructuredData({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.published_at,
    "author": { "@type": "Organization", "name": "Apex Rebate" },
    "keywords": post.seo_keywords ? post.seo_keywords.join(', ') : '',
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
