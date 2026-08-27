import Link from 'next/link';
import Image from 'next/image';
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
      className={`group flex flex-col overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] transition-shadow duration-[var(--duration-normal)] hover:shadow-[var(--shadow-md)] ${featured ? 'lg:flex-row' : ''}`}
    >
      <div className={`relative overflow-hidden bg-[var(--surface-sunken)] ${featured ? 'aspect-[16/9] lg:aspect-auto lg:w-1/2' : 'aspect-[16/9]'}`}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
            className="object-cover transition-transform duration-[var(--duration-normal)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl font-[var(--font-display)] font-bold text-[var(--ink-300)]">
            {post.title.charAt(0)}
          </div>
        )}
        <span className="absolute top-3 left-3">
          <Badge tone="gold">{post.category}</Badge>
        </span>
      </div>
      <div className={`flex flex-col gap-3 p-5 ${featured ? 'lg:w-1/2 lg:justify-center lg:p-8' : ''}`}>
        <h3 className={`line-clamp-2 leading-[var(--leading-snug)] font-[var(--font-display)] font-bold text-[var(--ink-900)] ${featured ? 'text-2xl' : 'text-lg'}`}>
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-[var(--leading-relaxed)] text-[var(--text-muted)]">{post.excerpt}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--ink-300)]">
          {author?.name && <span className="font-medium text-[var(--ink-500)]">{author.name}</span>}
          <span>{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3" />{post.readingTimeMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
