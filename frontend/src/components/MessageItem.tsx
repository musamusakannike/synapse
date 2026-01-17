"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import StyledMarkdown from "./StyledMarkdown";
import CourseAttachment from "./CourseAttachment";
import QuizAttachment from "./QuizAttachment";
import FlashcardAttachment from "./FlashcardAttachment";
import ImageAttachment from "./ImageAttachment";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
    attachments?: Array<{
        type: "course" | "quiz" | "flashcard" | "image";
        data: any;
        metadata?: any;
    }>;
}

interface MessageItemProps {
    message: Message;
    index: number;
}

export default function MessageItem({ message, index }: MessageItemProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const isUser = message.role === "user";

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleViewCourse = (courseId: string) => {
        router.push(`/dashboard/courses/${courseId}`);
    };

    const handleStartQuiz = (quizId: string) => {
        router.push(`/dashboard/quizzes/${quizId}`);
    };

    const handleStudyFlashcards = (flashcardSetId: string) => {
        router.push(`/dashboard/flashcards/${flashcardSetId}`);
    };

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-full md:max-w-[85%] rounded-2xl px-4 py-3 ${isUser
                    ? "bg-blue-600 text-white rounded-br-sm max-w-[85%]"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm w-full md:w-auto"
                    }`}
            >
                {isUser ? (
                    <div className="flex items-start gap-2">
                        <p
                            className={`text-base leading-relaxed ${!isExpanded ? "line-clamp-6" : ""
                                }`}
                        >
                            {message.content}
                        </p>
                        {message.content.length > 200 && (
                            <button
                                onClick={handleToggleExpand}
                                className="text-white/80 hover:text-white text-sm shrink-0"
                            >
                                {isExpanded ? "▲" : "▼"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <StyledMarkdown>{message.content}</StyledMarkdown>
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-3 w-full max-w-md">
                                {message.attachments.map((attachment, idx) => {
                                    if (attachment.type === "course") {
                                        return (
                                            <CourseAttachment
                                                key={idx}
                                                courseId={attachment.data.courseId}
                                                title={attachment.data.title}
                                                outline={attachment.data.outline}
                                                onViewCourse={handleViewCourse}
                                            />
                                        );
                                    }
                                    if (attachment.type === "quiz") {
                                        return (
                                            <QuizAttachment
                                                key={idx}
                                                quizId={attachment.data.quizId}
                                                title={attachment.data.title}
                                                questions={attachment.data.questions}
                                                settings={attachment.data.settings}
                                                onStartQuiz={handleStartQuiz}
                                            />
                                        );
                                    }
                                    if (attachment.type === "flashcard") {
                                        return (
                                            <FlashcardAttachment
                                                key={idx}
                                                flashcardSetId={attachment.data.flashcardSetId}
                                                title={attachment.data.title}
                                                flashcards={attachment.data.flashcards}
                                                settings={attachment.data.settings}
                                                onStudyFlashcards={handleStudyFlashcards}
                                            />
                                        );
                                    }
                                    if (attachment.type === "image") {
                                        return (
                                            <ImageAttachment
                                                key={idx}
                                                documentId={attachment.data.documentId}
                                                originalName={attachment.data.originalName}
                                                summary={attachment.data.summary}
                                                extractedText={attachment.data.extractedText}
                                                mimeType={attachment.data.mimeType}
                                                isImage={attachment.data.isImage}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
