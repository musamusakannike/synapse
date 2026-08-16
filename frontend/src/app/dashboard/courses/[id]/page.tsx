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
  Check,
  FileText,
  HelpCircle,
  Sparkles,
  Code,
  Video,
  Volume2,
  Youtube,
  Award,
  ArrowRight,
} from 'lucide-react';
import { courseApi, chapterApi, progressApi, paymentApi } from '@/lib/api';
import { Course, Chapter, Topic, PaymentStatus, Exercise } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import ExerciseModal from '@/components/courses/ExerciseModal';

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

  // Topic Reader Modal State
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeContentIndex, setActiveContentIndex] = useState<number>(0);
  const [readingModalOpen, setReadingModalOpen] = useState(false);

  // Exercise Modal State
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const [courseRes, chaptersRes, paymentRes] = await Promise.all([
        courseApi.get(id),
        chapterApi.byCourse(id),
        paymentApi.me().catch(() => ({ data: { data: null } })),
      ]);

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
      setIsLoading(false);
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
    setActiveTopic(topic);
    setActiveContentIndex(0);
    setReadingModalOpen(true);

    // Save position
    progressApi.savePosition({
      courseId: id,
      chapterId: chapter._id,
      topicId: topic._id,
      contentIndex: 0,
    });
  };

  const handleCompleteTopicNoExercise = async () => {
    if (!activeTopic || !course) return;
    try {
      await progressApi.completeTopic({
        courseId: course._id,
        topicId: activeTopic._id,
      });
      setReadingModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      console.error('Failed to complete topic:', err);
    }
  };

  const handleLaunchTopicExercise = () => {
    if (!activeTopic || !activeTopic.exercise) return;
    setActiveExercise(activeTopic.exercise);
    setReadingModalOpen(false);
    setExerciseModalOpen(true);
  };

  const handleExercisePassed = async () => {
    setExerciseModalOpen(false);
    await fetchCourseData();
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
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)]">Course not found.</p>
        <Link href="/dashboard/courses" className="text-[var(--brand-gold-600)] hover:underline mt-2 inline-block font-semibold">
          Back to courses
        </Link>
      </div>
    );
  }

  const authors = course.authors || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Toast feedback for copied link */}
      {copiedToast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2 border border-slate-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Course link copied to clipboard!</span>
        </div>
      )}

      {/* Back button */}
      <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      {/* Hero Section */}
      <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs relative overflow-hidden">
        {/* Banner image if available */}
        {course.banner && (
          <div className="w-full aspect-[21/9] bg-[var(--surface-sunken)] rounded-2xl overflow-hidden mb-4 border border-[var(--line)]">
            <img src={course.banner} alt={course.title} className="w-full h-full object-cover" />
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface-sunken)] hover:bg-[var(--line)] text-[var(--ink-900)] font-semibold text-xs rounded-xl border border-[var(--line)] transition-colors"
          >
            <Share2 className="w-4 h-4 text-[var(--brand-gold-600)]" />
            <span>Share Course</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink-900)] font-[var(--font-display)]">
          {course.title}
        </h1>

        {/* Author(s) Profile */}
        {authors.length > 0 && (
          <div className="flex items-center gap-3 pt-1 border-t border-[var(--line)] pt-4">
            <div className="flex -space-x-2 overflow-hidden shrink-0">
              {authors.slice(0, expandedAuthors ? authors.length : 3).map((author, aIdx) => (
                <div
                  key={aIdx}
                  className="w-10 h-10 rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] flex items-center justify-center font-bold text-sm border-2 border-white overflow-hidden shrink-0"
                  title={author.name}
                >
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    author.name.charAt(0).toUpperCase()
                  )}
                </div>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Author(s)</p>
              <p className="text-sm font-bold text-[var(--ink-900)] truncate">
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
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--line)] text-center">
          <div className="p-3 bg-[var(--surface-sunken)] rounded-2xl border border-[var(--line)]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1 font-semibold">
              <BookOpen className="w-4 h-4 text-[var(--brand-gold-600)]" />
              <span>Lessons</span>
            </div>
            <p className="text-lg font-extrabold text-[var(--ink-900)]">{course.lessonCount || 0}</p>
          </div>

          <div className="p-3 bg-[var(--surface-sunken)] rounded-2xl border border-[var(--line)]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1 font-semibold">
              <Users className="w-4 h-4 text-[var(--brand-gold-600)]" />
              <span>Registered</span>
            </div>
            <p className="text-lg font-extrabold text-[var(--ink-900)]">{course.registeredUsersCount || 0}</p>
          </div>

          <div className="p-3 bg-[var(--surface-sunken)] rounded-2xl border border-[var(--line)]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] mb-1 font-semibold">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
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
          <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleAccordion('learn')}
              className="w-full px-6 py-4 flex items-center justify-between font-bold text-base text-[var(--ink-900)] text-left hover:bg-[var(--surface-sunken)] transition-colors"
            >
              <span>What you'll learn</span>
              {accordionState.learn ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
            </button>
            {accordionState.learn && (
              <div className="px-6 pb-6 pt-2 border-t border-[var(--line)] bg-[var(--surface-card)] grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
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
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleAccordion('prerequisites')}
            className="w-full px-6 py-4 flex items-center justify-between font-bold text-base text-[var(--ink-900)] text-left hover:bg-[var(--surface-sunken)] transition-colors"
          >
            <span>Prerequisites</span>
            {accordionState.prerequisites ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
          </button>
          {accordionState.prerequisites && (
            <div className="px-6 pb-6 pt-2 border-t border-[var(--line)] bg-[var(--surface-card)] space-y-2">
              {course.prerequisites && course.prerequisites.length > 0 ? (
                course.prerequisites.map((prereq, idx) => (
                  <p key={idx} className="text-sm text-[var(--ink-800)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-gold)]" />
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
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
          <button
            onClick={() => toggleAccordion('description')}
            className="w-full px-6 py-4 flex items-center justify-between font-bold text-base text-[var(--ink-900)] text-left hover:bg-[var(--surface-sunken)] transition-colors"
          >
            <span>Description</span>
            {accordionState.description ? <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />}
          </button>
          {accordionState.description && (
            <div className="px-6 pb-6 pt-2 border-t border-[var(--line)] bg-[var(--surface-card)]">
              <p className="text-sm text-[var(--ink-800)] leading-relaxed whitespace-pre-line">
                {course.longDescription || course.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chapters & Topics List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--ink-900)] font-[var(--font-display)]">
          Course Structure
        </h2>

        {chapters.length === 0 ? (
          <div className="p-8 text-center bg-[var(--surface-card)] rounded-2xl border border-[var(--line)]">
            <BookOpen className="w-10 h-10 text-[var(--ink-300)] mx-auto mb-2" />
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
                  className={`bg-[var(--surface-card)] border rounded-2xl overflow-hidden transition-all shadow-xs ${
                    isLocked ? 'opacity-70 border-[var(--line)]' : 'border-[var(--line)] hover:border-[var(--brand-gold-300)]'
                  }`}
                >
                  {/* Chapter Header Card */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--brand-gold-600)] uppercase tracking-wider">
                          Chapter {cIdx + 1}
                        </span>
                        <Badge tone={isCompleted ? 'success' : isLocked ? 'dark' : 'gold'}>
                          {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'In Progress'}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-[var(--ink-900)] text-lg truncate">
                        {chapter.title}
                      </h3>

                      {chapter.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                          {chapter.description}
                        </p>
                      )}

                      {/* Progress Bar for In-Progress chapter */}
                      {isInProgress && (
                        <div className="pt-2 max-w-md">
                          <ProgressBar value={chapter.progressPercent || 0} label={`${chapter.progressPercent || 0}% Completed`} />
                        </div>
                      )}
                    </div>

                    {/* Action Button & Toggle Dropdown */}
                    <div className="flex items-center gap-3 shrink-0">
                      {isLocked ? (
                        <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </button>
                      ) : isCompleted ? (
                        <button
                          onClick={() => {
                            if (chapter.topics && chapter.topics.length > 0) {
                              handleOpenTopic(chapter, chapter.topics[0]);
                            }
                          }}
                          className="px-4 py-2 bg-[var(--surface-sunken)] hover:bg-[var(--line)] text-[var(--ink-900)] font-semibold text-xs rounded-xl border border-[var(--line)] transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 text-[var(--brand-gold-600)]" />
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
                          className="px-4 py-2 bg-[var(--brand-gold)] text-slate-950 font-bold text-xs rounded-xl hover:brightness-105 transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>Continue Chapter</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleChapterDropdown(chapter._id)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--ink-900)] rounded-xl hover:bg-[var(--surface-sunken)] transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Topics List Collapsed Dropdown */}
                  {isOpen && chapter.topics && chapter.topics.length > 0 && (
                    <div className="border-t border-[var(--line)] bg-[var(--surface-sunken)]/40 p-4 space-y-2">
                      {chapter.topics.map((topic, tIdx) => {
                        const tUnlocked = !!topic.isUnlocked;
                        const tCompleted = !!topic.isCompleted;

                        return (
                          <div
                            key={topic._id}
                            onClick={() => tUnlocked && handleOpenTopic(chapter, topic)}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                              !tUnlocked
                                ? 'bg-[var(--surface-card)]/50 border-[var(--line)] opacity-60 cursor-not-allowed'
                                : 'bg-[var(--surface-card)] border-[var(--line)] hover:border-[var(--brand-gold-400)] cursor-pointer shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
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
                                <h4 className="text-sm font-semibold text-[var(--ink-900)] truncate">
                                  {topic.title}
                                </h4>
                                {topic.description && (
                                  <p className="text-xs text-[var(--text-muted)] truncate">
                                    {topic.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {/* XP Badge */}
                              <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                +{topic.xp || 50} XP
                              </span>

                              {!tUnlocked ? (
                                <Lock className="w-4 h-4 text-slate-400" />
                              ) : tCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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

      {/* Topic Reader Modal */}
      {readingModalOpen && activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface-sunken)]/50">
              <div>
                <span className="text-xs font-bold text-[var(--brand-gold-600)] uppercase tracking-wider">
                  Lesson Content
                </span>
                <h3 className="text-lg font-bold text-[var(--ink-900)]">{activeTopic.title}</h3>
              </div>
              <button onClick={() => setReadingModalOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-[var(--ink-900)]">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTopic.contents && activeTopic.contents.length > 0 ? (
                activeTopic.contents.map((content, cIdx) => (
                  <div key={cIdx} className="space-y-2 p-4 bg-[var(--surface-sunken)]/30 border border-[var(--line)] rounded-2xl">
                    {content.title && <h4 className="font-bold text-sm text-[var(--ink-900)]">{content.title}</h4>}
                    {content.type === 'text' && <p className="text-sm text-[var(--ink-800)] leading-relaxed whitespace-pre-line">{content.content}</p>}
                    {content.type === 'code' && (
                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
                        <code>{content.content}</code>
                      </pre>
                    )}
                    {content.type === 'youtube' && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-[var(--line)]">
                        <iframe className="w-full h-full" src={content.content} title="Video lesson" allowFullScreen />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Reading content for this topic.</p>
              )}
            </div>

            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-sunken)]/50 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                Earn +{activeTopic.xp || 50} XP on completion
              </span>

              {activeTopic.exercise ? (
                <button
                  onClick={handleLaunchTopicExercise}
                  className="px-6 py-2.5 bg-[var(--brand-gold)] text-slate-950 font-bold text-xs rounded-xl hover:brightness-105 transition-all flex items-center gap-2"
                >
                  <span>Take Exercise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteTopicNoExercise}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete Topic</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Exercise Runner Modal */}
      {exerciseModalOpen && activeExercise && (
        <ExerciseModal
          open={exerciseModalOpen}
          onClose={() => setExerciseModalOpen(false)}
          exercise={activeExercise}
          courseId={id}
          topicId={activeTopic?._id}
          onSuccessPassed={handleExercisePassed}
        />
      )}
    </div>
  );
}
