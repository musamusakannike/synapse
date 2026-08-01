import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

interface LessonOutline {
  title: string;
  description?: string;
  isCompleted?: boolean;
  generatedLessonId?: string;
}

interface ModuleOutline {
  title: string;
  lessons: LessonOutline[];
}

interface Attempt {
  score: number;
  total: number;
  takenAt: string | Date;
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * GET aggregated learning-progress stats + adaptive study-plan recommendations
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const [courses, quizzes, questions, documents] = await Promise.all([
      db.collection("courses").find({ userId }).sort({ createdAt: -1 }).toArray(),
      db.collection("quizzes").find({ userId }).sort({ createdAt: -1 }).toArray(),
      db.collection("questions").find({ userId }).sort({ createdAt: -1 }).toArray(),
      db.collection("documents").find({ userId }).sort({ createdAt: -1 }).toArray(),
    ]);

    // ---- Course progress ----
    const courseProgress = courses.map((course) => {
      const modules: ModuleOutline[] = course.outline?.modules || [];
      const allLessons = modules.flatMap((m) => m.lessons || []);
      const totalLessons = allLessons.length;
      const completedLessons = allLessons.filter((l) => l.isCompleted).length;
      const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Find the next lesson to study (first not completed)
      let nextLesson: { moduleTitle: string; lessonTitle: string } | null = null;
      for (const mod of modules) {
        const lesson = (mod.lessons || []).find((l) => !l.isCompleted);
        if (lesson) {
          nextLesson = { moduleTitle: mod.title, lessonTitle: lesson.title };
          break;
        }
      }

      return {
        _id: course._id.toString(),
        title: course.title,
        totalLessons,
        completedLessons,
        percent,
        nextLesson,
        isComplete: totalLessons > 0 && completedLessons === totalLessons,
        inProgress: completedLessons > 0 && completedLessons < totalLessons,
        createdAt: course.createdAt,
      };
    });

    const coursesInProgress = courseProgress.filter((c) => c.inProgress).length;
    const coursesCompleted = courseProgress.filter((c) => c.isComplete).length;
    const lessonsCompleted = courseProgress.reduce((acc, c) => acc + c.completedLessons, 0);

    // ---- Quiz performance ----
    const allAttempts: Array<Attempt & { quizId: string; title: string }> = [];
    for (const quiz of quizzes) {
      const attempts: Attempt[] = quiz.attempts || [];
      for (const a of attempts) {
        allAttempts.push({ ...a, quizId: quiz._id.toString(), title: quiz.title });
      }
    }
    allAttempts.sort(
      (a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime()
    );

    const quizzesTaken = quizzes.filter((q) => (q.attempts || []).length > 0).length;
    const totalAttempts = allAttempts.length;
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            (allAttempts.reduce(
              (acc, a) => acc + (a.total > 0 ? a.score / a.total : 0),
              0
            ) /
              totalAttempts) *
              100
          )
        : 0;

    const scoreTrend = allAttempts.slice(-10).map((a) => ({
      date: new Date(a.takenAt).toISOString(),
      percent: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
      score: a.score,
      total: a.total,
      title: a.title,
    }));

    // ---- Streak (consecutive days of activity up to today) ----
    const activityDays = new Set<string>();
    for (const c of courses) if (c.createdAt) activityDays.add(toDayKey(new Date(c.createdAt)));
    for (const q of quizzes) {
      if (q.createdAt) activityDays.add(toDayKey(new Date(q.createdAt)));
      for (const a of q.attempts || []) {
        if (a.takenAt) activityDays.add(toDayKey(new Date(a.takenAt)));
      }
    }
    for (const q of questions) if (q.createdAt) activityDays.add(toDayKey(new Date(q.createdAt)));

