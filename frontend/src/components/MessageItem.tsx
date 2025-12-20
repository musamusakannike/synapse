"use client";

import React, { useState } from "react";
import StyledMarkdown from "./StyledMarkdown";

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
    const [isExpanded, setIsExpanded] = useState(false);
    const isUser = message.role === "user";

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${isUser
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
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
                                className="text-white/80 hover:text-white text-sm flex-shrink-0"
                            >
                                {isExpanded ? "▲" : "▼"}
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <StyledMarkdown>{message.content}</StyledMarkdown>
                        {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {message.attachments.map((attachment, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                    >
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)} Attachment
                                        </p>
                                        {attachment.data.title && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {attachment.data.title}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
