"use client";

import React, { useState } from "react";
import { Send, Plus } from "lucide-react";

interface ChatInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (inputText.trim() && !disabled) {
            onSend(inputText.trim());
            setInputText("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Synapse"
                        disabled={disabled}
                        className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 
                     placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none
                     min-h-[60px] max-h-[200px]"
                        rows={1}
                    />
                    <div className="flex items-center justify-between px-3 pb-2">
                        <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            aria-label="Add attachment"
                        >
                            <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                Fast
                            </span>
                            {inputText.trim() && (
                                <button
                                    onClick={handleSend}
                                    disabled={disabled}
                                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600
                           rounded-full transition-colors"
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
