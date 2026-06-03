import axios from "axios";
import {
  validateOrThrow,
  courseOutlineSchema,
  lessonContentSchema,
  quizSchema,
  quizQuestionSchema,
  videoScriptSchema,
  documentInsightsSchema,
} from "@/lib/ai-schemas";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * Safely parse JSON from AI response, handling common formatting issues:
 * - Markdown code blocks (```json ... ```)
 * - Trailing/leading whitespace
 * - Truncated responses
 * Returns { data, error } tuple for safe handling
 */
function safeJsonParse(rawText: string): { data: any | null; error: string | null } {
  if (!rawText || typeof rawText !== "string") {
    return { data: null, error: "Empty or invalid response" };
  }

  let cleaned = rawText.trim();

  // Extract JSON from markdown code blocks
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }

  // Repair common AI JSON escaping mistakes: unescape escaped backticks (\`) and single quotes (\')
  cleaned = cleaned.replace(/\\`/g, "`").replace(/\\'/g, "'");

  // Remove any text before the first { or after the last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    const data = JSON.parse(cleaned);
    return { data, error: null };
  } catch (err: any) {
    // Provide context about where the error might be
    const errorPos = err.message?.match(/position\s+(\d+)/)?.[1];
    const context = errorPos
      ? ` around "${cleaned.substring(Math.max(0, parseInt(errorPos) - 20), parseInt(errorPos) + 20)}"`
      : "";
    return {
      data: null,
      error: `JSON parse error: ${err.message}${context}. Raw length: ${cleaned.length}`,
    };
  }
}

/**
 * Parse the AI response for a lesson, supporting both legacy JSON mode
 * and raw markdown with [SUMMARY] ... [/SUMMARY] tags.
 */
function parseLessonContentResponse(
  responseText: string,
  lessonTitle: string
): { summary: string; content: string } {
  const trimmed = responseText.trim();

  // Try parsing as JSON first (handles legacy or fallback outputs)
  const { data, error } = safeJsonParse(trimmed);
  if (!error && data && typeof data === "object" && typeof data.content === "string") {
    return {
      summary: data.summary || lessonTitle,
      content: data.content,
    };
  }

  // Look for [SUMMARY] ... [/SUMMARY] tags
  const summaryMatch = trimmed.match(/\[SUMMARY\]([\s\S]*?)\[\/SUMMARY\]/i);
  if (summaryMatch) {
    const summary = summaryMatch[1].trim();
    const content = trimmed.substring(summaryMatch.index! + summaryMatch[0].length).trim();
    return { summary, content };
  }

  // Fallback: If no tags or JSON, treat the whole response as markdown content
  return {
    summary: lessonTitle,
    content: trimmed,
  };
}
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const BASE_URL = "https://api.deepseek.com";

if (!DEEPSEEK_API_KEY) {
  console.warn("DEEPSEEK_API_KEY is not defined in the environment. AI generations will fail.");
}

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Common caller for the DeepSeek API
 */
