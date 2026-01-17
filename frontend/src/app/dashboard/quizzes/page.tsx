"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, HelpCircle, Clock, CheckCircle, XCircle, Trash2, Loader2, ChevronLeft } from "lucide-react";
import { QuizAPI } from "@/lib/api";

interface Quiz {
    _id: string;
    title: string;
    status: "generating" | "completed" | "failed";
    createdAt: string;
    settings?: {
        numberOfQuestions: number;
        difficulty: string;
    };
    questions?: { questionText: string }[];
}

export default function QuizzesPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchQuizzes = useCallback(async () => {
        try {
            const response = await QuizAPI.list();
            setQuizzes(response.data.quizzes || response.data || []);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    const handleDeleteQuiz = useCallback(async (quizId: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        setDeletingId(quizId);
        try {
            await QuizAPI.delete(quizId);
            setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
        } catch (error) {
            console.error("Error deleting quiz:", error);
            alert("Failed to delete quiz");
        } finally {
            setDeletingId(null);
        }
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "generating":
                return <Clock className="w-4 h-4 text-yellow-400" />;
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "failed":
                return <XCircle className="w-4 h-4 text-red-400" />;
            default:
                return <HelpCircle className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "generating":
                return "bg-yellow-500/20 text-yellow-400";
            case "completed":
                return "bg-green-500/20 text-green-400";
            case "failed":
                return "bg-red-500/20 text-red-400";
            default:
                return "bg-slate-500/20 text-slate-400";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
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
                    <h1 className="text-lg font-semibold text-white">My Quizzes</h1>
                    <button
                        onClick={() => router.push("/dashboard/quizzes/generate")}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 rounded-full bg-blue-500/15 flex items-center justify-center mb-6">
                            <HelpCircle className="w-12 h-12 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-3">
                            No Quizzes Yet
                        </h2>
                        <p className="text-slate-400 text-center max-w-sm mb-6">
                            Create your first quiz to test your knowledge on any topic.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/quizzes/generate")}
                            className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Quiz
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map((quiz, index) => (
                            <div
                                key={quiz._id}
                                className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden group"
                                style={{
                                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                }}
                            >
                                <div
                                    className="p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                                    onClick={() => {
                                        if (quiz.status === "completed") {
                                            router.push(`/dashboard/quizzes/${quiz._id}`);
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate mb-1">
                                                {quiz.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                <span>{formatDate(quiz.createdAt)}</span>
                                                {quiz.questions && (
                                                    <span>{quiz.questions.length} questions</span>
                                                )}
                                                {quiz.settings?.difficulty && (
                                                    <span className="capitalize">
                                                        {quiz.settings.difficulty}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                    quiz.status
                                                )}`}
                                            >
                                                {getStatusIcon(quiz.status)}
                                                {quiz.status.charAt(0).toUpperCase() +
                                                    quiz.status.slice(1)}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteQuiz(quiz._id);
                                                }}
                                                disabled={deletingId === quiz._id}
                                                className="p-2 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                {deletingId === quiz._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
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
