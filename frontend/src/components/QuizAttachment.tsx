"use client";

import React from "react";
import { PenTool } from "lucide-react";

interface QuizAttachmentProps {
    quizId: string;
    title: string;
    questions: any[];
    settings: {
        numberOfQuestions: number;
        difficulty: string;
        includeCalculations: boolean;
        timeLimit?: number;
    };
    onStartQuiz: (quizId: string) => void;
}

export default function QuizAttachment({
    quizId,
    title,
    questions,
    settings,
    onStartQuiz,
}: QuizAttachmentProps) {
    return (
        <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-mobile">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {questions.length} {questions.length === 1 ? "question" : "questions"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                        {settings.difficulty}
                    </span>
                </div>
                {settings.timeLimit && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {settings.timeLimit} minutes
                        </span>
                    </div>
                )}
                {settings.includeCalculations && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                        Includes calculations
                    </div>
                )}
            </div>

            <button
                onClick={() => onStartQuiz(quizId)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors"
            >
                Start Quiz
            </button>
        </div>
    );
}