export async function callDeepSeek(
  messages: DeepSeekMessage[],
  jsonMode: boolean = false
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API Key is missing. Please configure DEEPSEEK_API_KEY.");
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/chat/completions`,
      {
        model: DEEPSEEK_MODEL,
        messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: jsonMode ? 0.2 : 0.7,
        max_tokens: 8192,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        timeout: 90000, // 90 seconds timeout for large responses
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Invalid response structure from DeepSeek API");
    }
    return content;
  } catch (error: any) {
    console.error("DeepSeek API Error Details:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || error.message || "Failed to query DeepSeek API"
    );
  }
}

/**
 * 1. Generate a Course Outline based on student topic and profile preferences
 */
export async function generateCourseOutline(
  topic: string,
  level: string,
  style: string,
  goals: string,
  documentContext?: string
) {
  const systemPrompt = `You are Synapse's AI Course Architect.
Your task is to design a highly personalized, logically structured academic course outline for a student.
Adapt your terminology and structure entirely to the student's study preferences.

Student Profile:
- Grade Level/Curriculum: ${level}
- Primary Study Style: ${style} (Visual, Textual, Analytical, Case-Study, Q&A-driven)
- Learning Goals: ${goals}

Output MUST be a valid JSON object matching the following structure:
{
  "title": "A catchy, custom course name tailored to their goals",
  "level": "${level}",
  "style": "${style}",
  "outline": {
    "modules": [
      {
        "title": "Module 1: Title",
        "description": "Short summary of what this module covers",
        "lessons": [
          { "title": "Lesson 1.1: Subtopic Title", "description": "Short explanation of the concept" },
          { "title": "Lesson 1.2: Subtopic Title", "description": "Short explanation of the concept" }
        ]
      },
      {
        "title": "Module 2: Title",
        "description": "Short summary of what this module covers",
        "lessons": [
          { "title": "Lesson 2.1: Subtopic Title", "description": "Short explanation of the concept" },
          { "title": "Lesson 2.2: Subtopic Title", "description": "Short explanation of the concept" }
        ]
      }
    ]
  }
}

Important Instructions:
- Avoid generic lesson divisions. Make it specialized.
- Define 2 to 3 modules, with 2 lessons in each module (total 4 to 6 lessons) to keep the course compact and achievable.
- Output ONLY the raw JSON block without markdown code blocks.`;

  let userPrompt = `Create a custom, premium course outline about: "${topic}"`;
  if (documentContext) {
    userPrompt += `\n\nThe student has provided the following reference material. Use it to inform and enrich the course structure:\n${documentContext}`;
  }

  const responseText = await callDeepSeek(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    true
  );

  const { data, error } = safeJsonParse(responseText);
  if (error) {
    throw new Error(`Failed to parse course outline: ${error}`);
  }
  return validateOrThrow(courseOutlineSchema, data, "course outline");
}

/**
 * 2. Incremental Context-Aware Lesson Generation
 * Fetches previous lesson content to maintain flow, prevent repeating core themes, and ensure natural progression.
 */
export async function generateLessonContent(
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
  userProfile: { style: string; level: string; goals: string },
  previousLessonContent?: string
): Promise<{ summary: string; content: string }> {
  let contextSnippet = "This is the first lesson in the course. Introduce the topics from the ground up.";
  if (previousLessonContent) {
    contextSnippet = `This is a subsequent lesson in the course. Here is the lesson text that you completed previously in this course:
---
${previousLessonContent.substring(0, 1500)}... (truncated context)
---
Build logically on top of this. Do NOT re-explain the foundations covered above. Dive straight into this new lesson, connecting the concepts to what they learned previously. Maintain structural continuity.`;
  }

  const systemPrompt = `You are Synapse's AI Senior Professor.
Your job is to generate a comprehensive, highly engaging, and non-generic lesson content for a student.

Student Learning Context:
- Course: "${courseTitle}"
- Module: "${moduleTitle}"
- Current Lesson to Generate: "${lessonTitle}"
- Grade Level: ${userProfile.level}
- Target Study Preference: ${userProfile.style} (Ensure the text, formatting, and layout heavily adopt this style. E.g. visual style should use abundant tables, structural ASCII boxes, and text diagrams; analytical style should have derivation steps, rigorous formulas, and logical steps; case-study style should center the entire lesson around 1 practical real-world scenario).
- Goals: ${userProfile.goals}

Lesson Continuity Context:
${contextSnippet}

Writing & Formatting Instructions:
- Write in rich Markdown.
- Organize content into clear sections:
  1. **# Lesson Introduction**: Tie back to previous topics, establish why this matters.
  2. **# Core Concepts**: Deep-dive theoretical breakdown (rich, customized, highly readable).
  3. **# Style-Adapted Application**: The primary study-style implementation (formula derivations, structured tables, or in-depth real-world case studies).
  4. **# Sandbox Activity / Practice**: A hands-on prompt or practice challenge that the student can attempt right now.
  5. **# Summary Checklist**: Concise review bullets.

Output Format:
You MUST start your response with a 1-2 sentence executive summary of the lesson enclosed in [SUMMARY] ... [/SUMMARY] tags.
Immediately following that, write the full markdown lesson content.

Example Output:
[SUMMARY]
This lesson introduces the foundational skill of distinguishing given and required information.
[/SUMMARY]

# Lesson 1.1: Identifying Given and Required
Welcome to the lesson...`;

  const userPrompt = `Write the full lesson text for "${lessonTitle}" inside the module "${moduleTitle}".`;

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let responseText = "";
    try {
      responseText = await callDeepSeek(messages, false); // jsonMode = false for free-form generation

      console.log(`generateLessonContent attempt ${attempt} raw response (first 500 chars):`, responseText.substring(0, 500));

      const parsedData = parseLessonContentResponse(responseText, lessonTitle);

      try {
        return validateOrThrow(lessonContentSchema, parsedData, "lesson content");
      } catch (validationErr: any) {
        console.error(`[VALIDATION ERROR] Zod validation failed on generateLessonContent attempt ${attempt}. Error details: ${validationErr.message}`);
        console.error(`[RAW RESPONSE START]\n${responseText}\n[RAW RESPONSE END]`);
        throw validationErr;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`generateLessonContent attempt ${attempt} failed: ${err.message}`);
    }
  }

  throw new Error(
    `Failed to generate lesson content after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * 3. Generate Targeted Practice Quizzes
 */
export async function generateQuizQuestions(
  topic: string,
  userProfile: { style: string; level: string; goals: string },
  documentContext?: string,
  numQuestions: number = 5
) {
  const systemPrompt = `You are Synapse's AI Quiz Master.
Generate a targeted, interactive ${numQuestions}-question practice quiz based on the user's topic: "${topic}".

Student Profile:
- Grade Level: ${userProfile.level}
- Learning Goals: ${userProfile.goals}
- Primary Study Style: ${userProfile.style}

Instructions for Questions:
- Generate precisely ${numQuestions} questions.
- Maintain a balance of types across the ${numQuestions} questions:
  - Multiple-Choice (type: "multiple-choice", must provide an array of 4 "options" strings) - roughly 50% of the quiz.
  - True/False (type: "true-false", must provide options: ["True", "False"]) - roughly 25% of the quiz.
  - Fill-in-the-blank (type: "fill-in-the-blank", options should be empty or omitted. The answer should be a precise single word or short phrase) - roughly 25% of the quiz.
- Provide a detailed "explanation" for why the answer is correct and why other choices are wrong. Make it educational.

Output MUST be a valid JSON object matching the following structure:
{
  "title": "A custom quiz name matching the topic",
  "questions": [
    {
      "question": "The question text here...",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B",
      "explanation": "Detailed explanation here..."
    },
    {
      "question": "The statement here...",
      "type": "true-false",
      "options": ["True", "False"],
      "answer": "True",
      "explanation": "Explanation..."
    },
    {
      "question": "Sentence with a blank __ here.",
      "type": "fill-in-the-blank",
      "answer": "word",
      "explanation": "Explanation..."
    }
  ]
}

Output ONLY the raw JSON block without markdown code blocks.`;

  let userPrompt = `Spin up a targeted quiz for the topic: "${topic}"`;
  if (documentContext) {
    userPrompt += `\n\nThe student has provided the following reference material. Base the quiz questions on this content:\n${documentContext}`;
  }

  const responseText = await callDeepSeek(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    true
  );

  const { data, error } = safeJsonParse(responseText);
  if (error) {
    throw new Error(`Failed to parse quiz questions: ${error}`);
  }
  return validateOrThrow(quizSchema, data, "quiz");
}

/**
 * Generate quiz questions in chunks for large quizzes.
 * This ensures the AI generates exactly the requested number of questions
 * by splitting generation into smaller batches and combining them.
 * Includes retry logic and graceful degradation for failed chunks.
 */
export async function generateQuizQuestionsChunked(
  topic: string,
  userProfile: { style: string; level: string; goals: string },
  documentContext?: string,
  numQuestions: number = 50
) {
  const CHUNK_SIZE = 15; // Reduced from 20 for better reliability
  const MAX_RETRIES = 3;
  const chunks: number[] = [];

  // Calculate chunk sizes
  let remaining = numQuestions;
  while (remaining > 0) {
    const chunkSize = Math.min(remaining, CHUNK_SIZE);
    chunks.push(chunkSize);
    remaining -= chunkSize;
  }

  const allQuestions: any[] = [];
  let quizTitle = "";
  let failedChunks = 0;

  // Generate each chunk sequentially to maintain topic coherence
  for (let i = 0; i < chunks.length; i++) {
    const chunkSize = chunks[i];
    const chunkNumber = i + 1;
    const totalChunks = chunks.length;

    const systemPrompt = `You are Synapse's AI Quiz Master.
Generate exactly ${chunkSize} quiz questions for chunk ${chunkNumber} of ${totalChunks}.
Topic: "${topic}"
Student Profile:
- Grade Level: ${userProfile.level}
- Learning Goals: ${userProfile.goals}
- Primary Study Style: ${userProfile.style}

${totalChunks > 1 ? `This is part ${chunkNumber} of a ${numQuestions}-question quiz. Focus on different aspects than previous parts to avoid repetition.` : ""}

Instructions:
- Generate precisely ${chunkSize} questions.
- Maintain a balance: ~50% Multiple-Choice, ~25% True/False, ~25% Fill-in-the-blank.
- For Multiple-Choice: provide exactly 4 options.
- For True/False: options must be ["True", "False"].
- For Fill-in-the-blank: options should be empty, answer is a single word or short phrase.
- Provide detailed educational explanations.
- CRITICAL: Your response must be valid JSON only. No markdown, no extra text.

Output MUST be valid JSON:
{
  "title": "Quiz title (only include in part 1, empty string for subsequent parts)",
  "questions": [
    {
      "question": "The question text...",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct answer",
      "explanation": "Educational explanation..."
    }
  ]
}

Output ONLY the raw JSON block without markdown code blocks.`;

    let userPrompt = `Generate ${chunkSize} quiz questions for the topic: "${topic}"`;
    if (documentContext) {
      userPrompt += `\n\nReference material:\n${documentContext}`;
    }

    // Retry logic for each chunk
    let chunkSuccess = false;
    let lastError = "";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const responseText = await callDeepSeek(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          true
        );

        const { data: chunkData, error } = safeJsonParse(responseText);

        if (error) {
          lastError = error;
          console.warn(`Chunk ${chunkNumber} attempt ${attempt} failed: ${error}`);
          if (attempt < MAX_RETRIES) continue;
          break;
        }

        if (!chunkData || !chunkData.questions || !Array.isArray(chunkData.questions)) {
          lastError = "Invalid response structure - missing questions array";
          console.warn(`Chunk ${chunkNumber} attempt ${attempt}: ${lastError}`);
          if (attempt < MAX_RETRIES) continue;
          break;
        }

        // Validate question count
        if (chunkData.questions.length !== chunkSize) {
          console.warn(
            `Chunk ${chunkNumber} returned ${chunkData.questions.length} questions, expected ${chunkSize}`
          );
        }

        for (const q of chunkData.questions) {
          const parsedQuestion = quizQuestionSchema.safeParse(q);
          if (parsedQuestion.success) allQuestions.push(parsedQuestion.data);
        }
        if (chunkData.title && !quizTitle) {
          quizTitle = chunkData.title;
        }
        chunkSuccess = true;
        break;
      } catch (err: any) {
        lastError = err.message || "Unknown error";
        console.warn(`Chunk ${chunkNumber} attempt ${attempt} error: ${lastError}`);
        if (attempt < MAX_RETRIES) continue;
      }
    }

    if (!chunkSuccess) {
      failedChunks++;
      console.error(`Chunk ${chunkNumber} failed after ${MAX_RETRIES} attempts: ${lastError}`);
    }
  }

  // Warn if any chunks failed
  if (failedChunks > 0) {
    console.warn(`${failedChunks} of ${chunks.length} chunks failed. Generated ${allQuestions.length}/${numQuestions} questions.`);
  }

  // Trim to exact requested count in case of over-generation
  const finalQuestions = allQuestions.slice(0, numQuestions);

  // If we have no questions at all, throw an error
  if (finalQuestions.length === 0) {
    throw new Error("Failed to generate any valid quiz questions. Please try again.");
  }

  return {
    title: quizTitle || `Quiz: ${topic}`,
    questions: finalQuestions,
    generatedCount: finalQuestions.length,
    requestedCount: numQuestions,
    failedChunks,
  };
}

