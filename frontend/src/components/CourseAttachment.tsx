"use client";

import React from "react";
import { BookOpen } from "lucide-react";

interface CourseAttachmentProps {
    courseId: string;
    title: string;
    outline: {
        section: string;
        subsections?: string[];
    }[];
    onViewCourse: (courseId: string) => void;
}

export default function CourseAttachment({
    courseId,
    title,
    outline,
    onViewCourse,
}: CourseAttachmentProps) {
    return (
        <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-mobile">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {outline.length} {outline.length === 1 ? "section" : "sections"}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {outline.slice(0, 3).map((item, index) => (
                    <div key={index} className="text-sm">
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                            {index + 1}. {item.section}
                        </p>
                        {item.subsections && item.subsections.length > 0 && (
                            <p className="text-gray-500 dark:text-gray-500 text-xs ml-4 mt-1">
                                {item.subsections.length} subsections
                            </p>
                        )}
                    </div>
                ))}
                {outline.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        +{outline.length - 3} more sections
                    </p>
                )}
            </div>

            <button
                onClick={() => onViewCourse(courseId)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors"
            >
                View Course
            </button>
        </div>
    );
}
