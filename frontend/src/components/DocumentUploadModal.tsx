"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText } from "lucide-react";

interface DocumentUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess?: (documentId: string) => void;
    initialGuidanceText?: string;
}

export default function DocumentUploadModal({
    isOpen,
    onClose,
    onUploadSuccess,
    initialGuidanceText = "",
}: DocumentUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [guidanceText, setGuidanceText] = useState(initialGuidanceText);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validDocumentTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ];

    const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/bmp",
        "image/tiff",
    ];

    const validDocumentExtensions = [".pdf", ".docx", ".txt"];
    const validImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file type
        const fileName = file.name.toLowerCase();
        const hasValidDocumentExtension = validDocumentExtensions.some((ext) =>
            fileName.endsWith(ext)
        );
        const hasValidImageExtension = validImageExtensions.some((ext) =>
            fileName.endsWith(ext)
        );
        const hasValidDocumentMimeType = validDocumentTypes.includes(file.type);
        const hasValidImageMimeType = validImageTypes.includes(file.type);

        const isDocument = hasValidDocumentExtension || hasValidDocumentMimeType;
        const isImage = hasValidImageExtension || hasValidImageMimeType;

        if (!isDocument && !isImage) {
            setError(
                "Invalid file type. Please select a PDF, DOCX, TXT file, or an image (JPEG, PNG, WebP, GIF, BMP, TIFF)"
            );
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setError("File too large. Please select a file under 10MB");
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setIsUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", selectedFile);

            if (guidanceText.trim()) {
                formData.append("prompt", guidanceText.trim());
            }

            const response = await fetch("https://synapse-tzlh.onrender.com/api/documents", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Upload failed");
            }

            const data = await response.json();
            const documentId = data.document._id;

            // Reset state
            setSelectedFile(null);
            setGuidanceText(initialGuidanceText);
            setIsUploading(false);

            // Notify parent
            if (onUploadSuccess) {
                onUploadSuccess(documentId);
            }

            // Close modal
            onClose();

            // Show success message
            alert("Upload Successful! Your document is being processed. You'll be notified when it's ready.");
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload document. Please try again.");
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        if (mb < 1) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${mb.toFixed(1)} MB`;
    };

    const handleClose = () => {
        if (!isUploading) {
            setSelectedFile(null);
            setGuidanceText(initialGuidanceText);
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center sm:justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-[500px] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <h2 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                        Upload Document
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Guidance Text Input */}
                    <div>
                        <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                            What should I do with this document?
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            (Optional) Add instructions for how to process this document
                        </p>
                        <textarea
                            value={guidanceText}
                            onChange={(e) => setGuidanceText(e.target.value)}
                            placeholder="e.g., 'Summarize the key points', 'Extract main formulas', 'Create study questions', etc."
                            maxLength={500}
                            disabled={isUploading}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                       rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50"
                            rows={3}
                        />
                        <div className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
                            {guidanceText.length}/500
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select a PDF, DOCX, TXT file, or an image (JPEG, PNG, WebP, GIF, BMP, TIFF) to upload
                    </p>

                    {/* File Selection */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 
                     hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 
                     rounded-xl transition-colors disabled:opacity-50"
                    >
                        <FileText className="w-5 h-5" />
                        {selectedFile ? "Change File" : "📄 Select File or Image"}
                    </button>

                    {/* Selected File Display */}
                    {selectedFile && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 
                     text-white font-medium rounded-xl transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 
                     disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Upload
                            </>
                        )}
                    </button>

                    {/* Cancel Button */}
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="w-full py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 
                     transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