/**
 * 4. Generate AI Explanatory Video Script & Scenes — Adaptive Layout System
 * Each scene gets its own AI-chosen layout type, animation style, and layout-specific data.
 */
export async function generateVideoScript(
  topic: string,
  styleTheme: string,
  userProfile: { style: string; level: string; goals: string },
  numScenes: number = 5,
  documentContext?: string
) {
  // Clamp to supported range
  const sceneCount = Math.max(3, Math.min(8, numScenes));

  const systemPrompt = `You are Synapse's AI Explanatory Video Director — an industry-leading expert at crafting premium educational videos that feel handmade and dynamic.

Create a rich, multi-scene explanatory video on: "${topic}".

Student Profile:
- Grade Level: ${userProfile.level}
- Theme: ${styleTheme}
- Learning Style: ${userProfile.style}
- Learning Goals: ${userProfile.goals}

CRITICAL RULE: Every scene MUST use a DIFFERENT layoutType. No two scenes may repeat the same layoutType.
Choose the layoutType that would make a student most easily understand the specific content of that scene.

Available layoutTypes and when to use them:
- "hero-statement": Use for powerful opening lines or single key insight. Requires "heroStatement" field (one punchy sentence, max 10 words).
- "split-bullets": Use for listing multiple key facts or properties. Requires "bulletPoints" (3-4 items). Classic split-screen with animated bullet list.
- "timeline": Use for processes, steps, or sequences. Requires "timelineSteps" (array of 3-5 short step strings).
- "comparison": Use for comparing two concepts, pros/cons, before/after. Requires "comparisonLeft" ({ label, items: string[] }) and "comparisonRight" ({ label, items: string[] }).
- "spotlight": Use for defining one critical term deeply. Requires "spotlightTerm" (1-3 words) and "spotlightDefinition" (1-2 sentences).
- "data-visual": Use when there are statistics, numbers, or measurable facts. Requires "statCallouts" (array of { value: string, label: string }, 2-4 items).
- "cinematic-quote": Use for closing thoughts, inspirational principles, or famous quotes. Requires "quoteText" (a short impactful quote or principle statement) and "quoteAuthor" (optional attribution).
- "explode-list": Use for brainstorms, applications, or scattered related concepts. Requires "bulletPoints" (4-6 short items).

Available animationStyles (choose the best fit per scene):
- "slide-from-left": Content slides in from the left
- "slide-from-right": Content slides in from the right
- "scale-in": Content scales from small to full size
- "fade-up": Content fades in while rising
- "typewriter": Text appears character by character
- "reveal-left-to-right": A reveal wipe from left to right

Generate exactly ${sceneCount} scenes that tell a complete educational story from introduction to conclusion.
Each scene narration should be 25-45 words — natural voiceover language.
Scene duration: 12-18 seconds each.

Output MUST be a valid JSON with exactly ${sceneCount} scene objects. Include ONLY the fields relevant to the chosen layoutType (skip irrelevant optional fields). Example structure (adapt scene count to ${sceneCount}):
{
  "title": "A premium, custom video title",
  "scenes": [
    {
      "sceneNumber": 1,
      "layoutType": "hero-statement",
      "animationStyle": "typewriter",
      "title": "Short Scene Label",
      "heroStatement": "One powerful sentence here.",
      "illustrationPrompt": "Highly detailed visual description for this scene",
      "narration": "Full natural voiceover text for this scene...",
      "durationSeconds": 14
    },
    {
      "sceneNumber": 2,
      "layoutType": "split-bullets",
      "animationStyle": "slide-from-left",
      "title": "Key Concepts",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "illustrationPrompt": "...",
      "narration": "...",
      "durationSeconds": 15
    },
    {
      "sceneNumber": 3,
      "layoutType": "cinematic-quote",
      "animationStyle": "fade-up",
      "title": "Key Takeaway",
      "quoteText": "An insightful closing principle about the topic.",
      "quoteAuthor": "optional attribution",
      "illustrationPrompt": "...",
      "narration": "...",
      "durationSeconds": 12
    }
  ]
}

Output ONLY the raw JSON block. No markdown fences. No explanation.`;

  let userPrompt = `Create a premium adaptive explanatory video for the topic: "${topic}". Make each scene visually and structurally unique.`;
  if (documentContext) {
    userPrompt += `\n\nThe student has provided the following reference material. Ground the video script in this content where relevant:\n${documentContext}`;
  }

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const MAX_ATTEMPTS = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const responseText = await callDeepSeek(messages, true);
      const { data: parsed, error } = safeJsonParse(responseText);

      if (error) {
        throw new Error(`JSON parse failed: ${error}`);
      }

      return validateOrThrow(videoScriptSchema, parsed, "video script");
    } catch (err: any) {
      lastError = err;
      console.warn(`generateVideoScript attempt ${attempt} failed: ${err.message}`);
    }
  }

  throw new Error(
    `Failed to generate a valid video script after ${MAX_ATTEMPTS} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * 5. Generate Document Insights — Summary, Key Concepts, Glossary, Quiz Topics, Course Outline
 */
export interface DocumentInsights {
  summary: string;
  keyConcepts: Array<{ concept: string; description: string }>;
  glossary: Array<{ term: string; definition: string }>;
  quizTopics: string[];
  courseOutline: Array<{ module: string; lessons: string[] }>;
}

export async function generateDocumentInsights(
  extractedText: string,
  fileName: string,
  userProfile: { style: string; level: string; goals: string }
): Promise<DocumentInsights> {
  const truncatedText = extractedText.substring(0, 6000);

  const systemPrompt = `You are Synapse's AI Document Analyst — an expert at transforming raw study materials into structured, actionable learning resources.

Student Profile:
- Grade Level: ${userProfile.level}
- Study Style: ${userProfile.style}
- Goals: ${userProfile.goals}

Analyze the provided document text and generate comprehensive study insights.

Output MUST be a valid JSON object with this exact structure:
{
  "summary": "A 3-5 sentence executive summary of the document's main content and purpose.",
  "keyConcepts": [
    { "concept": "Concept Name", "description": "Clear 1-2 sentence explanation of why this is important" }
  ],
  "glossary": [
    { "term": "Technical Term", "definition": "Clear, student-friendly definition" }
  ],
  "quizTopics": [
    "Specific topic or question area that could be tested"
  ],
  "courseOutline": [
    { "module": "Module Title", "lessons": ["Lesson 1 title", "Lesson 2 title"] }
  ]
}

Instructions:
- summary: Provide a rich overview that captures the document's scope, purpose, and key findings.
- keyConcepts: Extract 4-8 core concepts/ideas. Prioritize what a student NEEDS to understand.
- glossary: Extract 5-10 technical terms, jargon, or key vocabulary with student-friendly definitions.
- quizTopics: Suggest 5-8 specific topics/questions that could be used to test understanding.
- courseOutline: Suggest a 2-4 module course structure with 2-3 lessons each, based on the document's content.
- Adapt language complexity to the student's grade level.
- Output ONLY the raw JSON. No markdown fences. No extra text.`;

  const userPrompt = `Analyze this document ("${fileName}") and generate comprehensive study insights:\n\n${truncatedText}`;

  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const responseText = await callDeepSeek(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        true
      );

      const { data, error } = safeJsonParse(responseText);
      if (error) {
        throw new Error(`Failed to parse document insights: ${error}`);
      }

      return validateOrThrow(documentInsightsSchema, data, "document insights") as DocumentInsights;
    } catch (err: any) {
      lastError = err;
      console.warn(`generateDocumentInsights attempt ${attempt} failed: ${err.message}`);
    }
  }

  throw new Error(
    `Failed to generate document insights after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * 6. General Academic Q&A (Synapse AI Tutor)
 */
export async function generateTutorAnswer(
  question: string,
  userProfile: { style: string; level: string; goals: string },
  documentContext?: string
): Promise<string> {
  const systemPrompt = `You are Synapse's Elite Academic AI Tutor.
Provide a highly personalized, clear, and comprehensive explanation to the student's question.

Student Learning Profile:
- Grade Level: ${userProfile.level}
- Target Study Preference: ${userProfile.style}
- Learning Goals: ${userProfile.goals}

Formatting Guidelines:
- Adopt their study style directly. For visual learners, use markdown tables, list highlights, and simple visual separators. For analytical learners, break it down mathematically or in structural logical trees.
- Keep explanations clear, engaging, and professional.
- Conclude with a helpful quick summary.
- Respond directly in rich Markdown.`;

  let userContent = question;
  if (documentContext) {
    userContent += `\n\nReference material provided by the student:\n${documentContext}`;
  }

  return await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);
}
