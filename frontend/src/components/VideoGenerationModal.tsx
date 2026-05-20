"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  X,
  Download,
  Loader2,
  Sparkles,
  Film,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Play,
  Clock,
} from "lucide-react";
import { CourseAPI } from "@/lib/api";

type VideoStatus =
  | "idle"
  | "generating_script"
  | "rendering"
  | "completed"
  | "failed";

interface VideoGenerationModalProps {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onClose: () => void;
  /** Initial status from the course object */
  initialStatus?: VideoStatus;
  hasExistingVideo?: boolean;
  /** Called when video status changes so the parent can update its own state */
  onStatusChange?: (status: VideoStatus, hasVideo: boolean) => void;
}

const STATUS_STEPS = [
  {
    key: "generating_script",
    label: "Writing Video Script",
    sub: "AI is converting your course into engaging slide narratives with math & code",
    icon: Sparkles,
    color: "#818cf8",
  },
  {
    key: "rendering",
    label: "Rendering Video",
    sub: "Remotion is compositing all slides into a high-quality 1080p video",
    icon: Film,
    color: "#a78bfa",
  },
  {
    key: "completed",
    label: "Video Ready!",
    sub: "Your course video is ready to download in MP4 format",
    icon: CheckCircle2,
    color: "#34d399",
  },
];

function getStepIndex(status: VideoStatus) {
  if (status === "generating_script") return 0;
  if (status === "rendering") return 1;
  if (status === "completed") return 2;
  return -1;
}

