'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Newspaper, Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import MediaUploader from '@/components/admin/MediaUploader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { BlogPost, PaginatedResponse } from '@/lib/types';

const CATEGORIES = ['Study tips', 'Learning science', 'Web development', 'Career', 'Product updates', 'Announcements'];

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: CATEGORIES[0],
  tags: '',
  isPublished: false,
  seoTitle: '',
  seoDescription: '',
};

function AdminBlogContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12, includeDrafts: true };
      if (search) params.search = search;
      const res = await blogApi.list(params);
      const data = res.data as PaginatedResponse<BlogPost>;
      setPosts(data.data);
      setPages(data.pagination.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { const t = setTimeout(fetchPosts, 300); return () => clearTimeout(t); }, [fetchPosts]);

  const resetForm = () => { setForm(emptyForm); setShowPreview(false); };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'tags') {
        fd.append('tags', JSON.stringify(String(v).split(',').map((t) => t.trim()).filter(Boolean)));
      } else {
        fd.append(k, String(v));
      }
    });
    return fd;
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim() || !form.category.trim()) {
      return toast.error('Title, excerpt, content, and category are required');
    }
    setSaving(true);
    try {
      if (editPost) {
        await blogApi.update(editPost._id, buildFormData());
        toast.success('Post updated');
      } else {
        await blogApi.create(buildFormData());
        toast.success('Post created');
      }
      setShowModal(false);
      setEditPost(null);
      resetForm();
      fetchPosts();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.response?.data?.errors?.[0] || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await blogApi.remove(deleteTarget._id);
      toast.success('Post deleted');
      fetchPosts();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete post');
    }
  };

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || '',
      category: post.category,
      tags: (post.tags || []).join(', '),
      isPublished: post.isPublished,
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <AdminPageHeader
        title="Manage blog"
        description="Write, publish, and manage articles for the public blog"
        action={<Button onClick={() => { resetForm(); setEditPost(null); setShowModal(true); }}><Plus className="w-4 h-4" /> New post</Button>}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-300)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" className="w-full max-w-md pl-10 pr-4 py-2.5 bg-[var(--surface-card)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <EmptyState icon={<Newspaper className="w-12 h-12" />} title="No blog posts yet" description="Create your first article to get the blog going." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card key={post._id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-gold-100)] flex items-center justify-center text-[var(--brand-gold-600)]"><Newspaper className="w-5 h-5" /></div>
                <Badge tone={post.isPublished ? 'success' : 'warning'}>{post.isPublished ? 'Published' : 'Draft'}</Badge>
              </div>
              <h3 className="font-semibold text-[var(--ink-900)] mb-1 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{post.excerpt}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge tone="gold">{post.category}</Badge>
                <span className="text-xs text-[var(--ink-300)] inline-flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--line)]">
                <Button variant="secondary" size="sm" fullWidth onClick={() => openEdit(post)}><Pencil className="w-3.5 h-3.5" /> Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(post)}><Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-[var(--radius-md)] text-sm font-semibold border ${p === page ? 'bg-[var(--ink-900)] text-white border-[var(--ink-900)]' : 'bg-[var(--surface-card)] border-[var(--line)] text-[var(--ink-700)]'}`}>{p}</button>
          ))}
        </div>
      )}

      <Dialog open={showModal} onClose={() => { setShowModal(false); setEditPost(null); resetForm(); }} title={editPost ? 'Edit post' : 'New post'} maxWidth="720px">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 5 study habits that actually work" />
          <Input label="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="One or two sentences shown in listings and search results" />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Cover image</span>
            <MediaUploader kind="image" value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
            <Input label="Tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="comma, separated, tags" />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--ink-900)]">Content (Markdown)</span>
              <button type="button" onClick={() => setShowPreview((v) => !v)} className="text-xs font-semibold text-[var(--brand-gold-600)]">
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {showPreview ? (
              <div className="blog-prose min-h-[260px] px-3.5 py-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '*Nothing to preview yet.*'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={14}
                placeholder="Write in Markdown — headings, **bold**, lists, ```code```, images, links…"
                className="w-full px-3.5 py-3 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none resize-y font-[var(--font-mono)]"
              />
            )}
          </div>

          <details className="rounded-[var(--radius-md)] border border-[var(--line)] p-4">
            <summary className="text-sm font-semibold text-[var(--ink-900)] cursor-pointer">SEO settings (optional)</summary>
            <div className="space-y-3 mt-3">
              <Input label="SEO title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="Overrides the page <title> — defaults to the post title" />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--ink-900)]">SEO description</span>
                <textarea value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} rows={2} placeholder="Overrides the meta description — defaults to the excerpt" className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none resize-none" />
              </div>
            </div>
          </details>

          <Checkbox checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Publish post (visible on the public blog)" />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
            <Button variant="ghost" onClick={() => { setShowModal(false); setEditPost(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editPost ? 'Save changes' : 'Create post'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete post"
        message={`Deleting "${deleteTarget?.title}" will permanently remove it from the blog. This cannot be undone.`}
        confirmLabel="Delete post"
      />
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminGuard>
      <AdminBlogContent />
    </AdminGuard>
  );
}
