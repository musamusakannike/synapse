'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, RotateCcw, ChevronDown } from 'lucide-react';
import { mcqApi, topicApi } from '@/lib/api';
import { MCQ, Topic } from '@/lib/types';
import { useProgressStore } from '@/store/progress.store';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Phase = 'setup' | 'quiz' | 'results';

export default function McqPage() {
  const params = useParams();
  const courseId = params.id as string;
  const topicId = params.topicId as string;
  const { submitMcqSession } = useProgressStore();

  const [allMcqs, setAllMcqs] = useState<MCQ[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [activeMcqs, setActiveMcqs] = useState<MCQ[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<{ mcqId: string; correct: boolean; selected: number }[]>([]);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const [mcqRes, topicRes] = await Promise.all([mcqApi.byTopic(topicId), topicApi.get(topicId)]);
        setAllMcqs(mcqRes.data.data || []);
        setTopic(topicRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [topicId]);

  const startQuiz = (count: number) => {
    const shuffled = [...allMcqs].sort(() => Math.random() - 0.5);
    setActiveMcqs(count === 0 ? shuffled : shuffled.slice(0, Math.min(count, shuffled.length)));
    setPhase('quiz'); setCurrentQ(0); setSelectedOption(null); setShowFeedback(false); setAnswers([]);
    startTimeRef.current = Date.now();
  };

  const handleSelectOption = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    const correct = activeMcqs[currentQ].options[idx].isCorrect;
    setAnswers([...answers, { mcqId: activeMcqs[currentQ]._id, correct, selected: idx }]);
  };

  const handleNext = () => {
    if (currentQ < activeMcqs.length - 1) {
      setCurrentQ(currentQ + 1); setSelectedOption(null); setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correctCount = answers.filter((a) => a.correct).length;
    const score = Math.round((correctCount / activeMcqs.length) * 100);
    await submitMcqSession({ course: courseId, topic: topicId, mcqAnswered: activeMcqs.length, mcqCorrect: correctCount, score, duration });
    setPhase('results');
  };

  const retry = () => { setPhase('setup'); setCurrentQ(0); setSelectedOption(null); setShowFeedback(false); setAnswers([]); };

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  if (allMcqs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)] mb-4">No MCQs available for this topic yet.</p>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`} className="text-[var(--brand-gold-600)] hover:opacity-80">Back to topic</Link>
      </div>
    );
  }

  if (phase === 'setup') {
    const countOptions = [5, 10, 15, 20];
    return (
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to topic
        </Link>
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-2">Ready to test your knowledge?</h1>
          <p className="text-[var(--text-muted)] mb-1">Select the number of questions</p>
          <p className="text-sm text-[var(--ink-300)] mb-6">{allMcqs.length} questions available</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {countOptions.map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                disabled={count > allMcqs.length}
                className={`py-4 rounded-[var(--radius-md)] border text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                  questionCount === count ? 'bg-[var(--brand-gold)] border-[var(--brand-gold)] text-[var(--ink-900)]' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--line-strong)]'
                }`}
              >
                {count}
              </button>
            ))}
            <button
              onClick={() => setQuestionCount(0)}
              className={`py-4 rounded-[var(--radius-md)] border text-sm font-semibold cursor-pointer ${
                questionCount === 0 ? 'bg-[var(--brand-gold)] border-[var(--brand-gold)] text-[var(--ink-900)]' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--line-strong)]'
              }`}
            >
              All
            </button>
          </div>
          <Button onClick={() => startQuiz(questionCount)} fullWidth>Start quiz</Button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const mcq = activeMcqs[currentQ];
    const progress = ((currentQ + 1) / activeMcqs.length) * 100;
    return (
      <div className="max-w-2xl mx-auto">
        {topic && <p className="text-xs text-[var(--brand-gold-600)] font-semibold uppercase tracking-wide mb-4">{topic.title}</p>}
        <div className="mb-4">
          <ProgressBar value={progress} label={`Question ${currentQ + 1} of ${activeMcqs.length}`} />
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-6 mb-4">
          <p className="text-lg font-medium text-[var(--ink-900)] mb-6">{mcq.question}</p>
          <div className="space-y-2">
            {mcq.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = option.isCorrect;
              let cls = 'border-[var(--line)] text-[var(--ink-900)] hover:border-[var(--line-strong)]';
              if (showFeedback) {
                if (isCorrect) cls = 'border-[var(--success)] bg-[var(--success-100)] text-[var(--success)]';
                else if (isSelected && !isCorrect) cls = 'border-[var(--danger)] bg-[var(--danger-100)] text-[var(--danger)]';
                else cls = 'border-[var(--line)] text-[var(--text-muted)]';
              } else if (isSelected) {
                cls = 'border-[var(--brand-gold)] bg-[var(--brand-gold-100)] text-[var(--ink-900)]';
              }
              return (
                <button key={idx} onClick={() => handleSelectOption(idx)} disabled={showFeedback} className={`w-full text-left p-4 rounded-[var(--radius-md)] border transition-all ${cls} ${!showFeedback ? 'cursor-pointer' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.text}</span>
                    {showFeedback && isCorrect && <Check className="w-4 h-4 text-[var(--success)]" />}
                    {showFeedback && isSelected && !isCorrect && <X className="w-4 h-4 text-[var(--danger)]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4 mb-4">
            <p className="text-xs text-[var(--text-muted)] mb-1">Explanation</p>
            <p className="text-sm text-[var(--ink-900)]">{mcq.explanation || 'No explanation provided.'}</p>
          </div>
        )}

        {showFeedback && (
          <Button onClick={handleNext} fullWidth>{currentQ < activeMcqs.length - 1 ? 'Next question' : 'Finish quiz'}</Button>
        )}
      </div>
    );
  }

  const correctCount = answers.filter((a) => a.correct).length;
  const score = Math.round((correctCount / activeMcqs.length) * 100);
  const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
  const tone = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-6">Quiz results</h1>
        <div className="relative w-44 h-44 mx-auto mb-6 flex items-center justify-center rounded-full" style={{ background: `conic-gradient(${tone} ${score}%, var(--surface-sunken) 0)` }}>
          <div className="absolute inset-3 rounded-full bg-[var(--surface-card)] flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: tone }}>{score}%</span>
            <span className="text-xs text-[var(--ink-300)] mt-1">Score</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4">
            <p className="text-xl font-bold text-[var(--ink-900)]">{correctCount}/{activeMcqs.length}</p>
            <p className="text-xs text-[var(--ink-300)] mt-1">Correct</p>
          </div>
          <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4">
            <p className="text-xl font-bold text-[var(--ink-900)]">{Math.floor(duration / 60)}m {duration % 60}s</p>
            <p className="text-xs text-[var(--ink-300)] mt-1">Time</p>
          </div>
          <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4">
            <p className="text-xl font-bold text-[var(--ink-900)]">{score}%</p>
            <p className="text-xs text-[var(--ink-300)] mt-1">Accuracy</p>
          </div>
        </div>
        <p className="text-sm mb-6" style={{ color: tone }}>
          {score >= 80 ? "Excellent work — you're mastering this topic." : score >= 50 ? 'Good effort. Keep practicing to improve.' : "Don't give up — review the material and try again."}
        </p>
        <div className="flex gap-3 justify-center mb-6">
          <Button variant="secondary" onClick={retry}><RotateCcw className="w-4 h-4" /> Retry</Button>
          <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`}><Button>Back to topic</Button></Link>
        </div>
        <div className="text-left">
          <h2 className="text-sm font-semibold text-[var(--ink-900)] mb-3">Review answers</h2>
          <div className="space-y-2">
            {activeMcqs.map((mcq, i) => {
              const answer = answers[i];
              const isExpanded = expandedReview === i;
              return (
                <div key={mcq._id} className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] overflow-hidden">
                  <button onClick={() => setExpandedReview(isExpanded ? null : i)} className="w-full flex items-center justify-between p-3 text-left cursor-pointer">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${answer?.correct ? 'bg-[var(--success-100)]' : 'bg-[var(--danger-100)]'}`}>
                        {answer?.correct ? <Check className="w-3 h-3 text-[var(--success)]" /> : <X className="w-3 h-3 text-[var(--danger)]" />}
                      </span>
                      <span className="text-sm text-[var(--ink-900)] truncate">{mcq.question}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[var(--ink-300)] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pl-10 space-y-1">
                      {mcq.options.map((opt, idx) => (
                        <div key={idx} className={`text-xs px-2 py-1.5 rounded ${opt.isCorrect ? 'text-[var(--success)] bg-[var(--success-100)]' : idx === answer?.selected ? 'text-[var(--danger)] bg-[var(--danger-100)]' : 'text-[var(--text-muted)]'}`}>
                          {opt.text} {opt.isCorrect && '(correct)'}
                        </div>
                      ))}
                      {mcq.explanation && <p className="text-xs text-[var(--text-muted)] pt-1">{mcq.explanation}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
