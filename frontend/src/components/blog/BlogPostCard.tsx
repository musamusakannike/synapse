import Link from 'next/link';
import { Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { BlogPost } from '@/lib/types';

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const author = typeof post.author === 'object' ? post.author : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col rounded-[var(--radius-2xl)] bg-[var(--surface-card)] overflow-hidden shadow-[var(--shadow-sm)] transition-shadow duration-[var(--duration-normal)] hover:shadow-[var(--shadow-md)] ${featured ? 'lg:flex-row' : ''}`}
    >
      <div className={`relative bg-[var(--surface-sunken)] overflow-hidden ${featured ? 'lg:w-1/2 aspect-[16/9] lg:aspect-auto' : 'aspect-[16/9]'}`}>
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-[var(--duration-normal)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--ink-300)] font-[var(--font-display)] text-3xl font-bold">
            {post.title.charAt(0)}
          </div>
        )}
        <span className="absolute top-3 left-3">
          <Badge tone="gold">{post.category}</Badge>
        </span>
      </div>
      <div className={`p-5 flex flex-col gap-3 ${featured ? 'lg:w-1/2 lg:p-8 lg:justify-center' : ''}`}>
        <h3 className={`font-[var(--font-display)] font-bold text-[var(--ink-900)] leading-[var(--leading-snug)] line-clamp-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        <p className="text-sm text-[var(--text-muted)] leading-[var(--leading-relaxed)] line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-[var(--ink-300)] mt-1">
          {author?.name && <span className="text-[var(--ink-500)] font-medium">{author.name}</span>}
          <span>{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTimeMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
