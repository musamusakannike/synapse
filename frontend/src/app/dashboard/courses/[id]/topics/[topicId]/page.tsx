'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, FileQuestion, CreditCard, HelpCircle, Play, Volume2, FileText, Image as ImageIcon, Code2, Terminal, GraduationCap, Layers } from 'lucide-react';
import { topicApi, courseApi } from '@/lib/api';
import { Topic, Course, TopicContent } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import InfoStepBlock from '@/components/lesson/InfoStepBlock';

function ContentBlock({ content, index, topicTitle }: { content: TopicContent; index: number; topicTitle: string }) {
  const label = ({
    text: 'Reading',
    latex: 'Formula',
    code: 'Code',
    youtube: 'Video',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    quiz: 'Quiz',
    exercise: 'Exercise',
    group: 'Group',
  } as const)[content.type];

  const Icon = ({ text: FileText, latex: FileText, code: Code2, youtube: Play, image: ImageIcon, video: Play, audio: Volume2, quiz: HelpCircle, exercise: Terminal, group: Layers } as const)[content.type];

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center gap-2 text-[var(--ink-300)]">
        <Icon className="size-4" />
        <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
      </div>

      {content.type === 'quiz' && content.quiz ? (
        <p className="text-[var(--ink-900)]">{content.quiz.question}</p>
      ) : content.type === 'exercise' && content.exercise ? (
        <p className="text-[var(--ink-900)]">{content.exercise.instructions}</p>
      ) : (
        <InfoStepBlock content={content} index={index} topicTitle={topicTitle} />
      )}
    </Card>
  );
}

function isProgrammingCourse(course: Course | null, topic: Topic | null): boolean {
  if (!course && !topic) return false;
  const PROGRAMMING_CATEGORIES = [
    'web development',
    'data science',
    'mobile development',
    'programming',
    'computer science',
    'software engineering',
    'python',
    'javascript',
    'code',
  ];
  const cat = (course?.category || '').toLowerCase();
  const title = (course?.title || '').toLowerCase();
  const desc = (course?.description || '').toLowerCase();

  const isCategoryMatch = PROGRAMMING_CATEGORIES.some(
    (pc) => cat.includes(pc) || title.includes(pc) || desc.includes(pc)
  );

  const hasCodeOrExercise = topic?.contents?.some(
    (c) => c.type === 'code' || c.type === 'exercise'
  );

  return isCategoryMatch || !!hasCodeOrExercise;
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceFlat = searchParams.get('view') === 'flat';
  const courseId = params.id as string;
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<Topic | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [topicRes, courseRes] = await Promise.all([topicApi.get(topicId), courseApi.get(courseId)]);
        setTopic(topicRes.data.data);
        setCourse(courseRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [courseId, topicId]);

  const shouldBeGuided = topic && (topic.defaultFlow === 'guided' || isProgrammingCourse(course, topic));

  useEffect(() => {
    if (shouldBeGuided && !forceFlat) {
      router.replace(`/dashboard/courses/${courseId}/topics/${topicId}/learn`);
    }
  }, [shouldBeGuided, forceFlat, router, courseId, topicId]);

  if (isLoading || (shouldBeGuided && !forceFlat)) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!topic) {
    return (
      <EmptyState
        icon={<BookOpen className="size-12" />}
        title="Topic not found"
        description="This topic may have been removed or is not yet published."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/dashboard/courses" className="hover:text-[var(--ink-900)]">Courses</Link>
        <span className="text-[var(--ink-300)]">/</span>
        <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[var(--ink-900)]">{course?.title || 'Course'}</Link>
        <span className="text-[var(--ink-300)]">/</span>
        <span className="text-[var(--ink-900)]">{topic.title}</span>
      </div>

      <div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--ink-900)]">{topic.title}</h1>
        {topic.description && <p className="text-[var(--text-muted)]">{topic.description}</p>}
      </div>

      {topic.contents?.length > 0 && (
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/learn`} className="block">
          <Button fullWidth>
            <GraduationCap className="size-4" /> Start lesson
          </Button>
        </Link>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/flashcards`} className="flex-1">
          <Button variant="secondary" fullWidth>
            <CreditCard className="size-4" /> Start flashcards {topic.flashcardCount ? <Badge tone="gold" className="ml-1">{topic.flashcardCount}</Badge> : null}
          </Button>
        </Link>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/mcq`} className="flex-1">
          <Button variant="secondary" fullWidth>
            <HelpCircle className="size-4" /> Take practice test {topic.mcqCount ? <Badge tone="neutral" className="ml-1">{topic.mcqCount}</Badge> : null}
          </Button>
        </Link>
      </div>

      {topic.contents?.length > 0 ? (
        <div className="space-y-4">
          {topic.contents.map((content, index) => (
            <ContentBlock key={index} content={content} index={index} topicTitle={topic.title} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<FileText className="size-12" />} title="No content blocks" description="This topic focuses on flashcards and practice questions." />
      )}

      <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row">
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/flashcards`} className="flex-1">
          <Button variant="ghost" fullWidth><CreditCard className="size-4" /> Study flashcards</Button>
        </Link>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/mcq`} className="flex-1">
          <Button variant="ghost" fullWidth><FileQuestion className="size-4" /> Practice MCQs</Button>
        </Link>
      </div>
    </div>
  );
}
