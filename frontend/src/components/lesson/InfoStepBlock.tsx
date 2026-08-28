import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { TopicContent } from '@/lib/types';

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-700)] transition-colors hover:bg-[var(--line)]"
      title="Copy code to clipboard"
      type="button"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-[var(--success)]" />
          <span className="text-[var(--success)]">Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function FormattedParagraph({ text }: { text: string }) {
  // Support [text](url), **bold/highlight**, and plain text
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);
  return (
    <p className="text-base sm:text-lg leading-relaxed text-[var(--ink-900)] mb-4 last:mb-0">
      {parts.map((part, pIdx) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={pIdx}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0084FE] hover:underline"
            >
              {linkMatch[1]}
            </a>
          );
        }
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
          return (
            <span key={pIdx} className="font-bold text-[#0084FE]">
              {boldMatch[1]}
            </span>
          );
        }
        return <span key={pIdx}>{part}</span>;
      })}
    </p>
  );
}

export default function InfoStepBlock({ content, index = 0, topicTitle = '' }: { content: TopicContent; index?: number; topicTitle?: string }) {
  return (
    <div className="space-y-4">
      {content.type === 'text' && (
        <div className="space-y-4">
          {content.content
            .split(/\n\n+/)
            .filter((p) => p.trim().length > 0)
            .map((paragraph, pIdx) => (
              <FormattedParagraph key={pIdx} text={paragraph} />
            ))}
        </div>
      )}

      {content.type === 'latex' && (
        <div className="overflow-x-auto rounded-2xl bg-[var(--surface-sunken)] p-6 text-center font-mono text-xl text-[var(--ink-900)] border border-[var(--line)]">
          {content.content}
        </div>
      )}

      {content.type === 'code' && (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-sunken)] px-4 py-2 font-mono text-xs text-[var(--ink-500)]">
            <span className="font-semibold uppercase tracking-wider">{content.language || 'code'}</span>
            <CopyButton text={content.content} />
          </div>
          <SyntaxHighlighter
            language={content.language || 'text'}
            style={oneLight}
            customStyle={{ margin: 0, padding: '1.25rem', fontSize: '14px', lineHeight: '1.6' }}
          >
            {content.content}
          </SyntaxHighlighter>
        </div>
      )}

      {content.type === 'group' && (
        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-5 shadow-xs">
          {content.content && (
            <h3 className="border-b border-[var(--line)] pb-2 text-base font-bold text-[var(--ink-900)]">{content.content}</h3>
          )}
          <div className="space-y-4">
            {(content.blocks || []).map((subBlock, bIdx) => (
              <InfoStepBlock key={bIdx} content={subBlock} index={bIdx} topicTitle={topicTitle} />
            ))}
          </div>
        </div>
      )}

      {content.type === 'youtube' &&
        (getYouTubeId(content.content) ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--line)] shadow-sm">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(content.content)}`}
              title={`Video content ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        ) : (
          <a href={content.content} target="_blank" rel="noopener noreferrer" className="text-sm break-all font-semibold text-[#0084FE] hover:underline">
            {content.content}
          </a>
        ))}

      {content.type === 'image' && (
        <div className="flex justify-center py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.content}
            alt={`${topicTitle} illustration ${index + 1}`}
            loading="lazy"
            className="max-h-72 w-auto max-w-full rounded-2xl bg-transparent object-contain drop-shadow-sm"
          />
        </div>
      )}

      {content.type === 'video' && (
        <video src={content.content} controls className="w-full rounded-2xl border border-[var(--line)] shadow-sm" />
      )}
      {content.type === 'audio' && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-sunken)] p-4">
          <audio src={content.content} controls className="w-full" />
        </div>
      )}
    </div>
  );
}
