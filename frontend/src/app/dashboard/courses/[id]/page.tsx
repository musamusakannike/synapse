"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, BookOpen, Download, Trash2, Loader2, Award, BookOpenCheck, Video } from "lucide-react";
import { CourseAPI } from "@/lib/api";
import StyledMarkdown from "@/components/StyledMarkdown";
import VideoGenerationModal from "@/components/VideoGenerationModal";

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
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [videoStatus, setVideoStatus] = useState<"idle" | "generating_script" | "rendering" | "completed" | "failed">("idle");
    const [hasVideo, setHasVideo] = useState(false);
    const videoPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initial course fetch
    useEffect(() => {
        if (id) {
            fetchCourse(true);
        }
    }, [id]);

    // Fetch video status when course is loaded
    useEffect(() => {
        if (id && course?.status === "completed") {
            CourseAPI.getVideoStatus(id)
                .then((res) => {
                    setVideoStatus(res.data.videoStatus ?? "idle");
                    setHasVideo(res.data.hasVideo ?? false);
                    // If already in progress, start background polling
                    if (res.data.videoStatus === "generating_script" || res.data.videoStatus === "rendering") {
                        startVideoStatusPolling();
                    }
                })
                .catch(() => {});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, course?.status]);

    // Cleanup video polling on unmount
    useEffect(() => {
        return () => {
            if (videoPollingRef.current) clearInterval(videoPollingRef.current);
        };
    }, []);

    function startVideoStatusPolling() {
        if (videoPollingRef.current) clearInterval(videoPollingRef.current);
        videoPollingRef.current = setInterval(async () => {
            try {
                const res = await CourseAPI.getVideoStatus(id);
                const s = res.data.videoStatus ?? "idle";
                setVideoStatus(s);
                setHasVideo(res.data.hasVideo ?? false);
                if (s === "completed" || s === "failed") {
                    clearInterval(videoPollingRef.current!);
                    videoPollingRef.current = null;
                }
            } catch {}
        }, 5000);
    }

    // Real-time polling to retrieve generated contents incrementally
    useEffect(() => {
        if (!course || course.status === "completed" || course.status === "failed") {
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const response = await CourseAPI.get(id);
                const updatedCourse: Course = response.data;
                
                setCourse((prevCourse) => {
                    // Update active section / subsection if they aren't initialized yet
                    if (!activeSection && updatedCourse.outline && updatedCourse.outline.length > 0) {
                        const firstSection = updatedCourse.outline[0];
                        setActiveSection(firstSection.section);
                        if (firstSection.subsections && firstSection.subsections.length > 0) {
                            setActiveSubsection(firstSection.subsections[0]);
                        }
                    }
                    return updatedCourse;
                });
            } catch (error) {
                console.error("Error polling course details:", error);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [id, course?.status, activeSection]);

    const fetchCourse = async (showSpinner = false) => {
        try {
            if (showSpinner) setLoading(true);
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
            if (showSpinner) setLoading(false);
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

    const handleRegenerate = async () => {
        try {
            setIsRegenerating(true);
            const response = await CourseAPI.regenerate(id, course?.settings);
            setCourse(response.data);
            // Reset active sections so they will be re-initialized
            setActiveSection("");
            setActiveSubsection("");
        } catch (error) {
            console.error("Error regenerating course:", error);
            alert("Failed to regenerate course");
        } finally {
            setIsRegenerating(false);
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

    // Calculate generation progress stats
    const totalSections = course?.outline ? course.outline.reduce(
        (acc, sect) => acc + 1 + (sect.subsections ? sect.subsections.length : 0),
        0
    ) : 0;
    const generatedSections = course?.content ? course.content.length : 0;
    const percentComplete = totalSections > 0 ? Math.round((generatedSections / totalSections) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-800 dark:text-gray-200 text-lg font-semibold animate-pulse">Loading course content...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center max-w-sm p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                    <BookOpen className="w-12 h-12 text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Course Not Found</h2>
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

    if (course.status === "generating_outline") {
        return (
            <div className="min-h-screen bg-[#f9f8f6] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-3xl p-8 text-center shadow-xs flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative p-4 bg-blue-50/80 rounded-2xl text-blue-600">
                            <Loader2 className="w-10 h-10 animate-spin" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">🎓 Planning Course Outline...</h2>
                        <p className="text-gray-505 text-xs mt-2 leading-relaxed max-w-sm">
                            We are designing a comprehensive structured syllabus for <strong>"{course.title}"</strong> customized to your specifications. This will take just a moment.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60 h-16 flex items-center">
                <div className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            onClick={() => router.push("/dashboard/courses")}
                            className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors font-medium text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Courses</span>
                        </button>
                        <div className="h-4 w-px bg-gray-200" />
                        <h1 className="text-base font-bold text-gray-800 dark:text-gray-200 truncate" title={course.title}>
                            {course.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {course.settings && (
                            <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-800 px-3 py-1 rounded-xl">
                                <Award className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    {course.settings.level}
                                </span>
                            </div>
                        )}

                        {/* Generate Video button */}
                        <button
                            onClick={() => setVideoModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-semibold text-xs border"
                            style={{
                                background: videoStatus === "completed"
                                    ? "rgba(52,211,153,0.1)"
                                    : videoStatus === "generating_script" || videoStatus === "rendering"
                                    ? "rgba(129,140,248,0.1)"
                                    : "rgba(99,102,241,0.08)",
                                borderColor: videoStatus === "completed"
                                    ? "rgba(52,211,153,0.3)"
                                    : videoStatus === "generating_script" || videoStatus === "rendering"
                                    ? "rgba(129,140,248,0.3)"
                                    : "rgba(99,102,241,0.2)",
                                color: videoStatus === "completed"
                                    ? "#34d399"
                                    : videoStatus === "generating_script" || videoStatus === "rendering"
                                    ? "#818cf8"
                                    : "#6366f1",
                            }}
                        >
                            {videoStatus === "generating_script" || videoStatus === "rendering" ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Video className="w-3.5 h-3.5" />
                            )}
                            <span>
                                {videoStatus === "completed"
                                    ? "Video Ready"
                                    : videoStatus === "generating_script"
                                    ? "Writing Script..."
                                    : videoStatus === "rendering"
                                    ? "Rendering..."
                                    : "Generate Video"}
                            </span>
                        </button>

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
                <aside className="w-80 border-r border-gray-200 dark:border-gray-700/60 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
                    {course.description && (
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
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
                                                        : "text-gray-650 hover:bg-gray-50 dark:bg-slate-800 hover:text-gray-900 dark:text-white"
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
                    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-8 sm:p-10 shadow-xs min-h-full flex flex-col">
                        {course.status === "failed" ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-red-50/10 border border-dashed border-red-200/60 rounded-2xl my-auto">
                                <div className="p-3 bg-red-50 rounded-2xl text-red-600 mb-4">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">Content Generation Failed</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">
                                    Something went wrong while generating the course materials. Don't worry, you can try regenerating it.
                                </p>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isRegenerating}
                                    className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm text-sm disabled:opacity-50 transition-all active:scale-[0.98]"
                                >
                                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    <span>Regenerate Course</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Selected Topic Title Header */}
                                <div className="border-b border-gray-150 pb-6 mb-8">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                        {activeSection || "Getting Started"}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {activeSubsection || "Course Overview"}
                                    </h2>
                                </div>

                                {/* Content Viewer */}
                                <div className="flex-1 flex flex-col">
                                    {course.status === "generating_content" && !course.content.some(c => c.section === activeSection && c.subsection === activeSubsection) ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-blue-50/20 border border-dashed border-blue-100 rounded-2xl my-4">
                                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3.5" />
                                            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">Generating Lesson Content...</h3>
                                            <p className="text-xs text-gray-555 max-w-xs leading-relaxed">
                                                We are currently writing the lesson explanation for <strong>{activeSubsection || activeSection}</strong>.
                                            </p>
                                            <div className="w-full max-w-[240px] bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-5 overflow-hidden">
                                                <div className="bg-blue-600 h-1.5 transition-all duration-500" style={{ width: `${percentComplete}%` }}></div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-2 font-semibold tracking-wider uppercase">
                                                {generatedSections} of {totalSections} lessons written ({percentComplete}%)
                                            </span>
                                        </div>
                                    ) : (
                                        <StyledMarkdown className="prose-blue">
                                            {getCurrentExplanation()}
                                        </StyledMarkdown>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Video Generation Modal */}
            <VideoGenerationModal
                courseId={id}
                courseTitle={course.title}
                open={videoModalOpen}
                onClose={() => setVideoModalOpen(false)}
                initialStatus={videoStatus}
                hasExistingVideo={hasVideo}
                onStatusChange={(s, hasVid) => {
                    setVideoStatus(s);
                    setHasVideo(hasVid);
                    if (s === "generating_script" || s === "rendering") {
                        startVideoStatusPolling();
                    }
                }}
            />
        </div>
    );
}
