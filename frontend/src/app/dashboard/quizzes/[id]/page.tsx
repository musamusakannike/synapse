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
        const baseStyle = "w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all text-left";

        if (!showExplanation) {
            return selectedOption === optionIndex
                ? `${baseStyle} border-blue-500 bg-blue-500/10`
                : `${baseStyle} border-slate-600 hover:border-slate-500 bg-slate-700/30`;
        }

        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (!currentQuestion) return `${baseStyle} border-slate-600 bg-slate-700/30`;

        if (optionIndex === currentQuestion.correctOption) {
            return `${baseStyle} border-green-500 bg-green-500/10`;
        }
        if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctOption) {
            return `${baseStyle} border-red-500 bg-red-500/10`;
        }
        return `${baseStyle} border-slate-600 bg-slate-700/30`;
    };

    const getOptionTextColor = (optionIndex: number) => {
        if (!showExplanation) {
            return selectedOption === optionIndex ? "text-blue-400" : "text-white";
        }

        const currentQuestion = quiz?.questions[currentQuestionIndex];
        if (!currentQuestion) return "text-white";

        if (optionIndex === currentQuestion.correctOption) {
            return "text-green-400";
        }
        if (optionIndex === selectedOption && optionIndex !== currentQuestion.correctOption) {
            return "text-red-400";
        }
        return "text-white";
    };

    if (isLoading || (quiz?.status === "generating" && quiz.questions.length === 0)) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-white text-lg">
                        {quiz?.status === "generating"
                            ? "Generating quiz questions..."
                            : "Loading quiz..."}
                    </p>
                    {quiz?.status === "generating" && (
                        <p className="text-slate-400">
                            {quiz.questions.length} / {quiz.settings.numberOfQuestions} questions generated
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!quiz || quiz.status === "failed") {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <XCircle className="w-12 h-12 text-slate-400" />
                    <p className="text-white text-lg">Quiz not found</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
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
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 text-center">
                    <div
                        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${isPassing ? "bg-green-500/20" : "bg-red-500/20"
                            }`}
                    >
                        {isPassing ? (
                            <CheckCircle className="w-16 h-16 text-green-400" />
                        ) : (
                            <XCircle className="w-16 h-16 text-red-400" />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isPassing ? "Congratulations!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-slate-400 mb-6">{quiz.title}</p>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-6xl font-bold text-blue-400">{score}</span>
                        <span className="text-4xl text-slate-500">/</span>
                        <span className="text-3xl text-slate-400">{quiz.questions.length}</span>
                    </div>
                    <p className="text-xl text-slate-300 mb-8">{percentage}%</p>

                    <div className="flex items-center justify-center gap-8 mb-8 p-4 bg-slate-700/30 rounded-xl">
                        <div className="text-center">
                            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-white">{score}</p>
                            <p className="text-sm text-slate-400">Correct</p>
                        </div>
                        <div className="w-px h-12 bg-slate-600" />
                        <div className="text-center">
                            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-white">{quiz.questions.length - score}</p>
                            <p className="text-sm text-slate-400">Incorrect</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleRetakeQuiz}
                            className="w-full py-4 rounded-full border-2 border-blue-500 text-blue-400 font-medium flex items-center justify-center gap-2 hover:bg-blue-500/10 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Retake Quiz
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="w-full py-4 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
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
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
                                router.back();
                            }
                        }}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex-1">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-sm text-slate-400 mt-1">
                            {currentQuestionIndex + 1} / {quiz.questions.length}
                        </p>
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Question */}
                <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-blue-500/15 text-blue-400 text-xs font-medium rounded-full mb-4">
                        {currentQuestion.difficulty.charAt(0).toUpperCase() +
                            currentQuestion.difficulty.slice(1)}
                    </span>
                    <h2 className="text-xl font-medium text-white leading-relaxed">
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
                                    <span className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-300">
                                        {String.fromCharCode(65 + displayIndex)}
                                    </span>
                                    <span className={`flex-1 ${getOptionTextColor(originalIndex)}`}>
                                        {option}
                                    </span>
                                    {showExplanation &&
                                        originalIndex === currentQuestion.correctOption && (
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                        )}
                                    {showExplanation &&
                                        originalIndex === selectedOption &&
                                        originalIndex !== currentQuestion.correctOption && (
                                            <XCircle className="w-6 h-6 text-red-400" />
                                        )}
                                </button>
                            );
                        }
                    )}
                </div>

                {/* Explanation */}
                {showExplanation && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            <span className="font-medium text-amber-400">Explanation</span>
                        </div>
                        <p className="text-amber-200/80">{currentQuestion.explanation}</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="sticky bottom-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 p-4">
                <div className="max-w-4xl mx-auto">
                    {!showExplanation ? (
                        <button
                            onClick={handleConfirmAnswer}
                            disabled={selectedOption === null}
                            className={`w-full py-4 rounded-full font-semibold transition-all ${selectedOption === null
                                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                        >
                            Confirm Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-full bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : currentQuestionIndex < quiz.questions.length - 1 ? (
                                <>
                                    Next Question
                                    <ArrowRight className="w-5 h-5" />
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
