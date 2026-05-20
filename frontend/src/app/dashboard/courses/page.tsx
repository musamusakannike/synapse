"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { CourseAPI } from "@/lib/api";

interface Course {
    _id: string;
    title: string;
    status: "generating" | "completed" | "failed";
    createdAt: string;
    settings?: {
        level: string;
        detailLevel: string;
    };
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await CourseAPI.list();
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            await CourseAPI.delete(courseId);
            fetchCourses();
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "generating":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "failed":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <BookOpen className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "generating":
                return "Generating...";
            case "completed":
                return "Ready";
            case "failed":
                return "Failed";
            default:
                return "Unknown";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6]">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Courses
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Generate and manage your AI-powered courses
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard/courses/generate")}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white 
                       rounded-xl transition-colors font-medium shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Generate Course
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">Loading courses...</div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
                        <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No courses yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                            Generate your first AI-powered course to get started
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/courses/generate")}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-xl transition-colors font-medium shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Generate Course
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course._id}
                                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700/60 
                         rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group relative hover:border-gray-300"
                                onClick={() => {
                                    if (course.status === "completed") {
                                        router.push(`/dashboard/courses/${course._id}`);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-50 rounded-xl">
                                            <BookOpen className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(course.status)}
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {getStatusText(course.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCourse(course._id);
                                        }}
                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 
                              rounded-lg transition-all absolute right-4 top-4"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 pr-6">
                                    {course.title}
                                </h3>

                                <div className="flex items-center justify-between text-sm text-gray-400 font-medium pt-2 border-t border-gray-50 mt-4">
                                    <span className="capitalize px-2.5 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700/40 text-gray-600 dark:text-gray-400">
                                        {course.settings?.level || "Course"}
                                    </span>
                                    <span>{formatDate(course.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
