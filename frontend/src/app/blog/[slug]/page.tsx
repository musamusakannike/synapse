import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Clock, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Badge from '@/components/ui/Badge';
import BlogPostCard from '@/components/blog/BlogPostCard';
import { fetchBlogPostBySlug, SITE_URL } from '@/lib/blog-server';

const navLinks = [
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'Blog', href: '/blog' },
  { label: 'AI tools', href: '/#ai-tools' },
];

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchBlogPostBySlug(slug);

  if (!result) {
    return { title: 'Post not found — SabiLearn Blog' };
  }

  const { post } = result;
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: `${title} — SabiLearn Blog`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await fetchBlogPostBySlug(slug);

  if (!result) {
    notFound();
  }

  const { post, related } = result;
  const author = typeof post.author === 'object' ? post.author : null;
  const url = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt,
    author: author ? { '@type': 'Person', name: author.name } : { '@type': 'Organization', name: 'SabiLearn' },
    publisher: { '@type': 'Organization', name: 'SabiLearn' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-page)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Navbar links={navLinks} active="Blog" />

      <article className="px-6 sm:px-8 py-14">
        <div className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--ink-500)] mb-8">
            <Link href="/" className="hover:text-[var(--ink-900)] font-semibold">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-[var(--ink-900)] font-semibold">Blog</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--ink-300)] truncate max-w-[240px]">{post.title}</span>
          </nav>

          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-500)] hover:text-[var(--ink-900)] mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          <Badge tone="gold">{post.category}</Badge>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] leading-[var(--leading-tight)] mt-4 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] mb-8">
            {author?.name && <span className="font-semibold text-[var(--ink-700)]">{author.name}</span>}
            <span>{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readingTimeMinutes} min read</span>
          </div>

          {post.coverImage && (
            <div className="relative w-full h-[280px] sm:h-[440px] rounded-[var(--radius-2xl)] overflow-hidden mb-10 shadow-[var(--shadow-md)]">
              <Image src={post.coverImage} alt={post.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            </div>
          )}

          <div className="blog-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                img: ({ alt, ...props }) => (
                  // eslint-disable-next-line @next/next/no-img-element -- author-uploaded, dimensions unknown ahead of time
                  <img {...props} alt={alt || ''} loading="lazy" decoding="async" />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[var(--line)]">
              {post.tags.map((tag) => (
                <Badge key={tag} tone="neutral">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="px-6 sm:px-8 py-16 bg-[var(--surface-card)] border-t border-[var(--line)]">
          <div className="max-w-[var(--container-max)] mx-auto">
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--ink-900)] mb-8">More like this</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <BlogPostCard key={p._id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
