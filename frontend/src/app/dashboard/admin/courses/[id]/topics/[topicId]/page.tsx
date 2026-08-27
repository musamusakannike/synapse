'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, HelpCircle, Plus, Pencil, Trash2, Save, Layers, Award, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { topicApi, flashcardApi, mcqApi, chapterApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import ContentBlockEditor from '@/components/admin/ContentBlockEditor';
import ExerciseEditor from '@/components/admin/ExerciseEditor';
import BulkImportModal from '@/components/admin/BulkImportModal';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Tabs from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Topic, Chapter, Flashcard, MCQ, MCQOption, TopicContent, Exercise } from '@/lib/types';

function AdminTopicDetailContent() {
  const params = useParams();
  const courseId = params.id as string;
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'exercise' | 'flashcards' | 'mcqs'>('content');

  // Content Blocks
  const [contents, setContents] = useState<TopicContent[]>([]);
  const [originalContents, setOriginalContents] = useState<TopicContent[]>([]);
  const [savingContent, setSavingContent] = useState(false);

  // End-of-Topic Exercise
  const [exercise, setExercise] = useState<Exercise>({ title: '', instructions: '', questions: [] });
  const [originalExercise, setOriginalExercise] = useState<Exercise>({ title: '', instructions: '', questions: [] });
  const [savingExercise, setSavingExercise] = useState(false);

  // Flashcards
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [flashcardForm, setFlashcardForm] = useState({ question: '', answer: '' });
  const [savingFlashcard, setSavingFlashcard] = useState(false);
  const [deletingFlashcard, setDeletingFlashcard] = useState<Flashcard | null>(null);
  const [showFlashcardBulk, setShowFlashcardBulk] = useState(false);

  // MCQs
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQ | null>(null);
  const [mcqForm, setMcqForm] = useState({
    question: '',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] as MCQOption[],
    explanation: '',
  });
  const [savingMcq, setSavingMcq] = useState(false);
  const [deletingMcq, setDeletingMcq] = useState<MCQ | null>(null);
  const [showMcqBulk, setShowMcqBulk] = useState(false);

  // Topic Metadata Edit
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState<{
    title: string;
    description: string;
    chapter: string;
    xp: number;
    isPublished: boolean;
    defaultFlow: 'flat' | 'guided';
  }>({
    title: '',
    description: '',
    chapter: '',
    xp: 50,
    isPublished: true,
    defaultFlow: 'flat',
  });

  const loadData = async () => {
    try {
      const [topicRes, chaptersRes, fcRes, mcqRes] = await Promise.all([
        topicApi.get(topicId),
        chapterApi.byCourse(courseId).catch(() => ({ data: { data: [] } })),
        flashcardApi.byTopic(topicId),
        mcqApi.byTopic(topicId),
      ]);

      const t = topicRes.data.data;
      setTopic(t);
      setContents(t.contents || []);
      setOriginalContents(t.contents || []);

      const ex = t.exercise || {
        title: `${t.title} Assessment`,
        instructions: 'Answer the questions below to test your understanding.',
        questions: [],
      };
      setExercise(ex);
      setOriginalExercise(ex);

      setChapters(chaptersRes.data.data || []);
      setFlashcards(fcRes.data.data || []);
      setMcqs(mcqRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, courseId]);

  const hasContentChanges = JSON.stringify(contents) !== JSON.stringify(originalContents);
  const hasExerciseChanges = JSON.stringify(exercise) !== JSON.stringify(originalExercise);

  const handleSaveContent = async () => {
    setSavingContent(true);
    try {
      await topicApi.update(topicId, { contents });
      setOriginalContents(contents);
      toast.success('Lesson content blocks saved');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save content');
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveExercise = async () => {
    setSavingExercise(true);
    try {
      await topicApi.update(topicId, { exercise });
      setOriginalExercise(exercise);
      toast.success('Topic assessment saved successfully');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSavingExercise(false);
    }
  };

  const handleSaveFlashcard = async () => {
    if (!flashcardForm.question.trim() || !flashcardForm.answer.trim()) {
      return toast.error('Question and answer are required');
    }
    setSavingFlashcard(true);
    try {
      if (editingFlashcard) {
        await flashcardApi.update(editingFlashcard._id, flashcardForm);
        toast.success('Flashcard updated');
      } else {
        await flashcardApi.create({ ...flashcardForm, topic: topicId });
        toast.success('Flashcard created');
      }
      setShowFlashcardModal(false);
      setEditingFlashcard(null);
      setFlashcardForm({ question: '', answer: '' });
      const res = await flashcardApi.byTopic(topicId);
      setFlashcards(res.data.data || []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save flashcard');
    } finally {
      setSavingFlashcard(false);
    }
  };

  const handleDeleteFlashcard = async () => {
    if (!deletingFlashcard) return;
    try {
      await flashcardApi.remove(deletingFlashcard._id);
      toast.success('Flashcard deleted');
      setFlashcards(flashcards.filter((f) => f._id !== deletingFlashcard._id));
      setDeletingFlashcard(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete flashcard');
    }
  };

  const handleSaveMcq = async () => {
    if (!mcqForm.question.trim()) return toast.error('Question is required');
    const validOptions = mcqForm.options.filter((o) => o.text.trim());
    if (validOptions.length < 2) return toast.error('At least 2 options required');
    if (!validOptions.some((o) => o.isCorrect)) return toast.error('Mark at least one correct option');
    setSavingMcq(true);
    try {
      const payload = {
        question: mcqForm.question,
        options: validOptions,
        explanation: mcqForm.explanation,
        topic: topicId,
      };
      if (editingMcq) {
        await mcqApi.update(editingMcq._id, payload);
        toast.success('MCQ updated');
      } else {
        await mcqApi.create(payload);
        toast.success('MCQ created');
      }
      setShowMcqModal(false);
      setEditingMcq(null);
      setMcqForm({
        question: '',
        options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
        explanation: '',
      });
      const res = await mcqApi.byTopic(topicId);
      setMcqs(res.data.data || []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save MCQ');
    } finally {
      setSavingMcq(false);
    }
  };

  const handleDeleteMcq = async () => {
    if (!deletingMcq) return;
    try {
      await mcqApi.remove(deletingMcq._id);
      toast.success('MCQ deleted');
      setMcqs(mcqs.filter((m) => m._id !== deletingMcq._id));
      setDeletingMcq(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete MCQ');
    }
  };

  const addOption = () => {
    if (mcqForm.options.length < 6) {
      setMcqForm({ ...mcqForm, options: [...mcqForm.options, { text: '', isCorrect: false }] });
    }
  };

  const removeOption = (index: number) => {
    if (mcqForm.options.length > 2) {
      setMcqForm({ ...mcqForm, options: mcqForm.options.filter((_, i) => i !== index) });
    }
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setMcqForm({
      ...mcqForm,
      options: mcqForm.options.map((o, i) =>
        i === index
          ? { ...o, [field]: value }
          : field === 'isCorrect'
          ? { ...o, isCorrect: false }
          : o
      ),
    });
  };

  const handleSaveTopicMeta = async () => {
    if (!topicForm.title.trim()) return toast.error('Title is required');
    try {
      await topicApi.update(topicId, {
        title: topicForm.title.trim(),
        description: topicForm.description.trim(),
        chapter: topicForm.chapter || undefined,
        xp: topicForm.xp || 50,
        isPublished: topicForm.isPublished,
        defaultFlow: topicForm.defaultFlow,
      });
      toast.success('Topic metadata updated');
      setShowEditTopicModal(false);
      const res = await topicApi.get(topicId);
      setTopic(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update topic');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-muted)]">Topic not found.</p>
        <Link
          href={`/dashboard/admin/courses/${courseId}`}
          className="mt-2 inline-block text-[var(--brand-gold-600)] hover:opacity-80"
        >
          Back to course
        </Link>
      </div>
    );
  }

  const assignedChapter = chapters.find((c) => c._id === topic.chapter);

  const tabs = [
    { value: 'content', label: `Lesson Blocks (${contents.length})` },
    { value: 'exercise', label: `End-of-Topic Assessment (${exercise.questions?.length || 0})` },
    { value: 'flashcards', label: `Flashcards (${flashcards.length})` },
    { value: 'mcqs', label: `MCQ Bank (${mcqs.length})` },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Breadcrumb */}
      <Link
        href={`/dashboard/admin/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]"
      >
        <ArrowLeft className="size-4" /> Back to curriculum
      </Link>

      {/* Topic Header Card */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-card)] p-6 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge tone={assignedChapter ? 'gold' : 'neutral'}>
              {assignedChapter ? `Chapter: ${assignedChapter.title}` : 'Standalone Topic'}
            </Badge>
            <Badge tone="neutral">View: {topic.defaultFlow === 'guided' ? 'Guided Steps' : 'Flat Page'}</Badge>
            <Badge tone={topic.isPublished ? 'success' : 'warning'}>
              {topic.isPublished ? 'Published' : 'Draft'}
            </Badge>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
              <Zap className="size-3.5 fill-amber-500 text-amber-500" /> +{topic.xp || 50} XP
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTopicForm({
                title: topic.title,
                description: topic.description || '',
                chapter: topic.chapter || '',
                xp: topic.xp || 50,
                isPublished: topic.isPublished,
                defaultFlow: topic.defaultFlow || 'flat',
              });
              setShowEditTopicModal(true);
            }}
          >
            <Pencil className="size-3.5" /> Edit Settings
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-[var(--ink-900)] md:text-3xl">{topic.title}</h1>
        {topic.description && <p className="text-sm text-[var(--text-muted)]">{topic.description}</p>}
      </div>

      {/* Tab Navigation */}
      <Tabs
        tabs={tabs}
        active={activeTab}
        onChange={(v) => setActiveTab(v as 'content' | 'exercise' | 'flashcards' | 'mcqs')}
      />

      {/* TAB 1: LESSON CONTENT BLOCKS */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-900)]">Lesson Content Editor</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Add, reorder, and configure modular blocks (Text, Code, Video, LaTeX, In-line Quiz, etc.).
              </p>
            </div>
            <Button size="sm" onClick={handleSaveContent} disabled={!hasContentChanges || savingContent}>
              <Save className="size-4" /> {savingContent ? 'Saving…' : 'Save Blocks'}
            </Button>
          </div>
          {hasContentChanges && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
              You have unsaved changes in your lesson content blocks. Click &quot;Save Blocks&quot; above to commit.
            </div>
          )}
          <ContentBlockEditor contents={contents} onChange={setContents} />
        </div>
      )}

      {/* TAB 2: END-OF-TOPIC ASSESSMENT / EXERCISE */}
      {activeTab === 'exercise' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-900)]">End-of-Topic Challenge / Assessment</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Learners must take and pass (50%+) this exercise to mark the topic complete and unlock the next lesson.
              </p>
            </div>
            <Button size="sm" onClick={handleSaveExercise} disabled={!hasExerciseChanges || savingExercise}>
              <Save className="size-4" /> {savingExercise ? 'Saving…' : 'Save Assessment'}
            </Button>
          </div>
          {hasExerciseChanges && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
              You have unsaved changes in this assessment. Click &quot;Save Assessment&quot; above to commit.
            </div>
          )}
          <Card className="p-6">
            <ExerciseEditor exercise={exercise} onChange={setExercise} />
          </Card>
        </div>
      )}

      {/* TAB 3: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-900)]">Flashcard Study Deck</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Spaced repetition study cards attached to this topic.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowFlashcardBulk(true)}>
                <Layers className="size-4" /> Bulk Import
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingFlashcard(null);
                  setFlashcardForm({ question: '', answer: '' });
                  setShowFlashcardModal(true);
                }}
              >
                <Plus className="size-4" /> Add Flashcard
              </Button>
            </div>
          </div>

          {flashcards.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="size-12 text-[var(--ink-300)]" />}
              title="No flashcards yet"
              description="Add individual study cards or import a JSON deck."
            />
          ) : (
            <div className="space-y-2">
              {flashcards.map((fc, i) => (
                <Card key={fc._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-sm font-semibold text-[var(--ink-900)]">{fc.question}</p>
                        <p className="text-sm text-[var(--text-muted)]">{fc.answer}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingFlashcard(fc);
                          setFlashcardForm({ question: fc.question, answer: fc.answer });
                          setShowFlashcardModal(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingFlashcard(fc)}
                      >
                        <Trash2 className="size-3.5 text-[var(--danger)]" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MCQS */}
      {activeTab === 'mcqs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-900)]">Practice MCQ Question Bank</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Multiple-choice questions for learner practice and quizzes.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowMcqBulk(true)}>
                <Layers className="size-4" /> Bulk Import
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingMcq(null);
                  setMcqForm({
                    question: '',
                    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
                    explanation: '',
                  });
                  setShowMcqModal(true);
                }}
              >
                <Plus className="size-4" /> Add MCQ
              </Button>
            </div>
          </div>

          {mcqs.length === 0 ? (
            <EmptyState
              icon={<HelpCircle className="size-12 text-[var(--ink-300)]" />}
              title="No MCQs in this question bank"
              description="Add multiple-choice practice questions individually or bulk import via JSON."
            />
          ) : (
            <div className="space-y-2">
              {mcqs.map((mcq, mIdx) => (
                <Card key={mcq._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        {mIdx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="mb-2 text-sm font-semibold text-[var(--ink-900)]">{mcq.question}</p>
                        <div className="space-y-1">
                          {mcq.options.map((option, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 text-xs ${
                                option.isCorrect ? 'font-semibold text-emerald-600' : 'text-[var(--text-muted)]'
                              }`}
                            >
                              <span
                                className={`size-3.5 rounded-full border ${
                                  option.isCorrect
                                    ? 'border-emerald-600 bg-emerald-600 text-white flex items-center justify-center text-[9px]'
                                    : 'border-[var(--line)]'
                                }`}
                              />
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                        {mcq.explanation && (
                          <p className="mt-2 text-xs text-[var(--ink-400)] italic">
                            Explanation: {mcq.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMcq(mcq);
                          setMcqForm({
                            question: mcq.question,
                            options: mcq.options.map((o) => ({ ...o })),
                            explanation: mcq.explanation || '',
                          });
                          setShowMcqModal(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingMcq(mcq)}
                      >
                        <Trash2 className="size-3.5 text-[var(--danger)]" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Flashcard Dialog */}
      <Dialog
        open={showFlashcardModal}
        onClose={() => {
          setShowFlashcardModal(false);
          setEditingFlashcard(null);
        }}
        title={editingFlashcard ? 'Edit Flashcard' : 'Add Flashcard'}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Front Question</span>
            <textarea
              value={flashcardForm.question}
              onChange={(e) => setFlashcardForm({ ...flashcardForm, question: e.target.value })}
              rows={3}
              placeholder="e.g. What is closure in JavaScript?"
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Back Answer</span>
            <textarea
              value={flashcardForm.answer}
              onChange={(e) => setFlashcardForm({ ...flashcardForm, answer: e.target.value })}
              rows={3}
              placeholder="e.g. A function bundled together with references to its surrounding lexical scope."
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowFlashcardModal(false);
                setEditingFlashcard(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFlashcard} disabled={savingFlashcard}>
              {savingFlashcard ? 'Saving…' : editingFlashcard ? 'Save changes' : 'Add Flashcard'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit MCQ Dialog */}
      <Dialog
        open={showMcqModal}
        onClose={() => {
          setShowMcqModal(false);
          setEditingMcq(null);
        }}
        title={editingMcq ? 'Edit MCQ' : 'Add MCQ'}
        maxWidth="560px"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Question</span>
            <textarea
              value={mcqForm.question}
              onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })}
              rows={3}
              placeholder="Enter question prompt..."
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--ink-900)]">
                Options (Select circle for correct answer)
              </span>
              {mcqForm.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="cursor-pointer text-xs font-semibold text-[var(--brand-gold-600)] hover:opacity-80"
                >
                  + Add option
                </button>
              )}
            </div>
            <div className="space-y-2">
              {mcqForm.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateOption(i, 'isCorrect', true)}
                    className={`size-5 shrink-0 cursor-pointer rounded-full border-2 ${
                      option.isCorrect
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-[var(--line)] bg-transparent'
                    }`}
                  />
                  <input
                    value={option.text}
                    onChange={(e) => updateOption(i, 'text', e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none"
                  />
                  {mcqForm.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="shrink-0 cursor-pointer text-[var(--ink-300)] hover:text-[var(--danger)]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Explanation (Optional)</span>
            <textarea
              value={mcqForm.explanation}
              onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })}
              rows={2}
              placeholder="Why this answer is correct..."
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowMcqModal(false);
                setEditingMcq(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMcq} disabled={savingMcq}>
              {savingMcq ? 'Saving…' : editingMcq ? 'Save changes' : 'Add MCQ'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Topic Metadata Dialog */}
      <Dialog
        open={showEditTopicModal}
        onClose={() => setShowEditTopicModal(false)}
        title="Edit Topic Settings"
      >
        <div className="space-y-4">
          <Input
            label="Topic Title"
            value={topicForm.title}
            onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Topic Description</span>
            <textarea
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none"
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

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Default View for Learners</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTopicForm({ ...topicForm, defaultFlow: 'flat' })}
                className={`cursor-pointer rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors ${
                  topicForm.defaultFlow === 'flat'
                    ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]'
                    : 'border-[var(--line)] bg-[var(--surface-card)]'
                }`}
              >
                <span className="block font-semibold text-[var(--ink-900)]">Flat</span>
                <span className="block text-xs text-[var(--text-muted)]">All content on one scrollable page</span>
              </button>
              <button
                type="button"
                onClick={() => setTopicForm({ ...topicForm, defaultFlow: 'guided' })}
                className={`cursor-pointer rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors ${
                  topicForm.defaultFlow === 'guided'
                    ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]'
                    : 'border-[var(--line)] bg-[var(--surface-card)]'
                }`}
              >
                <span className="block font-semibold text-[var(--ink-900)]">Guided</span>
                <span className="block text-xs text-[var(--text-muted)]">Step-by-step lesson flow</span>
              </button>
            </div>
          </div>

          <Checkbox
            checked={topicForm.isPublished}
            onChange={(v) => setTopicForm({ ...topicForm, isPublished: v })}
            label="Publish Topic (Visible to learners)"
          />

          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => setShowEditTopicModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTopicMeta}>Save changes</Button>
          </div>
        </div>
      </Dialog>

      {/* Bulk Imports */}
      <BulkImportModal
        isOpen={showFlashcardBulk}
        onClose={() => setShowFlashcardBulk(false)}
        topicId={topicId}
        type="flashcards"
        onImported={async () => {
          const res = await flashcardApi.byTopic(topicId);
          setFlashcards(res.data.data || []);
        }}
      />
      <BulkImportModal
        isOpen={showMcqBulk}
        onClose={() => setShowMcqBulk(false)}
        topicId={topicId}
        type="mcqs"
        onImported={async () => {
          const res = await mcqApi.byTopic(topicId);
          setMcqs(res.data.data || []);
        }}
      />

      {/* Confirm Deletions */}
      <ConfirmDialog
        isOpen={!!deletingFlashcard}
        onClose={() => setDeletingFlashcard(null)}
        onConfirm={handleDeleteFlashcard}
        title="Delete flashcard"
        message="This flashcard will be permanently removed."
        confirmLabel="Delete"
      />
      <ConfirmDialog
        isOpen={!!deletingMcq}
        onClose={() => setDeletingMcq(null)}
        onConfirm={handleDeleteMcq}
        title="Delete MCQ"
        message="This MCQ will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

export default function AdminTopicDetailPage() {
  return (
    <AdminGuard>
      <AdminTopicDetailContent />
    </AdminGuard>
  );
}