    let streak = 0;
    const cursor = new Date();
    // Allow the streak to count even if there was no activity *today* yet (start from today,
    // but if today is empty, check from yesterday so an active streak isn't reset mid-day).
    if (!activityDays.has(toDayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (activityDays.has(toDayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // ---- Recent questions ----
    const recentQuestions = questions.slice(0, 5).map((q) => ({
      _id: q._id.toString(),
      question: q.question,
      createdAt: q.createdAt,
      pinned: !!q.pinned,
    }));

    // ---- Continue learning (most recent in-progress / not-started courses) ----
    const continueLearning = courseProgress
      .filter((c) => !c.isComplete && c.totalLessons > 0)
      .sort((a, b) => {
        // in-progress first, then most recent
        if (a.inProgress !== b.inProgress) return a.inProgress ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);

    // ---- Adaptive study plan recommendations ----
    type Recommendation = {
      id: string;
      kind: "weak-quiz" | "continue-course" | "final-exam" | "start-course" | "start-quiz" | "doc-insights";
      title: string;
      description: string;
      href: string;
      cta: string;
      accent: string;
    };
    const recommendations: Recommendation[] = [];

    // 1. Weakest quiz (lowest latest score under 70%)
    const quizzesWithScore = quizzes
      .map((q) => {
        const attempts: Attempt[] = q.attempts || [];
        if (attempts.length === 0) return null;
        const last = attempts[attempts.length - 1];
        const pct = last.total > 0 ? Math.round((last.score / last.total) * 100) : 0;
        return { id: q._id.toString(), title: q.title, pct };
      })
      .filter((q): q is { id: string; title: string; pct: number } => q !== null && q.pct < 70)
      .sort((a, b) => a.pct - b.pct);

    if (quizzesWithScore.length > 0) {
      const weakest = quizzesWithScore[0];
      recommendations.push({
        id: `weak-${weakest.id}`,
        kind: "weak-quiz",
        title: "Review a weak topic",
        description: `You scored ${weakest.pct}% on "${weakest.title}". Retry it or generate similar questions from what you missed.`,
        href: `/dashboard/quizzes/${weakest.id}`,
        cta: "Practice now",
        accent: "var(--danger)",
      });
    }

    // 2. Continue a course in progress
    const continueRec = courseProgress.find((c) => c.inProgress && c.nextLesson);
    if (continueRec && continueRec.nextLesson) {
      recommendations.push({
        id: `continue-${continueRec._id}`,
        kind: "continue-course",
        title: `Continue ${continueRec.nextLesson.lessonTitle}`,
        description: `You're ${continueRec.percent}% through "${continueRec.title}". Pick up where you left off.`,
        href: `/dashboard/courses/${continueRec._id}`,
        cta: "Resume",
        accent: "var(--accent)",
      });
    }

    // 3. Final exam for a freshly-completed course (no attempts recorded against it yet)
    const examReady = courseProgress.find((c) => c.isComplete);
    if (examReady) {
      recommendations.push({
        id: `exam-${examReady._id}`,
        kind: "final-exam",
        title: "Take a final exam",
        description: `You finished all lessons in "${examReady.title}". Test everything with a final exam.`,
        href: `/dashboard/courses/${examReady._id}`,
        cta: "Start exam",
        accent: "var(--success)",
      });
    }

    // 4. Onboarding-style fallbacks
    if (courses.length === 0) {
      recommendations.push({
        id: "start-course",
        kind: "start-course",
        title: "Generate your first course",
        description: "Build a structured, personalized course on any topic to start learning.",
        href: "/dashboard/courses",
        cta: "Create course",
        accent: "var(--accent)",
      });
    }
    if (quizzes.length === 0) {
      recommendations.push({
        id: "start-quiz",
        kind: "start-quiz",
        title: "Take your first quiz",
        description: "Test your knowledge with an AI-generated quiz on any topic.",
        href: "/dashboard/quizzes",
        cta: "Start quiz",
        accent: "#818CF8",
      });
    }

    // 5. Documents waiting for insights
    const docWithoutInsights = documents.find((d) => d.extractedText && !d.insights);
    if (recommendations.length < 4 && docWithoutInsights) {
      recommendations.push({
        id: `doc-${docWithoutInsights._id.toString()}`,
        kind: "doc-insights",
        title: "Unlock document insights",
        description: `Generate a summary, key concepts and quiz topics from "${docWithoutInsights.fileName}".`,
        href: `/dashboard/documents/${docWithoutInsights._id.toString()}`,
        cta: "View document",
        accent: "#F472B6",
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        coursesInProgress,
        coursesCompleted,
        lessonsCompleted,
        quizzesTaken,
        totalAttempts,
        avgScore,
        questionsAsked: questions.length,
        documents: documents.length,
        streak,
      },
      scoreTrend,
      recentQuestions,
      continueLearning,
      recommendations: recommendations.slice(0, 4),
    });
  } catch (error) {
    console.error("GET Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
