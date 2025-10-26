import React, { useState } from "react";
import StyledMarkdown from "@/components/StyledMarkdown";
import OptimisticLoader from "@/components/OptimisticLoader";

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
            <StyledMarkdown>{m.content}</StyledMarkdown>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="w-full">
      <OptimisticLoader
        messages={[
          "Analyzing your document...",
          "Searching for relevant information...",
          "Generating a detailed response...",
          "Processing your question...",
          "Crafting the perfect answer...",
        ]}
        interval={2500}
      />
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
      <StyledMarkdown className="prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
        {display}
      </StyledMarkdown>
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



