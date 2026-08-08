'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle2, XCircle } from 'lucide-react';
import { TopicExercise } from '@/lib/types';

export default function ExerciseRunner({ exercise }: { exercise: TopicExercise }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<{ stdout: string; stderr: string; ok: boolean } | null>(null);
  const [running, setRunning] = useState(false);

  const isPython = (exercise.language || 'python') === 'python';

  useEffect(() => {
    if (!isPython) return;

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'ready') {
        setReady(true);
        iframeRef.current?.contentWindow?.postMessage({ type: 'init', code: exercise.starterCode }, '*');
      } else if (data.type === 'result') {
        setRunning(false);
        setResult({ stdout: data.stdout || '', stderr: data.stderr || '', ok: data.ok });
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isPython, exercise.starterCode]);

  const handleRun = () => {
    if (!ready) return;
    setRunning(true);
    setResult(null);
    iframeRef.current?.contentWindow?.postMessage({ type: 'run' }, '*');
  };

  const expectedOutput = (exercise.expectedOutput || '').trim();
  const passed = result && expectedOutput ? result.stdout.trim().includes(expectedOutput) : null;

  if (!isPython) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">{exercise.instructions}</p>
        <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--line)]">
          <SyntaxHighlighter language={exercise.language || 'text'} style={oneLight} customStyle={{ margin: 0, fontSize: '13px' }}>
            {exercise.starterCode}
          </SyntaxHighlighter>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Running code in-app is currently only supported for Python.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-muted)]">{exercise.instructions}</p>
      <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--line)] h-72">
        <iframe
          ref={iframeRef}
          src="/playground/exercise.html"
          title="Exercise runner"
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRun}
          disabled={!ready || running}
          className="px-4 py-2 bg-[var(--brand-gold)] hover:bg-[var(--brand-gold-600)] disabled:opacity-50 text-[var(--ink-900)] font-semibold text-sm rounded-[var(--radius-sm)] transition-colors cursor-pointer"
        >
          {running ? 'Running…' : 'Run'}
        </button>
        {passed === true && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--success)]">
            <CheckCircle2 className="w-4 h-4" /> Output matches
          </span>
        )}
        {passed === false && (
          <span className="flex items-center gap-1.5 text-sm text-[var(--danger)]">
            <XCircle className="w-4 h-4" /> Not quite — try again
          </span>
        )}
      </div>
    </div>
  );
}
