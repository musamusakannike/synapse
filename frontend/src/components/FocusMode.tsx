"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, Sun, Moon, Minus, Plus, Copy, Share2, Eye, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface FocusModeProps {
    content: string;
    role: "user" | "assistant";
    onClose: () => void;
}

export default function FocusMode({ content, role, onClose }: FocusModeProps) {
    const [fontSize, setFontSize] = useState(18);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate word count and read time
    const { wordCount, readTime } = useMemo(() => {
        const words = content.split(/\s+/).filter(Boolean);
        return {
            wordCount: words.length,
            readTime: Math.ceil(words.length / 200),
        };
    }, [content]);

    // Auto-hide controls after 5 seconds
    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 5000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const toggleControls = useCallback(() => {
        setShowControls((prev) => !prev);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const handleIncreaseFontSize = useCallback(() => {
        setFontSize((prev) => Math.min(prev + 2, 32));
    }, []);

    const handleDecreaseFontSize = useCallback(() => {
        setFontSize((prev) => Math.max(prev - 2, 12));
    }, []);

    const handleToggleTheme = useCallback(() => {
        setIsDarkMode((prev) => !prev);
    }, []);

    const handleCopyContent = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    }, [content]);

    const handleShareContent = useCallback(async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    text: content,
                    title: "Shared from Synapse",
                });
            } else {
                // Fallback: copy to clipboard
                await handleCopyContent();
            }
        } catch (error) {
            console.error("Share error:", error);
        }
    }, [content, handleCopyContent]);

    const theme = useMemo(
        () =>
            isDarkMode
                ? {
                    background: "bg-slate-900",
                    surface: "bg-slate-800",
                    text: "text-slate-100",
                    textSecondary: "text-slate-400",
                    accent: "text-blue-400",
                    border: "border-slate-700",
                }
                : {
                    background: "bg-slate-50",
                    surface: "bg-white",
                    text: "text-slate-900",
                    textSecondary: "text-slate-500",
                    accent: "text-blue-600",
                    border: "border-slate-200",
                },
        [isDarkMode]
    );

    return (
        <div
            className={`fixed inset-0 z-50 ${theme.background} transition-colors duration-300`}
        >
            {/* Tap area to toggle controls */}
            <div className="h-full overflow-y-auto" onClick={toggleControls}>
                <div className="max-w-3xl mx-auto px-6 py-20 pb-32">
                    {/* Focus Mode Header */}
                    <div className="flex flex-col items-center mb-8">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleControls();
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-full text-white text-sm font-medium mb-3 hover:bg-blue-600 transition-all transform hover:scale-105"
                        >
                            <Eye className="w-4 h-4" />
                            Focus Mode
                        </button>
                        <span className={`text-sm ${theme.textSecondary}`}>
                            {role === "user" ? "Your Message" : "AI Response"}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="mb-8" onClick={(e) => e.stopPropagation()}>
                        {role === "user" ? (
                            <p
                                className={`${theme.text} leading-relaxed`}
                                style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
                            >
                                {content}
                            </p>
                        ) : (
                            <div
                                className={`prose prose-lg max-w-none ${isDarkMode ? "prose-invert" : ""
                                    }`}
                                style={{
                                    fontSize: `${fontSize}px`,
                                    lineHeight: 1.7,
                                }}
                            >
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => (
                                            <h1
                                                className={`${theme.text} font-bold mb-4 mt-6`}
                                                style={{ fontSize: `${fontSize + 10}px` }}
                                            >
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2
                                                className={`${theme.text} font-semibold mb-3 mt-5`}
                                                style={{ fontSize: `${fontSize + 6}px` }}
                                            >
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3
                                                className={`${theme.text} font-semibold mb-2 mt-4`}
                                                style={{ fontSize: `${fontSize + 4}px` }}
                                            >
                                                {children}
                                            </h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className={`${theme.text} mb-4`}>{children}</p>
                                        ),
                                        code: ({ children, className }) => {
                                            const isInline = !className;
                                            return isInline ? (
                                                <code
                                                    className={`${theme.surface} ${theme.accent} px-1.5 py-0.5 rounded text-sm font-mono`}
                                                >
                                                    {children}
                                                </code>
                                            ) : (
                                                <code
                                                    className={`block ${theme.surface} p-4 rounded-xl my-3 overflow-x-auto font-mono text-sm ${theme.border} border`}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        },
                                        pre: ({ children }) => (
                                            <pre
                                                className={`${theme.surface} p-4 rounded-xl my-3 overflow-x-auto ${theme.border} border`}
                                            >
                                                {children}
                                            </pre>
                                        ),
                                        blockquote: ({ children }) => (
                                            <blockquote
                                                className={`border-l-4 border-blue-500 ${theme.surface} pl-4 py-2 my-3 rounded-r`}
                                            >
                                                {children}
                                            </blockquote>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className={`${theme.text} list-disc list-inside mb-4`}>
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className={`${theme.text} list-decimal list-inside mb-4`}>
                                                {children}
                                            </ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="mb-2">{children}</li>
                                        ),
                                        a: ({ href, children }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 underline hover:text-blue-400"
                                            >
                                                {children}
                                            </a>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className={`font-bold ${theme.text}`}>
                                                {children}
                                            </strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className={`italic ${theme.text}`}>{children}</em>
                                        ),
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Reading Stats */}
                    <div className="flex justify-center gap-4">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.surface}`}
                        >
                            <span className={`text-sm ${theme.textSecondary}`}>
                                {wordCount} words
                            </span>
                        </div>
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.surface}`}
                        >
                            <span className={`text-sm ${theme.textSecondary}`}>
                                ~{readTime} min read
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Controls */}
            <div
                className={`fixed top-6 left-0 right-0 px-6 flex items-center justify-between transition-opacity duration-150 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            >
                <button
                    onClick={onClose}
                    className={`w-11 h-11 rounded-full ${theme.surface} flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}
                >
                    <X className={`w-5 h-5 ${theme.text}`} />
                </button>

                <button
                    onClick={handleToggleTheme}
                    className={`w-11 h-11 rounded-full ${theme.surface} flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}
                >
                    {isDarkMode ? (
                        <Sun className={`w-5 h-5 ${theme.text}`} />
                    ) : (
                        <Moon className={`w-5 h-5 ${theme.text}`} />
                    )}
                </button>
            </div>

            {/* Bottom Controls */}
            <div
                className={`fixed bottom-0 left-0 right-0 ${theme.surface} border-t ${theme.border} px-6 py-4 flex items-center justify-between transition-opacity duration-150 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            >
                {/* Font Size Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDecreaseFontSize}
                        className={`w-9 h-9 rounded-full border ${theme.border} flex items-center justify-center hover:bg-blue-500/10 transition-colors`}
                    >
                        <Minus className={`w-4 h-4 ${theme.text}`} />
                    </button>
                    <span className={`text-sm font-medium ${theme.text} min-w-[45px] text-center`}>
                        {fontSize}px
                    </span>
                    <button
                        onClick={handleIncreaseFontSize}
                        className={`w-9 h-9 rounded-full border ${theme.border} flex items-center justify-center hover:bg-blue-500/10 transition-colors`}
                    >
                        <Plus className={`w-4 h-4 ${theme.text}`} />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopyContent}
                        className={`w-11 h-11 rounded-full ${isDarkMode ? "bg-slate-700" : "bg-slate-200"} flex items-center justify-center hover:scale-105 transition-transform`}
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <Copy className={`w-5 h-5 ${theme.text}`} />
                        )}
                    </button>
                    <button
                        onClick={handleShareContent}
                        className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Share2 className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
