"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { formatMarkdown } from "@/lib/markdown";
import { BetaBadge } from "@/components/BetaBadge";
import { DocumentUpload, AttachedDocChip } from "@/components/documents/DocumentUpload";
import { DocumentPicker } from "@/components/documents/DocumentPicker";
import type { UploadedDoc } from "@/components/documents/DocumentUpload";
import { cn } from "@/lib/cn";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "text" | "course-created" | "quiz-created" | "video-created";
  meta?: { id?: string; title?: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedDocs, setAttachedDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<
    "ask" | "course" | "quiz" | "video" | null
  >(null);

  // Document picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canSubmit = !loading && (input.trim() !== "" || attachedDocs.length > 0);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const addMessage = useCallback(
    (
      role: ChatMessage["role"],
      content: string,
      type?: ChatMessage["type"],
      meta?: ChatMessage["meta"]
    ) => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role,
        content,
        timestamp: new Date(),
        type,
        meta,
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    []
  );

  const handleUploadComplete = (doc: UploadedDoc) => {
    if (!attachedDocs.some((d) => d._id === doc._id)) {
      setAttachedDocs((prev) => [...prev, doc]);
    }
    setUploadError("");
  };

  const handleRemoveDoc = (id: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d._id !== id));
  };

  const handlePickerSelect = (docs: UploadedDoc[]) => {
    const existing = new Set(attachedDocs.map((d) => d._id));
    const merged = [
      ...attachedDocs,
      ...docs.filter((d) => !existing.has(d._id)),
    ];
    setAttachedDocs(merged);
  };

  // ── Send handler ─────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!canSubmit) return;

    const userInput = input.trim();
    const docIds = attachedDocs.map((d) => d._id);
    const docNames = attachedDocs.map((d) => d.fileName);
    const mode = activeMode || "ask";

    // Build display message
    let displayMsg = userInput;
    if (docNames.length > 0) {
      const docLabel = docNames.join(", ");
      displayMsg = userInput
        ? `${userInput}\n\n📎 ${docLabel}`
        : `📎 ${docLabel}`;
    }

    addMessage("user", displayMsg);
    setInput("");
    setAttachedDocs([]);
    setLoading(true);

    try {
      if (mode === "course") {
        // Create course
        addMessage(
          "system",
          `Creating course${userInput ? ` on "${userInput}"` : ""}...`
        );
        const res = await fetch("/api/ai/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: userInput, documentIds: docIds }),
        });
        const data = await res.json();
        if (!res.ok) {
          addMessage("assistant", data.error || "Failed to create course.");
        } else {
          const courseId = data.course?._id || data.courseId;
          const courseTitle =
            data.course?.title || userInput || "your new course";
          addMessage(
            "assistant",
            `✅ **Course created:** "${courseTitle}"\n\nYour personalized course has been generated successfully. Click below to start learning.`,
            "course-created",
            { id: courseId, title: courseTitle }
          );
        }
      } else if (mode === "quiz") {
        // Create quiz
        addMessage(
          "system",
          `Generating quiz${userInput ? ` on "${userInput}"` : ""}...`
        );
        const res = await fetch("/api/ai/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: userInput,
            documentIds: docIds,
            numQuestions: 5,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          addMessage("assistant", data.error || "Failed to create quiz.");
        } else {
          const quizId = data.quiz?._id || data.quizId;
          const quizTitle =
            data.quiz?.title || userInput || "your new quiz";
          addMessage(
            "assistant",
            `✅ **Quiz created:** "${quizTitle}"\n\nYour quiz with 5 questions is ready. Test your knowledge now.`,
            "quiz-created",
            { id: quizId, title: quizTitle }
          );
        }
      } else if (mode === "video") {
        // Create video
        addMessage(
          "system",
          `Generating video${userInput ? ` on "${userInput}"` : ""}...`
        );
        const res = await fetch("/api/ai/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: userInput,
            styleTheme: "emerald",
            numScenes: 5,
            documentIds: docIds,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          addMessage("assistant", data.error || "Failed to create video.");
        } else {
          const videoId = data.video?._id || data.videoId;
          const videoTitle =
            data.video?.title || userInput || "your new video";
          addMessage(
            "assistant",
            `✅ **Video created:** "${videoTitle}"\n\nYour explanatory video presentation has been generated. Watch it now.`,
            "video-created",
            { id: videoId, title: videoTitle }
          );
        }
      } else {
        // Ask AI (default)
        const res = await fetch("/api/ai/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userInput, documentIds: docIds }),
        });
        const data = await res.json();
        if (!res.ok) {
          addMessage("assistant", data.error || "Failed to get answer.");
        } else {
          addMessage("assistant", data.answer || "No response received.");
        }
      }
    } catch {
      addMessage("assistant", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setActiveMode(null);
    }
  }, [canSubmit, input, attachedDocs, activeMode, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDropdownAction = (action: string) => {
    setDropdownOpen(false);
    if (action === "attach") {
      setPickerOpen(true);
      return;
    }
    const modeMap: Record<string, "course" | "quiz" | "video"> = {
      course: "course",
      quiz: "quiz",
      video: "video",
    };
    setActiveMode(modeMap[action] || null);
    textareaRef.current?.focus();
  };

  const dropdownItems = [
    {
      key: "course",
      label: "Create Course",
      description: "Generate a full course on any topic",
    },
    {
      key: "quiz",
      label: "Create Quiz",
      description: "Generate practice questions",
    },
    {
      key: "attach",
      label: "Attach Document",
      description: "Upload or pick a document",
    },
    {
      key: "video",
      label: "Generate Video",
      description: "Create an explanatory video",
      beta: true,
    },
  ];

  const modeLabels: Record<string, string> = {
    course: "Course Mode",
    quiz: "Quiz Mode",
    video: "Video Mode",
    ask: "Ask AI",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="hidden md:block flex-shrink-0 px-4 sm:px-6 md:px-8 py-4 border-b border-[var(--border-subtle)]">
        <h1 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Ask anything, create courses, quizzes, or videos — all from here.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold mb-1.5">
              How can I help you learn today?
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              Type a question, create a course, generate a quiz, or attach a document.
              Use the <span className="font-semibold text-[var(--text-secondary)]">+</span> button to explore options.
            </p>

            {/* Quick suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
              {[
                { label: "Explain quantum computing", mode: "ask" as const },
                { label: "Create a physics course", mode: "course" as const },
                { label: "Quiz me on biology", mode: "quiz" as const },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => {
                    setInput(chip.label.replace(/^(Create a |Quiz me on |Explain )/, ""));
                    if (chip.mode !== "ask") setActiveMode(chip.mode);
                    textareaRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "system" ? (
                  // System message (loading indicator style)
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] max-w-[90%] sm:max-w-[70%]">
                    <div className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-sm text-[var(--text-muted)]">
                      {msg.content}
                    </span>
                  </div>
                ) : msg.role === "user" ? (
                  // User message
                  <div className="max-w-[90%] sm:max-w-[70%] px-4 py-3 rounded-2xl rounded-br-md bg-[var(--accent)] text-[var(--bg-primary)]">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-[var(--bg-primary)]/10">
                      <span className="text-[10px] opacity-60">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 rounded hover:bg-[var(--bg-primary)]/10 text-[var(--bg-primary)] opacity-60 hover:opacity-100 transition-all active:scale-95 flex items-center gap-1 group/copy"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <span className="text-[10px] font-semibold animate-in fade-in slide-in-from-right-1 duration-200">
                              Copied!
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-in zoom-in duration-200"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] opacity-0 group-hover/copy:opacity-100 transition-opacity duration-200 font-medium">
                              Copy
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-70 group-hover/copy:opacity-100 transition-opacity duration-200"
                            >
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Assistant message
                  <div className="max-w-[90%] sm:max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <div
                      className="prose prose-invert prose-sm max-w-none [&_h1]:font-[family-name:var(--font-display)] [&_h2]:font-[family-name:var(--font-display)] [&_h3]:font-[family-name:var(--font-display)] [&_p]:text-[var(--text-secondary)] [&_p]:leading-relaxed [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_code]:bg-[var(--bg-elevated)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[var(--accent)] [&_code]:text-xs"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(msg.content),
                      }}
                    />
                    {/* Action buttons for created items */}
                    {msg.type === "course-created" && msg.meta?.id && (
                      <button
                        onClick={() =>
                          router.push(`/dashboard/courses/${msg.meta!.id}`)
                        }
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        Open Course →
                      </button>
                    )}
                    {msg.type === "quiz-created" && msg.meta?.id && (
                      <button
                        onClick={() =>
                          router.push(`/dashboard/quizzes/${msg.meta!.id}`)
                        }
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        Take Quiz →
                      </button>
                    )}
                    {msg.type === "video-created" && msg.meta?.id && (
                      <button
                        onClick={() =>
                          router.push(`/dashboard/videos/${msg.meta!.id}`)
                        }
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--bg-primary)] text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        Watch Video →
                      </button>
                    )}
                    <div className="flex items-center justify-between gap-4 mt-3 pt-2 border-t border-[var(--border-subtle)]/30">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all active:scale-95 flex items-center gap-1 group/copy"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <span className="text-[10px] font-medium text-[var(--accent)] animate-in fade-in slide-in-from-right-1 duration-200">
                              Copied!
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--accent)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-in zoom-in duration-200"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span className="text-[9px] opacity-0 group-hover/copy:opacity-100 transition-opacity duration-200 font-medium">
                              Copy
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-70 group-hover/copy:opacity-100 transition-opacity duration-200"
                            >
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading &&
              messages.length > 0 &&
              messages[messages.length - 1]?.role !== "system" && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
          {/* Active mode indicator */}
          {activeMode && (
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/15">
                {modeLabels[activeMode]}
                {activeMode === "video" && (
                  <BetaBadge className="text-[8px] px-1 py-0" />
                )}
              </span>
              <button
                onClick={() => setActiveMode(null)}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Attached docs */}
          {attachedDocs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedDocs.map((doc) => (
                <AttachedDocChip
                  key={doc._id}
                  doc={doc}
                  onRemove={handleRemoveDoc}
                />
              ))}
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-[var(--danger)] mb-2">{uploadError}</p>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2">
            {/* Plus button */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={loading}
                className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center transition-all disabled:opacity-50",
                  dropdownOpen
                    ? "bg-[var(--accent-muted)] border-[var(--accent)]/30 text-[var(--accent)]"
                    : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                )}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-transform duration-200",
                    dropdownOpen && "rotate-45"
                  )}
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-64 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {dropdownItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleDropdownAction(item.key)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {item.label}
                        </span>
                        {item.beta && <BetaBadge />}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeMode === "course"
                    ? "Enter a topic for your course..."
                    : activeMode === "quiz"
                    ? "Enter a topic for your quiz..."
                    : activeMode === "video"
                    ? "Enter a topic for your video..."
                    : "Ask anything or type a topic..."
                }
                disabled={loading}
                rows={1}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none disabled:opacity-50 min-h-[42px] max-h-[160px]"
              />
            </div>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSubmit}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                canSubmit
                  ? "bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)]"
                  : "bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed opacity-50"
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
            {user?.premium
              ? "Premium — unlimited generations"
              : `Free plan — ${3 - (user?.generationsToday || 0)} generations left today`}
          </p>
        </div>
      </div>

      {/* Document picker modal */}
      <DocumentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        selectedIds={attachedDocs.map((d) => d._id)}
      />

      {/* Hidden upload input for "Attach Document" option */}
      <div className="hidden">
        <DocumentUpload
          compact
          onUploadComplete={handleUploadComplete}
          onError={setUploadError}
        />
      </div>
    </div>
  );
}
