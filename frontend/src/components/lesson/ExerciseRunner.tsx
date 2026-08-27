import React, { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CheckCircle2, XCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { TopicExercise } from '@/lib/types';

function SolutionCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-[var(--surface-card)] px-2 py-0.5 text-xs font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--line)]"
    >
      {copied ? <Check className="size-3 text-[var(--success)]" /> : <Copy className="size-3" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export default function ExerciseRunner({ exercise }: { exercise: TopicExercise }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<{ stdout: string; stderr: string; ok: boolean } | null>(null);
  const [running, setRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

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
  const solutionCode = (exercise.solution || '').trim();
  const passed = result && expectedOutput ? result.stdout.trim().includes(expectedOutput) : null;

  if (!isPython) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-muted)]">{exercise.instructions}</p>
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)]">
          <SyntaxHighlighter language={exercise.language || 'text'} style={oneLight} customStyle={{ margin: 0, fontSize: '13px' }}>
            {exercise.starterCode}
          </SyntaxHighlighter>
        </div>
        <p className="text-xs text-[var(--text-muted)]">Running code in-app is currently only supported for Python.</p>
        {(solutionCode || expectedOutput) && (
          <div className="pt-2">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--brand-violet-600)] hover:opacity-80"
            >
              {showSolution ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showSolution ? 'Hide correct answer' : 'Show correct answer'}
            </button>
            {showSolution && (
              <div className="mt-2 space-y-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-sunken)] p-3">
                {expectedOutput && (
                  <div>
                    <span className="mb-1 block text-xs font-bold text-[var(--ink-500)] uppercase">Expected Output</span>
                    <pre className="rounded border border-[var(--line)] bg-[var(--surface-card)] p-2 font-mono text-xs whitespace-pre-wrap text-[var(--ink-900)]">{expectedOutput}</pre>
                  </div>
                )}
                {solutionCode && (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink-500)] uppercase">Reference Solution</span>
                      <SolutionCopyButton text={solutionCode} />
                    </div>
                    <SyntaxHighlighter language={exercise.language || 'text'} style={oneLight} customStyle={{ margin: 0, fontSize: '12px' }}>
                      {solutionCode}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-muted)]">{exercise.instructions}</p>

      {expectedOutput && (
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-sunken)] p-2.5 text-xs">
          <span className="mb-1 block font-bold tracking-wide text-[var(--ink-500)] uppercase">Target Output:</span>
          <code className="font-mono whitespace-pre-wrap text-[var(--ink-900)]">{expectedOutput}</code>
        </div>
      )}

      <div className="h-72 overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)]">
        <iframe
          ref={iframeRef}
          src="/playground/exercise.html"
          title="Exercise runner"
          className="size-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={!ready || running}
            className="cursor-pointer rounded-[var(--radius-sm)] bg-[var(--brand-gold)] px-4 py-2 text-sm font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--brand-gold-600)] disabled:opacity-50"
          >
            {running ? 'Running…' : 'Run'}
          </button>
          {passed === true && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--success)]">
              <CheckCircle2 className="size-4" /> Output matches!
            </span>
          )}
          {passed === false && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--danger)]">
              <XCircle className="size-4" /> Not quite — check output
            </span>
          )}
        </div>

        {(solutionCode || expectedOutput) && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--brand-gold-600)] hover:opacity-80"
          >
            {showSolution ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {showSolution ? 'Hide Answer' : 'Show Correct Answer'}
          </button>
        )}
      </div>

      {showSolution && (
        <div className="animate-fadeIn mt-3 space-y-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-sunken)] p-3">
          {expectedOutput && (
            <div>
              <span className="mb-1 block text-xs font-bold text-[var(--ink-500)] uppercase">Expected Output</span>
              <pre className="rounded border border-[var(--line)] bg-[var(--surface-card)] p-2 font-mono text-xs whitespace-pre-wrap text-[var(--ink-900)]">{expectedOutput}</pre>
            </div>
          )}
          {solutionCode && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--ink-500)] uppercase">Reference Solution</span>
                <SolutionCopyButton text={solutionCode} />
              </div>
              <div className="overflow-hidden rounded border border-[var(--line)]">
                <SyntaxHighlighter language={exercise.language || 'python'} style={oneLight} customStyle={{ margin: 0, fontSize: '12.5px' }}>
                  {solutionCode}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
