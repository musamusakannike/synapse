'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Check, BookOpen, ArrowLeft, CreditCard, HelpCircle, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { courseApi, topicApi, paymentApi } from '@/lib/api';
import { Course, Topic, PaymentStatus } from '@/lib/types';
import { formatKobo } from '@/lib/money';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, topicsRes, paymentRes] = await Promise.all([
          courseApi.get(id),
          topicApi.byCourse(id),
          paymentApi.me(),
        ]);
        setCourse(courseRes.data.data);
        setTopics(topicsRes.data.data || []);
        setPaymentStatus(paymentRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const hasAccess =
    !course ||
    course.isFree ||
    paymentStatus?.subscription.status === 'active' ||
    !!paymentStatus?.purchasedCourseIds.includes(course._id);

  const handleBuyCourse = async () => {
    if (!course) return;
    setIsPurchasing(true);
    try {
      const res = await paymentApi.initializeCoursePurchase(course._id);
      window.location.href = res.data.data.authorizationUrl;
    } catch (e) {
      console.error(e);
      setIsPurchasing(false);
    }
  };

  const handleTopicClick = (e: React.MouseEvent) => {
    if (hasAccess) return;
    // Locked topics don't navigate — the purchase/subscribe card above is the call to action.
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <Link href="/dashboard/courses" className="text-[var(--brand-gold-600)] hover:opacity-80 mt-2 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--ink-900)]">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </Link>

      {course.banner ? (
        <div className="relative w-full aspect-[16/9] bg-[var(--surface-sunken)] rounded-[var(--radius-xl)] overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.banner} alt={course.title} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-[var(--brand-gold-100)] rounded-[var(--radius-xl)] flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-[var(--brand-gold-600)]/50" />
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Badge tone="neutral">{course.category}</Badge>
          <Badge tone="gold">{course.difficulty}</Badge>
          {!course.isFree && <Badge tone={hasAccess ? 'success' : 'dark'}>{hasAccess ? 'Unlocked' : formatKobo(course.price)}</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-3">{course.title}</h1>
        <p className="text-[var(--text-muted)] leading-[var(--leading-relaxed)]">{course.longDescription || course.description}</p>
      </div>

      {!hasAccess && (
        <Card className="p-5 border border-[var(--brand-gold-100)] bg-[var(--brand-gold-50,var(--surface-sunken))]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--brand-gold-100)] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[var(--brand-gold-600)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ink-900)]">This is a premium course</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Buy it once for {formatKobo(course.price)}, or get it (and everything else) with a monthly subscription.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard/subscribe')}>
                <Sparkles className="w-4 h-4" /> Go all-access
              </Button>
              <Button size="sm" onClick={handleBuyCourse} loading={isPurchasing}>
                Buy for {formatKobo(course.price)}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-6 py-4 border-y border-[var(--line)]">
        <div className="flex items-center gap-2 text-[var(--ink-900)]">
          <BookOpen className="w-5 h-5 text-[var(--brand-gold-600)]" />
          <span className="text-sm">{course.topicCount || topics.length} topics</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--ink-900)]">
          <CreditCard className="w-5 h-5 text-[var(--brand-gold-600)]" />
          <span className="text-sm">{topics.reduce((s, t) => s + (t.flashcardCount || 0), 0)} flashcards</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--ink-900)]">
          <HelpCircle className="w-5 h-5 text-[var(--brand-gold-600)]" />
          <span className="text-sm">{topics.reduce((s, t) => s + (t.mcqCount || 0), 0)} MCQs</span>
        </div>
      </div>

      {course.whatYouWillLearn?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">What you&apos;ll learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {course.whatYouWillLearn.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--success-100)] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[var(--success)]" />
                </div>
                <p className="text-sm text-[var(--text-muted)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-[var(--ink-900)] mb-4">Course content</h2>
        {topics.length === 0 ? (
          <EmptyState icon={<BookOpen className="w-12 h-12" />} title="No topics yet" description="Topics for this course will appear here once published." />
        ) : (
          <div className="gap-y-2 flex flex-col">
            {topics.map((topic, i) => (
              <Link
                key={topic._id}
                href={`/dashboard/courses/${course._id}/topics/${topic._id}`}
                onClick={handleTopicClick}
              >
                <Card className="p-4 hover:shadow-[var(--shadow-sm)] transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-[var(--brand-gold-100)] text-[var(--brand-gold-600)] text-sm font-semibold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--ink-900)]">{topic.title}</h3>
                      {topic.description && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{topic.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--ink-300)]">
                        {topic.contents?.length > 0 && <span>{topic.contents.length} content blocks</span>}
                        {!!topic.flashcardCount && (
                          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {topic.flashcardCount}</span>
                        )}
                        {!!topic.mcqCount && <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> {topic.mcqCount}</span>}
                      </div>
                    </div>
                    {hasAccess ? (
                      <ChevronRight className="w-5 h-5 text-[var(--ink-300)] shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-[var(--ink-300)] shrink-0" />
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
