"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Clock, CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";
import { DocumentAPI } from "@/lib/api";
import DocumentUploadModal from "@/components/DocumentUploadModal";

interface Document {
    _id: string;
    title: string;
    status: "processing" | "completed" | "failed";
    uploadedAt: string;
    fileType?: string;
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await DocumentAPI.list();
            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = (documentId: string) => {
        console.log("Document uploaded successfully:", documentId);
        fetchDocuments(); // Refresh the list
    };

    const handleDeleteDocument = async (documentId: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            await DocumentAPI.delete(documentId);
            fetchDocuments();
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Failed to delete document");
        }
    };

    const handleReprocess = async (documentId: string) => {
        try {
            await DocumentAPI.reprocess(documentId);
            alert("Document reprocessing started");
            fetchDocuments();
        } catch (error) {
            console.error("Error reprocessing document:", error);
            alert("Failed to reprocess document");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "processing":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "failed":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "processing":
                return "Processing...";
            case "completed":
                return "Ready";
            case "failed":
                return "Failed";
            default:
                return "Unknown";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Upload Modal */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                Documents
                            </h1>
                            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Upload and manage your documents for reference
                            </p>
                        </div>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-xl transition-all font-semibold shadow-sm text-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading documents...</div>
                        </div>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20 max-w-md mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-8 shadow-sm">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-850 mb-2">
                            No documents yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">
                            Upload your first document to reference in conversations and quizzes
                        </p>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-xl transition-all font-semibold shadow-sm text-sm"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group flex flex-col justify-between h-[160px]"
                                onClick={() => {
                                    if (doc.status === "completed") {
                                        router.push(`/dashboard/documents/${doc._id}`);
                                    }
                                }}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-blue-50 rounded-xl">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-800 px-2.5 py-1 rounded-lg">
                                            {getStatusIcon(doc.status)}
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {getStatusText(doc.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors mb-1 truncate" title={doc.title}>
                                        {doc.title}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between text-xs font-semibold text-gray-450 border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-md uppercase tracking-wider text-[10px]">
                                        {doc.fileType || "PDF"}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span>{formatDate(doc.uploadedAt)}</span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {doc.status === "failed" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReprocess(doc._id);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 dark:bg-slate-800 rounded-lg"
                                                    title="Reprocess"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteDocument(doc._id);
                                                }}
                                                className="p-1 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
