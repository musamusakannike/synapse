"use client";

import React, { useEffect, useState } from "react";
import StyledMarkdown from "@/components/StyledMarkdown";
import { CourseAPI } from "@/lib/api";
import {
  GraduationCap,
  Plus,
  RefreshCw,
  Trash2,
  Download,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Loader from "@/components/Loader";
import OptimisticLoader from "@/components/OptimisticLoader";

type Course = {
  _id: string;
  title: string;
  description?: string;
  outline: Array<{
    section: string;
    subsections: string[];
  }>;
  content: Array<{
    section: string;
    subsection: string | null;
    explanation: string;
  }>;
  status: "generating_outline" | "generating_content" | "completed" | "failed";
  settings: {
    level: "beginner" | "intermediate" | "advanced";
    includeExamples: boolean;
    includePracticeQuestions: boolean;
    detailLevel: "brief" | "moderate" | "comprehensive";
  };
  createdAt?: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [detailLevel, setDetailLevel] = useState<"brief" | "moderate" | "comprehensive">("moderate");
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includePracticeQuestions, setIncludePracticeQuestions] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Course | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await CourseAPI.list();
      setCourses(data || []);
      // Keep selection in sync
      if (selected) {
        const fresh = (data || []).find((c: Course) => c._id === selected._id) || null;
        setSelected(fresh);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // Poll for updates every 5 seconds if any course is generating
    const hasGenerating = courses.some(
      (c) => c.status === "generating_outline" || c.status === "generating_content"
    );
    
    if (!hasGenerating) return;

    const interval = setInterval(() => {
      load();
    }, 5000);

    return () => clearInterval(interval);
  }, [courses]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setCreating(true);
      await CourseAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        settings: {
          level,
          includeExamples,
          includePracticeQuestions,
          detailLevel,
        },
      });
      setTitle("");
      setDescription("");
      setLevel("intermediate");
      setDetailLevel("moderate");
      setIncludeExamples(true);
      setIncludePracticeQuestions(false);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      setActionId(id);
      await CourseAPI.delete(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const downloadPDF = async (id: string) => {
    try {
      setDownloadingPDF(true);
      await CourseAPI.downloadPDF(id);
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getStatusBadge = (status: Course["status"]) => {
    switch (status) {
      case "generating_outline":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating Outline
          </span>
        );
      case "generating_content":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating Content
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            Completed
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
            Failed
          </span>
        );
    }
  };

  // Filter
  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden lg:block w-72 border-r border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Courses</h2>
          <button onClick={load} className="p-2 rounded hover:bg-gray-100" aria-label="Refresh courses">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
        />
        {loading ? (
          <Loader size="sm" />
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-500">No courses found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  setSelected(c);
                  setSidebarOpen(false);
                }}
                className={`p-2 rounded cursor-pointer border ${selected?._id === c._id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"}`}
              >
                <p className="font-medium truncate" title={c.title}>{c.title}</p>
                {c.description && (
                  <p className="text-xs text-gray-500 truncate" title={c.description}>{c.description}</p>
                )}
                <div className="mt-1">{getStatusBadge(c.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[80%] bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Courses</h2>
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <button onClick={load} className="p-2 rounded border hover:bg-gray-50" aria-label="Refresh courses">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <Loader size="sm" />
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-500">No courses found.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelected(c);
                      setSidebarOpen(false);
                    }}
                    className={`p-2 rounded cursor-pointer border ${selected?._id === c._id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-transparent"}`}
                  >
                    <p className="font-medium truncate" title={c.title}>{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-gray-500 truncate" title={c.description}>{c.description}</p>
                    )}
                    <div className="mt-1">{getStatusBadge(c.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between lg:hidden p-3 border-b border-gray-200">
          <button className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="w-5 h-5" />
            <span className="text-sm">Courses</span>
          </button>
          {selected && <span className="text-sm text-gray-600 truncate max-w-[60%]" title={selected.title}>{selected.title}</span>}
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 overflow-y-auto pb-96">
          {!selected ? (
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600">Generate comprehensive courses on any topic</p>
              {!loading && courses.length === 0 && (
                <div className="mt-6 text-gray-600">No courses yet. Use the form below to create one.</div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">{selected.title}</h1>
                  {selected.description && (
                    <p className="text-sm text-gray-600 mt-1">{selected.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {getStatusBadge(selected.status)}
                    <span className="text-xs text-gray-500">Level: {selected.settings.level}</span>
                    <span className="text-xs text-gray-500">Detail: {selected.settings.detailLevel}</span>
                  </div>
                </div>
              </div>

              {/* Course Outline */}
              {selected.outline && selected.outline.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-3">Course Outline</h2>
                  <div className="space-y-2">
                    {selected.outline.map((section, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleSection(index)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <span className="font-medium text-left">
                            {index + 1}. {section.section}
                          </span>
                          {expandedSections[index] ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {expandedSections[index] && section.subsections && section.subsections.length > 0 && (
                          <div className="px-3 pb-3 space-y-1">
                            {section.subsections.map((subsection, subIndex) => (
                              <div key={subIndex} className="pl-4 text-sm text-gray-600">
                                {index + 1}.{subIndex + 1}. {subsection}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Content or Loading State */}
              {selected.status === "generating_outline" || selected.status === "generating_content" ? (
                <div className="mt-6">
                  <OptimisticLoader
                    messages={[
                      "Crafting your comprehensive course outline...",
                      "Structuring the learning path for you...",
                      "Generating detailed course content...",
                      "Adding examples and explanations...",
                      "Organizing sections and subsections...",
                      "Almost ready with your personalized course...",
                      "Fine-tuning the educational content...",
                      "Building a structured learning experience...",
                    ]}
                  />
                </div>
              ) : selected.status === "completed" && selected.content && selected.content.length > 0 ? (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-3">Course Content</h2>
                  <div className="space-y-6">
                    {selected.outline.map((section, sectionIndex) => {
                      const sectionContent = selected.content.find(
                        (c) => c.section === section.section && !c.subsection
                      );
                      return (
                        <div key={sectionIndex} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {sectionIndex + 1}. {section.section}
                          </h3>
                          {sectionContent && (
                            <div className="mb-4">
                              <StyledMarkdown>{sectionContent.explanation}</StyledMarkdown>
                            </div>
                          )}
                          {section.subsections && section.subsections.length > 0 && (
                            <div className="space-y-4 ml-4">
                              {section.subsections.map((subsection, subIndex) => {
                                const subsectionContent = selected.content.find(
                                  (c) => c.section === section.section && c.subsection === subsection
                                );
                                return (
                                  <div key={subIndex}>
                                    <h4 className="text-base font-medium mb-2">
                                      {sectionIndex + 1}.{subIndex + 1}. {subsection}
                                    </h4>
                                    {subsectionContent && (
                                      <StyledMarkdown>{subsectionContent.explanation}</StyledMarkdown>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex items-center gap-2">
                {selected.status === "completed" && (
                  <button
                    onClick={() => downloadPDF(selected._id)}
                    disabled={downloadingPDF}
                    className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {downloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download PDF
                  </button>
                )}
                <button
                  onClick={() => remove(selected._id)}
                  disabled={actionId === selected._id}
                  className="text-sm inline-flex items-center gap-2 px-3 py-2 rounded border border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom composer to create courses */}
        <div className="fixed left-0 right-0 bottom-0 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="max-w-4xl mx-auto px-3 py-3">
            <form onSubmit={create} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Course title (required)"
                  className="w-full border border-gray-200 rounded px-3 py-2"
                />
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full border border-gray-200 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <select
                  value={detailLevel}
                  onChange={(e) => setDetailLevel(e.target.value as any)}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                >
                  <option value="brief">Brief</option>
                  <option value="moderate">Moderate</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeExamples}
                    onChange={(e) => setIncludeExamples(e.target.checked)}
                    className="rounded"
                  />
                  Examples
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includePracticeQuestions}
                    onChange={(e) => setIncludePracticeQuestions(e.target.checked)}
                    className="rounded"
                  />
                  Practice
                </label>
              </div>
              <button
                type="submit"
                disabled={!title.trim() || creating}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {creating ? <Loader size="xs" /> : <Plus className="w-4 h-4" />}
                Generate Course
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
