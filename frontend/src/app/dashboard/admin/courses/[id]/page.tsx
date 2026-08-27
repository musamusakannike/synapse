'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Award,
  Zap,
  Layers,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { courseApi, chapterApi, topicApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import MediaUploader from '@/components/admin/MediaUploader';
import ExerciseEditor from '@/components/admin/ExerciseEditor';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Course, Chapter, Topic, Exercise } from '@/lib/types';
import { formatNairaFromKobo } from '@/lib/money';

function SortableTopicRow({
  topic,
  index,
  onEdit,
  onDelete,
}: {
  topic: Topic;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: topic._id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-card)] p-3.5 shadow-2xs transition-all hover:border-[var(--brand-gold-300)]">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[var(--ink-300)] hover:text-[var(--ink-900)] active:cursor-grabbing"
          aria-label="Drag to reorder topic"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-100)] text-xs font-bold text-[var(--brand-gold-600)]">
          {index + 1}
        </span>
        <Link
          href={`/dashboard/admin/courses/${topic.course}/topics/${topic._id}`}
          className="group min-w-0 flex-1"
        >
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--ink-900)] transition-colors group-hover:text-[var(--brand-gold-600)]">
              {topic.title}
            </h4>
            <Badge tone={topic.isPublished ? 'success' : 'warning'}>
              {topic.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          {topic.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">{topic.description}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-400)]">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="size-3 text-[var(--brand-gold-600)]" />
              {topic.contents?.length || 0} blocks
            </span>
            {!!topic.flashcardCount && (
              <span className="flex items-center gap-1">
                <CreditCard className="size-3 text-blue-500" /> {topic.flashcardCount} cards
              </span>
            )}
            {!!topic.mcqCount && (
              <span className="flex items-center gap-1">
                <HelpCircle className="size-3 text-emerald-500" /> {topic.mcqCount} MCQs
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <Zap className="size-3 fill-amber-500 text-amber-500" /> +{topic.xp || 50} XP
            </span>
            {topic.exercise?.questions && topic.exercise.questions.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Assessment ({topic.exercise.questions.length} Qs)
              </span>
            )}
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="size-3.5 text-[var(--danger)]" />
          </Button>
          <Link href={`/dashboard/admin/courses/${topic.course}/topics/${topic._id}`}>
            <Button variant="ghost" size="sm">
              <ChevronRight className="size-4 text-[var(--ink-300)]" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminCourseDetailContent() {
  const params = useParams();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Accordion open/close state for chapters
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  // Chapter Modals
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ title: '', description: '' });
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);
  const [savingChapter, setSavingChapter] = useState(false);

  // Chapter Assessment (Exercise) Modal
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedChapterForExercise, setSelectedChapterForExercise] = useState<Chapter | null>(null);
  const [currentChapterExercise, setCurrentChapterExercise] = useState<Exercise>({
    title: '',
    instructions: '',
    questions: [],
  });
  const [savingExercise, setSavingExercise] = useState(false);

  // Topic Modals
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicForm, setTopicForm] = useState<{
    title: string;
    description: string;
    chapter: string;
    xp: number;
    isPublished: boolean;
  }>({
    title: '',
    description: '',
    chapter: '',
    xp: 50,
    isPublished: true,
  });

  // Banner
  const [banner, setBanner] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadData = useCallback(async () => {
    try {
      const [courseRes, chaptersRes, topicsRes] = await Promise.all([
        courseApi.get(id),
        chapterApi.byCourse(id),
        topicApi.byCourse(id),
      ]);
      setCourse(courseRes.data.data);
      setBanner(courseRes.data.data.banner || '');
      const fetchedChapters: Chapter[] = chaptersRes.data.data || [];
      setChapters(fetchedChapters);
      setTopics(topicsRes.data.data || []);

      // Default expand all chapters
      const openMap: Record<string, boolean> = {};
      fetchedChapters.forEach((c) => {
        openMap[c._id] = true;
      });
      setOpenChapters((prev) => ({ ...openMap, ...prev }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // Reorder Chapters
  const handleChapterDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((c) => c._id === active.id);
      const newIndex = chapters.findIndex((c) => c._id === over.id);
      const newOrder = arrayMove(chapters, oldIndex, newIndex);
      setChapters(newOrder);
      try {
        await chapterApi.reorder({ course: id, chapterIds: newOrder.map((c) => c._id) });
        toast.success('Chapter order updated');
      } catch {
        toast.error('Failed to save chapter order');
        loadData();
      }
    }
  };

  // Reorder Topics within a Chapter
  const handleTopicDragEnd = async (chapterId: string, chapterTopics: Topic[], event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chapterTopics.findIndex((t) => t._id === active.id);
      const newIndex = chapterTopics.findIndex((t) => t._id === over.id);
      const newOrder = arrayMove(chapterTopics, oldIndex, newIndex);

      // Update local state
      const otherTopics = topics.filter((t) => (t.chapter || '') !== chapterId);
      setTopics([...otherTopics, ...newOrder]);

      try {
        await topicApi.reorder({
          course: id,
          topicIds: newOrder.map((t) => t._id),
          chapterId: chapterId || undefined,
        });
      } catch {
        toast.error('Failed to save topic order');
        loadData();
      }
    }
  };

  // Save / Create Chapter
  const handleSaveChapter = async () => {
    if (!chapterForm.title.trim()) return toast.error('Chapter title is required');
    setSavingChapter(true);
    try {
      if (editingChapter) {
        await chapterApi.update(editingChapter._id, chapterForm);
        toast.success('Chapter updated');
      } else {
        await chapterApi.create({
          ...chapterForm,
          course: id,
          order: chapters.length,
        });
        toast.success('Chapter created');
      }
      setShowChapterModal(false);
      setEditingChapter(null);
      setChapterForm({ title: '', description: '' });
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save chapter');
    } finally {
      setSavingChapter(false);
    }
  };

  // Delete Chapter
  const handleDeleteChapter = async () => {
    if (!deletingChapter) return;
    try {
      await chapterApi.remove(deletingChapter._id);
      toast.success('Chapter deleted');
      setDeletingChapter(null);
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete chapter');
    }
  };

  // Open Chapter Assessment Modal
  const openExerciseModal = (chapter: Chapter) => {
    setSelectedChapterForExercise(chapter);
    setCurrentChapterExercise(
      chapter.exercise || {
        title: `${chapter.title} Capstone Assessment`,
        instructions: 'Complete all questions to unlock the next chapter.',
        questions: [],
      }
    );
    setShowExerciseModal(true);
  };

  // Save Chapter Assessment
  const handleSaveChapterExercise = async () => {
    if (!selectedChapterForExercise) return;
    setSavingExercise(true);
    try {
      await chapterApi.update(selectedChapterForExercise._id, {
        exercise: currentChapterExercise,
      });
      toast.success('Chapter assessment saved successfully');
      setShowExerciseModal(false);
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSavingExercise(false);
    }
  };

  // Save / Create Topic
  const handleSaveTopic = async () => {
    if (!topicForm.title.trim()) return toast.error('Topic title is required');
    setSavingTopic(true);
    try {
      const payload = {
        title: topicForm.title.trim(),
        description: topicForm.description.trim(),
        chapter: topicForm.chapter || undefined,
        xp: topicForm.xp || 50,
        isPublished: topicForm.isPublished,
        course: id,
      };

      if (editingTopic) {
        await topicApi.update(editingTopic._id, payload);
        toast.success('Topic updated');
      } else {
        await topicApi.create(payload as Partial<Topic>);
        toast.success('Topic created');
      }
      setShowTopicModal(false);
      setEditingTopic(null);
      setTopicForm({ title: '', description: '', chapter: '', xp: 50, isPublished: true });
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save topic');
    } finally {
      setSavingTopic(false);
    }
  };

  // Delete Topic
  const handleDeleteTopic = async () => {
    if (!deletingTopic) return;
    try {
      await topicApi.remove(deletingTopic._id);
      toast.success('Topic deleted');
      setDeletingTopic(null);
      loadData();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-muted)]">Course not found.</p>
        <Link href="/dashboard/admin/courses" className="mt-2 inline-block text-[var(--brand-gold-600)] hover:opacity-80">
          Back to courses
        </Link>
      </div>
    );
  }

  // Standalone/unassigned topics
  const unassignedTopics = topics.filter(
    (t) => !t.chapter || !chapters.some((c) => c._id === t.chapter)
  );

  const totalFlashcards = topics.reduce((s, t) => s + (t.flashcardCount || 0), 0);
  const totalMcqs = topics.reduce((s, t) => s + (t.mcqCount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Breadcrumb */}
      <Link
        href="/dashboard/admin/courses"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      {/* Banner Upload Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Course Banner Header
          </span>
          {savingBanner && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--ink-300)]">
              <Loader2 className="size-3.5 animate-spin" /> Saving…
            </span>
          )}
        </div>
        <MediaUploader kind="image" value={banner} onChange={handleBannerChange} />
      </div>

      {/* Course Info Card */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-card)] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone="neutral">{course.category}</Badge>
            <Badge tone="gold">{course.difficulty}</Badge>
            <Badge tone={course.isFree ? 'neutral' : 'gold'}>
              {course.isFree ? 'Free' : formatNairaFromKobo(course.price || 0)}
            </Badge>
            <Badge tone={course.isPublished ? 'success' : 'warning'}>
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <Link href={`/dashboard/courses/${course._id}`} target="_blank">
            <Button variant="secondary" size="sm">
              View Learner Page ↗
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-900)] md:text-3xl">{course.title}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {course.longDescription || course.description}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 sm:grid-cols-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]">
              <BookOpen className="size-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Curriculum</p>
              <p className="text-sm font-bold text-[var(--ink-900)]">
                {chapters.length} Chapters • {topics.length} Topics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CreditCard className="size-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Study Cards</p>
              <p className="text-sm font-bold text-[var(--ink-900)]">{totalFlashcards} Flashcards</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">MCQ Bank</p>
              <p className="text-sm font-bold text-[var(--ink-900)]">{totalMcqs} MCQs</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Zap className="size-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Total XP</p>
              <p className="text-sm font-bold text-amber-600">+{course.totalObtainableXp || 0} XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Header & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--ink-900)]">Curriculum Structure</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Organize learning units into Chapters and Topics. Learners progress sequentially.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingTopic(null);
              setTopicForm({
                title: '',
                description: '',
                chapter: chapters.length > 0 ? chapters[0]._id : '',
                xp: 50,
                isPublished: true,
              });
              setShowTopicModal(true);
            }}
          >
            <Plus className="size-4" /> Add Topic
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingChapter(null);
              setChapterForm({ title: '', description: '' });
              setShowChapterModal(true);
            }}
          >
            <FolderPlus className="size-4" /> Add Chapter
          </Button>
        </div>
      </div>

      {/* Chapters List */}
      {chapters.length === 0 && unassignedTopics.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-12" />}
          title="No chapters or topics yet"
          description="Start building your course curriculum by creating your first chapter."
          action={
            <Button
              onClick={() => {
                setEditingChapter(null);
                setChapterForm({ title: '', description: '' });
                setShowChapterModal(true);
              }}
            >
              <FolderPlus className="size-4" /> Create Chapter 1
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChapterDragEnd}>
            <SortableContext items={chapters.map((c) => c._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {chapters.map((chapter, cIdx) => {
                  const chapterTopics = topics.filter((t) => t.chapter === chapter._id);
                  const isOpen = !!openChapters[chapter._id];
                  const hasExercise = !!chapter.exercise?.questions?.length;

                  return (
                    <div
                      key={chapter._id}
                      className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] shadow-2xs"
                    >
                      {/* Chapter Accordion Header */}
                      <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface-sunken)]/40 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleChapter(chapter._id)}
                            className="flex items-center gap-2 text-left"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold)] font-bold text-xs text-slate-950">
                              Ch {cIdx + 1}
                            </span>
                            <div>
                              <h3 className="font-bold text-base text-[var(--ink-900)] hover:text-[var(--brand-gold-600)] transition-colors">
                                {chapter.title}
                              </h3>
                              {chapter.description && (
                                <p className="line-clamp-1 text-xs text-[var(--text-muted)]">
                                  {chapter.description}
                                </p>
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Chapter Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Assessment Button */}
                          <Button
                            variant={hasExercise ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => openExerciseModal(chapter)}
                            className={hasExercise ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100' : ''}
                          >
                            <Award className="size-3.5 text-amber-600" />
                            <span className="text-xs">
                              {hasExercise
                                ? `Capstone Assessment (${chapter.exercise?.questions.length} Qs)`
                                : '+ Capstone'}
                            </span>
                          </Button>

                          {/* Quick Add Topic to Chapter */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingTopic(null);
                              setTopicForm({
                                title: '',
                                description: '',
                                chapter: chapter._id,
                                xp: 50,
                                isPublished: true,
                              });
                              setShowTopicModal(true);
                            }}
                          >
                            <Plus className="size-3.5" />
                            <span className="text-xs">Add Topic</span>
                          </Button>

                          {/* Edit Chapter */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingChapter(chapter);
                              setChapterForm({
                                title: chapter.title,
                                description: chapter.description || '',
                              });
                              setShowChapterModal(true);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          {/* Delete Chapter */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingChapter(chapter)}
                          >
                            <Trash2 className="size-3.5 text-[var(--danger)]" />
                          </Button>

                          {/* Toggle Expand */}
                          <button
                            onClick={() => toggleChapter(chapter._id)}
                            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--line)] hover:text-[var(--ink-900)] transition-colors"
                          >
                            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Topics inside this Chapter */}
                      {isOpen && (
                        <div className="space-y-2 p-4">
                          {chapterTopics.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-[var(--line)] py-6 text-center text-xs text-[var(--text-muted)]">
                              No topics in this chapter yet. Click &quot;Add Topic&quot; above to create one.
                            </div>
                          ) : (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(e) => handleTopicDragEnd(chapter._id, chapterTopics, e)}
                            >
                              <SortableContext
                                items={chapterTopics.map((t) => t._id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2">
                                  {chapterTopics.map((topic, tIdx) => (
                                    <SortableTopicRow
                                      key={topic._id}
                                      topic={topic}
                                      index={tIdx}
                                      onEdit={() => {
                                        setEditingTopic(topic);
                                        setTopicForm({
                                          title: topic.title,
                                          description: topic.description || '',
                                          chapter: topic.chapter || chapter._id,
                                          xp: topic.xp || 50,
                                          isPublished: topic.isPublished,
                                        });
                                        setShowTopicModal(true);
                                      }}
                                      onDelete={() => setDeletingTopic(topic)}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          {/* Unassigned / Standalone Topics Section */}
          {unassignedTopics.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-amber-950">
                    Standalone / Unassigned Topics ({unassignedTopics.length})
                  </h3>
                  <p className="text-xs text-amber-800">
                    These topics are not linked to a specific chapter. In learner view, they are grouped under Chapter 1.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {unassignedTopics.map((topic, uIdx) => (
                  <div
                    key={topic._id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-card)] p-3.5 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {uIdx + 1}
                        </span>
                        <h4 className="font-semibold text-sm text-[var(--ink-900)] truncate">
                          {topic.title}
                        </h4>
                        <Badge tone={topic.isPublished ? 'success' : 'warning'}>
                          {topic.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      {topic.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-muted)]">
                          {topic.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {chapters.length > 0 && (
                        <select
                          value=""
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            try {
                              await topicApi.update(topic._id, { chapter: e.target.value });
                              toast.success('Topic assigned to chapter');
                              loadData();
                            } catch {
                              toast.error('Failed to assign chapter');
                            }
                          }}
                          className="rounded-lg border border-[var(--line)] bg-[var(--surface-page)] px-2.5 py-1 text-xs text-[var(--ink-900)] outline-none"
                        >
                          <option value="">Move to Chapter...</option>
                          {chapters.map((c, i) => (
                            <option key={c._id} value={c._id}>
                              Chapter {i + 1}: {c.title}
                            </option>
                          ))}
                        </select>
                      )}

                      <Link href={`/dashboard/admin/courses/${topic.course}/topics/${topic._id}`}>
                        <Button variant="secondary" size="sm">
                          Edit Lessons
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTopic(topic);
                          setTopicForm({
                            title: topic.title,
                            description: topic.description || '',
                            chapter: topic.chapter || '',
                            xp: topic.xp || 50,
                            isPublished: topic.isPublished,
                          });
                          setShowTopicModal(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingTopic(topic)}
                      >
                        <Trash2 className="size-3.5 text-[var(--danger)]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chapter Create / Edit Dialog */}
      <Dialog
        open={showChapterModal}
        onClose={() => {
          setShowChapterModal(false);
          setEditingChapter(null);
        }}
        title={editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
      >
        <div className="space-y-4">
          <Input
            label="Chapter Title"
            value={chapterForm.title}
            onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
            placeholder="e.g. Fundamentals & Core Concepts"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Chapter Description</span>
            <textarea
              value={chapterForm.description}
              onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
              rows={3}
              placeholder="What this chapter covers..."
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowChapterModal(false);
                setEditingChapter(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveChapter} disabled={savingChapter}>
              {savingChapter ? 'Saving…' : editingChapter ? 'Save changes' : 'Add Chapter'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Chapter Capstone Assessment Modal */}
      <Dialog
        open={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        title={`Capstone Assessment: ${selectedChapterForExercise?.title}`}
        maxWidth="760px"
      >
        <div className="space-y-4">
          <ExerciseEditor
            exercise={currentChapterExercise}
            onChange={(ex) => setCurrentChapterExercise(ex)}
          />
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => setShowExerciseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChapterExercise} disabled={savingExercise}>
              {savingExercise ? 'Saving Assessment…' : 'Save Capstone Assessment'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Topic Create / Edit Dialog */}
      <Dialog
        open={showTopicModal}
        onClose={() => {
          setShowTopicModal(false);
          setEditingTopic(null);
        }}
        title={editingTopic ? 'Edit Topic Settings' : 'Add Topic'}
      >
        <div className="space-y-4">
          <Input
            label="Topic Title"
            value={topicForm.title}
            onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
            placeholder="e.g. Variables and Data Types"
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Topic Description</span>
            <textarea
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
              rows={3}
              placeholder="Brief overview of this topic lesson..."
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[var(--ink-900)]">Assign to Chapter</span>
              <select
                value={topicForm.chapter}
                onChange={(e) => setTopicForm({ ...topicForm, chapter: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none focus:border-[var(--ink-900)]"
              >
                <option value="">None (Standalone)</option>
                {chapters.map((c, i) => (
                  <option key={c._id} value={c._id}>
                    Chapter {i + 1}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="XP Reward on Completion"
              type="number"
              min="0"
              value={String(topicForm.xp)}
              onChange={(e) => setTopicForm({ ...topicForm, xp: parseInt(e.target.value, 10) || 50 })}
            />
          </div>

          <Checkbox
            checked={topicForm.isPublished}
            onChange={(v) => setTopicForm({ ...topicForm, isPublished: v })}
            label="Publish Topic (Visible to learners)"
          />

          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowTopicModal(false);
                setEditingTopic(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTopic} disabled={savingTopic}>
              {savingTopic ? 'Saving…' : editingTopic ? 'Save changes' : 'Add Topic'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Confirm Deletions */}
      <ConfirmDialog
        isOpen={!!deletingChapter}
        onClose={() => setDeletingChapter(null)}
        onConfirm={handleDeleteChapter}
        title="Delete Chapter"
        message={`Deleting "${deletingChapter?.title}" will also remove all topics inside it. This action cannot be undone.`}
        confirmLabel="Delete Chapter"
      />

      <ConfirmDialog
        isOpen={!!deletingTopic}
        onClose={() => setDeletingTopic(null)}
        onConfirm={handleDeleteTopic}
        title="Delete Topic"
        message={`Deleting "${deletingTopic?.title}" will permanently remove all lesson blocks, flashcards, MCQs, and user progress for this topic.`}
        confirmLabel="Delete Topic"
      />
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
