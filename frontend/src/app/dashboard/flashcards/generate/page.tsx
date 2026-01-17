"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, BookOpen, Check, Loader2, Sparkles, Layers } from "lucide-react";
import { FlashcardAPI, DocumentAPI, CourseAPI } from "@/lib/api";

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

export default function GenerateFlashcardsPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [sourceType, setSourceType] = useState<SourceType>("topic");
    const [selectedSourceId, setSelectedSourceId] = useState<string>("");
    const [topicContent, setTopicContent] = useState("");
    const [numberOfCards, setNumberOfCards] = useState(20);
    const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
    const [includeDefinitions, setIncludeDefinitions] = useState(true);
    const [includeExamples, setIncludeExamples] = useState(true);

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
            alert("Please enter a flashcard set title");
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
            const flashcardData: any = {
                title: title.trim(),
                description: description.trim() || undefined,
                sourceType,
                settings: {
                    numberOfCards,
                    difficulty,
                    includeDefinitions,
                    includeExamples,
                },
            };

            if (sourceType === "topic") {
                // For topic, we might need to create it differently or use content
                flashcardData.sourceType = "manual";
            } else {
                flashcardData.sourceId = selectedSourceId;
            }

            const response = await FlashcardAPI.generate(flashcardData);
            const flashcardSetId = response.data.flashcardSet?._id || response.data._id;

            if (flashcardSetId) {
                router.push(`/dashboard/flashcards/${flashcardSetId}`);
            } else {
                router.push("/dashboard/flashcards");
            }
        } catch (error: any) {
            console.error("Error generating flashcards:", error);
            alert(error.message || "Failed to generate flashcards");
        } finally {
            setIsGenerating(false);
        }
    }, [
        title,
        description,
        sourceType,
        topicContent,
        selectedSourceId,
        numberOfCards,
        difficulty,
        includeDefinitions,
        includeExamples,
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

    const cardCounts = [10, 15, 20, 25, 30];
    const difficulties: { value: Difficulty; label: string }[] = [
        { value: "easy", label: "Easy" },
        { value: "medium", label: "Medium" },
        { value: "hard", label: "Hard" },
        { value: "mixed", label: "Mixed" },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="flex-1 text-center text-lg font-semibold text-white">
                        Generate Flashcards
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Flashcard Set Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter flashcard set title..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description (Optional)
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the flashcard set..."
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Source Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
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
                                    ? "border-blue-500 bg-blue-500/10"
                                    : "border-slate-700 hover:border-slate-600"
                                    }`}
                            >
                                <Icon
                                    className={`w-6 h-6 ${sourceType === value ? "text-blue-400" : "text-slate-400"
                                        }`}
                                />
                                <span
                                    className={`text-sm font-medium ${sourceType === value ? "text-blue-400" : "text-slate-400"
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Topic Content
                        </label>
                        <textarea
                            value={topicContent}
                            onChange={(e) => setTopicContent(e.target.value)}
                            placeholder="Enter the topic content or paste text to generate flashcards from..."
                            rows={6}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select {sourceType === "document" ? "Document" : "Course"}
                        </label>
                        <button
                            onClick={() => setShowSourcePicker(true)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-left flex items-center justify-between hover:border-slate-600 transition-colors"
                        >
                            <span
                                className={
                                    selectedSourceId ? "text-white" : "text-slate-500"
                                }
                            >
                                {getSelectedSourceName()}
                            </span>
                            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                        </button>
                    </div>
                )}

                {/* Number of Cards */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Number of Cards
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {cardCounts.map((count) => (
                            <button
                                key={count}
                                onClick={() => setNumberOfCards(count)}
                                className={`px-4 py-2 rounded-lg border transition-all ${numberOfCards === count
                                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Difficulty
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {difficulties.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setDifficulty(value)}
                                className={`px-4 py-2 rounded-lg border transition-all ${difficulty === value
                                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Include Definitions Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div>
                        <p className="font-medium text-white">Include Definitions</p>
                        <p className="text-sm text-slate-400">
                            Add definition-based flashcards for key terms
                        </p>
                    </div>
                    <button
                        onClick={() => setIncludeDefinitions(!includeDefinitions)}
                        className={`w-12 h-6 rounded-full transition-colors ${includeDefinitions ? "bg-blue-500" : "bg-slate-600"
                            }`}
                    >
                        <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${includeDefinitions ? "translate-x-6" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                </div>

                {/* Include Examples Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div>
                        <p className="font-medium text-white">Include Examples</p>
                        <p className="text-sm text-slate-400">
                            Add example-based flashcards for better understanding
                        </p>
                    </div>
                    <button
                        onClick={() => setIncludeExamples(!includeExamples)}
                        className={`w-12 h-6 rounded-full transition-colors ${includeExamples ? "bg-blue-500" : "bg-slate-600"
                            }`}
                    >
                        <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${includeExamples ? "translate-x-6" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 transition-all ${isGenerating
                        ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                        : "bg-linear-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Layers className="w-5 h-5" />
                            Generate Flashcards
                        </>
                    )}
                </button>
            </main>

            {/* Source Picker Modal */}
            {showSourcePicker && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">
                                Select {sourceType === "document" ? "Document" : "Course"}
                            </h2>
                            <button
                                onClick={() => setShowSourcePicker(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {isLoadingSources ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                </div>
                            ) : sourceType === "document" ? (
                                documents.length === 0 ? (
                                    <p className="p-8 text-center text-slate-400">
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
                                            className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${selectedSourceId === doc._id ? "bg-blue-500/10" : ""
                                                }`}
                                        >
                                            <FileText className="w-5 h-5 text-slate-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white truncate">{doc.originalName}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {selectedSourceId === doc._id && (
                                                <Check className="w-5 h-5 text-blue-400" />
                                            )}
                                        </button>
                                    ))
                                )
                            ) : courses.length === 0 ? (
                                <p className="p-8 text-center text-slate-400">
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
                                        className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-700/50 transition-colors ${selectedSourceId === course._id ? "bg-blue-500/10" : ""
                                            }`}
                                    >
                                        <BookOpen className="w-5 h-5 text-slate-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white truncate">{course.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(course.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {selectedSourceId === course._id && (
                                            <Check className="w-5 h-5 text-blue-400" />
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
