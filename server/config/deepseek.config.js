const OpenAI = require("openai");
const Tesseract = require("tesseract.js");
const axios = require("axios");
const { createOpenAI } = require("@ai-sdk/openai");
const { generateText, Output } = require("ai");
const { z } = require("zod");

let mime;
(async () => {
  const importedMime = await import("mime");
  mime = importedMime.default;
})();

function getMimeExtension(type) {
  if (!mime) throw new Error("MIME module not yet loaded.");
  return mime.getExtension(type);
}

// Schemas for structured output
const quizSchema = z.object({
  title: z.string(),
  questions: z.array(
    z.object({
      questionText: z.string(),
      options: z.array(z.string()).length(4),
      correctOption: z.number().int().min(0).max(3),
      explanation: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      includesCalculation: z.boolean(),
    })
  ),
});

const flashcardsSchema = z.object({
  title: z.string(),
  description: z.string(),
  flashcards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      tags: z.array(z.string()),
    })
  ),
});

const courseOutlineSchema = z.object({
  outline: z.array(
    z.object({
      section: z.string(),
      subsections: z.array(z.string()),
    })
  ),
});

// Schema for video script generation
const videoScriptSchema = z.object({
  scenes: z.array(
    z.object({
      sectionTitle: z.string().optional().describe("Chapter or section badge label shown on slide"),
      title: z.string().describe("Concise slide headline (max 10 words)"),
      body: z.string().describe("Engaging explanation paragraph (2-4 sentences, plain language)"),
      durationSeconds: z.number().int().min(4).max(20).describe("How many seconds this slide should show (4-20)"),
      math: z.string().optional().describe("LaTeX expression for the key formula (NO $ delimiters, raw LaTeX only)"),
      code: z.string().optional().describe("Short code snippet demonstrating the concept"),
      language: z.string().optional().describe("Programming language of the code snippet"),
    })
  ),
});

