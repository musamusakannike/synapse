"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface ImageAttachmentProps {
    documentId: string;
    originalName: string;
    summary: string;
    extractedText: string;
    mimeType: string;
    isImage: boolean;
}

export default function ImageAttachment({
    documentId,
    originalName,
    summary,
    extractedText,
    mimeType,
    isImage,
}: ImageAttachmentProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-mobile">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                        {originalName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        {isImage ? "Image" : "Document"}
                    </p>
                </div>
            </div>

            {summary && (
                <div className="mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
                </div>
            )}

            {extractedText && (
                <div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        {isExpanded ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Hide extracted text
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Show extracted text
                            </>
                        )}
                    </button>
                    {isExpanded && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-60 overflow-y-auto">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {extractedText}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
