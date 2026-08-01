import { z } from "zod";

/**
 * Zod schemas for validating AI-generated JSON before it is persisted or
 * rendered. The DeepSeek model occasionally returns structurally invalid output
 * (missing fields, wrong shapes). Validating here keeps broken AI output from
 * becoming broken UI/database state — callers throw and retry/refund on failure.
 */

/** Throw a descriptive error if `data` does not match `schema`. */
export function validateOrThrow<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid ${label} structure: ${issues}`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Course outline
// ---------------------------------------------------------------------------
const lessonOutlineSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  isCompleted: z.boolean().optional(),
  generatedLessonId: z.string().optional(),
});

const moduleOutlineSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  lessons: z.array(lessonOutlineSchema).min(1),
});

export const courseOutlineSchema = z.object({
  title: z.string().optional(),
  level: z.string().optional(),
  style: z.string().optional(),
  outline: z.object({
    modules: z.array(moduleOutlineSchema).min(1),
  }),
});
export type CourseOutlineData = z.infer<typeof courseOutlineSchema>;

// ---------------------------------------------------------------------------
// Lesson content
// ---------------------------------------------------------------------------
export const lessonContentSchema = z.object({
  summary: z.string().min(1),
  content: z.string().min(1),
});
export type LessonContentData = z.infer<typeof lessonContentSchema>;

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------
export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["multiple-choice", "true-false", "fill-in-the-blank"]),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1),
  explanation: z.string().default(""),
});
export type QuizQuestionData = z.infer<typeof quizQuestionSchema>;

export const quizSchema = z.object({
  title: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1),
});
export type QuizData = z.infer<typeof quizSchema>;

// ---------------------------------------------------------------------------
// Video script — scenes carry layout-specific optional fields, so allow
// unknown keys to pass through untouched.
// ---------------------------------------------------------------------------
export const videoSceneSchema = z
  .object({
    sceneNumber: z.number(),
    title: z.string().default(""),
    narration: z.string().min(1),
    durationSeconds: z.number().optional(),
  })
  .loose();

export const videoScriptSchema = z.object({
  title: z.string().optional(),
  scenes: z.array(videoSceneSchema).min(1),
});
export type VideoScriptData = z.infer<typeof videoScriptSchema>;

// ---------------------------------------------------------------------------
// Document insights
// ---------------------------------------------------------------------------
export const documentInsightsSchema = z.object({
  summary: z.string().min(1),
  keyConcepts: z.array(
    z.object({ concept: z.string(), description: z.string().default("") })
  ),
  glossary: z.array(
    z.object({ term: z.string(), definition: z.string().default("") })
  ),
  quizTopics: z.array(z.string()),
  courseOutline: z.array(
    z.object({ module: z.string(), lessons: z.array(z.string()) })
  ),
});
export type DocumentInsightsData = z.infer<typeof documentInsightsSchema>;
