"use client";

import { useEffect, useState, useCallback } from "react";
import { DataTable } from "@/components/DataTable";
import { Modal } from "@/components/Modal";
import { formatDate, cn } from "@/lib/utils";
import { BookOpen, Trash2, Eye, Loader2, Award, FileText } from "lucide-react";

interface CourseRow {
  _id: string;
  title: string;
  userId: string;
  userName: string;
  userEmail: string;
  level: string;
  style: string;
  moduleCount: number;
  lessonCount: number;
  completedCount: number;
  progress: number;
  createdAt: string;
}

interface CourseDetail {
  _id: string;
  title: string;
  outline?: {
    modules?: {
      title: string;
      lessons?: {
        title: string;
        isCompleted?: boolean;
        duration?: string;
      }[];
    }[];
  };
}

const columns = [
  { key: "title", label: "Course Title" },
  { key: "user", label: "User" },
  { key: "level", label: "Level" },
  { key: "style", label: "Style" },
  { key: "outline", label: "Outline" },
  { key: "progress", label: "Progress" },
  { key: "created", label: "Created" },
  { key: "actions", label: "" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Outline modal
  const [selectedCourse, setSelectedCourse] = useState<CourseRow | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete modal
  const [deleteCourse, setDeleteCourse] = useState<CourseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });
      const res = await fetch(`/api/admin/courses?${params}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search]);

  const fetchCourseDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`);
      const data = await res.json();
      if (data.success) {
        setCourseDetail(data.course);
      }
    } catch {
      // Silently fail
    }
    setLoadingDetail(false);
  };

  const handleDelete = async () => {
    if (!deleteCourse) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${deleteCourse._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteCourse(null);
        fetchCourses();
      }
    } catch {
      // Silently fail
    }
    setDeleting(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold">
          Courses
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Monitor and manage AI-generated learning courses.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={courses as unknown as Record<string, unknown>[]}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by course title…"
        loading={loading}
        emptyMessage="No courses found."
        renderRow={(item) => {
          const course = item as unknown as CourseRow;
          return (
            <tr key={course._id}>
              <td>
                <div className="flex items-center gap-2 max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] border border-[var(--border-subtle)]">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-[var(--text-primary)] block truncate" title={course.title}>
                      {course.title}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <div className="text-xs">
                  <span className="font-medium block text-[var(--text-secondary)] truncate max-w-[120px]">
                    {course.userName}
                  </span>
                  <span className="text-[var(--text-muted)] block truncate max-w-[120px]">
                    {course.userEmail}
                  </span>
                </div>
              </td>
              <td>
                <span className="capitalize text-xs text-[var(--text-secondary)]">
                  {course.level?.replace("-", " ")}
                </span>
              </td>
              <td>
                <span className="capitalize text-xs text-[var(--text-secondary)]">
                  {course.style}
                </span>
              </td>
              <td className="text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  {course.moduleCount}
                </span>
                <span className="text-[var(--text-muted)]"> modules</span>
                <span className="text-[var(--text-muted)]"> / </span>
                <span className="text-[var(--text-secondary)] font-medium">
                  {course.lessonCount}
                </span>
                <span className="text-[var(--text-muted)]"> lessons</span>
              </td>
              <td>
                <div className="flex items-center gap-2 min-w-[80px]">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    {course.progress}%
                  </span>
                </div>
              </td>
              <td className="text-xs">{formatDate(course.createdAt)}</td>
              <td>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      fetchCourseDetail(course._id);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                    title="View Outline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteCourse(course)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[rgba(248,113,113,0.1)] hover:text-[var(--danger)] transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        }}
      />

      {/* Outline Modal */}
      <Modal
        open={!!selectedCourse}
        onClose={() => {
          setSelectedCourse(null);
          setCourseDetail(null);
        }}
        title="Course Outline"
        maxWidth="max-w-2xl"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">{selectedCourse.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Generated for <strong>{selectedCourse.userName}</strong> ({selectedCourse.userEmail}) on {formatDate(selectedCourse.createdAt)}
              </p>
              <div className="flex gap-4 mt-3 text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">Level:</span>{" "}
                  <span className="font-medium capitalize">{selectedCourse.level?.replace("-", " ")}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Style:</span>{" "}
                  <span className="font-medium capitalize">{selectedCourse.style}</span>
                </div>
              </div>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
              {loadingDetail ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                  <span className="text-xs text-[var(--text-muted)]">Loading outline…</span>
                </div>
              ) : courseDetail?.outline?.modules && courseDetail.outline.modules.length > 0 ? (
                courseDetail.outline.modules.map((mod, modIdx) => (
                  <div
                    key={modIdx}
                    className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2"
                  >
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] text-[var(--accent)] font-bold">
                        {modIdx + 1}
                      </span>
                      {mod.title}
                    </h4>
                    {mod.lessons && mod.lessons.length > 0 ? (
                      <ul className="space-y-1.5 pl-6 border-l border-[var(--border-subtle)] ml-2.5">
                        {mod.lessons.map((les, lesIdx) => (
                          <li
                            key={lesIdx}
                            className="text-xs text-[var(--text-secondary)] flex items-center justify-between py-0.5"
                          >
                            <span className="truncate pr-4">{les.title}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {les.duration && (
                                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                                  {les.duration}
                                </span>
                              )}
                              {les.isCompleted ? (
                                <span className="badge badge-success text-[9px] py-0.5 px-1.5">Completed</span>
                              ) : (
                                <span className="badge badge-neutral text-[9px] py-0.5 px-1.5">Pending</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-[var(--text-muted)] pl-6">No lessons in this module.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No module details found.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-[var(--border-subtle)] pt-3 mt-4">
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setCourseDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteCourse}
        onClose={() => setDeleteCourse(null)}
        title="Delete Course"
      >
        {deleteCourse && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
              <p className="text-sm text-[var(--danger)] font-medium mb-1">
                ⚠️ Destructive action.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Are you sure you want to permanently delete the course <strong>{deleteCourse.title}</strong>?
                This will remove the course outline and all of its associated lessons.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteCourse(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Course
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
