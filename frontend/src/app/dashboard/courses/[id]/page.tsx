'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  Share2,
  Users,
  Zap,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { courseApi, chapterApi, progressApi, paymentApi } from '@/lib/api';
import { Course, Chapter, Topic, PaymentStatus } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);

  // Accordion toggle states
  const [accordionState, setAccordionState] = useState({
    learn: false,
    prerequisites: false,
    description: false,
  });

  // Collapsed chapter dropdown states
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const [expandedAuthors, setExpandedAuthors] = useState(false);

  useEffect(() => {
    let active = true;
    if (!id) return;

    (async () => {
      try {
        const [courseRes, chaptersRes, paymentRes] = await Promise.all([
          courseApi.get(id),
          chapterApi.byCourse(id),
          paymentApi.me().catch(() => ({ data: { data: null } })),
        ]);

        if (!active) return;
        setCourse(courseRes.data.data);
        const fetchedChapters: Chapter[] = chaptersRes.data.data || [];
        setChapters(fetchedChapters);
        setPaymentStatus(paymentRes.data.data);

        // Default expand chapter 1
        if (fetchedChapters.length > 0) {
          setOpenChapters((prev) => ({ ...prev, [fetchedChapters[0]._id]: true }));
        }
      } catch (e) {
        console.error('Failed to load course details:', e);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, chaptersRes, paymentRes] = await Promise.all([
        courseApi.get(id),
        chapterApi.byCourse(id),
        paymentApi.me().catch(() => ({ data: { data: null } })),
      ]);

      setCourse(courseRes.data.data);
      const fetchedChapters: Chapter[] = chaptersRes.data.data || [];
      setChapters(fetchedChapters);
      setPaymentStatus(paymentRes.data.data);
    } catch (e) {
      console.error('Failed to reload course details:', e);
    }
  };

  const hasAccess =
    !course ||
    course.isFree ||
    paymentStatus?.subscription?.status === 'active' ||
    !!paymentStatus?.purchasedCourseIds?.includes(course._id);

  const toggleAccordion = (key: keyof typeof accordionState) => {
    setAccordionState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleChapterDropdown = (chapterId: string) => {
    setOpenChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const handleOpenTopic = (chapter: Chapter, topic: Topic) => {
    if (!hasAccess || !topic.isUnlocked) return;

    // Save position asynchronously
    progressApi.savePosition({
      courseId: id,
      chapterId: chapter._id,
      topicId: topic._id,
      contentIndex: 0,
    }).catch(() => {});

    // Navigate directly to dedicated lesson page
    router.push(`/dashboard/courses/${id}/topics/${topic._id}/learn`);
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
        <Link href="/dashboard/courses" className="mt-2 inline-block font-semibold text-[var(--brand-gold-600)] hover:underline">
          Back to courses
        </Link>
      </div>
    );
  }

  const authors = course.authors || [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Toast feedback for copied link */}
      {copiedToast && (
        <div className="animate-in fade-in fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl duration-200">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>Course link copied to clipboard!</span>
        </div>
      )}

      {/* Back button */}
      <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--ink-900)]">
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      {/* Hero Section */}
      <div className="relative space-y-6 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-card)] p-6 shadow-xs md:p-8">
        {/* Banner image if available */}
        {course.banner && (
          <div className="mb-4 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={course.banner} alt={course.title} className="size-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge tone="neutral">{course.category}</Badge>
            <Badge tone="gold">{course.difficulty}</Badge>
            {!course.isFree && <Badge tone={hasAccess ? 'success' : 'dark'}>{hasAccess ? 'Unlocked' : 'Premium'}</Badge>}
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] px-4 py-2 text-xs font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--line)]"
          >
            <Share2 className="size-4 text-[var(--brand-gold-600)]" />
            <span>Share Course</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-[var(--font-display)] font-extrabold text-[var(--ink-900)] md:text-3xl">
          {course.title}
        </h1>

        {/* Author(s) Profile */}
        {authors.length > 0 && (
          <div className="flex items-center gap-3 border-t border-[var(--line)] pt-4">
            <div className="flex shrink-0 -space-x-2 overflow-hidden">
              {authors.slice(0, expandedAuthors ? authors.length : 3).map((author, aIdx) => (
                <div
                  key={aIdx}
                  className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[var(--brand-gold-100)] text-sm font-bold text-[var(--brand-gold-600)]"
                  title={author.name}
                >
                  {author.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={author.avatar} alt={author.name} className="size-full object-cover" />
                  ) : (
                    author.name.charAt(0).toUpperCase()
                  )}
                </div>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">Author(s)</p>
              <p className="truncate text-sm font-bold text-[var(--ink-900)]">
                {expandedAuthors ? (
                  authors.map((a) => a.name).join(', ')
                ) : (
                  <>
                    {authors[0].name}
                    {authors.length > 1 && (
                      <button
                        onClick={() => setExpandedAuthors(!expandedAuthors)}
                        className="ml-2 text-xs font-semibold text-[var(--brand-gold-600)] hover:underline"
                      >
                        +{authors.length - 1} more
                      </button>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Hero Metadata Stats Row */}
        <div className="grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-4 text-center">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] p-3">
            <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <BookOpen className="size-4 text-[var(--brand-gold-600)]" />
              <span>Lessons</span>
            </div>
            <p className="text-lg font-extrabold text-[var(--ink-900)]">{course.lessonCount || 0}</p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] p-3">
            <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <Users className="size-4 text-[var(--brand-gold-600)]" />
              <span>Registered</span>
            </div>
            <p className="text-lg font-extrabold text-[var(--ink-900)]">{course.registeredUsersCount || 0}</p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] p-3">
            <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <Zap className="size-4 fill-amber-500 text-amber-500" />
              <span>Total XP</span>
            </div>
            <p className="text-lg font-extrabold text-amber-600">+{course.totalObtainableXp || 0}</p>
          </div>
        </div>
      </div>

      {/* 3 Collapsed Dropdowns (Accordion) */}
      <div className="space-y-3">
        {/* What You'll Learn Accordion */}
        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] shadow-xs">
            <button
              onClick={() => toggleAccordion('learn')}
              className="flex w-full items-center justify-between px-6 py-4 text-left text-base font-bold text-[var(--ink-900)] transition-colors hover:bg-[var(--surface-sunken)]"
            >
              <span>What you&apos;ll learn</span>
              {accordionState.learn ? <ChevronUp className="size-5 text-[var(--text-muted)]" /> : <ChevronDown className="size-5 text-[var(--text-muted)]" />}
            </button>
            {accordionState.learn && (
              <div className="grid grid-cols-1 gap-3 border-t border-[var(--line)] bg-[var(--surface-card)] px-6 pt-2 pb-6 md:grid-cols-2">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gold-100)] text-xs font-bold text-[var(--brand-gold-600)]">
                      ✓
                    </div>
                    <p className="text-sm text-[var(--ink-800)]">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prerequisites Accordion */}
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] shadow-xs">
          <button
            onClick={() => toggleAccordion('prerequisites')}
            className="flex w-full items-center justify-between px-6 py-4 text-left text-base font-bold text-[var(--ink-900)] transition-colors hover:bg-[var(--surface-sunken)]"
          >
            <span>Prerequisites</span>
            {accordionState.prerequisites ? <ChevronUp className="size-5 text-[var(--text-muted)]" /> : <ChevronDown className="size-5 text-[var(--text-muted)]" />}
          </button>
          {accordionState.prerequisites && (
            <div className="space-y-2 border-t border-[var(--line)] bg-[var(--surface-card)] px-6 pt-2 pb-6">
              {course.prerequisites && course.prerequisites.length > 0 ? (
                course.prerequisites.map((prereq, idx) => (
                  <p key={idx} className="flex items-center gap-2 text-sm text-[var(--ink-800)]">
                    <span className="size-1.5 rounded-full bg-[var(--brand-gold)]" />
                    <span>{prereq}</span>
                  </p>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No prior prerequisites required. Perfect for beginners!</p>
              )}
            </div>
          )}
        </div>

        {/* Description Accordion */}
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] shadow-xs">
          <button
            onClick={() => toggleAccordion('description')}
            className="flex w-full items-center justify-between px-6 py-4 text-left text-base font-bold text-[var(--ink-900)] transition-colors hover:bg-[var(--surface-sunken)]"
          >
            <span>Description</span>
            {accordionState.description ? <ChevronUp className="size-5 text-[var(--text-muted)]" /> : <ChevronDown className="size-5 text-[var(--text-muted)]" />}
          </button>
          {accordionState.description && (
            <div className="border-t border-[var(--line)] bg-[var(--surface-card)] px-6 pt-2 pb-6">
              <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--ink-800)]">
                {course.longDescription || course.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chapters & Topics List */}
      <div className="space-y-4">
        <h2 className="text-xl font-[var(--font-display)] font-bold text-[var(--ink-900)]">
          Course Structure
        </h2>

        {chapters.length === 0 ? (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-8 text-center">
            <BookOpen className="mx-auto mb-2 size-10 text-[var(--ink-300)]" />
            <p className="text-sm text-[var(--text-muted)]">No chapters published yet for this course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter, cIdx) => {
              const isOpen = !!openChapters[chapter._id];
              const isLocked = chapter.status === 'locked';
              const isCompleted = chapter.status === 'completed';
              const isInProgress = chapter.status === 'inprogress';

              return (
                <div
                  key={chapter._id}
                  className={`overflow-hidden rounded-2xl border bg-[var(--surface-card)] shadow-xs transition-all ${
                    isLocked ? 'border-[var(--line)] opacity-70' : 'border-[var(--line)] hover:border-[var(--brand-gold-300)]'
                  }`}
                >
                  {/* Chapter Header Card */}
                  <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold tracking-wider text-[var(--brand-gold-600)] uppercase">
                          Chapter {cIdx + 1}
                        </span>
                        <Badge tone={isCompleted ? 'success' : isLocked ? 'dark' : 'gold'}>
                          {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'In Progress'}
                        </Badge>
                      </div>

                      <h3 className="truncate text-lg font-bold text-[var(--ink-900)]">
                        {chapter.title}
                      </h3>

                      {chapter.description && (
                        <p className="line-clamp-1 text-xs text-[var(--text-muted)]">
                          {chapter.description}
                        </p>
                      )}

                      {/* Progress Bar for In-Progress chapter */}
                      {isInProgress && (
                        <div className="max-w-md pt-2">
                          <ProgressBar value={chapter.progressPercent || 0} label={`${chapter.progressPercent || 0}% Completed`} />
                        </div>
                      )}
                    </div>

                    {/* Action Button & Toggle Dropdown */}
                    <div className="flex shrink-0 items-center gap-3">
                      {isLocked ? (
                        <button disabled className="flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400">
                          <Lock className="size-3.5" />
                          <span>Locked</span>
                        </button>
                      ) : isCompleted ? (
                        <button
                          onClick={() => {
                            if (chapter.topics && chapter.topics.length > 0) {
                              handleOpenTopic(chapter, chapter.topics[0]);
                            }
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-sunken)] px-4 py-2 text-xs font-semibold text-[var(--ink-900)] transition-colors hover:bg-[var(--line)]"
                        >
                          <Play className="size-3.5 text-[var(--brand-gold-600)]" />
                          <span>Retake Chapter</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const firstUnlocked = (chapter.topics || []).find((t) => t.isUnlocked);
                            if (firstUnlocked) {
                              handleOpenTopic(chapter, firstUnlocked);
                            }
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-gold)] px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all hover:brightness-105"
                        >
                          <Play className="size-3.5 fill-black" />
                          <span>Continue Chapter</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleChapterDropdown(chapter._id)}
                        className="rounded-xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]"
                      >
                        {isOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Topics List Collapsed Dropdown */}
                  {isOpen && chapter.topics && chapter.topics.length > 0 && (
                    <div className="space-y-2 border-t border-[var(--line)] bg-[var(--surface-sunken)]/40 p-4">
                      {chapter.topics.map((topic, tIdx) => {
                        const tUnlocked = !!topic.isUnlocked;
                        const tCompleted = !!topic.isCompleted;

                        return (
                          <div
                            key={topic._id}
                            onClick={() => tUnlocked && handleOpenTopic(chapter, topic)}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                              !tUnlocked
                                ? 'cursor-not-allowed border-[var(--line)] bg-[var(--surface-card)]/50 opacity-60'
                                : 'cursor-pointer border-[var(--line)] bg-[var(--surface-card)] shadow-xs hover:border-[var(--brand-gold-400)]'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                  tCompleted
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : tUnlocked
                                    ? 'bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)]'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {tCompleted ? '✓' : tIdx + 1}
                              </span>

                              <div className="min-w-0">
                                <h4 className="truncate text-sm font-semibold text-[var(--ink-900)]">
                                  {topic.title}
                                </h4>
                                {topic.description && (
                                  <p className="truncate text-xs text-[var(--text-muted)]">
                                    {topic.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              {/* XP Badge */}
                              <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                                <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                                +{topic.xp || 50} XP
                              </span>

                              {!tUnlocked ? (
                                <Lock className="size-4 text-slate-400" />
                              ) : tCompleted ? (
                                <CheckCircle2 className="size-4 text-emerald-500" />
                              ) : (
                                <span className="text-xs font-bold text-[var(--brand-gold-600)]">Start →</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