export default function VideoGenerationModal({
  courseId,
  courseTitle,
  open,
  onClose,
  initialStatus = "idle",
  hasExistingVideo = false,
  onStatusChange,
}: VideoGenerationModalProps) {
  const [status, setStatus] = useState<VideoStatus>(initialStatus);
  const [isStarting, setIsStarting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActive =
    status === "generating_script" || status === "rendering";

  // Sync initial status
  useEffect(() => {
    if (open) {
      setStatus(initialStatus);
      setError(null);
    }
  }, [open, initialStatus]);

  // Elapsed time counter
  useEffect(() => {
    if (isActive) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Poll status while generating
  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await CourseAPI.getVideoStatus(courseId);
        const nextStatus: VideoStatus = res.data.videoStatus ?? "idle";
        const nextHasVideo = res.data.hasVideo ?? false;
        setStatus(nextStatus);
        onStatusChange?.(nextStatus, nextHasVideo);
        if (nextStatus === "completed" || nextStatus === "failed") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          if (nextStatus === "failed") {
            setError("Video generation failed. You can try again.");
          }
        }
      } catch {
        // Network hiccup — keep polling
      }
    }, 4000);
  }, [courseId]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!open) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [open]);

  // Auto-start polling if already in progress when modal opens
  useEffect(() => {
    if (open && (initialStatus === "generating_script" || initialStatus === "rendering")) {
      startPolling();
    }
  }, [open, initialStatus, startPolling]);

  const handleStart = async () => {
    try {
      setIsStarting(true);
      setError(null);
      await CourseAPI.generateVideo(courseId);
      setStatus("generating_script");
      onStatusChange?.("generating_script", false);
      startPolling();
    } catch (err: any) {
      setError(err?.message || "Failed to start video generation");
      setStatus("failed");
      onStatusChange?.("failed", false);
    } finally {
      setIsStarting(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);
      await CourseAPI.downloadVideo(courseId, courseTitle);
    } catch {
      setError("Failed to download video. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setStatus("idle");
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const stepIndex = getStepIndex(status);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={!isActive ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(145deg, #0f0c29 0%, #1e1b4b 60%, #2d2a5e 100%)",
                border: "1px solid rgba(129,140,248,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 pt-6 pb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)" }}
                  >
                    <Video className="w-5 h-5" style={{ color: "#818cf8" }} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Generate Video</h2>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      AI-powered course video — 1080p MP4
                    </p>
                  </div>
                </div>
                {!isActive && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl transition-colors hover:bg-white/10"
                    style={{ color: "#64748b" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Course title pill */}
              <div className="px-6 py-4">
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm font-semibold truncate"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e2e8f0",
                  }}
                >
                  📚 {courseTitle}
                </div>
              </div>

              {/* Content area */}
              <div className="px-6 pb-6">

                {/* IDLE state */}
                {status === "idle" && (
                  <div className="space-y-5">
                    {/* Feature list */}
                    <div className="space-y-3">
                      {[
                        { icon: "✨", text: "AI writes an engaging slide-by-slide script" },
                        { icon: "∫", text: "LaTeX math & equations rendered beautifully" },
                        { icon: "💻", text: "Syntax-highlighted code blocks for programming topics" },
                        { icon: "🎬", text: "Smooth animations at 1920×1080 resolution" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <span className="text-lg w-7 text-center shrink-0">{item.icon}</span>
                          <span className="text-sm" style={{ color: "#94a3b8" }}>{item.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Time estimate */}
                    <div
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
                      style={{ background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)", color: "#a5b4fc" }}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Rendering typically takes <strong>3–8 minutes</strong> depending on course length</span>
                    </div>

                    {/* Existing video banner */}
                    {hasExistingVideo && (
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
                        style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>A video already exists. Generating will overwrite it.</span>
                      </div>
                    )}

                    <button
                      onClick={handleStart}
                      disabled={isStarting}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "white",
                        boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                      }}
                    >
                      {isStarting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isStarting ? "Starting..." : hasExistingVideo ? "Regenerate Video" : "Generate Video"}
                    </button>
                  </div>
                )}

                {/* IN PROGRESS state */}
                {isActive && (
                  <div className="space-y-5">
                    {/* Steps */}
                    <div className="space-y-3">
                      {STATUS_STEPS.slice(0, 2).map((step, i) => {
                        const isCurrentStep = i === stepIndex;
                        const isDone = i < stepIndex;
                        const Icon = step.icon;
                        return (
                          <motion.div
                            key={step.key}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-3.5 p-4 rounded-2xl"
                            style={{
                              background: isCurrentStep
                                ? "rgba(129,140,248,0.1)"
                                : isDone
                                ? "rgba(52,211,153,0.06)"
                                : "rgba(255,255,255,0.03)",
                              border: `1px solid ${isCurrentStep
                                ? "rgba(129,140,248,0.25)"
                                : isDone
                                ? "rgba(52,211,153,0.2)"
                                : "rgba(255,255,255,0.05)"}`,
                            }}
                          >
                            <div
                              className="p-2 rounded-xl shrink-0 mt-0.5"
                              style={{
                                background: isDone
                                  ? "rgba(52,211,153,0.15)"
                                  : isCurrentStep
                                  ? `rgba(129,140,248,0.15)`
                                  : "rgba(255,255,255,0.05)",
                              }}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4" style={{ color: "#34d399" }} />
                              ) : isCurrentStep ? (
                                <Loader2 className="w-4 h-4 animate-spin" style={{ color: step.color }} />
                              ) : (
                                <Icon className="w-4 h-4" style={{ color: "#475569" }} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold"
                                style={{
                                  color: isDone ? "#34d399" : isCurrentStep ? "#e2e8f0" : "#475569",
                                }}
                              >
                                {step.label}
                              </p>
                              {isCurrentStep && (
                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748b" }}>
                                  {step.sub}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Animated progress bar */}
                    <div className="space-y-2">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: "linear-gradient(90deg, #6366f1, #a78bfa)",
                          }}
                          animate={{
                            width: status === "rendering" ? ["30%", "85%"] : ["0%", "40%"],
                          }}
                          transition={{ duration: 120, ease: "linear", repeat: Infinity, repeatType: "loop" }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#475569" }}>
                          {status === "generating_script" ? "Writing script..." : "Rendering frames..."}
                        </span>
                        <span className="text-xs font-mono" style={{ color: "#475569" }}>
                          {formatElapsed(elapsedSeconds)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-center leading-relaxed" style={{ color: "#334155" }}>
                      This runs in the background. You can close this modal and come back later.
                    </p>
                  </div>
                )}

                {/* COMPLETED state */}
                {status === "completed" && (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex flex-col items-center py-4 gap-3"
                    >
                      <div
                        className="p-4 rounded-2xl"
                        style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.25)" }}
                      >
                        <CheckCircle2 className="w-8 h-8" style={{ color: "#34d399" }} />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold" style={{ color: "#e2e8f0" }}>
                          Your video is ready!
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                          1920×1080 · MP4 · 30fps
                        </p>
                      </div>
                    </motion.div>

                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60"
                      style={{
                        background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                        color: "white",
                        boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                      }}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isDownloading ? "Downloading..." : "Download MP4"}
                    </button>

                    <button
                      onClick={handleRetry}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold transition-all hover:bg-white/5"
                      style={{ color: "#64748b" }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate Video
                    </button>
                  </div>
                )}

                {/* FAILED state */}
                {status === "failed" && (
                  <div className="space-y-4">
                    <div
                      className="flex items-start gap-3 p-4 rounded-2xl"
                      style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                      <p className="text-sm leading-relaxed" style={{ color: "#fca5a5" }}>
                        {error || "Video generation failed. This can happen due to server load. Please try again."}
                      </p>
                    </div>

                    <button
                      onClick={handleRetry}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "white",
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
