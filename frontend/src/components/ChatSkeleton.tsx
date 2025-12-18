"use client";

import React from "react";

export default function ChatSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {/* Assistant message skeleton */}
            <div className="flex items-start">
                <div className="max-w-[85%] bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
                </div>
            </div>

            {/* User message skeleton */}
            <div className="flex items-start justify-end">
                <div className="max-w-[85%] bg-blue-100 dark:bg-blue-900 rounded-2xl rounded-br-sm p-4 animate-pulse">
                    <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-40"></div>
                </div>
            </div>

            {/* Assistant message skeleton */}
            <div className="flex items-start">
                <div className="max-w-[85%] bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm p-4 animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-56 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-72 mb-2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                </div>
            </div>
        </div>
    );
}
