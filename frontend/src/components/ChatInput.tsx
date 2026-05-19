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
        <div className="border-t border-gray-200/60 bg-[#f9f8f6]">
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Synapse..."
                        disabled={disabled}
                        className="w-full px-4 py-3 bg-transparent text-gray-800 
                     placeholder-gray-400 resize-none outline-none
                     min-h-[60px] max-h-[200px]"
                        rows={1}
                    />
                    <div className="flex items-center justify-between px-3 pb-2">
                        <button
                            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                            aria-label="Add attachment"
                        >
                            <Plus className="w-5 h-5 text-gray-500" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-medium px-3 py-1 bg-gray-50 rounded-xl border border-gray-200/60">
                                DeepSeek V4
                            </span>
                            {inputText.trim() && (
                                <button
                                    onClick={handleSend}
                                    disabled={disabled}
                                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200
                           rounded-xl transition-colors shadow-xs"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
