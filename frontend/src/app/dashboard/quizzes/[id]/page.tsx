"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, CheckCircle, XCircle, Lightbulb, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { QuizAPI } from "@/lib/api";

interface Question {
    questionText: string;
    options: string[];
    correctOption: number;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    includesCalculation: boolean;
}

interface Quiz {
    _id: string;
    title: string;
    description?: string;
    questions: Question[];
    status?: "generating" | "completed" | "failed";
    settings: {
        numberOfQuestions: number;
        difficulty: string;
        includeCalculations: boolean;
        timeLimit?: number;
    };
}

interface Answer {
    questionIndex: number;
    selectedOption: number;
    timeSpent: number;
}

export default function QuizAttemptPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState<number[][]>([]);

    const questionStartTime = useRef<number>(Date.now());
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Helper function to shuffle array indices
    const shuffleOptions = useCallback((length: number): number[] => {
        const indices = Array.from({ length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices;
    }, []);

    const loadQuiz = useCallback(async () => {
        try {
            const response = await QuizAPI.getQuiz(id);
            const quizData = response.data;
            setQuiz(quizData);

            // Initialize shuffled options for each question ONLY on first load
            if (quizData.questions && quizData.questions.length > 0) {
                const shuffled = quizData.questions.map((q: Question) =>
                    shuffleOptions(q.options.length)
                );
                setShuffledOptions(shuffled);
            }

            // If quiz is still generating, start polling
            if (quizData.status === "generating") {
                setIsLoading(false);

                // Clear any existing interval
                if (pollingInterval.current) {
                    clearInterval(pollingInterval.current);
                }

                // Poll every 5 seconds
                pollingInterval.current = setInterval(async () => {
                    try {
                        const pollResponse = await QuizAPI.getQuiz(id);
                        const updatedQuiz = pollResponse.data;

                        // Only update shuffled options for NEW questions that were just generated
                        setQuiz((prevQuiz) => {
                            if (prevQuiz && updatedQuiz.questions.length > prevQuiz.questions.length) {
                                // New questions were added, shuffle only the new ones
                                const newQuestionsCount = updatedQuiz.questions.length - prevQuiz.questions.length;
                                const newShuffled = updatedQuiz.questions
                                    .slice(-newQuestionsCount)
                                    .map((q: Question) => shuffleOptions(q.options.length));

                                setShuffledOptions((prev) => [...prev, ...newShuffled]);
                            }
                            return updatedQuiz;
                        });

                        // Stop polling when quiz is completed or failed
                        if (updatedQuiz.status === "completed" || updatedQuiz.status === "failed") {
                            if (pollingInterval.current) {
                                clearInterval(pollingInterval.current);
                                pollingInterval.current = null;
                            }

                            // Show error if failed
                            if (updatedQuiz.status === "failed") {
                                alert("Failed to generate quiz. Please try again.");
                                router.back();
                            }
                        }
                    } catch (error) {
                        console.error("Error polling quiz:", error);
                    }
                }, 5000);
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error loading quiz:", error);
            alert("Failed to load quiz. Please try again.");
            router.back();
        }
    }, [id, router, shuffleOptions]);

    useEffect(() => {
        loadQuiz();

        // Cleanup polling on unmount
        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
            }
        };
    }, [loadQuiz]);

    useEffect(() => {
        // Reset state when question changes
        questionStartTime.current = Date.now();
        setSelectedOption(null);
        setShowExplanation(false);
    }, [currentQuestionIndex]);

    const handleSelectOption = useCallback((optionIndex: number) => {
        if (showExplanation) return;
        setSelectedOption(optionIndex);
    }, [showExplanation]);

    const handleConfirmAnswer = useCallback(() => {
        if (selectedOption === null || !quiz) return;

        const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
        const currentQuestion = quiz.questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.correctOption;

        const newAnswer: Answer = {
            questionIndex: currentQuestionIndex,
            selectedOption,
            timeSpent,
        };

        setAnswers((prev) => [...prev, newAnswer]);
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
        setShowExplanation(true);
    }, [selectedOption, quiz, currentQuestionIndex]);

    const handleFinishQuiz = useCallback(async () => {
        if (!quiz) return;

        setIsSubmitting(true);
        try {
            await QuizAPI.submitAttempt(quiz._id, answers);
            setQuizCompleted(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            setQuizCompleted(true); // Still show results
        } finally {
            setIsSubmitting(false);
        }
    }, [quiz, answers]);

    const handleNextQuestion = useCallback(() => {
        if (!quiz) return;

        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            handleFinishQuiz();
        }
    }, [currentQuestionIndex, quiz, handleFinishQuiz]);

    const handleRetakeQuiz = useCallback(() => {
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setScore(0);
        setQuizCompleted(false);
        setSelectedOption(null);
        setShowExplanation(false);

        // Re-shuffle options for each question
        if (quiz?.questions && quiz.questions.length > 0) {
            const shuffled = quiz.questions.map((q: Question) =>
                shuffleOptions(q.options.length)
            );
            setShuffledOptions(shuffled);
        }
    }, [quiz, shuffleOptions]);

    const getOptionStyle = (optionIndex: number) => {
        const baseStyle = "w-full p-4 rounded-xl border flex items-center gap-3 transition-all text-left";

        if (!showExplanation) {
            return selectedOption === optionIndex
                ? `${baseStyle} border-blue-600 bg-blue-50/50`
                : `${baseStyle} border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:bg-slate-800 bg-white dark:bg-slate-900`;
        }

        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (!currentQuestion) return `${baseStyle} border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900`;

        if (optionIndex === currentQuestion.correctOption) {
            return `${baseStyle} border-green-600 bg-green-50/50`;
        }
        if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctOption) {
            return `${baseStyle} border-red-600 bg-red-50/50`;
        }
        return `${baseStyle} border-gray-200 dark:border-gray-700 opacity-60 bg-white dark:bg-slate-900`;
    };

    const getOptionTextColor = (optionIndex: number) => {
        if (!showExplanation) {
            return selectedOption === optionIndex ? "text-blue-800 font-semibold" : "text-gray-700 dark:text-gray-300";
        }

        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (!currentQuestion) return "text-gray-750";

        if (optionIndex === currentQuestion.correctOption) {
            return "text-green-800 font-semibold";
        }
        if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctOption) {
            return "text-red-800 font-semibold";
        }
        return "text-gray-500 dark:text-gray-400";
    };

    const getBadgeStyle = (optionIndex: number) => {
        const base = "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all shrink-0 ";
        if (!showExplanation) {
            return selectedOption === optionIndex
                ? base + "bg-blue-100 text-blue-700"
                : base + "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400";
        }
        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (optionIndex === currentQuestion?.correctOption) {
            return base + "bg-green-100 text-green-700";
        }
        if (optionIndex === selectedOption) {
            return base + "bg-red-100 text-red-700";
        }
        return base + "bg-gray-100 dark:bg-slate-800 text-gray-400";
    };

    if (isLoading || (quiz?.status === "generating" && quiz.questions.length === 0)) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-800 dark:text-gray-200 text-lg font-semibold animate-pulse">
                        {quiz?.status === "generating"
                            ? "Generating quiz questions..."
                            : "Loading quiz..."}
                    </p>
                    {quiz?.status === "generating" && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {quiz.questions.length} / {quiz.settings.numberOfQuestions} questions generated
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!quiz || quiz.status === "failed") {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <XCircle className="w-12 h-12 text-red-500" />
                    <p className="text-gray-800 dark:text-gray-200 text-lg font-bold">Quiz not found</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (quizCompleted) {
        const percentage = Math.round((score / quiz.questions.length) * 100);
        const isPassing = percentage >= 70;

        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center p-6 animate-fade-in">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700/60 text-center shadow-lg">
                    <div
                        className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 ${isPassing ? "bg-green-50" : "bg-red-50"
                            }`}
                    >
                        {isPassing ? (
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600" />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isPassing ? "Congratulations!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-gray-555 text-sm font-medium mb-6">{quiz.title}</p>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-6xl font-bold text-blue-600">{score}</span>
                        <span className="text-4xl text-gray-300">/</span>
                        <span className="text-3xl text-gray-400 font-semibold">{quiz.questions.length}</span>
                    </div>
                    <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-8">{percentage}%</p>

                    <div className="flex items-center justify-center gap-8 mb-8 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-250/20 rounded-xl">
                        <div className="text-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{score}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Correct</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div className="text-center">
                            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{quiz.questions.length - score}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Incorrect</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleRetakeQuiz}
                            className="w-full py-3.5 rounded-xl border border-blue-600 text-blue-600 font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retake Quiz
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#f9f8f6] flex flex-col animate-fade-in">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                                router.back();
                            }
                        }}
                        className="p-2 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-slate-800 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex-1">
                        <div className="h-2 bg-gray-200/60 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-xs font-semibold text-gray-400 mt-1.5">
                            {currentQuestionIndex + 1} / {quiz.questions.length} Questions
                        </p>
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Question */}
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-205/30 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-lg mb-4">
                        {currentQuestion.difficulty.charAt(0).toUpperCase() +
                            currentQuestion.difficulty.slice(1)}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                        {currentQuestion.questionText}
                    </h2>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                    {shuffledOptions[currentQuestionIndex]?.map(
                        (originalIndex, displayIndex) => {
                            const option = currentQuestion.options[originalIndex];
                            return (
                                <button
                                    key={displayIndex}
                                    onClick={() => handleSelectOption(originalIndex)}
                                    disabled={showExplanation}
                                    className={getOptionStyle(originalIndex)}
                                >
                                    <span className={getBadgeStyle(originalIndex)}>
                                        {String.fromCharCode(65 + displayIndex)}
                                    </span>
                                    <span className={`flex-1 text-sm font-semibold leading-relaxed ${getOptionTextColor(originalIndex)}`}>
                                        {option}
                                    </span>
                                    {showExplanation &&
                                        originalIndex === currentQuestion.correctOption && (
                                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                        )}
                                    {showExplanation &&
                                        originalIndex === selectedOption &&
                                        originalIndex !== currentQuestion.correctOption && (
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        )}
                                </button>
                            );
                        }
                    )}
                </div>

                {/* Explanation */}
                {showExplanation && (
                    <div className="p-5 bg-amber-50/50 border border-amber-200/60 rounded-xl mb-8 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                            <span className="font-bold text-sm text-amber-700 uppercase tracking-wider">Explanation</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">{currentQuestion.explanation}</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="sticky bottom-0 bg-white dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700/60 p-4">
                <div className="max-w-4xl mx-auto">
                    {!showExplanation ? (
                        <button
                            onClick={handleConfirmAnswer}
                            disabled={selectedOption === null}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all text-sm shadow-sm ${selectedOption === null
                                ? "bg-gray-150 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            Confirm Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm text-sm"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Submitting...</span>
                                </>
                            ) : currentQuestionIndex < quiz.questions.length - 1 ? (
                                <>
                                    <span>Next Question</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            ) : (
                                "Finish Quiz"
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
