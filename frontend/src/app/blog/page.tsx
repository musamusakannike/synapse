import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import EmptyState from '@/components/ui/EmptyState';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogSearchBar from '@/components/blog/BlogSearchBar';
import { fetchBlogPosts, fetchBlogCategories, SITE_URL } from '@/lib/blog-server';
import { Newspaper } from 'lucide-react';

const navLinks = [
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'Blog', href: '/blog' },
  { label: 'AI tools', href: '/#ai-tools' },
];

export const metadata: Metadata = {
  title: 'Blog — SabiLearn',
  description: 'Practical study guides, learning science, and how-tos to help you learn faster and sabi it for life.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'The SabiLearn Blog',
    description: 'Practical study guides, learning science, and how-tos to help you learn faster and sabi it for life.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam, category = 'all', search = '' } = await searchParams;
  const page = parseInt(pageParam || '1', 10) || 1;

  const [{ data: posts, pagination }, categories] = await Promise.all([
    fetchBlogPosts({ page, limit: 9, category, search: search || undefined }),
    fetchBlogCategories(),
  ]);

  const [featured, ...rest] = posts;
  const buildHref = (nextPage: number, nextCategory?: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('category', nextCategory ?? category);
    if (nextPage > 1) params.set('page', String(nextPage));
    return `/blog?${params.toString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--surface-page)]">
      <Navbar links={navLinks} active="Blog" />

      <section className="px-6 sm:px-8 py-16 sm:py-20 border-b border-[var(--line)] bg-[var(--surface-card)]">
        <div className="max-w-[var(--container-max)] mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-[var(--radius-full)] bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] text-xs font-semibold uppercase tracking-wide mb-5">
            The SabiLearn blog
          </span>
          <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold tracking-[var(--tracking-tight)] text-[var(--ink-900)] leading-[var(--leading-tight)] mb-5">
            Study smarter, learn faster
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-[var(--leading-relaxed)] max-w-xl mx-auto">
            Practical guides on learning science, study techniques, and building real skills — written for Nigerian learners.
          </p>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-10">
        <div className="max-w-[var(--container-max)] mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <BlogSearchBar initialValue={search} />
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref(1, 'all')}
                className={`px-4 py-2 rounded-[var(--radius-full)] text-sm font-semibold border transition-colors ${category === 'all' ? 'bg-[var(--ink-900)] text-white border-[var(--ink-900)]' : 'bg-[var(--surface-card)] text-[var(--ink-700)] border-[var(--line)] hover:border-[var(--ink-900)]'}`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={buildHref(1, c)}
                  className={`px-4 py-2 rounded-[var(--radius-full)] text-sm font-semibold border capitalize transition-colors ${category === c ? 'bg-[var(--ink-900)] text-white border-[var(--ink-900)]' : 'bg-[var(--surface-card)] text-[var(--ink-700)] border-[var(--line)] hover:border-[var(--ink-900)]'}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {posts.length === 0 ? (
            <EmptyState icon={<Newspaper className="w-12 h-12" />} title="No articles found" description="Try a different search or check back soon for new posts." />
          ) : (
            <div className="flex flex-col gap-8">
              {featured && page === 1 && !search && category === 'all' && <BlogPostCard post={featured} featured />}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(page === 1 && !search && category === 'all' ? rest : posts).map((post) => (
                  <BlogPostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildHref(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold border transition-colors ${p === page ? 'bg-[var(--brand-gold)] border-[var(--brand-gold)] text-[var(--ink-900)]' : 'bg-[var(--surface-card)] border-[var(--line)] text-[var(--ink-700)] hover:border-[var(--ink-900)]'}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
