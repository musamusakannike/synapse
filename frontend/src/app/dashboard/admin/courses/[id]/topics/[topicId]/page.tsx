'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, HelpCircle, Plus, Pencil, Trash2, Save, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { topicApi, flashcardApi, mcqApi } from '@/lib/api';
import AdminGuard from '@/components/auth/AdminGuard';
import ContentBlockEditor from '@/components/admin/ContentBlockEditor';
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
import { Topic, Flashcard, MCQ, MCQOption, TopicContent } from '@/lib/types';

function AdminTopicDetailContent() {
  const params = useParams();
  const courseId = params.id as string;
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'flashcards' | 'mcqs'>('content');

  const [contents, setContents] = useState<TopicContent[]>([]);
  const [originalContents, setOriginalContents] = useState<TopicContent[]>([]);
  const [savingContent, setSavingContent] = useState(false);

  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [flashcardForm, setFlashcardForm] = useState({ question: '', answer: '' });
  const [savingFlashcard, setSavingFlashcard] = useState(false);
  const [deletingFlashcard, setDeletingFlashcard] = useState<Flashcard | null>(null);
  const [showFlashcardBulk, setShowFlashcardBulk] = useState(false);

  const [showMcqModal, setShowMcqModal] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQ | null>(null);
  const [mcqForm, setMcqForm] = useState({ question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] as MCQOption[], explanation: '' });
  const [savingMcq, setSavingMcq] = useState(false);
  const [deletingMcq, setDeletingMcq] = useState<MCQ | null>(null);
  const [showMcqBulk, setShowMcqBulk] = useState(false);

  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState<{ title: string; description: string; isPublished: boolean; defaultFlow: 'flat' | 'guided' }>({
    title: '',
    description: '',
    isPublished: false,
    defaultFlow: 'flat',
  });

  useEffect(() => {
    (async () => {
      try {
        const [topicRes, fcRes, mcqRes] = await Promise.all([topicApi.get(topicId), flashcardApi.byTopic(topicId), mcqApi.byTopic(topicId)]);
        setTopic(topicRes.data.data);
        setContents(topicRes.data.data.contents || []);
        setOriginalContents(topicRes.data.data.contents || []);
        setFlashcards(fcRes.data.data || []);
        setMcqs(mcqRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [topicId]);

  const hasContentChanges = JSON.stringify(contents) !== JSON.stringify(originalContents);

  const handleSaveContent = async () => {
    setSavingContent(true);
    try {
      await topicApi.update(topicId, { contents });
      setOriginalContents(contents);
      toast.success('Content saved');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save content');
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveFlashcard = async () => {
    if (!flashcardForm.question.trim() || !flashcardForm.answer.trim()) return toast.error('Question and answer are required');
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
      const payload = { question: mcqForm.question, options: validOptions, explanation: mcqForm.explanation, topic: topicId };
      if (editingMcq) {
        await mcqApi.update(editingMcq._id, payload);
        toast.success('MCQ updated');
      } else {
        await mcqApi.create(payload);
        toast.success('MCQ created');
      }
      setShowMcqModal(false);
      setEditingMcq(null);
      setMcqForm({ question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' });
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
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete MCQ');
    }
  };

  const addOption = () => { if (mcqForm.options.length < 6) setMcqForm({ ...mcqForm, options: [...mcqForm.options, { text: '', isCorrect: false }] }); };
  const removeOption = (index: number) => { if (mcqForm.options.length > 2) setMcqForm({ ...mcqForm, options: mcqForm.options.filter((_, i) => i !== index) }); };
  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setMcqForm({ ...mcqForm, options: mcqForm.options.map((o, i) => (i === index ? { ...o, [field]: value } : field === 'isCorrect' ? { ...o, isCorrect: false } : o)) });
  };

  const handleSaveTopicMeta = async () => {
    if (!topicForm.title.trim()) return toast.error('Title is required');
    try {
      await topicApi.update(topicId, topicForm);
      toast.success('Topic updated');
      setShowEditTopicModal(false);
      const res = await topicApi.get(topicId);
      setTopic(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update topic');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!topic) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-muted)]">Topic not found.</p>
        <Link href={`/dashboard/admin/courses/${courseId}`} className="mt-2 inline-block text-[var(--brand-gold-600)] hover:opacity-80">Back to course</Link>
      </div>
    );
  }

  const tabs = [
    { value: 'content', label: `Content (${contents.length})` },
    { value: 'flashcards', label: `Flashcards (${flashcards.length})` },
    { value: 'mcqs', label: `MCQs (${mcqs.length})` },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/dashboard/admin/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]">
        <ArrowLeft className="size-4" /> Back to course
      </Link>

      <div>
        <div className="mb-2 flex items-center gap-3">
          <Badge tone={topic.isPublished ? 'success' : 'warning'}>{topic.isPublished ? 'Published' : 'Draft'}</Badge>
          <Button variant="ghost" size="sm" onClick={() => { setTopicForm({ title: topic.title, description: topic.description || '', isPublished: topic.isPublished, defaultFlow: topic.defaultFlow || 'flat' }); setShowEditTopicModal(true); }}>
            <Pencil className="size-3.5" /> Edit
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)]">{topic.title}</h1>
        {topic.description && <p className="mt-2 text-[var(--text-muted)]">{topic.description}</p>}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={(v) => setActiveTab(v as 'content' | 'flashcards' | 'mcqs')} />

      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[var(--text-muted)]">Add and reorder content blocks for this topic.</p>
            <Button size="sm" onClick={handleSaveContent} disabled={!hasContentChanges || savingContent}>
              <Save className="size-4" /> {savingContent ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
          {hasContentChanges && <p className="text-xs text-[var(--warning)]">You have unsaved changes</p>}
          <ContentBlockEditor contents={contents} onChange={setContents} />
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowFlashcardBulk(true)}><Layers className="size-4" /> Bulk import</Button>
            <Button size="sm" onClick={() => { setEditingFlashcard(null); setFlashcardForm({ question: '', answer: '' }); setShowFlashcardModal(true); }}><Plus className="size-4" /> Add flashcard</Button>
          </div>
          {flashcards.length === 0 ? (
            <EmptyState icon={<CreditCard className="size-12" />} title="No flashcards" description="Add flashcards individually or bulk import via JSON." />
          ) : (
            <div className="space-y-2">
              {flashcards.map((fc) => (
                <Card key={fc._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-sm font-medium text-[var(--ink-900)]">{fc.question}</p>
                      <p className="text-sm text-[var(--text-muted)]">{fc.answer}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingFlashcard(fc); setFlashcardForm({ question: fc.question, answer: fc.answer }); setShowFlashcardModal(true); }}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingFlashcard(fc)}><Trash2 className="size-3.5 text-[var(--danger)]" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mcqs' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowMcqBulk(true)}><Layers className="size-4" /> Bulk import</Button>
            <Button size="sm" onClick={() => { setEditingMcq(null); setMcqForm({ question: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '' }); setShowMcqModal(true); }}><Plus className="size-4" /> Add MCQ</Button>
          </div>
          {mcqs.length === 0 ? (
            <EmptyState icon={<HelpCircle className="size-12" />} title="No MCQs" description="Add MCQs individually or bulk import via JSON." />
          ) : (
            <div className="space-y-2">
              {mcqs.map((mcq) => (
                <Card key={mcq._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-sm font-medium text-[var(--ink-900)]">{mcq.question}</p>
                      <div className="space-y-1">
                        {mcq.options.map((option, i) => (
                          <div key={i} className={`flex items-center gap-2 text-xs ${option.isCorrect ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                            <span className={`size-4 rounded-full border ${option.isCorrect ? 'border-[var(--success)] bg-[var(--success)]' : 'border-[var(--line)]'}`} />
                            {option.text}
                          </div>
                        ))}
                      </div>
                      {mcq.explanation && <p className="mt-2 text-xs text-[var(--ink-300)] italic">{mcq.explanation}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingMcq(mcq); setMcqForm({ question: mcq.question, options: mcq.options.map((o) => ({ ...o })), explanation: mcq.explanation || '' }); setShowMcqModal(true); }}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingMcq(mcq)}><Trash2 className="size-3.5 text-[var(--danger)]" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={showFlashcardModal} onClose={() => { setShowFlashcardModal(false); setEditingFlashcard(null); }} title={editingFlashcard ? 'Edit flashcard' : 'Add flashcard'}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Question</span>
            <textarea value={flashcardForm.question} onChange={(e) => setFlashcardForm({ ...flashcardForm, question: e.target.value })} rows={3} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Answer</span>
            <textarea value={flashcardForm.answer} onChange={(e) => setFlashcardForm({ ...flashcardForm, answer: e.target.value })} rows={3} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none" />
          </div>
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => { setShowFlashcardModal(false); setEditingFlashcard(null); }}>Cancel</Button>
            <Button onClick={handleSaveFlashcard} disabled={savingFlashcard}>{savingFlashcard ? 'Saving…' : editingFlashcard ? 'Save changes' : 'Add flashcard'}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={showMcqModal} onClose={() => { setShowMcqModal(false); setEditingMcq(null); }} title={editingMcq ? 'Edit MCQ' : 'Add MCQ'} maxWidth="560px">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Question</span>
            <textarea value={mcqForm.question} onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })} rows={3} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none" />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--ink-900)]">Options</span>
              {mcqForm.options.length < 6 && <button onClick={addOption} className="cursor-pointer text-xs text-[var(--brand-gold-600)] hover:opacity-80">+ Add option</button>}
            </div>
            <div className="space-y-2">
              {mcqForm.options.map((option, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => updateOption(i, 'isCorrect', true)} className={`size-5 shrink-0 cursor-pointer rounded-full border-2 ${option.isCorrect ? 'border-[var(--success)] bg-[var(--success)]' : 'border-[var(--line)]'}`} />
                  <input value={option.text} onChange={(e) => updateOption(i, 'text', e.target.value)} placeholder={`Option ${i + 1}`} className="flex-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--ink-900)] outline-none" />
                  {mcqForm.options.length > 2 && <button onClick={() => removeOption(i)} className="shrink-0 cursor-pointer text-[var(--ink-300)] hover:text-[var(--danger)]">✕</button>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Explanation (optional)</span>
            <textarea value={mcqForm.explanation} onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })} rows={2} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none" />
          </div>
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => { setShowMcqModal(false); setEditingMcq(null); }}>Cancel</Button>
            <Button onClick={handleSaveMcq} disabled={savingMcq}>{savingMcq ? 'Saving…' : editingMcq ? 'Save changes' : 'Add MCQ'}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={showEditTopicModal} onClose={() => setShowEditTopicModal(false)} title="Edit topic">
        <div className="space-y-4">
          <Input label="Title" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Description</span>
            <textarea value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={3} className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-page)] px-3.5 py-2.5 text-sm text-[var(--ink-900)] outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-[var(--ink-900)]">Default view for learners</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTopicForm({ ...topicForm, defaultFlow: 'flat' })}
                className={`cursor-pointer rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors ${
                  topicForm.defaultFlow === 'flat' ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]' : 'border-[var(--line)] bg-[var(--surface-card)]'
                }`}
              >
                <span className="block font-semibold text-[var(--ink-900)]">Flat</span>
                <span className="block text-xs text-[var(--text-muted)]">All content on one scrollable page</span>
              </button>
              <button
                type="button"
                onClick={() => setTopicForm({ ...topicForm, defaultFlow: 'guided' })}
                className={`cursor-pointer rounded-[var(--radius-md)] border px-3.5 py-2.5 text-left text-sm transition-colors ${
                  topicForm.defaultFlow === 'guided' ? 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)]' : 'border-[var(--line)] bg-[var(--surface-card)]'
                }`}
              >
                <span className="block font-semibold text-[var(--ink-900)]">Guided</span>
                <span className="block text-xs text-[var(--text-muted)]">Step-by-step lesson flow</span>
              </button>
            </div>
          </div>
          <Checkbox checked={topicForm.isPublished} onChange={(v) => setTopicForm({ ...topicForm, isPublished: v })} label="Publish topic" />
          <div className="flex justify-end gap-3 border-t border-[var(--line)] pt-4">
            <Button variant="ghost" onClick={() => setShowEditTopicModal(false)}>Cancel</Button>
            <Button onClick={handleSaveTopicMeta}>Save changes</Button>
          </div>
        </div>
      </Dialog>

      <BulkImportModal isOpen={showFlashcardBulk} onClose={() => setShowFlashcardBulk(false)} topicId={topicId} type="flashcards" onImported={async () => { const res = await flashcardApi.byTopic(topicId); setFlashcards(res.data.data || []); }} />
      <BulkImportModal isOpen={showMcqBulk} onClose={() => setShowMcqBulk(false)} topicId={topicId} type="mcqs" onImported={async () => { const res = await mcqApi.byTopic(topicId); setMcqs(res.data.data || []); }} />

      <ConfirmDialog isOpen={!!deletingFlashcard} onClose={() => setDeletingFlashcard(null)} onConfirm={handleDeleteFlashcard} title="Delete flashcard" message="This flashcard will be permanently removed." confirmLabel="Delete" />
      <ConfirmDialog isOpen={!!deletingMcq} onClose={() => setDeletingMcq(null)} onConfirm={handleDeleteMcq} title="Delete MCQ" message="This MCQ will be permanently removed." confirmLabel="Delete" />
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
