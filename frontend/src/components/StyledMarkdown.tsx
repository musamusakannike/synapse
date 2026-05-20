import React from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

type StyledMarkdownProps = {
  children: string;
  className?: string;
  isAnimating?: boolean;
};

export default function StyledMarkdown({ children, className = "", isAnimating = false }: StyledMarkdownProps) {
  return (
    <div className={`prose prose-sm sm:prose max-w-none ${className}`}>
      <Streamdown
        mode={isAnimating ? "streaming" : "static"}
        plugins={{ code }}
        isAnimating={isAnimating}
        caret="block"
        components={{
          // Links - open in new tab with better styling
          a: ({ href, children, ...props }: any) => (
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
          // Inline code - custom styling for inline code
          code: ({ children, className, ...props }: any) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-900 border border-gray-200 text-[0.9em] font-mono dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700" {...props}>
                  {children}
                </code>
              );
            }
            // For block code, let Streamdown render with Shiki highlighter plugin
            return <code className={className} {...props}>{children}</code>;
          },
          // Headings with better spacing and styling
          h1: ({ children, ...props }: any) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300 mt-6 mb-4 pb-2 border-b-2 border-gray-200" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: any) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-300 mt-5 mb-3 pb-1 border-b border-gray-200" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: any) => (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-4 mb-2" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }: any) => (
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-300 mt-3 mb-2" {...props}>
              {children}
            </h4>
          ),
          // Paragraphs
          p: ({ children, ...props }: any) => (
            <p className="text-gray-900 dark:text-gray-300 leading-relaxed my-3" {...props}>
              {children}
            </p>
          ),
          // Lists with better styling
          ul: ({ children, ...props }: any) => (
            <ul className="list-disc list-outside ml-5 my-3 space-y-1 text-gray-900" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: any) => (
            <ol className="list-decimal list-outside ml-5 my-3 space-y-1 text-gray-900" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: any) => (
            <li className="leading-relaxed pl-1 dark:text-gray-300" {...props}>
              {children}
            </li>
          ),
          // Blockquotes
          blockquote: ({ children, ...props }: any) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50/50 text-gray-900 italic dark:bg-slate-800 dark:text-gray-300" {...props}>
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children, ...props }: any) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: any) => (
            <thead className="bg-gray-50 dark:bg-gray-700" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }: any) => (
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }: any) => (
            <tr className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }: any) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider dark:text-gray-300" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }: any) => (
            <td className="px-4 py-2 text-sm text-gray-900" {...props}>
              {children}
            </td>
          ),
          // Horizontal rule
          hr: (props: any) => (
            <hr className="my-6 border-t-2 border-gray-200" {...props} />
          ),
          // Strong/Bold
          strong: ({ children, ...props }: any) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-300" {...props}>
              {children}
            </strong>
          ),
          // Emphasis/Italic
          em: ({ children, ...props }: any) => (
            <em className="italic text-gray-900 dark:text-gray-300" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {children}
      </Streamdown>
    </div>
  );
}
