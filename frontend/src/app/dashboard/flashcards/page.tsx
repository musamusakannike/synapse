"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers, Trash2, Loader2, ChevronLeft, BookOpen } from "lucide-react";
import { FlashcardAPI } from "@/lib/api";

interface FlashcardSet {
    _id: string;
    title: string;
    description?: string;
    createdAt: string;
    flashcards?: { front: string; back: string }[];
    studyStats?: {
        totalStudySessions: number;
        averageScore: number;
        lastStudied?: string;
    };
}

export default function FlashcardsPage() {
    const router = useRouter();
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchFlashcardSets = useCallback(async () => {
        try {
            const response = await FlashcardAPI.list();
            setFlashcardSets(response.data.flashcardSets || response.data || []);
        } catch (error) {
            console.error("Error fetching flashcard sets:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFlashcardSets();
    }, [fetchFlashcardSets]);

    const handleDeleteSet = useCallback(async (setId: string) => {
        if (!confirm("Are you sure you want to delete this flashcard set?")) return;

        setDeletingId(setId);
        try {
            await FlashcardAPI.delete(setId);
            setFlashcardSets((prev) => prev.filter((s) => s._id !== setId));
        } catch (error) {
            console.error("Error deleting flashcard set:", error);
            alert("Failed to delete flashcard set");
        } finally {
            setDeletingId(null);
        }
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/dashboard/chat")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-lg font-semibold text-white">My Flashcards</h1>
                    <button
                        onClick={() => router.push("/dashboard/flashcards/generate")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {flashcardSets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 rounded-full bg-blue-500/15 flex items-center justify-center mb-6">
                            <Layers className="w-12 h-12 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-3">
                            No Flashcards Yet
                        </h2>
                        <p className="text-slate-400 text-center max-w-sm mb-6">
                            Create your first flashcard set to start studying and memorizing
                            key concepts.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/flashcards/generate")}
                            className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Flashcards
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {flashcardSets.map((set, index) => (
                            <div
                                key={set._id}
                                className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden group cursor-pointer hover:bg-slate-700/30 transition-colors"
                                onClick={() => router.push(`/dashboard/flashcards/${set._id}`)}
                                style={{
                                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                }}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                                <Layers className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white truncate">
                                                    {set.title}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {formatDate(set.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSet(set._id);
                                            }}
                                            disabled={deletingId === set._id}
                                            className="p-2 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            {deletingId === set._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {set.description && (
                                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                            {set.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-4 h-4" />
                                                {set.flashcards?.length || 0} cards
                                            </span>
                                        </div>

                                        {set.studyStats && set.studyStats.totalStudySessions > 0 && (
                                            <div className="text-right">
                                                <p
                                                    className={`text-sm font-medium ${getScoreColor(
                                                        set.studyStats.averageScore
                                                    )}`}
                                                >
                                                    {Math.round(set.studyStats.averageScore)}% avg
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {set.studyStats.totalStudySessions} sessions
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}
