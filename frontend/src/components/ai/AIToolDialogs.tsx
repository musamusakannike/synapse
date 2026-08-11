'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { Loader2, Sparkles } from 'lucide-react';
import { aiApi } from '@/lib/api';

interface ToolDialogProps {
  open: boolean;
  onClose: () => void;
}

function useFakeGenerate(delay = 1400) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const run = () => {
    setDone(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, delay);
  };
  const reset = () => {
    setLoading(false);
    setDone(false);
  };
  return { loading, done, run, reset };
}

export function SummarizerDialog({ open, onClose }: ToolDialogProps) {
  const [text, setText] = useState('');
  const { loading, done, run, reset } = useFakeGenerate();

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); setText(''); }}
      title="Summarizer"
      tone="ai"
      maxWidth="560px"
      footer={
        <Button variant="ai" onClick={run} disabled={loading || !text.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Summarizing…' : 'Generate'}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-white/80">Paste a lecture note or block of text — get a short, plain summary.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste your notes here…"
          className="w-full rounded-[var(--radius-md)] bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-white/50 outline-none resize-none"
        />
        {done && (
          <div className="rounded-[var(--radius-md)] bg-white/10 border border-white/20 p-4 text-sm leading-relaxed">
            <span className="font-semibold block mb-1">Summary</span>
            The passage explains the core idea in three points: definition, why it matters, and one practical example.
            Key terms are bolded in your original notes; review those first before attempting the flashcards for this topic.
          </div>
        )}
      </div>
    </Dialog>
  );
}

export function QuizGeneratorDialog({ open, onClose }: ToolDialogProps) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await aiApi.generateQuiz(topic.trim(), 3, false);
      if (res.data?.success && res.data?.data) {
        setHistoryId(res.data.data.historyId);
        setGeneratedQuestions(res.data.data.result || []);
      } else {
        setError('Quiz generation failed.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error generating quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTopic('');
    setLoading(false);
    setHistoryId(null);
    setGeneratedQuestions([]);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        handleReset();
      }}
      title="Quiz Generator"
      tone="ai"
      maxWidth="560px"
      footer={
        <div className="flex items-center justify-between w-full">
          <Link
            href="/dashboard/ai/quiz"
            onClick={onClose}
            className="text-xs font-semibold text-white/80 hover:text-white underline"
          >
            Go to Quiz Hub & History
          </Link>
          <Button variant="ai" onClick={handleGenerate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-white/80">Tell us the topic — get a custom multiple-choice quiz to test yourself.</p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. JavaScript closures, Photosynthesis"
          className="w-full rounded-[var(--radius-md)] bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-white/50 outline-none"
          disabled={loading}
        />

        {error && <p className="text-xs text-red-300 font-medium">{error}</p>}

        {generatedQuestions.length > 0 && (
          <div className="rounded-[var(--radius-md)] bg-white/10 border border-white/20 p-4 text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Generated {generatedQuestions.length} Questions</span>
              {historyId && (
                <Link
                  href={`/dashboard/ai/quiz/${historyId}`}
                  onClick={onClose}
                  className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-colors"
                >
                  Take Full Interactive Quiz →
                </Link>
              )}
            </div>
            <div className="space-y-2 text-white/90 text-xs border-t border-white/10 pt-2">
              <p className="font-semibold">Sample Question 1:</p>
              <p>{generatedQuestions[0]?.question}</p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export function FlashcardsGeneratorDialog({ open, onClose }: ToolDialogProps) {
  const [topic, setTopic] = useState('');
  const { loading, done, run, reset } = useFakeGenerate();

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); setTopic(''); }}
      title="Flashcards generator"
      tone="ai"
      maxWidth="560px"
      footer={
        <Button variant="ai" onClick={run} disabled={loading || !topic.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Building…' : 'Generate'}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-white/80">Turn a topic into a starter set of flashcards.</p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Newton's laws of motion"
          className="w-full rounded-[var(--radius-md)] bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-white/50 outline-none"
        />
        {done && (
          <div className="space-y-2">
            <div className="rounded-[var(--radius-md)] bg-white/10 border border-white/20 p-3 text-sm">
              <span className="font-semibold block">Q: What is Newton&apos;s first law?</span>
              <span className="text-white/80">A: An object stays at rest or in motion unless acted on by a net force.</span>
            </div>
            <div className="rounded-[var(--radius-md)] bg-white/10 border border-white/20 p-3 text-sm">
              <span className="font-semibold block">Q: What is Newton&apos;s second law?</span>
              <span className="text-white/80">A: Force equals mass times acceleration (F = ma).</span>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export function QAAIDialog({ open, onClose }: ToolDialogProps) {
  const [question, setQuestion] = useState('');
  const { loading, done, run, reset } = useFakeGenerate();

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); setQuestion(''); }}
      title="Q&A AI"
      tone="ai"
      maxWidth="560px"
      footer={
        <Button variant="ai" onClick={run} disabled={loading || !question.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Thinking…' : 'Ask'}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-white/80">Ask a question about anything you're studying.</p>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What's the difference between let and var?"
          className="w-full rounded-[var(--radius-md)] bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-white/50 outline-none"
        />
        {done && (
          <div className="rounded-[var(--radius-md)] bg-white/10 border border-white/20 p-4 text-sm leading-relaxed">
            <span className="font-semibold block mb-1">Answer</span>
            <code className="text-white">let</code> and <code className="text-white">const</code> are block-scoped, while{' '}
            <code className="text-white">var</code> is function-scoped and gets hoisted with a default value of{' '}
            <code className="text-white">undefined</code>. Prefer <code className="text-white">let</code>/<code className="text-white">const</code> in modern code.
          </div>
        )}
      </div>
    </Dialog>
  );
}
