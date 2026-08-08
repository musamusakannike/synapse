'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { courseApi } from '@/lib/api';
import { Course, PaginatedResponse } from '@/lib/types';
import CourseCard from '@/components/ui/CourseCard';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

const CATEGORIES = ['Web development', 'Data science', 'Design', 'Business', 'Mobile development', 'Marketing'];

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>}>
      <CoursesContent />
    </Suspense>
  );
}

function CoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (difficulty !== 'all') params.difficulty = difficulty;
      const res = await courseApi.list(params);
      const data = res.data as PaginatedResponse<Course>;
      setCourses(data.data);
      setPages(data.pagination.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category, difficulty]);

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300);
    return () => clearTimeout(t);
  }, [fetchCourses]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-900)] mb-1">Courses</h1>
        <p className="text-sm text-[var(--text-muted)]">Browse the full SabiLearn course catalog</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-300)]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search courses…"
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-card)] border border-[var(--line)] focus:border-[var(--ink-900)] rounded-[var(--radius-md)] text-sm text-[var(--ink-900)] outline-none"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} options={['all', ...CATEGORIES]} placeholder="Category" />
        </div>
        <div className="w-full sm:w-44">
          <Select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }} options={['all', 'beginner', 'intermediate', 'advanced']} placeholder="Level" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-12 h-12" />} title="No courses found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                id={course._id}
                image={course.banner}
                level={course.difficulty}
                title={course.title}
                category={course.category}
                topicCount={course.topicCount}
                free={course.isFree}
                price={course.price}
              />
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-[var(--radius-md)] text-sm font-semibold ${p === page ? 'bg-[var(--brand-gold)] text-[var(--ink-900)]' : 'bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--line)]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
