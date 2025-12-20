"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ChatAPI } from "@/lib/api";

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

interface ChatContextType {
    currentChatId: string | null;
    messages: Message[];
    isLoading: boolean;
    isChatMode: boolean;
    setCurrentChatId: (id: string | null) => void;
    setMessages: (messages: Message[]) => void;
    setIsLoading: (loading: boolean) => void;
    setIsChatMode: (mode: boolean) => void;
    sendMessage: (content: string) => Promise<void>;
    openChat: (chatId: string) => Promise<void>;
    createNewChat: () => void;
    editMessage: (messageIndex: number, newContent: string) => Promise<void>;
    regenerateResponse: (messageIndex: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatMode, setIsChatMode] = useState(false);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        try {
            setIsChatMode(true);
            setMessages((prev) => [...prev, { role: "user", content }]);
            setIsLoading(true);

            let chatId = currentChatId;
            if (!chatId) {
                const response = await ChatAPI.createNewChat();
                chatId = response.data.chat.id;
                setCurrentChatId(chatId);
            }

            if (!chatId) throw new Error("Chat ID is required");
            const response = await ChatAPI.sendMessage(chatId, content);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.data.aiResponse.content,
                    timestamp: new Date(response.data.aiResponse.timestamp),
                    attachments: response.data.aiResponse.attachments?.map((att: any) => ({
                        type: att.type,
                        data: att.data,
                        metadata: att.metadata,
                    })),
                },
            ]);
        } catch (error) {
            console.error("Send message error:", error);
            setMessages((prev) => prev.slice(0, -1));
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentChatId, isLoading]);

    const openChat = useCallback(async (chatId: string) => {
        try {
            setIsLoading(true);
            setIsChatMode(true);

            const response = await ChatAPI.getChatWithMessages(chatId);
            const chat = response.data.chat;

            setCurrentChatId(chat._id);

            const loadedMessages: Message[] = chat.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                attachments: msg.attachments?.map((att: any) => ({
                    type: att.type,
                    data: att.data,
                    metadata: att.metadata,
                })),
            }));

            setMessages(loadedMessages);
        } catch (error) {
            console.error("Open chat error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createNewChat = useCallback(() => {
        setCurrentChatId(null);
        setMessages([]);
        setIsChatMode(false);
        setIsLoading(false);
    }, []);

    const editMessage = useCallback(async (messageIndex: number, newContent: string) => {
        if (!currentChatId || !newContent.trim()) return;

        try {
            setIsLoading(true);
            const response = await ChatAPI.editMessage(currentChatId, messageIndex, newContent.trim());

            setMessages(
                response.data.messages.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.timestamp),
                    attachments: msg.attachments?.map((att: any) => ({
                        type: att.type,
                        data: att.data,
                        metadata: att.metadata,
                    })),
                }))
            );
        } catch (error) {
            console.error("Edit message error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentChatId]);

    const regenerateResponse = useCallback(async (messageIndex: number) => {
        if (!currentChatId) return;

        try {
            setIsLoading(true);
            const response = await ChatAPI.regenerateResponse(currentChatId, messageIndex);

            setMessages(
                response.data.messages.map((msg: any) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.timestamp),
                    attachments: msg.attachments?.map((att: any) => ({
                        type: att.type,
                        data: att.data,
                        metadata: att.metadata,
                    })),
                }))
            );
        } catch (error) {
            console.error("Regenerate response error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [currentChatId]);

    return (
        <ChatContext.Provider
            value={{
                currentChatId,
                messages,
                isLoading,
                isChatMode,
                setCurrentChatId,
                setMessages,
                setIsLoading,
                setIsChatMode,
                sendMessage,
                openChat,
                createNewChat,
                editMessage,
                regenerateResponse,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
