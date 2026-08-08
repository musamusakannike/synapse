'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileQuestion, CreditCard, HelpCircle, Play, Volume2, FileText, Image as ImageIcon, Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { topicApi, courseApi } from '@/lib/api';
import { Topic, Course, TopicContent } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function ContentBlock({ content, index, topicTitle }: { content: TopicContent; index: number; topicTitle: string }) {
  const label = ({
    text: 'Reading',
    latex: 'Formula',
    code: 'Code',
    youtube: 'Video',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
  } as const)[content.type];

  const Icon = ({ text: FileText, latex: FileText, code: Code2, youtube: Play, image: ImageIcon, video: Play, audio: Volume2 } as const)[content.type];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3 text-[var(--ink-300)]">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>

      {content.type === 'text' && (
        <div className="whitespace-pre-wrap leading-[var(--leading-relaxed)] text-[var(--ink-900)]">{content.content}</div>
      )}

      {content.type === 'latex' && (
        <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4 text-center font-mono text-lg overflow-x-auto text-[var(--ink-900)]">
          {content.content}
        </div>
      )}

      {content.type === 'code' && (
        <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--line)]">
          <SyntaxHighlighter language={content.language || 'text'} style={oneLight} customStyle={{ margin: 0, fontSize: '13px' }}>
            {content.content}
          </SyntaxHighlighter>
        </div>
      )}

      {content.type === 'youtube' &&
        (getYouTubeId(content.content) ? (
          <div className="relative w-full aspect-video rounded-[var(--radius-md)] overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(content.content)}`}
              title={`Video content ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <a href={content.content} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-gold-600)] hover:opacity-80 text-sm break-all">
            {content.content}
          </a>
        ))}

      {content.type === 'image' && (
        <a href={content.content} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.content} alt={`${topicTitle} illustration ${index + 1}`} loading="lazy" className="w-full max-h-[32rem] object-contain rounded-[var(--radius-md)] bg-[var(--surface-sunken)]" />
        </a>
      )}

      {content.type === 'video' && <video src={content.content} controls className="w-full rounded-[var(--radius-md)]" />}
      {content.type === 'audio' && <audio src={content.content} controls className="w-full" />}
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

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/dashboard/courses/${courseId}/topics/${topicId}/flashcards`} className="flex-1">
          <Button fullWidth>
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
