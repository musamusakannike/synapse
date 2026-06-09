"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { formatMarkdown } from "@/lib/markdown";
import { ShareBanner } from "@/components/ShareBanner";
import { AddToLibraryButton } from "@/components/AddToLibraryButton";
import Link from "next/link";

interface ChatSession {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export default function PublicChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicChat();
  }, [id]);

  const fetchPublicChat = async () => {
    try {
      const res = await fetch(`/api/share?id=${id}&type=chat`);
      const data = await res.json();
      if (data.success) {
        setChat(data.chat);
      } else {
        setError(data.error || "Shared chat not found");
      }
    } catch {
      setError("Failed to load shared chat");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-primary)] text-center p-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-4">
          Chat Not Available
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          {error || "This chat session has been set to private or does not exist."}
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          Go to Sabi Learn Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <ShareBanner />

      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col justify-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold mb-2">
            Shared AI Tutor Session
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Review the academic question and personalized AI response.
          </p>
        </div>

        {/* Question Panel */}
        <div className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold border border-[var(--accent)]/20 shrink-0 mt-0.5">
            Q
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{chat.question}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Shared on: {new Date(chat.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
            </p>
          </div>
        </div>

        {/* AI Answer Panel */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] relative">
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center absolute top-4 right-4 bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            {/* Branded Brain logo icon overlay */}
            <div className="w-3.5 h-3.5 rounded-full border border-[var(--accent)] border-t-transparent flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            </div>
          </div>
          
          <div
            className="prose prose-invert prose-sm max-w-none [&_h1]:font-[family-name:var(--font-display)] [&_h2]:font-[family-name:var(--font-display)] [&_h3]:font-[family-name:var(--font-display)] [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-xs pr-8"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(chat.answer) }}
          />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <AddToLibraryButton resourceId={id} type="chat" />
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(232,168,56,0.2)]"
          >
            Ask your own tutor questions
          </Link>
        </div>
      </div>
    </div>
  );
}
