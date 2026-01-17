"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, CheckCircle, HelpCircle, RefreshCw, ChevronLeft, ChevronRight, RotateCcw, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { FlashcardAPI } from "@/lib/api";

interface Flashcard {
    front: string;
    back: string;
    difficulty: "easy" | "medium" | "hard";
    tags?: string[];
}

interface FlashcardSet {
    _id: string;
    title: string;
    description?: string;
    flashcards: Flashcard[];
    studyStats?: {
        totalStudySessions: number;
        averageScore: number;
        lastStudied?: string;
    };
}

export default function FlashcardStudyPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
    const [studyCompleted, setStudyCompleted] = useState(false);

    const sessionStartTime = useRef<number>(Date.now());

    const loadFlashcardSet = useCallback(async () => {
        try {
            const response = await FlashcardAPI.getFlashcardSet(id);
            setFlashcardSet(response.data.flashcardSet);
        } catch (error) {
            console.error("Error loading flashcard set:", error);
            alert("Failed to load flashcards. Please try again.");
            router.back();
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        loadFlashcardSet();
    }, [loadFlashcardSet]);

    const handleFlipCard = useCallback(() => {
        setIsFlipped((prev) => !prev);
    }, []);

    const goToNextCard = useCallback(() => {
        if (!flashcardSet) return;

        if (currentIndex < flashcardSet.flashcards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        } else {
            setStudyCompleted(true);
        }
    }, [currentIndex, flashcardSet]);

    const goToPrevCard = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            setIsFlipped(false);
        }
    }, [currentIndex]);

    const markAsKnown = useCallback(() => {
        setKnownCards((prev) => new Set(prev).add(currentIndex));
        goToNextCard();
    }, [currentIndex, goToNextCard]);

    const markAsUnknown = useCallback(() => {
        setKnownCards((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentIndex);
            return newSet;
        });
        goToNextCard();
    }, [currentIndex, goToNextCard]);

    const handleFinishStudy = useCallback(async () => {
        if (!flashcardSet) return;

        const sessionDuration = Math.round(
            (Date.now() - sessionStartTime.current) / 1000
        );
        const score = (knownCards.size / flashcardSet.flashcards.length) * 100;

        try {
            await FlashcardAPI.updateStudyStats(flashcardSet._id, {
                score,
                sessionDuration,
            });
        } catch (error) {
            console.error("Error updating study stats:", error);
        }

        router.back();
    }, [flashcardSet, knownCards, router]);

    const handleRestartStudy = useCallback(() => {
        setCurrentIndex(0);
        setKnownCards(new Set());
        setStudyCompleted(false);
        setIsFlipped(false);
        sessionStartTime.current = Date.now();
    }, []);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "bg-green-500/20 text-green-400";
            case "medium":
                return "bg-yellow-500/20 text-yellow-400";
            case "hard":
                return "bg-red-500/20 text-red-400";
            default:
                return "bg-blue-500/20 text-blue-400";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-white text-lg">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    if (!flashcardSet || flashcardSet.flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <HelpCircle className="w-12 h-12 text-slate-400" />
                    <p className="text-white text-lg">No flashcards found</p>
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

    if (studyCompleted) {
        const score = Math.round(
            (knownCards.size / flashcardSet.flashcards.length) * 100
        );
        const isPassing = score >= 70;

        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 text-center">
                    <div
                        className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${isPassing ? "bg-green-500/20" : "bg-yellow-500/20"
                            }`}
                    >
                        {isPassing ? (
                            <CheckCircle className="w-16 h-16 text-green-400" />
                        ) : (
                            <RefreshCw className="w-16 h-16 text-yellow-400" />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isPassing ? "Great Job!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-slate-400 mb-6">{flashcardSet.title}</p>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-6xl font-bold text-blue-400">
                            {knownCards.size}
                        </span>
                        <span className="text-4xl text-slate-500">/</span>
                        <span className="text-3xl text-slate-400">
                            {flashcardSet.flashcards.length}
                        </span>
                    </div>
                    <p className="text-xl text-slate-300 mb-8">{score}% Mastered</p>

                    <div className="flex items-center justify-center gap-8 mb-8 p-4 bg-slate-700/30 rounded-xl">
                        <div className="text-center">
                            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-white">{knownCards.size}</p>
                            <p className="text-sm text-slate-400">Known</p>
                        </div>
                        <div className="w-px h-12 bg-slate-600" />
                        <div className="text-center">
                            <HelpCircle className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-white">
                                {flashcardSet.flashcards.length - knownCards.size}
                            </p>
                            <p className="text-sm text-slate-400">Review</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleRestartStudy}
                            className="w-full py-4 rounded-full border-2 border-blue-500 text-blue-400 font-medium flex items-center justify-center gap-2 hover:bg-blue-500/10 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Study Again
                        </button>
                        <button
                            onClick={handleFinishStudy}
                            className="w-full py-4 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = flashcardSet.flashcards[currentIndex];
    const progress =
        ((currentIndex + 1) / flashcardSet.flashcards.length) * 100;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (
                                confirm(
                                    "Are you sure you want to exit? Your progress will be saved."
                                )
                            ) {
                                handleFinishStudy();
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
                            {currentIndex + 1} / {flashcardSet.flashcards.length}
                        </p>
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            {/* Card Title */}
            <div className="max-w-4xl mx-auto w-full px-4 py-4 flex items-center justify-between">
                <h1 className="text-lg font-semibold text-white flex-1 truncate">
                    {flashcardSet.title}
                </h1>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        currentCard.difficulty
                    )}`}
                >
                    {currentCard.difficulty.charAt(0).toUpperCase() +
                        currentCard.difficulty.slice(1)}
                </span>
            </div>

            {/* Card Container */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div
                    className="relative w-full max-w-xl aspect-4/3 cursor-pointer perspective-1000"
                    onClick={handleFlipCard}
                >
                    {/* Card */}
                    <div
                        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                            }`}
                        style={{
                            transformStyle: "preserve-3d",
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                    >
                        {/* Front */}
                        <div
                            className="absolute inset-0 bg-slate-800/80 rounded-2xl border-2 border-blue-500/30 p-8 flex flex-col items-center justify-center"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <span className="absolute top-4 left-4 text-xs text-slate-500 uppercase tracking-wider">
                                Question
                            </span>
                            <p className="text-xl text-white text-center leading-relaxed">
                                {currentCard.front}
                            </p>
                            <span className="absolute bottom-4 text-xs text-slate-500">
                                Tap to flip
                            </span>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute inset-0 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl p-8 flex flex-col items-center justify-center"
                            style={{
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                        >
                            <span className="absolute top-4 left-4 text-xs text-white/60 uppercase tracking-wider">
                                Answer
                            </span>
                            <p className="text-xl text-white text-center leading-relaxed">
                                {currentCard.back}
                            </p>
                            <span className="absolute bottom-4 text-xs text-white/60">
                                Tap to flip back
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Swipe hints */}
            <div className="flex justify-between px-10 py-2">
                <div className="flex items-center gap-2 text-slate-500">
                    <ArrowLeft className="w-5 h-5 text-red-400" />
                    <span className="text-sm">Still Learning</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <span className="text-sm">Got It!</span>
                    <ArrowRight className="w-5 h-5 text-green-400" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-4 flex justify-center gap-4">
                <button
                    onClick={markAsUnknown}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-red-500 bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                >
                    <X className="w-6 h-6" />
                    Still Learning
                </button>
                <button
                    onClick={markAsKnown}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-green-500 bg-green-500/10 text-green-400 font-medium hover:bg-green-500/20 transition-colors"
                >
                    <CheckCircle className="w-6 h-6" />
                    Got It!
                </button>
            </div>

            {/* Navigation */}
            <footer className="border-t border-slate-700/50 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={goToPrevCard}
                        disabled={currentIndex === 0}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${currentIndex === 0
                            ? "bg-slate-700/30 text-slate-600 cursor-not-allowed"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleFlipCard}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Flip Card
                    </button>

                    <button
                        onClick={goToNextCard}
                        disabled={currentIndex === flashcardSet.flashcards.length - 1}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${currentIndex === flashcardSet.flashcards.length - 1
                            ? "bg-slate-700/30 text-slate-600 cursor-not-allowed"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </footer>

            <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
}
