"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, FileText, MessageSquare, Trash2, Search, Loader2 } from "lucide-react";
import { DocumentAPI, ChatAPI } from "@/lib/api";

interface DocumentData {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    extractedText?: string;
    summary?: string;
    chatId?: string;
    processingStatus: "pending" | "processing" | "completed" | "failed";
    createdAt: string;
}

export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [doc, setDoc] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDocument();
        }
    }, [id]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const response = await DocumentAPI.get(id);
            setDoc(response.data.document);
        } catch (error) {
            console.error("Error fetching document details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            await DocumentAPI.delete(id);
            router.push("/dashboard/documents");
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete document");
        }
    };

    const handleStartChat = async () => {
        if (!doc || isCreatingChat) return;
        try {
            setIsCreatingChat(true);
            // Create a new chat tied to the document
            const response = await ChatAPI.createNewChat(
                `Chat: ${doc.originalName}`,
                "document",
                doc._id
            );
            const newChatId = response.data.chat.id;
            // Redirect to chat with the new chatId
            router.push(`/dashboard/chat?chatId=${newChatId}`);
        } catch (error) {
            console.error("Error creating chat for document:", error);
            alert("Failed to start chat session");
        } finally {
            setIsCreatingChat(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        if (mb < 1) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${mb.toFixed(1)} MB`;
    };

    // Helper to highlight search text
    const highlightedText = useMemo(() => {
        if (!doc?.extractedText) return null;
        if (!searchQuery.trim()) {
            return <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">{doc.extractedText}</div>;
        }

        const query = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"); // escape regex
        const regex = new RegExp(`(${query})`, "gi");
        const parts = doc.extractedText.split(regex);

        return (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <mark key={i} className="bg-yellow-100 text-yellow-900 px-0.5 rounded font-medium">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </div>
        );
    }, [doc?.extractedText, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-800 text-lg font-semibold animate-pulse">Loading document contents...</p>
                </div>
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <FileText className="w-12 h-12 text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-800">Document Not Found</h2>
                    <p className="text-gray-550 text-sm">We couldn't retrieve the details for this document.</p>
                    <button
                        onClick={() => router.push("/dashboard/documents")}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm text-sm"
                    >
                        Back to Documents
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200/60 h-16 flex items-center">
                <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => router.push("/dashboard/documents")}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Documents</span>
                        </button>
                        <div className="h-4 w-px bg-gray-200" />
                        <h1 className="text-base font-bold text-gray-800 truncate" title={doc.originalName}>
                            {doc.originalName}
                        </h1>
                    </div>

                    <button
                        onClick={handleDelete}
                        className="p-2 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Document"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Content body split panel */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto flex items-stretch">
                {/* Left Metadata panel */}
                <aside className="w-80 border-r border-gray-200/60 bg-white flex flex-col shrink-0 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto p-6 space-y-6">
                    <div className="flex flex-col items-center text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="p-3.5 bg-blue-50 rounded-2xl mb-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-800 max-w-full truncate" title={doc.originalName}>
                            {doc.originalName}
                        </h2>
                        <span className="text-xs font-semibold text-gray-400 mt-1 uppercase">
                            {formatFileSize(doc.size)} • {doc.mimeType.split("/")[1] || "PDF"}
                        </span>
                    </div>

                    {/* AI Summary Section */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Summary</h3>
                        {doc.summary ? (
                            <p className="text-xs text-gray-650 leading-relaxed font-semibold bg-blue-50/20 border border-blue-50/40 p-4 rounded-xl">
                                {doc.summary}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No summary generated for this document.</p>
                        )}
                    </div>

                    {/* Chat Action */}
                    <div className="pt-4 border-t border-gray-100">
                        <button
                            onClick={handleStartChat}
                            disabled={isCreatingChat || doc.processingStatus !== "completed"}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm disabled:opacity-50"
                        >
                            {isCreatingChat ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Starting Chat...</span>
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Chat with Document</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Right Document Text Reader */}
                <main className="flex-1 bg-[#f9f8f6] p-8 md:p-12 overflow-y-auto h-[calc(100vh-64px)]">
                    <div className="max-w-3xl mx-auto bg-white border border-gray-200/60 rounded-2xl p-8 sm:p-10 shadow-xs min-h-full flex flex-col">
                        {/* Search Input bar */}
                        <div className="flex items-center gap-3 border-b border-gray-150 pb-6 mb-8">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search document text..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Document Content View */}
                        <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2">
                            {doc.extractedText ? (
                                highlightedText
                            ) : (
                                <p className="text-gray-400 italic text-center py-20 text-sm">No text extracted from this document.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
