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
 * 4. Generate AI Explanatory Video Script & Scenes
 */
export async function generateVideoScript(
  topic: string,
  styleTheme: string,
  userProfile: { style: string; level: string; goals: string }
) {
  const systemPrompt = `You are Synapse's AI Explanatory Video Director.
Create a highly visual, premium slide-show explanation script for a short educational video on: "${topic}".

Adapt content to the student profile:
- Grade Level: ${userProfile.level}
- Theme Selection: ${styleTheme} (Emerald, Lime, Slate, White)
- Study Preferences: ${userProfile.style}

Instructions:
- Create precisely 4 coherent sequential scenes/slides.
- Each scene must tell a story or progress the explanation.
- For each scene, specify:
  1. Title of the slide
  2. 3-4 short, punchy bullet points to display on-screen
  3. A high-fidelity prompt describing what illustrative graphic should accompany this slide
  4. The complete voiceover narrator text ("narration"). Make it natural, highly explanatory, and simple (approx 25-40 words per scene).
  5. Estimated scene duration in seconds (approx 10-15 seconds).

Output MUST be a valid JSON matching this format:
{
  "title": "A custom premium video title",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene Slide Title",
      "bulletPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "illustrationPrompt": "A conceptual 3D isometric graphic showing...",
      "narration": "Welcome! Today we are exploring... Here, we can see how...",
      "durationSeconds": 12
    }
  ]
}

Output ONLY the raw JSON block.`;

  const userPrompt = `Develop a premium explanatory video script outline for: "${topic}"`;

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
