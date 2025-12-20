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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Upload Modal */}
            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                                Documents
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Upload and manage your documents
                            </p>
                        </div>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-lg transition-colors font-medium"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Document
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">Loading documents...</div>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No documents yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Upload your first document to get started
                        </p>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-lg transition-colors font-medium"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                         rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                                onClick={() => {
                                    if (doc.status === "completed") {
                                        router.push(`/dashboard/documents/${doc._id}`);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(doc.status)}
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {getStatusText(doc.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {doc.status === "failed" && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReprocess(doc._id);
                                                }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                                title="Reprocess"
                                            >
                                                <RefreshCw className="w-4 h-4 text-gray-400" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDocument(doc._id);
                                            }}
                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 truncate">
                                    {doc.title}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>{doc.fileType || "Document"}</span>
                                    <span>{formatDate(doc.uploadedAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
