import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TopicContent } from '@/lib/types';

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function InfoStepBlock({ content, index, topicTitle }: { content: TopicContent; index: number; topicTitle: string }) {
  return (
    <div>
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
    </div>
  );
}
