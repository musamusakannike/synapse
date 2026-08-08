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
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const [fcRes, topicRes] = await Promise.all([flashcardApi.byTopic(topicId), topicApi.get(topicId)]);
        setFlashcards(fcRes.data.data || []);
        setTopic(topicRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [topicId]);

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
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)] mb-4">No flashcards available for this topic yet.</p>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`} className="text-[var(--brand-gold-600)] hover:opacity-80">Back to topic</Link>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--ink-900)] mb-2">Flashcards complete</h2>
          <p className="text-[var(--text-muted)] mb-6">Great job reviewing all the cards.</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4">
              <p className="text-2xl font-bold text-[var(--ink-900)]">{flashcards.length}</p>
              <p className="text-xs text-[var(--ink-300)] mt-1">Reviewed</p>
            </div>
            <div className="bg-[var(--success-100)] rounded-[var(--radius-md)] p-4">
              <p className="text-2xl font-bold text-[var(--success)]">{knownCards.size}</p>
              <p className="text-xs text-[var(--ink-300)] mt-1">Known</p>
            </div>
            <div className="bg-[var(--warning-100)] rounded-[var(--radius-md)] p-4">
              <p className="text-2xl font-bold text-[var(--warning)]">{reviewCards.size}</p>
              <p className="text-xs text-[var(--ink-300)] mt-1">Needs review</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={restart}><RotateCcw className="w-4 h-4" /> Restart</Button>
            <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`}><Button>Back to topic</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/courses/${courseId}/topics/${topicId}`} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to topic
      </Link>

      {topic && <p className="text-xs text-[var(--brand-gold-600)] font-semibold uppercase tracking-wide mb-1">{topic.title}</p>}

      <div className="mb-4">
        <ProgressBar value={progress} label={`Card ${currentIndex + 1} of ${flashcards.length}`} />
      </div>

      <div className="relative h-80 cursor-pointer mb-6" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div className="absolute inset-0 bg-[var(--surface-card)] border border-[var(--line)] rounded-[var(--radius-xl)] flex flex-col items-center justify-center p-8 shadow-[var(--shadow-sm)]" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-xs text-[var(--ink-300)] mb-4">Question</p>
            <p className="text-lg text-[var(--ink-900)] text-center font-medium">{card.question}</p>
            <p className="text-xs text-[var(--ink-300)] mt-6">Tap to flip</p>
          </div>
          <div className="absolute inset-0 bg-[var(--brand-gold-100)] border border-[var(--brand-gold)] rounded-[var(--radius-xl)] flex flex-col items-center justify-center p-8 shadow-[var(--shadow-sm)]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-xs text-[var(--brand-gold-600)] mb-4">Answer</p>
            <p className="text-lg text-[var(--ink-900)] text-center font-medium">{card.answer}</p>
            <p className="text-xs text-[var(--ink-300)] mt-6">Tap to flip back</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}><ArrowLeft className="w-4 h-4" /> Prev</Button>
        <div className="flex gap-2">
          <button onClick={markReview} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--warning-100)] text-[var(--warning)] hover:opacity-80 text-sm font-semibold cursor-pointer">
            <X className="w-4 h-4" /> Review
          </button>
          <button onClick={markKnown} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--success-100)] text-[var(--success)] hover:opacity-80 text-sm font-semibold cursor-pointer">
            <Check className="w-4 h-4" /> Known
          </button>
        </div>
        <Button variant="ghost" onClick={handleNext}>Next <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
