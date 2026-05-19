"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, BookOpen, Download, Trash2, Loader2, Award, BookOpenCheck } from "lucide-react";
import { CourseAPI } from "@/lib/api";
import StyledMarkdown from "@/components/StyledMarkdown";

interface Subsection {
    type: string;
}

interface OutlineSection {
    section: string;
    subsections: string[];
}

interface CourseContentItem {
    section: string;
    subsection: string;
    explanation: string;
}

interface Course {
    _id: string;
    title: string;
    description?: string;
    status: "generating_outline" | "generating_content" | "completed" | "failed";
    outline: OutlineSection[];
    content: CourseContentItem[];
    settings?: {
        level: "beginner" | "intermediate" | "advanced";
        detailLevel: "brief" | "moderate" | "comprehensive";
        includeExamples: boolean;
        includePracticeQuestions: boolean;
    };
}

export default function CourseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<string>("");
    const [activeSubsection, setActiveSubsection] = useState<string>("");
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCourse();
        }
    }, [id]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await CourseAPI.get(id);
            const data: Course = response.data;
            setCourse(data);

            // Select first subsection by default if available
            if (data.outline && data.outline.length > 0) {
                const firstSection = data.outline[0];
                setActiveSection(firstSection.section);
                if (firstSection.subsections && firstSection.subsections.length > 0) {
                    setActiveSubsection(firstSection.subsections[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching course details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            await CourseAPI.delete(id);
            router.push("/dashboard/courses");
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course");
        }
    };

    const handleDownloadPDF = async () => {
        if (isDownloading) return;
        try {
            setIsDownloading(true);
            await CourseAPI.downloadPDF(id);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to download PDF course catalog");
        } finally {
            setIsDownloading(false);
        }
    };

    // Find current content
    const getCurrentExplanation = () => {
        if (!course || !course.content) return "";
        const match = course.content.find(
            (c) => c.section === activeSection && c.subsection === activeSubsection
        );
        return match ? match.explanation : "Select a topic from the outline on the left to start reading.";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-800 text-lg font-semibold animate-pulse">Loading course content...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <BookOpen className="w-12 h-12 text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-800">Course Not Found</h2>
                    <p className="text-gray-550 text-sm">We couldn't retrieve the details for this course.</p>
                    <button
                        onClick={() => router.push("/dashboard/courses")}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm text-sm"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200/60 h-16 flex items-center">
                <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => router.push("/dashboard/courses")}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Courses</span>
                        </button>
                        <div className="h-4 w-px bg-gray-200" />
                        <h1 className="text-base font-bold text-gray-800 truncate" title={course.title}>
                            {course.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {course.settings && (
                            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1 rounded-xl">
                                <Award className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    {course.settings.level}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all font-semibold text-xs border border-blue-100 disabled:opacity-50"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Download className="w-3.5 h-3.5" />
                            )}
                            <span>PDF</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Course"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Split Panel Body */}
            <div className="flex-1 w-full max-w-[1400px] mx-auto flex items-stretch">
                {/* Outline Left Sidebar */}
                <aside className="w-80 border-r border-gray-200/60 bg-white flex flex-col shrink-0 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
                    {course.description && (
                        <div className="p-5 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Overview</p>
                            <p className="text-xs text-gray-550 leading-relaxed font-medium">{course.description}</p>
                        </div>
                    )}

                    <div className="flex-1 p-4 space-y-4">
                        {course.outline.map((sect, sectIdx) => (
                            <div key={sectIdx} className="space-y-1.5">
                                <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider truncate" title={sect.section}>
                                    {sect.section}
                                </h3>
                                <div className="space-y-1">
                                    {sect.subsections.map((sub, subIdx) => {
                                        const isActive = activeSection === sect.section && activeSubsection === sub;
                                        return (
                                            <button
                                                key={subIdx}
                                                onClick={() => {
                                                    setActiveSection(sect.section);
                                                    setActiveSubsection(sub);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all leading-normal flex items-start gap-2 ${
                                                    isActive
                                                        ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                                                        : "text-gray-650 hover:bg-gray-50 hover:text-gray-900"
                                                }`}
                                            >
                                                <BookOpenCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                                <span className="truncate">{sub}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Right Reading Panel */}
                <main className="flex-1 bg-[#f9f8f6] p-8 md:p-12 overflow-y-auto h-[calc(100vh-64px)]">
                    <div className="max-w-3xl mx-auto bg-white border border-gray-200/60 rounded-2xl p-8 sm:p-10 shadow-xs min-h-full flex flex-col">
                        {/* Selected Topic Title Header */}
                        <div className="border-b border-gray-150 pb-6 mb-8">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                {activeSection}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 mt-1">
                                {activeSubsection}
                            </h2>
                        </div>

                        {/* Content Viewer */}
                        <div className="flex-1">
                            <StyledMarkdown className="prose-blue">
                                {getCurrentExplanation()}
                            </StyledMarkdown>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
