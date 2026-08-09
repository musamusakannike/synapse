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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] hover:bg-[var(--line)] text-[var(--ink-700)] transition-colors cursor-pointer"
      title="Copy code to clipboard"
      type="button"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[var(--success)]" />
          <span className="text-[var(--success)]">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
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
        <div className="whitespace-pre-wrap leading-[var(--leading-relaxed)] text-[var(--ink-900)]">{content.content}</div>
      )}

      {content.type === 'latex' && (
        <div className="bg-[var(--surface-sunken)] rounded-[var(--radius-md)] p-4 text-center font-mono text-lg overflow-x-auto text-[var(--ink-900)]">
          {content.content}
        </div>
      )}

      {content.type === 'code' && (
        <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--line)]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--surface-sunken)] border-b border-[var(--line)] text-xs font-mono text-[var(--ink-500)]">
            <span>{content.language || 'code'}</span>
            <CopyButton text={content.content} />
          </div>
          <SyntaxHighlighter language={content.language || 'text'} style={oneLight} customStyle={{ margin: 0, fontSize: '13px' }}>
            {content.content}
          </SyntaxHighlighter>
        </div>
      )}

      {content.type === 'group' && (
        <div className="space-y-4 p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-card)] shadow-xs">
          {content.content && (
            <h3 className="text-base font-bold text-[var(--ink-900)] border-b border-[var(--line)] pb-2">{content.content}</h3>
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
