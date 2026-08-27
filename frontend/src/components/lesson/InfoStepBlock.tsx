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

export default function InfoStepBlock({ content, index, topicTitle }: { content: TopicContent; index: number; topicTitle: string }) {
  return (
    <div className="space-y-3">
      {content.type === 'text' && (
        <div className="leading-[var(--leading-relaxed)] whitespace-pre-wrap text-[var(--ink-900)]">{content.content}</div>
      )}

      {content.type === 'latex' && (
        <div className="overflow-x-auto rounded-[var(--radius-md)] bg-[var(--surface-sunken)] p-4 text-center font-mono text-lg text-[var(--ink-900)]">
          {content.content}
        </div>
      )}

      {content.type === 'code' && (
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--line)]">
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-sunken)] px-3 py-1.5 font-mono text-xs text-[var(--ink-500)]">
            <span>{content.language || 'code'}</span>
            <CopyButton text={content.content} />
          </div>
          <SyntaxHighlighter language={content.language || 'text'} style={oneLight} customStyle={{ margin: 0, fontSize: '13px' }}>
            {content.content}
          </SyntaxHighlighter>
        </div>
      )}

      {content.type === 'group' && (
        <div className="space-y-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] p-4 shadow-xs">
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
          <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-md)]">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(content.content)}`}
              title={`Video content ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        ) : (
          <a href={content.content} target="_blank" rel="noopener noreferrer" className="text-sm break-all text-[var(--brand-gold-600)] hover:opacity-80">
            {content.content}
          </a>
        ))}

      {content.type === 'image' && (
        <a href={content.content} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.content} alt={`${topicTitle} illustration ${index + 1}`} loading="lazy" className="max-h-[32rem] w-full rounded-[var(--radius-md)] bg-[var(--surface-sunken)] object-contain" />
        </a>
      )}

      {content.type === 'video' && <video src={content.content} controls className="w-full rounded-[var(--radius-md)]" />}
      {content.type === 'audio' && <audio src={content.content} controls className="w-full" />}
    </div>
  );
}
