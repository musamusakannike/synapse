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
                return "bg-green-50 border border-green-200/50 text-green-700";
            case "medium":
                return "bg-yellow-50 border border-yellow-200/50 text-yellow-750";
            case "hard":
                return "bg-red-50 border border-red-200/50 text-red-755";
            default:
                return "bg-blue-50 border border-blue-200/50 text-blue-700";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-500 text-sm font-semibold">Loading flashcard set...</p>
                </div>
            </div>
        );
    }

    if (!flashcardSet || flashcardSet.flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <HelpCircle className="w-12 h-12 text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-805">No Flashcards Found</h2>
                    <p className="text-gray-550 text-xs font-semibold">We couldn't retrieve the flashcards inside this set.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold text-xs shadow-sm"
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
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-200/60 text-center shadow-xs">
                    <div
                        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isPassing
                            ? "bg-green-50 border border-green-150 text-green-600"
                            : "bg-yellow-50 border border-yellow-150 text-yellow-600"
                            }`}
                    >
                        {isPassing ? (
                            <CheckCircle className="w-8 h-8" />
                        ) : (
                            <RefreshCw className="w-8 h-8 animate-spin-slow" />
                        )}
                    </div>

                    <h1 className="text-base font-bold text-gray-800 mb-1">
                        {isPassing ? "Great Job!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-xs text-gray-500 font-semibold mb-6">{flashcardSet.title}</p>

                    <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-4xl font-extrabold text-blue-650">
                            {knownCards.size}
                        </span>
                        <span className="text-2xl text-gray-300 font-bold">/</span>
                        <span className="text-xl text-gray-400 font-semibold">
                            {flashcardSet.flashcards.length}
                        </span>
                    </div>
                    <p className="text-xs text-gray-550 font-bold mb-6">{score}% Mastered</p>

                    <div className="flex items-center justify-center gap-6 mb-8 p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
                        <div className="text-center">
                            <CheckCircle className="w-5 h-5 text-green-650 mx-auto mb-1" />
                            <p className="text-lg font-bold text-gray-800">{knownCards.size}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Known</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div className="text-center">
                            <HelpCircle className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                            <p className="text-lg font-bold text-gray-800">
                                {flashcardSet.flashcards.length - knownCards.size}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Review</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleRestartStudy}
                            className="w-full py-2.5 rounded-xl border border-blue-200 hover:bg-blue-50/30 text-blue-600 font-bold transition-all text-xs flex items-center justify-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Study Again</span>
                        </button>
                        <button
                            onClick={handleFinishStudy}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-xs"
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
        <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200/60 h-16 flex items-center">
                <div className="w-full max-w-4xl mx-auto px-6 flex items-center gap-4">
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
                        className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex-1">
                        <div className="h-1.5 bg-gray-150 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-center text-[10px] text-gray-400 font-bold mt-1 uppercase">
                            {currentIndex + 1} of {flashcardSet.flashcards.length}
                        </p>
                    </div>

                    <div className="w-8" /> {/* Spacer */}
                </div>
            </header>

            {/* Card Title */}
            <div className="max-w-xl mx-auto w-full px-6 py-4 mt-4 flex items-center justify-between gap-4">
                <h1 className="text-sm font-bold text-gray-805 truncate flex-1" title={flashcardSet.title}>
                    {flashcardSet.title}
                </h1>
                <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(
                        currentCard.difficulty
                    )}`}
                >
                    {currentCard.difficulty}
                </span>
            </div>

            {/* Card Container */}
            <main className="flex-1 flex items-center justify-center px-6 py-4">
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
                            className="absolute inset-0 bg-white rounded-2xl border border-gray-200/60 p-8 flex flex-col items-center justify-center shadow-xs"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <span className="absolute top-4 left-4 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                Question
                            </span>
                            <p className="text-base font-bold text-gray-800 text-center leading-relaxed">
                                {currentCard.front}
                            </p>
                            <span className="absolute bottom-4 text-[10px] text-gray-400 font-semibold bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                                Tap to flip
                            </span>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute inset-0 bg-blue-600 rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm"
                            style={{
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                        >
                            <span className="absolute top-4 left-4 text-[9px] font-bold text-white/70 uppercase tracking-wider">
                                Answer
                            </span>
                            <p className="text-base font-bold text-white text-center leading-relaxed">
                                {currentCard.back}
                            </p>
                            <span className="absolute bottom-4 text-[10px] text-white/70 font-semibold bg-blue-700 border border-blue-500/35 px-3 py-1 rounded-lg">
                                Tap to flip back
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Swipe hints */}
            <div className="flex justify-between max-w-xl mx-auto w-full px-6 py-2">
                <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs">
                    <ArrowLeft className="w-4 h-4 animate-pulse" />
                    <span>Still Learning</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-650 font-bold text-xs">
                    <span>Got It!</span>
                    <ArrowRight className="w-4 h-4 animate-pulse" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 flex justify-center gap-4 max-w-xl mx-auto w-full">
                <button
                    onClick={markAsUnknown}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-55/60 text-red-650 font-bold transition-all text-xs"
                >
                    <X className="w-4 h-4" />
                    <span>Still Learning</span>
                </button>
                <button
                    onClick={markAsKnown}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-55/60 text-green-755 font-bold transition-all text-xs"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Got It!</span>
                </button>
            </div>

            {/* Navigation */}
            <footer className="border-t border-gray-150 p-4">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <button
                        onClick={goToPrevCard}
                        disabled={currentIndex === 0}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentIndex === 0
                            ? "bg-gray-50 border-gray-150 text-gray-350 cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50/50 shadow-xs"
                            }`}
                        aria-label="Previous card"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleFlipCard}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100/50 transition-all font-bold text-xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Flip Card</span>
                    </button>

                    <button
                        onClick={goToNextCard}
                        disabled={currentIndex === flashcardSet.flashcards.length - 1}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${currentIndex === flashcardSet.flashcards.length - 1
                            ? "bg-gray-50 border-gray-150 text-gray-350 cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50/50 shadow-xs"
                            }`}
                        aria-label="Next card"
                    >
                        <ChevronRight className="w-5 h-5" />
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
