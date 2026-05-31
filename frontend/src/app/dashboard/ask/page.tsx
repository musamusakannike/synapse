"use client";

import { useState, useCallback } from "react";
import { InputWithDocuments } from "@/components/documents";
import type { UploadedDoc } from "@/components/documents";
import { formatMarkdown } from "@/lib/markdown";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<UploadedDoc[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optimisticMessage, setOptimisticMessage] = useState("");

  const canSubmit =
    !loading && (question.trim() !== "" || attachedDocs.length > 0);

  const handleAsk = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setError("");
      setAnswer("");
      setLoading(true);

      // Optimistic UX
      const docNames = attachedDocs.map((d) => d.fileName).join(", ");
      setOptimisticMessage(
        attachedDocs.length > 0
          ? `Analyzing ${docNames}${question.trim() ? " with your question" : ""}...`
          : "Generating personalized answer..."
      );

      try {
        const res = await fetch("/api/ai/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            documentIds: attachedDocs.map((d) => d._id),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to get answer");
        } else {
          setAnswer(data.answer);
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
        setOptimisticMessage("");
      }
    },
    [canSubmit, question, attachedDocs]
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl">
      <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
        Ask AI Tutor
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6 sm:mb-8">
        Ask any academic question. Upload documents for context-aware answers adapted to your learning style.
      </p>

      <form onSubmit={handleAsk} className="mb-6 sm:mb-8">
        <InputWithDocuments
          inputType="textarea"
          value={question}
          onChange={setQuestion}
          placeholder="e.g. Explain the difference between mitosis and meiosis..."
          attachedDocs={attachedDocs}
          onDocsChange={setAttachedDocs}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-3 w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Thinking..." : "Ask Synapse"}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-muted)]">
              {optimisticMessage}
            </span>
          </div>
          <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      )}

      {answer && (
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <div
            className="prose prose-invert prose-sm max-w-none [&_h1]:font-[family-name:var(--font-display)] [&_h2]:font-[family-name:var(--font-display)] [&_h3]:font-[family-name:var(--font-display)] [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-xs"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }}
          />
        </div>
      )}
    </div>
  );
}


