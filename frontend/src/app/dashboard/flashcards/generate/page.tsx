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
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60 h-16 flex items-center">
                <div className="w-full max-w-2xl mx-auto px-6 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-base font-bold text-gray-800 dark:text-gray-200">
                        Generate Flashcards
                    </h1>
                    <div className="w-8" />
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
                {/* Title Input */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Flashcard Set Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Immunology Midterm Prep"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-xs font-semibold shadow-xs"
                    />
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Description (Optional)
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Chapter 4 to 8 vocabulary and core concepts"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-xs font-semibold shadow-xs"
                    />
                </div>

                {/* Source Type Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Source Material
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {(
                            [
                                { value: "topic", label: "Custom Topic", icon: Sparkles },
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
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer shadow-xs ${sourceType === value
                                    ? "border-blue-600 bg-blue-50/50 text-blue-600"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                                    }`}
                            >
                                <Icon
                                    className="w-5 h-5"
                                />
                                <span className="text-xs font-bold">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Source Content/Selection */}
                {sourceType === "topic" ? (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Topic Content
                        </label>
                        <textarea
                            value={topicContent}
                            onChange={(e) => setTopicContent(e.target.value)}
                            placeholder="Enter the topic keywords, content description, or paste study text to extract flashcards..."
                            rows={5}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-xl text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-xs font-semibold shadow-xs resize-none"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Select Source {sourceType === "document" ? "Document" : "Course"}
                        </label>
                        <button
                            onClick={() => setShowSourcePicker(true)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-xl text-left flex items-center justify-between hover:border-gray-300 transition-all font-semibold text-xs text-gray-800 dark:text-gray-200 shadow-xs cursor-pointer"
                        >
                            <span className={selectedSourceId ? "text-gray-850" : "text-gray-400"}>
                                {selectedSourceId ? getSelectedSourceName() : `Select a ${sourceType}...`}
                            </span>
                            <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                        </button>
                    </div>
                )}

                {/* Number of Cards */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Number of Cards
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {cardCounts.map((count) => (
                            <button
                                key={count}
                                onClick={() => setNumberOfCards(count)}
                                className={`px-4 py-2 rounded-xl border transition-all text-xs shadow-xs cursor-pointer ${numberOfCards === count
                                    ? "border-blue-600 bg-blue-50/50 text-blue-600 font-bold"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 font-semibold"
                                    }`}
                            >
                                {count} cards
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Difficulty Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {difficulties.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setDifficulty(value)}
                                className={`px-3 py-2 rounded-xl border transition-all text-xs shadow-xs cursor-pointer ${difficulty === value
                                    ? "border-blue-600 bg-blue-50/50 text-blue-600 font-bold"
                                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:border-gray-300 font-semibold"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Include Definitions Toggle */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-xs">
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">Include Definitions</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Add definition-based flashcards for core vocabulary and terminology
                        </p>
                    </div>
                    <button
                        onClick={() => setIncludeDefinitions(!includeDefinitions)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${includeDefinitions ? "bg-blue-600" : "bg-gray-200"
                            }`}
                    >
                        <div
                            className={`w-4.5 h-4.5 bg-white dark:bg-slate-900 rounded-full absolute top-0.5 transition-transform ${includeDefinitions ? "translate-x-5" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                </div>

                {/* Include Examples Toggle */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-xs">
                    <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">Include Examples</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Create scenario or context-based flashcards to reinforce understanding
                        </p>
                    </div>
                    <button
                        onClick={() => setIncludeExamples(!includeExamples)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer relative ${includeExamples ? "bg-blue-600" : "bg-gray-200"
                            }`}
                    >
                        <div
                            className={`w-4.5 h-4.5 bg-white dark:bg-slate-900 rounded-full absolute top-0.5 transition-transform ${includeExamples ? "translate-x-5" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full py-3 rounded-xl font-bold transition-all text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${isGenerating
                        ? "bg-gray-150 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating Sets...</span>
                        </>
                    ) : (
                        <>
                            <Layers className="w-4 h-4" />
                            <span>Generate Flashcard Set</span>
                        </>
                    )}
                </button>
            </main>

            {/* Source Picker Modal */}
            {showSourcePicker && (
                <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-md">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-gray-805 uppercase tracking-wider">
                                Select {sourceType === "document" ? "Document" : "Course"}
                            </h2>
                            <button
                                onClick={() => setShowSourcePicker(false)}
                                className="text-gray-400 hover:text-gray-700 dark:text-gray-300 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                            {isLoadingSources ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                </div>
                            ) : sourceType === "document" ? (
                                documents.length === 0 ? (
                                    <p className="p-8 text-center text-xs text-gray-400 font-semibold">
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
                                            className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 dark:bg-slate-800/50 transition-colors ${selectedSourceId === doc._id ? "bg-blue-50/30" : ""
                                                }`}
                                        >
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{doc.originalName}</p>
                                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {selectedSourceId === doc._id && (
                                                <Check className="w-4 h-4 text-blue-600" />
                                            )}
                                        </button>
                                    ))
                                )
                            ) : courses.length === 0 ? (
                                <p className="p-8 text-center text-xs text-gray-400 font-semibold">
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
                                        className={`w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 dark:bg-slate-800/50 transition-colors ${selectedSourceId === course._id ? "bg-blue-50/30" : ""
                                            }`}
                                    >
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{course.title}</p>
                                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                Created {new Date(course.createdAt).toLocaleDateString()}
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
