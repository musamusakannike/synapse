"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface CourseGenerationData {
    title: string;
    description?: string;
    settings: {
        level: "beginner" | "intermediate" | "advanced";
        includeExamples: boolean;
        includePracticeQuestions: boolean;
        detailLevel: "basic" | "moderate" | "comprehensive";
    };
}

export default function GenerateCoursePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
    const [includeExamples, setIncludeExamples] = useState(true);
    const [includePracticeQuestions, setIncludePracticeQuestions] = useState(false);
    const [detailLevel, setDetailLevel] = useState<"basic" | "moderate" | "comprehensive">("moderate");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCourse = async () => {
        if (!title.trim()) {
            setError("Please enter a course title");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const courseData: CourseGenerationData = {
                title: title.trim(),
                description: description.trim() || undefined,
                settings: {
                    level,
                    includeExamples,
                    includePracticeQuestions,
                    detailLevel,
                },
            };

            const response = await fetch("https://synapse-tzlh.onrender.com/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify(courseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to generate course");
            }

            const data = await response.json();
            const courseId = data._id;

            // Navigate to course progress page
            router.push(`/dashboard/courses/${courseId}`);
        } catch (err: any) {
            console.error("Course generation error:", err);
            setError(err.message || "Failed to generate course. Please try again.");
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <div className="bg-white border-b border-gray-200/60 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                            aria-label="Go back"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">
                            Generate Course
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-36">
                {/* Title Section */}
                <div className="mb-10 animate-fade-in">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Your Course
                    </h2>
                    <p className="text-lg font-medium text-gray-500">
                        Let's build a custom-tailored course for you
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-8 animate-fade-in bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/60 shadow-sm">
                    {/* Course Title */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                            Course Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Introduction to Machine Learning"
                            maxLength={100}
                            disabled={isGenerating}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-all"
                        />
                    </div>

                    {/* Course Description */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide additional context about what this course should cover..."
                            maxLength={500}
                            rows={4}
                            disabled={isGenerating}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none disabled:opacity-50 transition-all"
                        />
                    </div>

                    {/* Difficulty Level */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                            Difficulty Level
                        </label>
                        <div className="space-y-3">
                            <LevelOption
                                value="beginner"
                                label="Beginner"
                                description="Basic concepts and fundamentals"
                                selected={level === "beginner"}
                                onClick={() => setLevel("beginner")}
                                disabled={isGenerating}
                            />
                            <LevelOption
                                value="intermediate"
                                label="Intermediate"
                                description="Moderate complexity with practical examples"
                                selected={level === "intermediate"}
                                onClick={() => setLevel("intermediate")}
                                disabled={isGenerating}
                            />
                            <LevelOption
                                value="advanced"
                                label="Advanced"
                                description="In-depth analysis and complex topics"
                                selected={level === "advanced"}
                                onClick={() => setLevel("advanced")}
                                disabled={isGenerating}
                            />
                        </div>
                    </div>

                    {/* Detail Level */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                            Content Detail Level
                        </label>
                        <div className="space-y-3">
                            <LevelOption
                                value="basic"
                                label="Basic"
                                description="Concise explanations and key points"
                                selected={detailLevel === "basic"}
                                onClick={() => setDetailLevel("basic")}
                                disabled={isGenerating}
                            />
                            <LevelOption
                                value="moderate"
                                label="Moderate"
                                description="Balanced depth with good coverage"
                                selected={detailLevel === "moderate"}
                                onClick={() => setDetailLevel("moderate")}
                                disabled={isGenerating}
                            />
                            <LevelOption
                                value="comprehensive"
                                label="Comprehensive"
                                description="Detailed explanations and extensive coverage"
                                selected={detailLevel === "comprehensive"}
                                onClick={() => setDetailLevel("comprehensive")}
                                disabled={isGenerating}
                            />
                        </div>
                    </div>

                    {/* Additional Features */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 mb-2">
                            Additional Features
                        </label>
                        <div className="space-y-4">
                            <ToggleOption
                                label="Include Examples"
                                description="Add practical examples and use cases"
                                value={includeExamples}
                                onChange={() => setIncludeExamples(!includeExamples)}
                                disabled={isGenerating}
                            />
                            <ToggleOption
                                label="Practice Questions"
                                description="Include questions for self-assessment"
                                value={includePracticeQuestions}
                                onChange={() => setIncludePracticeQuestions(!includePracticeQuestions)}
                                disabled={isGenerating}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer with Generate Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/60 p-4 sm:p-6 z-20">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleGenerateCourse}
                        disabled={!title.trim() || isGenerating}
                        className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl 
                     transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                     transform active:scale-[0.98] shadow-sm text-center"
                    >
                        {isGenerating ? "🎓 Generating Course..." : "🎓 Generate Course"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Level Option Component
function LevelOption({
    value,
    label,
    description,
    selected,
    onClick,
    disabled,
}: {
    value: string;
    label: string;
    description: string;
    selected: boolean;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-4 border rounded-xl text-left transition-all disabled:opacity-50 ${selected
                ? "border-blue-600 bg-blue-50/50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
        >
            <div className={`text-base font-semibold mb-1 ${selected ? "text-blue-600" : "text-gray-800"}`}>
                {label}
            </div>
            <div className={`text-sm ${selected ? "text-blue-500" : "text-gray-500"}`}>
                {description}
            </div>
        </button>
    );
}

// Toggle Option Component
function ToggleOption({
    label,
    description,
    value,
    onChange,
    disabled,
}: {
    label: string;
    description: string;
    value: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className="w-full flex items-center justify-between p-4 border border-gray-200 
               bg-white rounded-xl hover:border-gray-300 hover:bg-gray-50 
               transition-all disabled:opacity-50"
        >
            <div className="flex-1 text-left">
                <div className="text-base font-semibold text-gray-800 mb-1">
                    {label}
                </div>
                <div className="text-sm text-gray-500">
                    {description}
                </div>
            </div>
            <div
                className={`relative w-12 h-6 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-250"
                    }`}
            >
                <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform ${value ? "translate-x-6" : "translate-x-0"
                        }`}
                />
            </div>
        </button>
    );
}
