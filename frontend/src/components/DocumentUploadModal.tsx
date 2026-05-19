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
                className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-[500px] bg-white rounded-t-3xl sm:rounded-2xl border border-gray-200/80 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-gray-800">
                        Upload Document
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Guidance Text Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">
                            What should I do with this document?
                        </label>
                        <p className="text-xs text-gray-500 font-semibold mb-3">
                            (Optional) Add instructions for how to process this document
                        </p>
                        <textarea
                            value={guidanceText}
                            onChange={(e) => setGuidanceText(e.target.value)}
                            placeholder="e.g., 'Summarize the key points', 'Extract main formulas', 'Create study questions', etc."
                            maxLength={500}
                            disabled={isUploading}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none disabled:opacity-50 text-sm"
                            rows={3}
                        />
                        <div className="text-xs text-gray-400 font-semibold text-right mt-1">
                            {guidanceText.length}/500
                        </div>
                    </div>

                    <p className="text-xs font-semibold text-gray-500">
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
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
                    >
                        <FileText className="w-4 h-4 text-gray-500" />
                        {selectedFile ? "Change File" : "Select File or Image"}
                    </button>

                    {/* Selected File Display */}
                    {selectedFile && (
                        <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-blue-900 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-blue-600 font-medium">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200/50 rounded-xl">
                            <p className="text-xs font-semibold text-red-650">{error}</p>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm text-sm"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                <span>Upload Document</span>
                            </>
                        )}
                    </button>

                    {/* Cancel Button */}
                    <button
                        onClick={handleClose}
                        disabled={isUploading}
                        className="w-full py-2 text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50 font-semibold text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
