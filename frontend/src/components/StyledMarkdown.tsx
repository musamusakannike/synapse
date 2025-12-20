import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type StyledMarkdownProps = {
  children: string;
  className?: string;
};

export default function StyledMarkdown({ children, className = "" }: StyledMarkdownProps) {
  return (
    <div className={`prose prose-sm sm:prose max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Links - open in new tab with better styling
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          // Inline code
          code: ({ inline, className, children, ..._props }: any) => {
            const text = String(children ?? "");
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200 text-[0.9em] font-mono">
                  {text}
                </code>
              );
            }
            return <CodeBlock text={text} className={className} />;
          },
          // Headings with better spacing and styling
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300 mt-6 mb-4 pb-2 border-b-2 border-gray-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-300 mt-5 mb-3 pb-1 border-b border-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-300 mt-3 mb-2">
              {children}
            </h4>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed my-3">
              {children}
            </p>
          ),
          // Lists with better styling
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 my-3 space-y-1 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 my-3 space-y-1 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 dark:text-gray-300">
              {children}
            </li>
          ),
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50/50 text-gray-700 italic">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-700">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700">
              {children}
            </td>
          ),
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-t-2 border-gray-200" />
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-300">
              {children}
            </strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-300">
              {children}
            </em>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
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

  // Extract language from className (e.g., "language-javascript")
  const language = className?.replace(/language-/, "") || "";

  return (
    <div className="relative group my-4">
      <pre className="overflow-x-auto p-4 rounded-lg bg-gray-900 text-gray-100 border border-gray-700">
        <code className={`text-sm font-mono ${className ?? ""}`}>{text}</code>
      </pre>
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {language && (
          <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700">
            {language}
          </span>
        )}
        <button
          type="button"
          className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200 border border-gray-700 opacity-0 group-hover:opacity-100 transition hover:bg-gray-700"
          onClick={onCopy}
          aria-label="Copy code"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
