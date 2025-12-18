"use client";

import React from "react";
import { Layers } from "lucide-react";

interface FlashcardAttachmentProps {
    flashcardSetId: string;
    title: string;
    flashcards: {
        front: string;
        back: string;
        difficulty: "easy" | "medium" | "hard";
        tags?: string[];
    }[];
    settings?: {
        numberOfCards: number;
        difficulty: string;
        includeDefinitions: boolean;
        includeExamples: boolean;
    };
    onStudyFlashcards: (flashcardSetId: string) => void;
}

export default function FlashcardAttachment({
    flashcardSetId,
    title,
    flashcards,
    settings,
    onStudyFlashcards,
}: FlashcardAttachmentProps) {
    const difficultyCount = flashcards.reduce(
        (acc, card) => {
            acc[card.difficulty] = (acc[card.difficulty] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-mobile">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {flashcards.length} {flashcards.length === 1 ? "card" : "cards"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex gap-2 flex-wrap">
                    {difficultyCount.easy && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                            {difficultyCount.easy} Easy
                        </span>
                    )}
                    {difficultyCount.medium && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                            {difficultyCount.medium} Medium
                        </span>
                    )}
                    {difficultyCount.hard && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                            {difficultyCount.hard} Hard
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={() => onStudyFlashcards(flashcardSetId)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors"
            >
                Study Flashcards
            </button>
        </div>
    );
}
