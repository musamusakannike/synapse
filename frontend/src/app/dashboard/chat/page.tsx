"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChatAPI } from "@/lib/api";
import {
  SendHorizontal,
  FileUp,
  BookOpen,
  Globe2,
  PenTool,
  FileSearch,
} from "lucide-react";
import Loader from "@/components/Loader";
import OptimisticLoader from "@/components/OptimisticLoader";
import { useSearchParams } from "next/navigation";
import HelpButton from "@/components/HelpButton";
import { helpConfigs } from "@/config/helpConfigs";

// Server list returns shape: { chats, pagination }
interface ChatListItem {
  id: string;
  title: string;
  type: "topic" | "document" | "website" | "general";
  messageCount: number;
  lastMessage: null | { role: string; content: string; timestamp: string };
  lastActivity: string;
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatFull {
  _id: string;
  title: string;
  type: "topic" | "document" | "website" | "general";
  messages: Message[];
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatFull | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadChats = async () => {
    try {
      setLoadingList(true);
      const { data } = await ChatAPI.list();
      setChats(data?.chats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Open a chat if ?open=<id>
  useEffect(() => {
    const toOpen = searchParams.get("open");
    if (toOpen) {
      setSelectedId(toOpen);
    }
  }, [searchParams]);

  // Load chat data when selectedId changes
  useEffect(() => {
    if (selectedId) {
      (async () => {
        try {
          const { data } = await ChatAPI.get(selectedId);
          const c = data?.chat;
          if (c) {
            setChat({
              _id: c._id,
              title: c.title,
              type: c.type,
              messages: c.messages || [],
            });
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [selectedId]);

  const doSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setSending(true);
      const content = message.trim();
      setMessage("");

      // Ensure we have a chat ID
      let chatId = selectedId;
      if (!chatId) {
        const { data } = await ChatAPI.create();
        chatId = data?.chat?.id;
        if (!chatId) throw new Error("Failed to create chat");
        setSelectedId(chatId);
      }

      // Optimistically add user message and a typing placeholder
      setChat((prev) => {
        const base: ChatFull = prev ?? {
          _id: chatId!,
          title: "New Chat",
          type: "general",
          messages: [],
        };
        return {
          ...base,
          messages: [
            ...base.messages,
            { role: "user", content },
            { role: "assistant", content: "typing__placeholder__" },
          ],
        };
      });

      // Send to server
      const { data } = await ChatAPI.sendMessage(chatId!, content);
      const aiResponse = data?.aiResponse || { role: "assistant", content: "" };

      // Replace typing placeholder with real content
      setChat((prev) => {
        if (!prev) return prev;
        const msgs = [...prev.messages];
        const idx = msgs.findIndex((m) => m.role === "assistant" && m.content === "typing__placeholder__");
        if (idx !== -1) {
          msgs[idx] = aiResponse;
        } else {
          msgs.push(aiResponse);
        }
        return { ...prev, messages: msgs };
      });

      // refresh list for last activity
      loadChats();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const emptyState = useMemo(
    () => (
      <div className="w-full max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureCard href="/dashboard/documents" icon={<FileUp className="w-5 h-5" />} title="Upload document" desc="Import PDFs or notes to chat with." />
          <FeatureCard href="/dashboard/topics" icon={<BookOpen className="w-5 h-5" />} title="Explain a Topic" desc="Get a clear explanation with examples." />
          <FeatureCard href="/dashboard/wikipedia" icon={<Globe2 className="w-5 h-5" />} title="Research Wikipedia" desc="Search summaries and deep dives." />
          <FeatureCard href="/dashboard/quizzes" icon={<PenTool className="w-5 h-5" />} title="Take Quiz" desc="Test your knowledge instantly." />
          <FeatureCard href="/dashboard/websites" icon={<FileSearch className="w-5 h-5" />} title="Research Website" desc="Analyze any webpage content." />
        </div>
      </div>
    ),
    []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length, sending]);

  return (
    <div className="relative">
      {/* Messages viewport */}
      <div className="max-w-4xl mx-auto pt-2 md:pt-4 pb-28">
        {!chat || chat.messages.length === 0 ? (
          <div className="mt-10 md:mt-16 text-center text-gray-700">
            <h1 className="text-2xl font-semibold mb-3">How can I help today?</h1>
            <p className="text-gray-500 mb-6">Choose a feature below or ask a question.</p>
            {emptyState}
          </div>
        ) : (
          <div data-help="messages" className="p-2 md:p-0 space-y-3">
            {chat.messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[92%] md:max-w-[78%] p-3 rounded-lg border ${
                  m.role === "user" ? "ml-auto bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-200"
                }`}
              >
                {m.content === "typing__placeholder__" ? (
                  <TypingDots />
                ) : (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed bottom input */}
      <div className="fixed left-0 right-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-4xl mx-auto px-3 py-3">
          <form onSubmit={doSend} className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 resize-none border border-gray-200 rounded-md px-3 py-2 max-h-40 min-h-10 focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows={1}
            />
            <button
              disabled={!message.trim() || sending}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              aria-label="Send message"
            >
              {sending ? <Loader size="xs" /> : <SendHorizontal className="w-4 h-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="text-[11px] text-gray-500 mt-2">AI may make mistakes. Verify important information.</p>
        </div>
      </div>

      <HelpButton helpConfig={helpConfigs.chat} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="w-full">
      <OptimisticLoader
        messages={[
          "Thinking about your question...",
          "Analyzing the context...",
          "Generating a thoughtful response...",
          "Processing your request...",
          "Crafting the perfect answer...",
        ]}
        interval={2500}
      />
    </div>
  );
}

function FeatureCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <a href={href} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
      <div className="mt-0.5 text-blue-600">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </a>
  );
}
