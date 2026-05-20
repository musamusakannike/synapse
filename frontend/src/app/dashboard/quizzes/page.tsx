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
                return <Clock className="w-3.5 h-3.5 text-yellow-600" />;
            case "completed":
                return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
            case "failed":
                return <XCircle className="w-3.5 h-3.5 text-red-600" />;
            default:
                return <HelpCircle className="w-3.5 h-3.5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "generating":
                return "bg-yellow-50 text-yellow-700 border border-yellow-250/30";
            case "completed":
                return "bg-green-50 text-green-700 border border-green-250/30";
            case "failed":
                return "bg-red-50 text-red-700 border border-red-250/30";
            default:
                return "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-250/30";
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
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/dashboard/chat")}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Back</span>
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">My Quizzes</h1>
                    <button
                        onClick={() => router.push("/dashboard/quizzes/generate")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Quiz
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {quizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                            <HelpCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No Quizzes Yet
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                            Create your first quiz to test your knowledge on any topic.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/quizzes/generate")}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Quiz
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quizzes.map((quiz, index) => (
                            <div
                                key={quiz._id}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-xs hover:shadow-sm hover:border-gray-300 transition-all duration-200 group relative"
                                style={{
                                    animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                                }}
                            >
                                <div
                                    className="p-5 cursor-pointer"
                                    onClick={() => {
                                        if (quiz.status === "completed") {
                                            router.push(`/dashboard/quizzes/${quiz._id}`);
                                        }
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1 pr-12 text-base">
                                                {quiz.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                                <span>{formatDate(quiz.createdAt)}</span>
                                                {quiz.questions && (
                                                    <span>• {quiz.questions.length} questions</span>
                                                )}
                                                {quiz.settings?.difficulty && (
                                                    <span className="capitalize">• {quiz.settings.difficulty}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
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
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                {deletingId === quiz._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
