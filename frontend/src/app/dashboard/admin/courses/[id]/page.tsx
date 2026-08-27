'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, BookOpen, CreditCard, HelpCircle, Plus, Pencil, Trash2, GripVertical, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { courseApi, topicApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import MediaUploader from '@/components/admin/MediaUploader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Course, Topic } from '@/lib/types';

function SortableTopicRow({ topic, index, onEdit, onDelete }: { topic: Topic; index: number; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="cursor-grab touch-none text-[var(--ink-300)] hover:text-[var(--ink-900)] active:cursor-grabbing">
            <GripVertical className="size-5" />
          </button>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-100)] text-sm font-semibold text-[var(--brand-gold-600)]">{index + 1}</span>
          <Link href={`/dashboard/admin/courses/${topic.course}/topics/${topic._id}`} className="group min-w-0 flex-1">
            <h3 className="text-sm font-medium text-[var(--ink-900)] transition-colors group-hover:text-[var(--brand-gold-600)]">{topic.title}</h3>
            {topic.description && <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">{topic.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-300)]">
              {topic.contents?.length > 0 && <span>{topic.contents.length} content blocks</span>}
              {!!topic.flashcardCount && <span className="flex items-center gap-1"><CreditCard className="size-3" /> {topic.flashcardCount}</span>}
              {!!topic.mcqCount && <span className="flex items-center gap-1"><HelpCircle className="size-3" /> {topic.mcqCount}</span>}
              <Badge tone={topic.isPublished ? 'success' : 'warning'}>{topic.isPublished ? 'Published' : 'Draft'}</Badge>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}><Pencil className="size-3.5" /></Button>
            <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="size-3.5 text-[var(--danger)]" /></Button>
            <ChevronRight className="size-5 text-[var(--ink-300)]" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function AdminCourseDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', isPublished: false });
  const [banner, setBanner] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, topicsRes] = await Promise.all([courseApi.get(id), topicApi.byCourse(id)]);
        setCourse(courseRes.data.data);
        setBanner(courseRes.data.data.banner || '');
        setTopics(topicsRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = topics.findIndex((t) => t._id === active.id);
      const newIndex = topics.findIndex((t) => t._id === over.id);
      const newOrder = arrayMove(topics, oldIndex, newIndex);
      setTopics(newOrder);
      try {
        await topicApi.reorder({ course: id, order: newOrder.map((t) => t._id) });
      } catch {
        toast.error('Failed to save order');
        setTopics(topics);
      }
    }
  };

  const handleSaveTopic = async () => {
    if (!topicForm.title.trim()) return toast.error('Topic title is required');
    setSaving(true);
    try {
      if (editingTopic) {
        await topicApi.update(editingTopic._id, topicForm);
        toast.success('Topic updated');
      } else {
        await topicApi.create({ ...topicForm, course: id } as Partial<Topic>);
        toast.success('Topic created');
      }
      setShowTopicModal(false);
      setEditingTopic(null);
      setTopicForm({ title: '', description: '', isPublished: false });
      const topicsRes = await topicApi.byCourse(id);
      setTopics(topicsRes.data.data || []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save topic');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!deletingTopic) return;
    try {
      await topicApi.remove(deletingTopic._id);
      toast.success('Topic deleted');
      const topicsRes = await topicApi.byCourse(id);
      setTopics(topicsRes.data.data || []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete topic');
    }
  };

  const handleBannerChange = async (url: string) => {
    setBanner(url);
    setSavingBanner(true);
    try {
      const fd = new FormData();
      fd.append('banner', url);
      const res = await courseApi.update(id, fd);
      setCourse(res.data.data);
      toast.success(url ? 'Banner updated' : 'Banner removed');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update banner');
    } finally {
      setSavingBanner(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!course) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-muted)]">Course not found.</p>
        <Link href="/dashboard/admin/courses" className="mt-2 inline-block text-[var(--brand-gold-600)] hover:opacity-80">Back to courses</Link>
      </div>
    );
  }

  const totalFlashcards = topics.reduce((s, t) => s + (t.flashcardCount || 0), 0);
  const totalMcqs = topics.reduce((s, t) => s + (t.mcqCount || 0), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/dashboard/admin/courses" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]">
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text-muted)]">Course banner</span>
          {savingBanner && <span className="flex items-center gap-1.5 text-xs text-[var(--ink-300)]"><Loader2 className="size-3.5 animate-spin" /> Saving…</span>}
        </div>
        <MediaUploader kind="image" value={banner} onChange={handleBannerChange} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Badge tone="neutral">{course.category}</Badge>
          <Badge tone="gold">{course.difficulty}</Badge>
          <Badge tone={course.isPublished ? 'success' : 'warning'}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--ink-900)]">{course.title}</h1>
        <p className="text-[var(--text-muted)]">{course.longDescription || course.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-y border-[var(--line)] py-4">
        <div className="flex items-center gap-2 text-[var(--ink-900)]"><BookOpen className="size-5 text-[var(--brand-gold-600)]" /><span className="text-sm">{course.topicCount || topics.length} topics</span></div>
        <div className="flex items-center gap-2 text-[var(--ink-900)]"><CreditCard className="size-5 text-[var(--brand-gold-600)]" /><span className="text-sm">{totalFlashcards} flashcards</span></div>
        <div className="flex items-center gap-2 text-[var(--ink-900)]"><HelpCircle className="size-5 text-[var(--brand-gold-600)]" /><span className="text-sm">{totalMcqs} MCQs</span></div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--ink-900)]">Topics</h2>
          <Button size="sm" onClick={() => { setEditingTopic(null); setTopicForm({ title: '', description: '', isPublished: false }); setShowTopicModal(true); }}>
            <Plus className="size-4" /> Add topic
          </Button>
        </div>

        {topics.length === 0 ? (
          <EmptyState icon={<BookOpen className="size-12" />} title="No topics yet" description="Add your first topic to start building course content." />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={topics.map((t) => t._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <SortableTopicRow
                    key={topic._id}
                    topic={topic}
                    index={index}
                    onEdit={() => { setEditingTopic(topic); setTopicForm({ title: topic.title, description: topic.description || '', isPublished: topic.isPublished }); setShowTopicModal(true); }}
                    onDelete={() => setDeletingTopic(topic)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={showTopicModal} onClose={() => { setShowTopicModal(false); setEditingTopic(null); }} title={editingTopic ? 'Edit topic' : 'Add topic'}>
        <div className="space-y-4">
          <Input label="Title" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} placeholder="e.g. Introduction to variables" />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Description</span>
            <textarea value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={3} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]" />
          </div>
          <Checkbox checked={topicForm.isPublished} onChange={(v) => setTopicForm({ ...topicForm, isPublished: v })} label="Publish topic" />
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => { setShowTopicModal(false); setEditingTopic(null); }}>Cancel</Button>
            <Button onClick={handleSaveTopic} disabled={saving}>{saving ? 'Saving…' : editingTopic ? 'Save changes' : 'Add topic'}</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog isOpen={!!deletingTopic} onClose={() => setDeletingTopic(null)} onConfirm={handleDeleteTopic} title="Delete topic" message={`Deleting "${deletingTopic?.title}" will remove all flashcards, MCQs, and user progress.`} confirmLabel="Delete topic" />
    </div>
  );
}

export default function AdminCourseDetailPage() {
  return (
    <AdminGuard>
      <AdminCourseDetailContent />
    </AdminGuard>
  );
}
