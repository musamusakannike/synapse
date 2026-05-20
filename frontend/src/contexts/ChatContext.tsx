"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useChat as useSdkChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatAPI, API_BASE_URL } from "@/lib/api";

export interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
    createdAt?: Date;
    attachments?: Array<{
        type: "course" | "quiz" | "flashcard" | "image";
        data: any;
        metadata?: any;
        name?: string;
        contentType?: string;
        url?: string;
    }>;
    toolInvocations?: any[];
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
    stopStreaming?: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const mapSdkMessagesToMessages = (sdkMessages: any[]): Message[] => {
    return sdkMessages
        .filter((msg) => msg.role !== "system")
        .map((msg) => {
            const attachments = (msg.attachments || []).map((att: any) => ({
                type: (["course", "quiz", "flashcard", "image"].includes(att.type) ? att.type : "course") as "course" | "quiz" | "flashcard" | "image",
                data: att.data || {},
                metadata: att.metadata,
                name: att.name,
                contentType: att.contentType,
                url: att.url,
            }));

            // Parse toolInvocations to find quiz/flashcard/course generation results
            if (msg.toolInvocations) {
                for (const invocation of msg.toolInvocations) {
                    if (invocation.state === "result" && invocation.result) {
                        const res = invocation.result;
                        if (["flashcard", "quiz", "course"].includes(res.type)) {
                            const exists = attachments.some(
                                (att: any) =>
                                    att.type === res.type &&
                                    String(att.data?.flashcardSetId || att.data?.quizId || att.data?.courseId) ===
                                        String(res.data?.flashcardSetId || res.data?.quizId || res.data?.courseId)
                            );
                            if (!exists) {
                                attachments.push({
                                    type: res.type as "course" | "quiz" | "flashcard" | "image",
                                    data: res.data || {},
                                    metadata: res.metadata,
                                });
                            }
                        }
                    }
                }
            }

            return {
                id: msg.id,
                role: msg.role as "user" | "assistant",
                content: msg.content,
                timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                attachments,
                toolInvocations: msg.toolInvocations,
            };
        });
};

