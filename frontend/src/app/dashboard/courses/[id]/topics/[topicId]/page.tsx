'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, FileQuestion, CreditCard, HelpCircle, Play, Volume2, FileText, Image as ImageIcon, Code2, Terminal, GraduationCap } from 'lucide-react';
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
  } as const)[content.type];

  const Icon = ({ text: FileText, latex: FileText, code: Code2, youtube: Play, image: ImageIcon, video: Play, audio: Volume2, quiz: HelpCircle, exercise: Terminal } as const)[content.type];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3 text-[var(--ink-300)]">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
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

export default function TopicDetailPage() {
  const params = useParams();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!topic) {
    return (
      <EmptyState
        icon={<BookOpen className="w-12 h-12" />}
        title="Topic not found"
        description="This topic may have been removed or is not yet published."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] flex-wrap">
        <Link href="/dashboard/courses" className="hover:text-[var(--ink-900)]">Courses</Link>
        <span className="text-[var(--ink-300)]">/</span>
        <Link href={`/dashboard/courses/${courseId}`} className="hover:text-[var(--ink-900)]">{course?.title || 'Course'}</Link>
        <span className="text-[var(--ink-300)]">/</span>
        <span className="text-[var(--ink-900)]">{topic.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-2">{topic.title}</h1>
        {topic.description && <p className="text-[var(--text-muted)]">{topic.description}</p>}
      </div>

      {topic.contents?.length > 0 && (
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/learn`} className="block">
          <Button fullWidth>
            <GraduationCap className="w-4 h-4" /> Start lesson
          </Button>
        </Link>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/flashcards`} className="flex-1">
          <Button variant="secondary" fullWidth>
            <CreditCard className="w-4 h-4" /> Start flashcards {topic.flashcardCount ? <Badge tone="gold" className="ml-1">{topic.flashcardCount}</Badge> : null}
          </Button>
        </Link>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/mcq`} className="flex-1">
          <Button variant="secondary" fullWidth>
            <HelpCircle className="w-4 h-4" /> Take practice test {topic.mcqCount ? <Badge tone="neutral" className="ml-1">{topic.mcqCount}</Badge> : null}
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
        <EmptyState icon={<FileText className="w-12 h-12" />} title="No content blocks" description="This topic focuses on flashcards and practice questions." />
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--line)]">
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/flashcards`} className="flex-1">
          <Button variant="ghost" fullWidth><CreditCard className="w-4 h-4" /> Study flashcards</Button>
        </Link>
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/mcq`} className="flex-1">
          <Button variant="ghost" fullWidth><FileQuestion className="w-4 h-4" /> Practice MCQs</Button>
        </Link>
      </div>
    </div>
  );
}
