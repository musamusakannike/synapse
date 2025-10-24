import React from "react";
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
    console.log("Rendering Chat with messages:", messages);
  return (
    <div className="space-y-3">
      {summary && (
        <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/50">
          <p className="text-xs font-semibold text-blue-700 mb-2">Document summary</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {summary}
          </ReactMarkdown>
        </div>
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
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
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

