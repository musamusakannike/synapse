import axios from "axios";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
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
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        timeout: 60000, // 60 seconds timeout
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
  goals: string
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

  const userPrompt = `Create a custom, premium course outline about: "${topic}"`;

  const responseText = await callDeepSeek(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    true
  );

  return JSON.parse(responseText);
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

Formatting Instructions:
- Write in rich Markdown.
- Organize content into clear sections:
  1. **# Lesson Introduction**: Tie back to previous topics, establish why this matters.
  2. **# Core Concepts**: Deep-dive theoretical breakdown (rich, customized, highly readable).
  3. **# Style-Adapted Application**: The primary study-style implementation (formula derivations, structured tables, or in-depth real-world case studies).
  4. **# Sandbox Activity / Practice**: A hands-on prompt or practice challenge that the student can attempt right now.
  5. **# Summary Checklist**: Concise review bullets.

Generate a JSON object containing:
{
  "summary": "A 1-2 sentence executive summary of the lesson",
  "content": "Full markdown lesson content..."
}
Output only raw JSON block without markdown code blocks.`;

  const userPrompt = `Write the full lesson text for "${lessonTitle}" inside the module "${moduleTitle}".`;

  const responseText = await callDeepSeek(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    true
  );

  return JSON.parse(responseText);
}

/**
 * 3. Generate Targeted Practice Quizzes
 */
export async function generateQuizQuestions(
  topic: string,
  userProfile: { style: string; level: string; goals: string }
) {
  const systemPrompt = `You are Synapse's AI Quiz Master.
Generate a targeted, interactive 5-question practice quiz based on the user's topic: "${topic}".

Student Profile:
- Grade Level: ${userProfile.level}
- Learning Goals: ${userProfile.goals}
- Primary Study Style: ${userProfile.style}

Instructions for Questions:
- Generate precisely 5 questions.
- Maintain a balance of types:
  - At least 2 Multiple-Choice (type: "multiple-choice", must provide an array of 4 "options" strings)
  - At least 1 True/False (type: "true-false", must provide options: ["True", "False"])
  - At least 1 Fill-in-the-blank (type: "fill-in-the-blank", options should be empty or omitted. The answer should be a precise single word or short phrase).
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

  const userPrompt = `Spin up a targeted quiz for the topic: "${topic}"`;

  const responseText = await callDeepSeek(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    true
  );

  return JSON.parse(responseText);
}

/**
 * 4. Generate AI Explanatory Video Script & Scenes — Adaptive Layout System
 * Each scene gets its own AI-chosen layout type, animation style, and layout-specific data.
 */
export async function generateVideoScript(
  topic: string,
  styleTheme: string,
  userProfile: { style: string; level: string; goals: string }
) {
  const systemPrompt = `You are Synapse's AI Explanatory Video Director — an industry-leading expert at crafting premium educational videos that feel handmade and dynamic.

Create a rich, multi-scene explanatory video on: "${topic}".

Student Profile:
- Grade Level: ${userProfile.level}
- Theme: ${styleTheme}
- Learning Style: ${userProfile.style}

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

Generate exactly 5 scenes that tell a complete educational story from introduction to conclusion.
Each scene narration should be 25-45 words — natural voiceover language.
Scene duration: 12-18 seconds each.

Output MUST be a valid JSON matching this exact format — include ONLY the fields relevant to the chosen layoutType (skip irrelevant optional fields):
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
      "layoutType": "timeline",
      "animationStyle": "reveal-left-to-right",
      "title": "How It Works",
      "timelineSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
      "illustrationPrompt": "...",
      "narration": "...",
      "durationSeconds": 16
    },
    {
      "sceneNumber": 4,
      "layoutType": "comparison",
      "animationStyle": "slide-from-right",
      "title": "Side by Side",
      "comparisonLeft": { "label": "Left Label", "items": ["Item A", "Item B", "Item C"] },
      "comparisonRight": { "label": "Right Label", "items": ["Item D", "Item E", "Item F"] },
      "illustrationPrompt": "...",
      "narration": "...",
      "durationSeconds": 14
    },
    {
      "sceneNumber": 5,
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

  const userPrompt = `Create a premium adaptive explanatory video for the topic: "${topic}". Make each scene visually and structurally unique.`;

  const responseText = await callDeepSeek(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    true
  );

  return JSON.parse(responseText);
}

/**
 * 5. General Academic Q&A (Synapse AI Tutor)
 */
export async function generateTutorAnswer(
  question: string,
  userProfile: { style: string; level: string; goals: string }
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

  return await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ]);
}
