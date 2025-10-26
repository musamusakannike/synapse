import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  messages: Message[];
  sending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  summary?: string;
};

export default function Chat({ messages, sending, messagesEndRef, summary }: Props) {
  return (
    <div className="space-y-3">
      {summary && <SummaryBlock text={summary} />}

      {messages.length === 0 && !sending && (
        <div className="text-center text-xs text-gray-500">Ask a question to get started.</div>
      )}

      {messages.map((m, idx) => (
        <div
          key={idx}
          className={`max-w-[92%] md:max-w-[78%] p-3 rounded-lg border ${
            m.role === "user"
              ? "ml-auto bg-blue-50 border-blue-100"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {m.content === "typing__placeholder__" ? (
            <TypingDots />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:no-underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                code: ({ inline, className, children, ..._props }: any) => {
                  const text = String(children ?? "");
                  if (inline) {
                    return (
                      <code className={`px-1 py-0.5 rounded bg-gray-100 ${className ?? ""}`}>
                        {text}
                      </code>
                    );
                  }
                  return <CodeBlock text={text} className={className} />;
                },
              }}
            >
              {m.content}
            </ReactMarkdown>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
    </div>
  );
}

function SummaryBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 280;
  const isLong = text.length > limit;
  const display = expanded || !isLong ? text : text.slice(0, limit) + "…";
  return (
    <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50">
      <p className="text-[11px] font-semibold text-gray-700 mb-1">Document summary</p>
      <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-a:text-gray-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, href, children, ...props }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="underline hover:no-underline"
                {...props}
              >
                {children}
              </a>
            ),
          }}
        >
          {display}
        </ReactMarkdown>
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}


function CodeBlock({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // ignore
    }
  };
  return (
    <div className="relative group">
      <pre className={`overflow-x-auto p-3 rounded bg-gray-900 text-gray-100 ${className ?? ""}`}>
        <code>{text}</code>
      </pre>
      <button
        type="button"
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700 opacity-0 group-hover:opacity-100 transition"
        onClick={onCopy}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

