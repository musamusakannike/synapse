'use client';

import React, { useState } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { Loader2, Sparkles } from 'lucide-react';

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
  const { loading, done, run, reset } = useFakeGenerate();

  return (
    <Dialog
      open={open}
      onClose={() => { onClose(); reset(); setTopic(''); }}
      title="Quiz generator"
      tone="ai"
      maxWidth="560px"
      footer={
        <Button variant="ai" onClick={run} disabled={loading || !topic.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : 'Generate'}
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-white/80">Tell us the topic — get a short multiple-choice quiz to test yourself.</p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. JavaScript closures"
          className="w-full rounded-[var(--radius-md)] bg-white/10 border border-white/20 px-3.5 py-2.5 text-sm text-white placeholder-white/50 outline-none"
        />
        {done && (
          <div className="rounded-[var(--radius-md)] bg-white/10 border border-white/20 p-4 text-sm leading-relaxed space-y-2">
            <p className="font-semibold">1. What does a closure capture?</p>
            <p className="text-white/80">A. Only global variables&nbsp;&nbsp; B. Its surrounding lexical scope&nbsp;&nbsp; C. Nothing</p>
            <p className="text-[var(--brand-gold-100)]">Correct answer: B</p>
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
