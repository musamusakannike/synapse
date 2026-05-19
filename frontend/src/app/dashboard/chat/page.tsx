"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, User } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useSidebar } from "@/contexts/SidebarContext";
import AnimatedButton from "@/components/AnimatedButton";
import MessageItem from "@/components/MessageItem";
import ChatInput from "@/components/ChatInput";
import ChatSkeleton from "@/components/ChatSkeleton";
import Sidebar from "@/components/Sidebar";
import ProfileModal from "@/components/ProfileModal";
import DocumentUploadModal from "@/components/DocumentUploadModal";

export default function ChatPage() {
    const router = useRouter();
    const { messages, isLoading, isChatMode, sendMessage, createNewChat, openChat } = useChat();
    const { openSidebar, isOpen: sidebarOpen, closeSidebar } = useSidebar();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [greeting, setGreeting] = useState("Hi there");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isDocumentUploadModalOpen, setIsDocumentUploadModalOpen] = useState(false);

    // Auto-open chat from query parameter
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const chatId = params.get("chatId");
            if (chatId) {
                openChat(chatId);
                // Clean query params so refreshing/revisiting doesn't keep reopening it
                const newUrl = window.location.pathname;
                window.history.replaceState({ path: newUrl }, "", newUrl);
            }
        }
    }, [openChat]);

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/users/me");
                const data = await response.json();
                if (data?.name || data?.email) {
                    const nameFromEmail = data.email ? data.email.split("@")[0] : "";
                    const normalizedName = (data.name || nameFromEmail || "").trim();
                    if (normalizedName) {
                        setUserName(normalizedName);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

    // Generate greeting
    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();
        const baseName = userName || "there";

        let timeOfDay: "morning" | "afternoon" | "evening";
        if (hour < 12) {
            timeOfDay = "morning";
        } else if (hour < 18) {
            timeOfDay = "afternoon";
        } else {
            timeOfDay = "evening";
        }

        const options: string[] = [
            `Hi ${baseName}`,
            `Hello ${baseName}`,
            `Welcome back, ${baseName}`,
            timeOfDay === "morning" ? `Good morning, ${baseName}` : "",
            timeOfDay === "afternoon" ? `Good afternoon, ${baseName}` : "",
            timeOfDay === "evening" ? `Good evening, ${baseName}` : "",
        ].filter(Boolean) as string[];

        if (options.length > 0) {
            const index = Math.floor(Math.random() * options.length);
            setGreeting(options[index]);
        }
    }, [userName]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = useCallback(
        async (content: string) => {
            try {
                await sendMessage(content);
            } catch (error) {
                console.error("Failed to send message:", error);
            }
        },
        [sendMessage]
    );

    const shouldShowHomepage = !isChatMode || messages.length === 0;

    return (
        <div className="flex h-screen bg-[#f9f8f6]">
            {/* Sidebar */}
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />

            {/* Profile Modal */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            {/* Document Upload Modal */}
            <DocumentUploadModal
                isOpen={isDocumentUploadModalOpen}
                onClose={() => setIsDocumentUploadModalOpen(false)}
                onUploadSuccess={(documentId) => {
                    console.log("Document uploaded:", documentId);
                    router.push("/dashboard/documents");
                }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <button
                        onClick={openSidebar}
                        className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5 text-gray-700" />
                    </button>

                    <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Synapse</h1>

                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center
                       bg-white hover:bg-gray-50 transition-all shadow-sm"
                        aria-label="User profile"
                    >
                        <User className="w-5 h-5 text-gray-600" />
                    </button>
                </header>

                {/* Content Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
                    {shouldShowHomepage ? (
                        <div className="max-w-3xl mx-auto pt-8">
                            {/* Greeting */}
                            <div className="mb-12 animate-fade-in">
                                <h2 className="text-4xl font-semibold text-gray-950 mb-2">
                                    {greeting}
                                </h2>
                                <p className="text-4xl font-light text-gray-400/80">
                                    Where should we start?
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <AnimatedButton
                                    delay={400}
                                    icon="✍️"
                                    onClick={() => setIsDocumentUploadModalOpen(true)}
                                >
                                    Upload Document
                                </AnimatedButton>
                                <AnimatedButton
                                    delay={500}
                                    icon="🎓"
                                    onClick={() => router.push("/dashboard/courses/generate")}
                                >
                                    Generate a complete course
                                </AnimatedButton>
                                <AnimatedButton
                                    delay={600}
                                    icon="📝"
                                    onClick={() => router.push("/dashboard/quizzes")}
                                >
                                    Take a Quiz
                                </AnimatedButton>
                                <AnimatedButton
                                    delay={700}
                                    icon="🃏"
                                    onClick={() => router.push("/dashboard/flashcards")}
                                >
                                    Create Flashcards
                                </AnimatedButton>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-4">
                            {messages.map((message, index) => (
                                <MessageItem key={index} message={message} index={index} />
                            ))}
                            {isLoading && <ChatSkeleton />}
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
}