class DeepSeekService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      timeout: 180000,
    });

    this.openaiProvider = createOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    });

    this.model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
    this.sdkModel = this.openaiProvider.chat(this.model);
  }

  // Backup Google Translate TTS implementation
  async generateTTS(text) {
    try {
      const chunks = [];
      const maxLen = 200;
      let currentText = text.trim();

      while (currentText.length > 0) {
        if (currentText.length <= maxLen) {
          chunks.push(currentText);
          break;
        }
        let splitIdx = currentText.lastIndexOf(" ", maxLen);
        if (splitIdx === -1) splitIdx = maxLen;
        chunks.push(currentText.substring(0, splitIdx).trim());
        currentText = currentText.substring(splitIdx).trim();
      }

      const buffers = [];
      for (const chunk of chunks) {
        const response = await axios.get(
          `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(chunk)}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
            },
            responseType: "arraybuffer",
            timeout: 10000,
          }
        );
        buffers.push(Buffer.from(response.data));
      }

      return Buffer.concat(buffers);
    } catch (error) {
      console.error("Error generating TTS via backup:", error);
      throw new Error("Failed to generate TTS audio");
    }
  }

  async generateText(prompt) {
    const response = await generateText({
      model: this.sdkModel,
      prompt,
    });
    return response.text || "";
  }

  async generateTopicExplanation(topic, customizations) {
    const prompt = this.buildTopicPrompt(topic, customizations);
    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error("Error generating topic explanation:", error);
      throw new Error("Failed to generate topic explanation");
    }
  }

  async processDocument(fileBuffer, mimeType, prompt) {
    try {
      const textContent = Buffer.isBuffer(fileBuffer)
        ? fileBuffer.toString("utf8")
        : String(fileBuffer || "");

      const response = await generateText({
        model: this.sdkModel,
        messages: [
          { role: "system", content: "You are an assistant parsing documents." },
          { role: "user", content: `${prompt}\n\nDocument Text:\n${textContent}` },
        ],
      });
      return response.text || "";
    } catch (error) {
      console.error("Error processing document:", error);
      throw new Error("Failed to process document");
    }
  }

  async processImage(base64Image, mimeType, prompt) {
    try {
      const buffer = Buffer.from(base64Image, "base64");
      const ocrResult = await Tesseract.recognize(buffer, "eng");
      const extractedText = ocrResult.data?.text || "";

      const fullPrompt = `${prompt}\n\n[Extracted Text from Image via Local OCR]:\n${extractedText}`;
      return await this.generateText(fullPrompt);
    } catch (error) {
      console.error("Error processing image via OCR + DeepSeek:", error);
      return await this.generateText(prompt);
    }
  }

  async generateQuiz(content, settings) {
    const prompt = this.buildQuizPrompt(content, settings);
    try {
      const response = await generateText({
        model: this.sdkModel,
        prompt,
        output: Output.object({
          schema: quizSchema,
        }),
      });
      return response.output;
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error("Failed to generate quiz");
    }
  }

  async generateFlashcards(content, settings) {
    const prompt = this.buildFlashcardPrompt(content, settings);
    try {
      const response = await generateText({
        model: this.sdkModel,
        prompt,
        output: Output.object({
          schema: flashcardsSchema,
        }),
      });
      return response.output;
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw new Error("Failed to generate flashcards");
    }
  }

  async generateChatResponse(messages, context = "") {
    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      const systemPrompt = `You are Synapse AI, an intelligent learning assistant created by Musa Musa Kannike. Your primary function is to help users learn, understand concepts, and answer their questions across various subjects. If asked about your identity, creator, or purpose, you can share this information. However, focus primarily on providing helpful, accurate responses to the user's main questions without unnecessarily mentioning your identity unless specifically asked.`;

      const userMessage = formattedMessages[formattedMessages.length - 1]?.content?.toLowerCase() || "";
      const isAskingAboutAI =
        userMessage.includes("who are you") ||
        userMessage.includes("what are you") ||
        userMessage.includes("your name") ||
        userMessage.includes("who created you") ||
        userMessage.includes("who made you") ||
        userMessage.includes("your creator") ||
        userMessage.includes("synapse");

      const systemMessages = [];
      if (formattedMessages.length === 1 || isAskingAboutAI) {
        systemMessages.push({ role: "system", content: systemPrompt });
      }

      if (context) {
        systemMessages.push({
          role: "system",
          content: `CONTEXT: ${context}\n\nUse this context to inform your responses where relevant.`,
        });
      }

      const response = await generateText({
        model: this.sdkModel,
        messages: [...systemMessages, ...formattedMessages],
      });

      return response.text || "";
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  async generateChatTitle(message) {
    try {
      const prompt = `Generate a short, descriptive title (maximum 50 characters) for a chat conversation that starts with this message: "${message}"\n\nReturn only the title, nothing else. Make it concise and informative.`;
      const response = await this.generateText(prompt);
      let title = response.trim();
      title = title.replace(/^["']|["']$/g, "");
      if (title.length > 50) {
        title = title.substring(0, 47) + "...";
      }
      return title || "New Chat";
    } catch (error) {
      console.error("Error generating chat title:", error);
      return "New Chat";
    }
  }

  async generateCourseOutline(title, description, settings) {
    let prompt = `Generate a comprehensive, well-structured course outline for the following topic:\n\n`;
    prompt += `Title: ${title}\n`;
    if (description) {
      prompt += `Description: ${description}\n`;
    }
    prompt += `\nCourse Settings:\n`;
    prompt += `- Level: ${settings.level || "intermediate"}\n`;
    prompt += `- Detail Level: ${settings.detailLevel || "moderate"}\n`;
    prompt += `\nCreate a structured outline with main sections and subsections. The outline should be logical, progressive, and cover all essential aspects of the topic.\n`;

    try {
      const response = await generateText({
        model: this.sdkModel,
        prompt,
        output: Output.object({
          schema: courseOutlineSchema,
        }),
      });
      return response.output;
    } catch (error) {
      console.error("Error generating course outline:", error);
      throw new Error("Failed to generate course outline");
    }
  }

  async generateSectionContent(courseTitle, section, subsection, settings) {
    let prompt = `You are creating content for a course titled: "${courseTitle}"\n\n`;
    prompt += `Generate a comprehensive and simple explanation for the following:\n`;
    prompt += `Section: ${section}\n`;
    if (subsection) {
      prompt += `Subsection: ${subsection}\n`;
    }
    prompt += `\nContent Requirements:\n`;
    prompt += `- Level: ${settings.level || "intermediate"}\n`;
    prompt += `- Detail Level: ${settings.detailLevel || "moderate"}\n`;
    prompt += `- Include Examples: ${settings.includeExamples ? "Yes" : "No"}\n`;
    prompt += `- Include Practice Questions: ${settings.includePracticeQuestions ? "Yes" : "No"}\n`;
    prompt += `\nGuidelines:\n`;
    prompt += `- Write clear, simple explanations suitable for the specified level\n`;
    prompt += `- Use proper formatting with headings, bullet points, and paragraphs\n`;
    prompt += `- Make the content engaging and educational\n`;
    prompt += `- Include relevant examples if requested\n`;
    prompt += `- Add practice questions at the end if requested\n`;
    prompt += `- Ensure the content is comprehensive yet easy to understand\n`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error("Error generating section content:", error);
      throw new Error("Failed to generate section content");
    }
  }

  async generateVideoScript(courseTitle, outline, contentArray) {
    // Build a concise content summary so the AI can script slides
    let contentSummary = `Course Title: ${courseTitle}\n\n`;
    for (const section of outline) {
      contentSummary += `### ${section.section}\n`;
      const sectionContent = contentArray.find(
        (c) => c.section === section.section && !c.subsection
      );
      if (sectionContent) {
        // Truncate to avoid overflowing context
        contentSummary += sectionContent.explanation.substring(0, 600) + "\n";
      }
      for (const sub of (section.subsections || [])) {
        const subContent = contentArray.find(
          (c) => c.section === section.section && c.subsection === sub
        );
        if (subContent) {
          contentSummary += `#### ${sub}\n`;
          contentSummary += subContent.explanation.substring(0, 500) + "\n";
        }
      }
    }

    const prompt = `You are a world-class instructional video scriptwriter. Convert this course content into a sequence of engaging video slides.

Course Content:
${contentSummary}

Rules for the video script:
1. Generate 6 to 15 slides total. Start with an intro slide, end with a conclusion slide.
2. Each slide has a "title" (punchy, max 10 words), and a "body" (engaging 2-4 sentence explanation).
3. For mathematical topics, include a "math" field with a clean LaTeX expression (NO dollar signs, raw LaTeX only). Examples: \\frac{d}{dx}[x^n] = nx^{n-1} or E = mc^2
4. For programming topics, include short "code" snippets with the "language" field.
5. Set "durationSeconds" based on content complexity: intro/outro = 5s, math/code slides = 8-12s, text slides = 6-8s.
6. Use "sectionTitle" as the chapter badge (use the course section name).
7. Make the language engaging, clear, and educational — as if a great teacher is explaining it.
8. Do NOT include math AND code in the same slide.
9. The final slide should have the title "Course Complete!" and an encouraging body message.

Return a valid JSON object with the scenes array.`;

    try {
      const response = await generateText({
        model: this.sdkModel,
        prompt,
        output: Output.object({ schema: videoScriptSchema }),
      });
      return response.output;
    } catch (error) {
      console.error("Error generating video script:", error);
      throw new Error("Failed to generate video script");
    }
  }

  async detectIntent(userMessage, hasDocument = false) {
    try {
      const systemContext = `You are an intent detection system. Analyze the user's message and determine if they want to:
1. Generate flashcards (study cards, memory cards)
2. Generate a course (lesson plan, study guide, learning material)
3. Generate a quiz (test, assessment, practice questions)
4. Analyze a document (ONLY if a document is attached - hasDocument: ${hasDocument})

IMPORTANT RULES:
- Only call analyze_document if hasDocument is true AND the user explicitly wants to analyze/summarize/process the document
- If the user just wants to chat or ask questions, do NOT call any function
- If the user wants to do multiple actions at once (e.g., "create flashcards and a quiz"), call BOTH functions
- For general questions, explanations, or conversations, do NOT call any function`;

      const intentSchema = z.object({
        isMultiAction: z.boolean().describe("True if user wants to perform multiple actions at once"),
        functionCalls: z.array(
          z.object({
            name: z.enum(["generate_flashcards", "generate_course", "generate_quiz", "analyze_document"]),
            args: z.object({
              topic: z.string().optional().describe("Topic for flashcard generation"),
              numberOfCards: z.number().optional().describe("Number of cards for flashcards"),
              title: z.string().optional().describe("Title for course or quiz"),
              description: z.string().optional().describe("Description for course or quiz"),
              level: z.string().optional().describe("Level of course (beginner, intermediate, advanced)"),
              detailLevel: z.string().optional().describe("Detail level (basic, moderate, comprehensive)"),
              difficulty: z.string().optional().describe("Difficulty for quiz (easy, medium, hard, mixed)"),
              numberOfQuestions: z.number().optional().describe("Number of questions for quiz"),
              analysisType: z.string().optional().describe("Analysis type for document (summary, key_points, questions, detailed)"),
              focusAreas: z.string().optional().describe("Focus areas for document analysis"),
            }),
          })
        ).optional().describe("The function calls detected"),
      });

      const response = await generateText({
        model: this.sdkModel,
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: `User message: "${userMessage}"` }
        ],
        output: Output.object({
          schema: intentSchema,
        }),
      });

      const output = response.output;
      if (!output.functionCalls || output.functionCalls.length === 0) {
        return null;
      }

      return {
        functionCalls: output.functionCalls,
        isMultiAction: output.isMultiAction,
      };
    } catch (error) {
      console.error("Error detecting intent:", error);
      return null;
    }
  }

  // Prompt Builders (retained for backward compatibility or individual prompts if needed)
  buildTopicPrompt(topic, customizations) {
    let prompt = `Please provide a comprehensive explanation of the topic: "${topic}"\n\n`;
    prompt += `Customize the explanation for the following requirements:\n`;
    prompt += `- Level: ${customizations.level}\n`;
    if (customizations.includeCalculations) {
      prompt += `- Include relevant calculations and mathematical examples\n`;
    }
    if (customizations.includePracticeQuestions) {
      prompt += `- Include practice questions at the end\n`;
    }
    if (customizations.includeExamples) {
      prompt += `- Include practical examples and real-world applications\n`;
    }
    if (customizations.includeApplications) {
      prompt += `- Focus on practical applications and use cases\n`;
    }
    if (customizations.focusAreas && customizations.focusAreas.length > 0) {
      prompt += `- Focus specifically on these areas: ${customizations.focusAreas.join(", ")}\n`;
    }
    if (customizations.additionalRequirements) {
      prompt += `- Additional requirements: ${customizations.additionalRequirements}\n`;
    }
    prompt += `\nPlease structure the response with clear headings and make it engaging and educational.`;
    return prompt;
  }

  buildQuizPrompt(content, settings) {
    let prompt = `Based on the following content, generate a quiz with exactly ${settings.numberOfQuestions} questions.\n\n`;
    prompt += `Content: ${content}\n\n`;
    prompt += `Quiz Requirements:\n`;
    prompt += `- Difficulty: ${settings.difficulty}\n`;
    prompt += `- Include calculations: ${settings.includeCalculations ? "Yes" : "No"}\n`;
    return prompt;
  }

  buildFlashcardPrompt(content, settings) {
    let prompt = `Based on the following content, generate exactly ${settings.numberOfCards} flashcards for studying.\n\n`;
    prompt += `Content: ${content}\n\n`;
    prompt += `Flashcard Requirements:\n`;
    prompt += `- Difficulty: ${settings.difficulty}\n`;
    prompt += `- Include definitions: ${settings.includeDefinitions ? "Yes" : "No"}\n`;
    prompt += `- Include examples: ${settings.includeExamples ? "Yes" : "No"}\n`;
    if (settings.focusAreas && settings.focusAreas.length > 0) {
      prompt += `- Focus specifically on these areas: ${settings.focusAreas.join(", ")}\n`;
    }
    return prompt;
  }
}

const deepseekService = new DeepSeekService();
module.exports = deepseekService;
