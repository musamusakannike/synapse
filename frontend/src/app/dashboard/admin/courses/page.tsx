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
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save course');
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
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete course');
    }
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({ title: course.title, description: course.description, longDescription: course.longDescription || '', banner: course.banner || '', category: course.category, difficulty: course.difficulty, isPublished: course.isPublished });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <AdminPageHeader
        title="Manage courses"
        description="Create, edit, and manage all courses"
        action={<Button onClick={() => { resetForm(); setEditCourse(null); setShowModal(true); }}><Plus className="w-4 h-4" /> Create course</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-300)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-card)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none" />
        </div>
        <div className="w-full sm:w-52"><Select value={category} onChange={(e) => setCategory(e.target.value)} options={['all', ...CATEGORIES]} placeholder="Category" /></div>
        <div className="w-full sm:w-44"><Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={['all', 'beginner', 'intermediate', 'advanced']} placeholder="Level" /></div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-12 h-12" />} title="No courses found" description="Try adjusting filters or create a new course." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course._id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-gold-100)] flex items-center justify-center text-[var(--brand-gold-600)]"><BookOpen className="w-5 h-5" /></div>
                <Badge tone={course.isPublished ? 'success' : 'warning'}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
              </div>
              <h3 className="font-semibold text-[var(--ink-900)] mb-1 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-3">{course.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge tone="gold">{course.difficulty}</Badge>
                <Badge tone="neutral">{course.category}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--line)]">
                <Link href={`/dashboard/admin/courses/${course._id}`} className="flex-1"><Button variant="secondary" size="sm" fullWidth>Manage</Button></Link>
                <Button variant="ghost" size="sm" onClick={() => openEdit(course)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(course)}><Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onClose={() => { setShowModal(false); setEditCourse(null); resetForm(); }} title={editCourse ? 'Edit course' : 'Create course'} maxWidth="560px">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Intro to JavaScript" />
          <Input label="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief one-line description" />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Long description</span>
            <textarea value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} rows={4} className="w-full px-3.5 py-2.5 bg-[var(--surface-page)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Banner image</span>
            <MediaUploader kind="image" value={form.banner} onChange={(url) => setForm({ ...form, banner: url })} />
          </div>
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={CATEGORIES} />
          <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })} options={['beginner', 'intermediate', 'advanced']} />
          <Checkbox checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Publish course" />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
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
