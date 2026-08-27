'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Pencil, Trash2, Search, User, CheckCircle2, DollarSign } from 'lucide-react';
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
import Tabs from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Course, CourseAuthor, PaginatedResponse } from '@/lib/types';
import { formatNairaFromKobo } from '@/lib/money';

const CATEGORIES = ['Web development', 'Data science', 'Design', 'Business', 'Mobile development', 'Marketing'];

interface CourseFormState {
  title: string;
  description: string;
  longDescription: string;
  banner: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
  isFree: boolean;
  priceNaira: number;
  order: number;
  whatYouWillLearn: string[];
  prerequisites: string[];
  authors: CourseAuthor[];
}

const initialFormState: CourseFormState = {
  title: '',
  description: '',
  longDescription: '',
  banner: '',
  category: CATEGORIES[0],
  difficulty: 'beginner',
  isPublished: false,
  isFree: true,
  priceNaira: 0,
  order: 0,
  whatYouWillLearn: [''],
  prerequisites: [''],
  authors: [],
};

function AdminCoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'pricing_outcomes' | 'authors'>('basic');
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CourseFormState>(initialFormState);

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

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  const resetForm = () => {
    setForm(initialFormState);
    setModalTab('basic');
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('title', form.title.trim());
    fd.append('description', form.description.trim());
    fd.append('longDescription', form.longDescription.trim());
    fd.append('category', form.category);
    fd.append('difficulty', form.difficulty);
    fd.append('isPublished', String(form.isPublished));
    fd.append('banner', form.banner || '');
    fd.append('isFree', String(form.isFree));
    fd.append('price', String(form.isFree ? 0 : Math.round(form.priceNaira * 100)));
    fd.append('order', String(form.order || 0));

    // Filter empty strings
    const cleanLearn = (form.whatYouWillLearn || []).filter((s) => s.trim().length > 0);
    const cleanPrereqs = (form.prerequisites || []).filter((s) => s.trim().length > 0);
    const cleanAuthors = (form.authors || []).filter((a) => a.name.trim().length > 0);

    fd.append('whatYouWillLearn', JSON.stringify(cleanLearn));
    fd.append('prerequisites', JSON.stringify(cleanPrereqs));
    fd.append('authors', JSON.stringify(cleanAuthors));

    return fd;
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return toast.error('Title and description are required');
    }
    setSaving(true);
    try {
      if (editCourse) {
        await courseApi.update(editCourse._id, buildFormData());
        toast.success('Course updated successfully');
      } else {
        await courseApi.create(buildFormData());
        toast.success('Course created successfully');
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
    setForm({
      title: course.title,
      description: course.description,
      longDescription: course.longDescription || '',
      banner: course.banner || '',
      category: course.category,
      difficulty: course.difficulty,
      isPublished: course.isPublished,
      isFree: course.isFree ?? true,
      priceNaira: course.price ? Math.round(course.price / 100) : 0,
      order: course.order || 0,
      whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : [''],
      prerequisites: course.prerequisites?.length ? course.prerequisites : [''],
      authors: course.authors || [],
    });
    setModalTab('basic');
    setShowModal(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Manage courses"
        description="Create, edit, and manage courses, curriculum, and pricing"
        action={
          <Button
            onClick={() => {
              resetForm();
              setEditCourse(null);
              setShowModal(true);
            }}
          >
            <Plus className="size-4" /> Create course
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--ink-300)]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search courses…"
            className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] py-2.5 pr-4 pl-10 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={['all', ...CATEGORIES]}
            placeholder="Category"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            options={['all', 'beginner', 'intermediate', 'advanced']}
            placeholder="Level"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-12" />}
          title="No courses found"
          description="Try adjusting filters or create a new course."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course._id} className="flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]">
                    <BookOpen className="size-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={course.isFree ? 'neutral' : 'gold'}>
                      {course.isFree ? 'Free' : formatNairaFromKobo(course.price || 0)}
                    </Badge>
                    <Badge tone={course.isPublished ? 'success' : 'warning'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <h3 className="mb-1 line-clamp-2 font-semibold text-[var(--ink-900)]">{course.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-[var(--text-muted)]">{course.description}</p>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge tone="gold">{course.difficulty}</Badge>
                  <Badge tone="neutral">{course.category}</Badge>
                </div>
                <div className="mt-auto flex items-center gap-2 border-t border-[var(--line)] pt-4">
                  <Link href={`/dashboard/admin/courses/${course._id}`} className="flex-1">
                    <Button variant="secondary" size="sm" fullWidth>
                      Manage Curriculum
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(course)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(course)}>
                    <Trash2 className="size-3.5 text-[var(--danger)]" />
                  </Button>
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
                  className={`size-9 rounded-[var(--radius-md)] text-sm font-semibold ${
                    p === page
                      ? 'bg-[var(--brand-gold)] text-[var(--ink-900)]'
                      : 'border border-[var(--line)] bg-[var(--surface-card)] text-[var(--text-muted)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Course Create / Edit Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditCourse(null);
          resetForm();
        }}
        title={editCourse ? 'Edit course settings' : 'Create course'}
        maxWidth="680px"
      >
        <div className="space-y-4">
          <Tabs
            tabs={[
              { value: 'basic', label: 'Basic Info' },
              { value: 'pricing_outcomes', label: 'Pricing & Outcomes' },
              { value: 'authors', label: `Instructors (${form.authors.length})` },
            ]}
            active={modalTab}
            onChange={(v) => setModalTab(v as 'basic' | 'pricing_outcomes' | 'authors')}
          />

          {/* TAB 1: BASIC INFO */}
          {modalTab === 'basic' && (
            <div className="space-y-4 pt-1">
              <Input
                label="Course Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Complete JavaScript Mastery"
              />
              <Input
                label="Short Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief one-line summary for course cards"
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--ink-900)]">Long Description</span>
                <textarea
                  value={form.longDescription}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  rows={3}
                  placeholder="Full description shown on course landing details page..."
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  options={CATEGORIES}
                />
                <Select
                  label="Difficulty Level"
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                    })
                  }
                  options={['beginner', 'intermediate', 'advanced']}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[var(--ink-900)]">Banner Image</span>
                <MediaUploader kind="image" value={form.banner} onChange={(url) => setForm({ ...form, banner: url })} />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-sunken)] p-3.5">
                <Checkbox
                  checked={form.isPublished}
                  onChange={(v) => setForm({ ...form, isPublished: v })}
                  label="Publish Course (Visible in catalog)"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Catalog Sort Order:</span>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-16 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-page)] px-2 py-1 text-center text-xs font-bold text-[var(--ink-900)] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & OUTCOMES */}
          {modalTab === 'pricing_outcomes' && (
            <div className="space-y-6 pt-1">
              {/* Pricing Section */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--ink-900)]">Access & Monetization</h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      Free courses are open to all users. Paid courses require one-off purchase or active subscription.
                    </p>
                  </div>
                  <Checkbox
                    checked={form.isFree}
                    onChange={(v) => setForm({ ...form, isFree: v })}
                    label="Free Course"
                  />
                </div>

                {!form.isFree && (
                  <div className="pt-2 border-t border-[var(--line)]">
                    <Input
                      label="One-off Price (in ₦ NGN)"
                      type="number"
                      min="0"
                      value={form.priceNaira ? String(form.priceNaira) : ''}
                      onChange={(e) =>
                        setForm({ ...form, priceNaira: Math.max(0, parseFloat(e.target.value) || 0) })
                      }
                      placeholder="e.g. 5000"
                    />
                  </div>
                )}
              </div>

              {/* What You'll Learn */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--ink-900)]">What You&apos;ll Learn (Bullet Points)</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, whatYouWillLearn: [...form.whatYouWillLearn, ''] })}
                    className="text-xs font-semibold text-[var(--brand-gold-600)] hover:underline"
                  >
                    + Add point
                  </button>
                </div>
                {form.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...form.whatYouWillLearn];
                        updated[idx] = e.target.value;
                        setForm({ ...form, whatYouWillLearn: updated });
                      }}
                      placeholder="e.g. Master asynchronous JavaScript and Promises"
                      className="flex-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3 py-2 text-xs text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                    />
                    {form.whatYouWillLearn.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            whatYouWillLearn: form.whatYouWillLearn.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-[var(--ink-300)] hover:text-[var(--danger)]"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Prerequisites */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--ink-900)]">Prerequisites</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, prerequisites: [...form.prerequisites, ''] })}
                    className="text-xs font-semibold text-[var(--brand-gold-600)] hover:underline"
                  >
                    + Add prerequisite
                  </button>
                </div>
                {form.prerequisites.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-full bg-[var(--brand-gold)]" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...form.prerequisites];
                        updated[idx] = e.target.value;
                        setForm({ ...form, prerequisites: updated });
                      }}
                      placeholder="e.g. Basic familiarity with HTML & CSS"
                      className="flex-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3 py-2 text-xs text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
                    />
                    {form.prerequisites.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            prerequisites: form.prerequisites.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-[var(--ink-300)] hover:text-[var(--danger)]"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUTHORS / INSTRUCTORS */}
          {modalTab === 'authors' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[var(--ink-900)]">Instructors & Authors</h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    Add authors shown on the course hero section.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setForm({
                      ...form,
                      authors: [
                        ...form.authors,
                        { name: '', role: 'Instructor', avatar: '', bio: '' },
                      ],
                    })
                  }
                >
                  <Plus className="size-3.5" /> Add Author
                </Button>
              </div>

              {form.authors.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-center text-xs text-[var(--text-muted)]">
                  No instructors assigned yet. Click &quot;Add Author&quot; to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.authors.map((author, aIdx) => (
                    <div
                      key={aIdx}
                      className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--brand-gold-600)] uppercase">
                          Instructor #{aIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              authors: form.authors.filter((_, i) => i !== aIdx),
                            })
                          }
                          className="text-[var(--ink-300)] hover:text-[var(--danger)]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                          label="Full Name"
                          placeholder="e.g. Dr. Alex Morgan"
                          value={author.name}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[aIdx] = { ...updated[aIdx], name: e.target.value };
                            setForm({ ...form, authors: updated });
                          }}
                        />
                        <Input
                          label="Role / Title"
                          placeholder="e.g. Lead Software Architect"
                          value={author.role || ''}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[aIdx] = { ...updated[aIdx], role: e.target.value };
                            setForm({ ...form, authors: updated });
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Input
                          label="Avatar URL (Optional)"
                          placeholder="https://..."
                          value={author.avatar || ''}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[aIdx] = { ...updated[aIdx], avatar: e.target.value };
                            setForm({ ...form, authors: updated });
                          }}
                        />
                        <Input
                          label="Short Bio"
                          placeholder="e.g. 10+ years in distributed systems"
                          value={author.bio || ''}
                          onChange={(e) => {
                            const updated = [...form.authors];
                            updated[aIdx] = { ...updated[aIdx], bio: e.target.value };
                            setForm({ ...form, authors: updated });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setEditCourse(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editCourse ? 'Save changes' : 'Create course'}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete course"
        message={`Deleting "${deleteTarget?.title}" will permanently remove all chapters, topics, flashcards, MCQs, and user progress. This cannot be undone.`}
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

