"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, BookOpen, Check, Loader2, Sparkles } from "lucide-react";
import { QuizAPI, DocumentAPI, CourseAPI } from "@/lib/api";

interface DocumentItem {
    _id: string;
    originalName: string;
    createdAt: string;
    processingStatus: string;
}

interface CourseItem {
    _id: string;
    title: string;
    createdAt: string;
    status: string;
}

type SourceType = "topic" | "document" | "course";
type Difficulty = "easy" | "medium" | "hard" | "mixed";

export default function GenerateQuizPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [sourceType, setSourceType] = useState<SourceType>("topic");
    const [selectedSourceId, setSelectedSourceId] = useState<string>("");
    const [topicContent, setTopicContent] = useState("");
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
    const [includeCalculations, setIncludeCalculations] = useState(false);

    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoadingSources, setIsLoadingSources] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSourcePicker, setShowSourcePicker] = useState(false);

    // Fetch documents and courses
    useEffect(() => {
        const fetchSources = async () => {
            setIsLoadingSources(true);
            try {
                const [docsRes, coursesRes] = await Promise.all([
                    DocumentAPI.list(),
                    CourseAPI.list(),
                ]);
                setDocuments(docsRes.data.documents || []);
                setCourses(coursesRes.data.courses || []);
            } catch (error) {
                console.error("Error fetching sources:", error);
            } finally {
                setIsLoadingSources(false);
            }
        };

        fetchSources();
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!title.trim()) {
            alert("Please enter a quiz title");
            return;
        }

        if (sourceType === "topic" && !topicContent.trim()) {
            alert("Please enter the topic content");
            return;
        }

        if ((sourceType === "document" || sourceType === "course") && !selectedSourceId) {
            alert(`Please select a ${sourceType}`);
            return;
        }

        setIsGenerating(true);
        try {
            const quizData: any = {
                title: title.trim(),
                sourceType,
                settings: {
                    numberOfQuestions,
                    difficulty,
                    includeCalculations,
                },
            };

            if (sourceType === "topic") {
                quizData.content = topicContent;
            } else {
                quizData.sourceId = selectedSourceId;
            }

            const response = await QuizAPI.create(quizData);
            const quizId = response.data.quiz?._id || response.data._id;

            if (quizId) {
                router.push(`/dashboard/quizzes/${quizId}`);
            } else {
                router.push("/dashboard/quizzes");
            }
        } catch (error: any) {
            console.error("Error generating quiz:", error);
            alert(error.message || "Failed to generate quiz");
        } finally {
            setIsGenerating(false);
        }
    }, [
        title,
        sourceType,
        topicContent,
        selectedSourceId,
        numberOfQuestions,
        difficulty,
        includeCalculations,
        router,
    ]);

    const getSelectedSourceName = () => {
        if (sourceType === "document") {
            const doc = documents.find((d) => d._id === selectedSourceId);
            return doc?.originalName || "Select a document";
        }
        if (sourceType === "course") {
            const course = courses.find((c) => c._id === selectedSourceId);
            return course?.title || "Select a course";
        }
        return "";
    };

    const questionCounts = [5, 10, 15, 20, 25];
    const difficulties: { value: Difficulty; label: string }[] = [
        { value: "easy", label: "Easy" },
        { value: "medium", label: "Medium" },
        { value: "hard", label: "Hard" },
        { value: "mixed", label: "Mixed" },
    ];

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Back</span>
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Generate Quiz</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 sm:p-8 shadow-sm">
                    {/* Title Input */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Quiz Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter quiz title..."
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Source Type Selection */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Source Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(
                                [
                                    { value: "topic", label: "Topic", icon: Sparkles },
                                    { value: "document", label: "Document", icon: FileText },
                                    { value: "course", label: "Course", icon: BookOpen },
                                ] as const
                            ).map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setSourceType(value);
                                        setSelectedSourceId("");
                                    }}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${sourceType === value
                                            ? "border-blue-600 bg-blue-50/50"
                                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-gray-300"
                                        }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 ${sourceType === value ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
                                            }`}
                                    />
                                    <span
                                        className={`text-sm font-semibold ${sourceType === value ? "text-blue-600" : "text-gray-600 dark:text-gray-400"
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Source Content/Selection */}
                    {sourceType === "topic" ? (
                        <div>
                            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Topic Content
                            </label>
                            <textarea
                                value={topicContent}
                                onChange={(e) => setTopicContent(e.target.value)}
                                placeholder="Enter the topic content or paste text to generate quiz questions from..."
                                rows={6}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Select {sourceType === "document" ? "Document" : "Course"}
                            </label>
                            <button
                                onClick={() => setShowSourcePicker(true)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-colors"
                            >
                                <span
                                    className={`text-sm font-medium ${selectedSourceId ? "text-gray-800 dark:text-gray-200 font-semibold" : "text-gray-400"}`}
                                >
                                    {getSelectedSourceName()}
                                </span>
                                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
                            </button>
                        </div>
                    )}

                    {/* Number of Questions */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Number of Questions
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {questionCounts.map((count) => (
                                <button
                                    key={count}
                                    onClick={() => setNumberOfQuestions(count)}
                                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${numberOfQuestions === count
                                            ? "border-blue-600 bg-blue-50/50 text-blue-600"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-900 hover:border-gray-300"
                                        }`}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Difficulty
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {difficulties.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setDifficulty(value)}
                                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${difficulty === value
                                            ? "border-blue-600 bg-blue-50/50 text-blue-600"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-900 hover:border-gray-300"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Include Calculations Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Include Calculations</p>
                            <p className="text-xs sm:text-sm text-gray-550">
                                Add questions that require mathematical calculations
                            </p>
                        </div>
                        <button
                            onClick={() => setIncludeCalculations(!includeCalculations)}
                            className={`w-12 h-6 rounded-full transition-colors ${includeCalculations ? "bg-blue-600" : "bg-gray-250"
                                }`}
                        >
                            <div
                                className={`w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-xs transition-transform ${includeCalculations ? "translate-x-6" : "translate-x-0.5"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${isGenerating
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Quiz...</span>
                            </>
                        ) : (
                            "Generate Quiz"
                        )}
                    </button>
                </div>
            </main>

            {/* Source Picker Modal */}
            {showSourcePicker && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 border-b border-gray-150 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                Select {sourceType === "document" ? "Document" : "Course"}
                            </h2>
                            <button
                                onClick={() => setShowSourcePicker(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 p-1 rounded-lg hover:bg-gray-50 dark:bg-slate-800"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                            {isLoadingSources ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                </div>
                            ) : sourceType === "document" ? (
                                documents.length === 0 ? (
                                    <p className="p-8 text-center text-gray-400 text-sm font-medium">
                                        No documents found
                                    </p>
                                ) : (
                                    documents.map((doc) => (
                                        <button
                                            key={doc._id}
                                            onClick={() => {
                                                setSelectedSourceId(doc._id);
                                                setShowSourcePicker(false);
                                            }}
                                            className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 dark:bg-slate-800 transition-colors ${selectedSourceId === doc._id ? "bg-blue-50/30" : ""
                                                }`}
                                        >
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-800 dark:text-gray-200 font-semibold truncate text-sm">{doc.originalName}</p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {selectedSourceId === doc._id && (
                                                <Check className="w-4 h-4 text-blue-600" />
                                            )}
                                        </button>
                                    ))
                                )
                            ) : courses.length === 0 ? (
                                <p className="p-8 text-center text-gray-400 text-sm font-medium">
                                    No courses found
                                </p>
                            ) : (
                                courses.map((course) => (
                                    <button
                                        key={course._id}
                                        onClick={() => {
                                            setSelectedSourceId(course._id);
                                            setShowSourcePicker(false);
                                        }}
                                        className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 dark:bg-slate-800 transition-colors ${selectedSourceId === course._id ? "bg-blue-50/30" : ""
                                            }`}
                                    >
                                        <BookOpen className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-800 dark:text-gray-200 font-semibold truncate text-sm">{course.title}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(course.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {selectedSourceId === course._id && (
                                            <Check className="w-4 h-4 text-blue-600" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
