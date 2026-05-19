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
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-500 text-sm font-semibold">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200/60 h-16 flex items-center">
                <div className="w-full max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/dashboard/chat")}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-base font-bold text-gray-800">My Flashcards</h1>
                    <button
                        onClick={() => router.push("/dashboard/flashcards/generate")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Set</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-10">
                {flashcardSets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200/60 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/30 flex items-center justify-center mb-4">
                            <Layers className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-base font-bold text-gray-850 mb-2">
                            No Flashcards Yet
                        </h2>
                        <p className="text-gray-500 text-center max-w-xs text-xs font-semibold mb-6">
                            Create your first flashcard set to start studying and memorizing
                            key concepts.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/flashcards/generate")}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-xs shadow-sm flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Flashcards</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                        {flashcardSets.map((set, index) => (
                            <div
                                key={set._id}
                                className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden group cursor-pointer hover:border-gray-300 hover:shadow-xs transition-all flex flex-col"
                                onClick={() => router.push(`/dashboard/flashcards/${set._id}`)}
                                style={{
                                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                }}
                            >
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/35 flex items-center justify-center shrink-0">
                                                    <Layers className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-800 truncate text-sm group-hover:text-blue-650 transition-colors">
                                                        {set.title}
                                                    </h3>
                                                    <p className="text-[10px] text-gray-400 font-semibold">
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
                                                className="p-1.5 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                            >
                                                {deletingId === set._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>

                                        {set.description && (
                                            <p className="text-xs text-gray-500 font-semibold mb-4 line-clamp-2 leading-relaxed">
                                                {set.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span>{set.flashcards?.length || 0} cards</span>
                                        </div>

                                        {set.studyStats && set.studyStats.totalStudySessions > 0 && (
                                            <div className="text-right">
                                                <p
                                                    className={`text-xs font-bold ${getScoreColor(
                                                        set.studyStats.averageScore
                                                    )}`}
                                                >
                                                    {Math.round(set.studyStats.averageScore)}% avg
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-semibold">
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
                        transform: translateY(6px);
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