export function ChatProvider({ children }: { children: ReactNode }) {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isChatMode, setIsChatMode] = useState(false);

    // Ref to track latest currentChatId inside callbacks without triggering re-renders/re-initializations of useSdkChat
    const currentChatIdRef = useRef<string | null>(currentChatId);
    useEffect(() => {
        currentChatIdRef.current = currentChatId;
    }, [currentChatId]);

    // Initialize Vercel AI SDK useChat
    const {
        messages: sdkMessages,
        setMessages: sdkSetMessages,
        sendMessage: sdkSendMessage,
        regenerate: sdkRegenerate,
        stop: stopStreaming,
        status,
    } = useSdkChat({
        id: currentChatId || undefined,
        transport: new DefaultChatTransport({
            api: `${API_BASE_URL}/chats/temp/message`,
            prepareSendMessagesRequest({ headers, body }) {
                const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
                const authHeaders: Record<string, string> = {};
                if (token) {
                    authHeaders["Authorization"] = `Bearer ${token}`;
                }

                const chatId = currentChatIdRef.current;
                const dynamicApi = chatId
                    ? `${API_BASE_URL}/chats/${chatId}/message`
                    : `${API_BASE_URL}/chats/temp/message`;

                return {
                    api: dynamicApi,
                    headers: {
                        ...headers,
                        ...authHeaders,
                    },
                    body: body || {},
                };
            },
        }),
    });

    const isLoading = status === "submitted" || status === "streaming";

    const messages = mapSdkMessagesToMessages(sdkMessages);

    // Allow manual setting of messages (e.g. for components clearing message state or manual overrides)
    const setMessages = useCallback((newMessages: Message[]) => {
        const mappedUIMessages = newMessages.map((msg) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content,
            parts: [{ type: "text" as const, text: msg.content }],
            createdAt: msg.timestamp || new Date(),
            attachments: msg.attachments?.map((att) => ({
                name: att.type,
                url: att.url || "",
                contentType: att.type,
                type: att.type,
                data: att.data,
                metadata: att.metadata,
            })) || [],
            toolInvocations: msg.toolInvocations,
        }));
        sdkSetMessages(mappedUIMessages as any);
    }, [sdkSetMessages]);

    // Legacy setIsLoading state support for components that expect it
    const setIsLoading = useCallback(() => {}, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        try {
            setIsChatMode(true);

            let chatId = currentChatIdRef.current;
            if (!chatId) {
                const response = await ChatAPI.createNewChat();
                chatId = response.data.chat.id;
                setCurrentChatId(chatId);
                currentChatIdRef.current = chatId;
            }

            if (!chatId) throw new Error("Chat ID is required");

            await sdkSendMessage({ text: content });
        } catch (error) {
            console.error("Send message error:", error);
            throw error;
        }
    }, [sdkSendMessage, isLoading]);

    const openChat = useCallback(async (chatId: string) => {
        try {
            setIsChatMode(true);
            const response = await ChatAPI.getChatWithMessages(chatId);
            const chat = response.data.chat;

            setCurrentChatId(chat._id);

            const loadedMessages = chat.messages.map((msg: any) => ({
                id: msg._id || `msg-${Date.now()}-${Math.random()}`,
                role: msg.role,
                content: msg.content,
                createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                attachments: msg.attachments?.map((att: any) => ({
                    name: att.type,
                    url: "",
                    contentType: att.type,
                    type: att.type,
                    data: att.data,
                    metadata: att.metadata,
                })) || [],
            }));

            sdkSetMessages(loadedMessages);
        } catch (error) {
            console.error("Open chat error:", error);
            throw error;
        }
    }, [sdkSetMessages]);

    const createNewChat = useCallback(() => {
        setCurrentChatId(null);
        sdkSetMessages([]);
        setIsChatMode(false);
    }, [sdkSetMessages]);

    const editMessage = useCallback(async (messageIndex: number, newContent: string) => {
        if (!currentChatId || !newContent.trim()) return;

        try {
            const response = await ChatAPI.editMessage(currentChatId, messageIndex, newContent.trim());

            const updatedMessages = response.data.messages.map((msg: any) => ({
                id: msg._id || `msg-${Date.now()}-${Math.random()}`,
                role: msg.role,
                content: msg.content,
                parts: [{ type: "text" as const, text: msg.content }],
                createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                attachments: msg.attachments?.map((att: any) => ({
                    name: att.type,
                    url: "",
                    contentType: att.type,
                    type: att.type,
                    data: att.data,
                    metadata: att.metadata,
                })) || [],
            }));

            sdkSetMessages(updatedMessages as any);
            await sdkRegenerate();
        } catch (error) {
            console.error("Edit message error:", error);
            throw error;
        }
    }, [currentChatId, sdkSetMessages, sdkRegenerate]);

    const regenerateResponse = useCallback(async (messageIndex: number) => {
        if (!currentChatId) return;

        try {
            const response = await ChatAPI.regenerateResponse(currentChatId, messageIndex);

            const updatedMessages = response.data.messages.map((msg: any) => ({
                id: msg._id || `msg-${Date.now()}-${Math.random()}`,
                role: msg.role,
                content: msg.content,
                parts: [{ type: "text" as const, text: msg.content }],
                createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
                attachments: msg.attachments?.map((att: any) => ({
                    name: att.type,
                    url: "",
                    contentType: att.type,
                    type: att.type,
                    data: att.data,
                    metadata: att.metadata,
                })) || [],
            }));

            sdkSetMessages(updatedMessages as any);
            await sdkRegenerate();
        } catch (error) {
            console.error("Regenerate response error:", error);
            throw error;
        }
    }, [currentChatId, sdkSetMessages, sdkRegenerate]);

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
                stopStreaming,
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
