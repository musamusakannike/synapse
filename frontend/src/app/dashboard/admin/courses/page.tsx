'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { courseApi } from '@/lib/api';
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
import { Course, PaginatedResponse } from '@/lib/types';

const CATEGORIES = ['Web development', 'Data science', 'Design', 'Business', 'Mobile development', 'Marketing'];

function AdminCoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', longDescription: '', banner: '', category: CATEGORIES[0], difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced', isPublished: false });

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12, includeDrafts: true };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      const res = await courseApi.list(params);
      const data = res.data as PaginatedResponse<Course>;
      setCourses(data.data);
      setPages(data.pagination.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, difficulty]);

  useEffect(() => { const t = setTimeout(fetchCourses, 300); return () => clearTimeout(t); }, [fetchCourses]);

  const resetForm = () => setForm({ title: '', description: '', longDescription: '', banner: '', category: CATEGORIES[0], difficulty: 'beginner', isPublished: false });

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    return fd;
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description are required');
    setSaving(true);
    try {
      if (editCourse) {
        await courseApi.update(editCourse._id, buildFormData());
        toast.success('Course updated');
      } else {
        await courseApi.create(buildFormData());
        toast.success('Course created');
      }
      setShowModal(false);
      setEditCourse(null);
      resetForm();
      fetchCourses();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await courseApi.remove(deleteTarget._id);
      toast.success('Course deleted');
      fetchCourses();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({ title: course.title, description: course.description, longDescription: course.longDescription || '', banner: course.banner || '', category: course.category, difficulty: course.difficulty, isPublished: course.isPublished });
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Manage courses"
        description="Create, edit, and manage all courses"
        action={<Button onClick={() => { resetForm(); setEditCourse(null); setShowModal(true); }}><Plus className="size-4" /> Create course</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--ink-300)]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search courses…" className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] py-2.5 pr-4 pl-10 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]" />
        </div>
        <div className="w-full sm:w-52"><Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} options={['all', ...CATEGORIES]} placeholder="Category" /></div>
        <div className="w-full sm:w-44"><Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} options={['all', 'beginner', 'intermediate', 'advanced']} placeholder="Level" /></div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="size-12" />} title="No courses found" description="Try adjusting filters or create a new course." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course._id} className="flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]"><BookOpen className="size-5" /></div>
                  <Badge tone={course.isPublished ? 'success' : 'warning'}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
                </div>
                <h3 className="mb-1 line-clamp-2 font-semibold text-[var(--ink-900)]">{course.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">{course.description}</p>
                <div className="mb-4 flex items-center gap-2">
                  <Badge tone="gold">{course.difficulty}</Badge>
                  <Badge tone="neutral">{course.category}</Badge>
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-[var(--line)] pt-4">
                  <Link href={`/dashboard/admin/courses/${course._id}`} className="flex-1"><Button variant="secondary" size="sm" fullWidth>Manage</Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(course)}><Pencil className="size-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(course)}><Trash2 className="size-3.5 text-[var(--danger)]" /></Button>
                </div>
              </Card>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`size-9 rounded-[var(--radius-md)] text-sm font-semibold ${p === page ? 'bg-[var(--brand-gold)] text-[var(--ink-900)]' : 'border border-[var(--line)] bg-[var(--surface-card)] text-[var(--text-muted)]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={showModal} onClose={() => { setShowModal(false); setEditCourse(null); resetForm(); }} title={editCourse ? 'Edit course' : 'Create course'} maxWidth="560px">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Intro to JavaScript" />
          <Input label="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief one-line description" />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Long description</span>
            <textarea value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} rows={4} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Banner image</span>
            <MediaUploader kind="image" value={form.banner} onChange={(url) => setForm({ ...form, banner: url })} />
          </div>
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
          <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' })} options={['beginner', 'intermediate', 'advanced']} />
          <Checkbox checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Publish course" />
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => { setShowModal(false); setEditCourse(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editCourse ? 'Save changes' : 'Create course'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete course"
        message={`Deleting "${deleteTarget?.title}" will permanently remove all topics, flashcards, MCQs, and user progress. This cannot be undone.`}
        confirmLabel="Delete course"
      />
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <AdminGuard>
      <AdminCoursesContent />
    </AdminGuard>
  );
}
