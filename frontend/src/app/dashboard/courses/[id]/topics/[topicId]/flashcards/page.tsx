'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, RotateCcw, Check, X } from 'lucide-react';
import { flashcardApi, topicApi } from '@/lib/api';
import { Flashcard, Topic } from '@/lib/types';
import { useProgressStore } from '@/store/progress.store';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function FlashcardsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const topicId = params.topicId as string;
  const { submitFlashcardSession } = useProgressStore();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [reviewCards, setReviewCards] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    (async () => {
      try {
        const [fcRes, topicRes] = await Promise.all([flashcardApi.byTopic(topicId), topicApi.get(topicId)]);
        setFlashcards(fcRes.data.data || []);
        setTopic(topicRes.data.data);
      } catch (e: any) {
        if (e.response?.status === 403) {
          window.location.href = `/dashboard/courses/${courseId}?paywall=true`;
        } else {
          console.error(e);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [topicId, courseId]);

  const handleComplete = async () => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    await submitFlashcardSession({ course: courseId, topic: topicId, flashcardsStudied: flashcards.length, duration });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#F2A900', '#5B4FE8', '#1F9D55'] });
    setIsComplete(true);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markKnown = () => { setKnownCards(new Set([...knownCards, flashcards[currentIndex]._id])); handleNext(); };
  const markReview = () => { setReviewCards(new Set([...reviewCards, flashcards[currentIndex]._id])); handleNext(); };
  const restart = () => {
    setCurrentIndex(0); setIsFlipped(false); setKnownCards(new Set()); setReviewCards(new Set()); setIsComplete(false);
    startTimeRef.current = Date.now();
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  if (flashcards.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-[var(--text-muted)]">No flashcards available for this topic yet.</p>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`} className="text-[var(--brand-gold-600)] hover:opacity-80">Back to topic</Link>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-[var(--ink-900)]">Flashcards complete</h2>
          <p className="mb-6 text-[var(--text-muted)]">Great job reviewing all the cards.</p>
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-4">
              <p className="text-2xl font-bold text-[var(--ink-900)]">{flashcards.length}</p>
              <p className="mt-1 text-xs text-[var(--ink-300)]">Reviewed</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--success-100)] p-4">
              <p className="text-2xl font-bold text-[var(--success)]">{knownCards.size}</p>
              <p className="mt-1 text-xs text-[var(--ink-300)]">Known</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--warning-100)] p-4">
              <p className="text-2xl font-bold text-[var(--warning)]">{reviewCards.size}</p>
              <p className="mt-1 text-xs text-[var(--ink-300)]">Needs review</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={restart}><RotateCcw className="size-4" /> Restart</Button>
            <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`}><Button>Back to topic</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`} className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]">
        <ArrowLeft className="size-4" /> Back to topic
      </Link>

      {topic && <p className="mb-1 text-xs font-semibold tracking-wide text-[var(--brand-gold-600)] uppercase">{topic.title}</p>}

      <div className="mb-4">
        <ProgressBar value={progress} label={`Card ${currentIndex + 1} of ${flashcards.length}`} />
      </div>

      <div className="relative mb-6 h-80 cursor-pointer" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-card)] p-8 shadow-[var(--shadow-sm)]" style={{ backfaceVisibility: 'hidden' }}>
            <p className="mb-4 text-xs text-[var(--ink-300)]">Question</p>
            <p className="text-center text-lg font-medium text-[var(--ink-900)]">{card.question}</p>
            <p className="mt-6 text-xs text-[var(--ink-300)]">Tap to flip</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[var(--brand-gold)] bg-[var(--brand-gold-100)] p-8 shadow-[var(--shadow-sm)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="mb-4 text-xs text-[var(--brand-gold-600)]">Answer</p>
            <p className="text-center text-lg font-medium text-[var(--ink-900)]">{card.answer}</p>
            <p className="mt-6 text-xs text-[var(--ink-300)]">Tap to flip back</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}><ArrowLeft className="size-4" /> Prev</Button>
        <div className="flex gap-2">
          <button onClick={markReview} className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--warning-100)] px-4 py-2.5 text-sm font-semibold text-[var(--warning)] hover:opacity-80">
            <X className="size-4" /> Review
          </button>
          <button onClick={markKnown} className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--success-100)] px-4 py-2.5 text-sm font-semibold text-[var(--success)] hover:opacity-80">
            <Check className="size-4" /> Known
          </button>
        </div>
        <Button variant="ghost" onClick={handleNext}>Next <ArrowRight className="size-4" /></Button>
      </div>
    </div>
  );
}
