const OpenAI = require("openai");
const Tesseract = require("tesseract.js");
const axios = require("axios");

let mime;
(async () => {
  const importedMime = await import("mime");
  mime = importedMime.default;
})();

function getMimeExtension(type) {
  if (!mime) throw new Error("MIME module not yet loaded.");
  return mime.getExtension(type);
}

// Helper function to sanitize potentially malformed JSON
function sanitizeJsonText(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.warn("Direct JSON parse failed, attempting sanitization...");
    let cleaned = jsonText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      console.warn("Parse after markdown removal failed, attempting manual repair...");
      let repaired = cleaned;
      const errorPos = parseInt(e2.message.match(/position (\d+)/)?.[1] || "0");
      if (errorPos > 0) {
        const start = Math.max(0, errorPos - 100);
        const end = Math.min(cleaned.length, errorPos + 100);
        console.error("Error context:", cleaned.substring(start, end));
      }
      repaired = repaired.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
      try {
        return JSON.parse(repaired);
      } catch (e3) {
        console.error("Manual repair failed");
        throw new Error(`JSON parse failed at position ${errorPos}: ${e.message}`);
      }
    }
  }
}

class DeepSeekService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      timeout: 180000, // 3 minutes timeout
    });

    // Default to deepseek-v4-flash for cost-effectiveness and speed
    this.model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  }

  // Backup Google Translate TTS implementation to support the speech functionalities
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
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content || "";
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

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: "You are an assistant parsing documents." },
          { role: "user", content: `${prompt}\n\nDocument Text:\n${textContent}` },
        ],
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error processing document:", error);
      throw new Error("Failed to process document");
    }
  }

  async processImage(base64Image, mimeType, prompt) {
    try {
      const buffer = Buffer.from(base64Image, "base64");
      // Use local OCR to extract text from image
      const ocrResult = await Tesseract.recognize(buffer, "eng");
      const extractedText = ocrResult.data?.text || "";

      const fullPrompt = `${prompt}\n\n[Extracted Text from Image via Local OCR]:\n${extractedText}`;
      return await this.generateText(fullPrompt);
    } catch (error) {
      console.error("Error processing image via OCR + DeepSeek:", error);
      // Fallback: execute prompt directly if OCR fails
      return await this.generateText(prompt);
    }
  }

  async generateQuiz(content, settings) {
    const prompt = this.buildQuizPrompt(content, settings);
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const jsonText = response.choices[0]?.message?.content || "";
      return sanitizeJsonText(jsonText);
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error("Failed to generate quiz");
    }
  }

  async generateFlashcards(content, settings) {
    const prompt = this.buildFlashcardPrompt(content, settings);
    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const jsonText = response.choices[0]?.message?.content || "";
      return sanitizeJsonText(jsonText);
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

      if (formattedMessages.length === 1 || isAskingAboutAI) {
        formattedMessages.unshift({ role: "system", content: systemPrompt });
      }

      if (context) {
        formattedMessages.unshift({
          role: "system",
          content: `CONTEXT: ${context}\n\nUse this context to inform your responses where relevant.`,
        });
      }

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: formattedMessages,
      });

      return response.choices[0]?.message?.content || "";
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
    prompt += `\nCreate a structured outline with main sections and subsections. The outline should be logical, progressive, and cover all essential aspects of the topic.\n\n`;
    prompt += `Return the outline in the following JSON format:\n`;
    prompt += `{\n  "outline": [\n    {\n      "section": "Main Section Title",\n      "subsections": ["Subsection 1", "Subsection 2", "Subsection 3"]\n    }\n  ]\n}\n\n`;
    prompt += `IMPORTANT JSON FORMATTING RULES:\n`;
    prompt += `- Properly escape all special characters in strings (quotes, backslashes, newlines)\n`;
    prompt += `- Use double quotes for all JSON strings\n`;
    prompt += `- Do NOT include any markdown formatting or code blocks in the response\n`;
    prompt += `- Return ONLY valid JSON, nothing else`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const jsonText = response.choices[0]?.message?.content || "";
      return sanitizeJsonText(jsonText);
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
- For general questions, explanations, or conversations, do NOT call any function

User message: "${userMessage}"`;

      const openaiTools = [
        {
          type: "function",
          function: {
            name: "generate_flashcards",
            description: "Generate flashcards for studying a topic or content. Use this when the user wants to create flashcards, study cards, or memory cards for learning.",
            parameters: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  description: "The topic or subject to generate flashcards about",
                },
                numberOfCards: {
                  type: "integer",
                  description: "Number of flashcards to generate (default: 10)",
                },
                difficulty: {
                  type: "string",
                  description: "Difficulty level: easy, medium, or hard (default: medium)",
                },
                includeExamples: {
                  type: "boolean",
                  description: "Whether to include examples in flashcards (default: false)",
                },
              },
              required: ["topic"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "generate_course",
            description: "Generate a comprehensive course or learning material on a topic. Use this when the user wants to create a course, lesson plan, study guide, or structured learning content.",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "The title or topic of the course",
                },
                description: {
                  type: "string",
                  description: "Optional description or specific focus areas for the course",
                },
                level: {
                  type: "string",
                  description: "Difficulty level: beginner, intermediate, or advanced (default: intermediate)",
                },
                detailLevel: {
                  type: "string",
                  description: "How detailed the content should be: basic, moderate, or comprehensive (default: moderate)",
                },
                includeExamples: {
                  type: "boolean",
                  description: "Whether to include examples (default: true)",
                },
                includePracticeQuestions: {
                  type: "boolean",
                  description: "Whether to include practice questions (default: false)",
                },
              },
              required: ["title"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "generate_quiz",
            description: "Generate a quiz or test questions on a topic. Use this when the user wants to create a quiz, test, assessment, or practice questions.",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "The title or topic of the quiz",
                },
                description: {
                  type: "string",
                  description: "Optional description or specific focus areas for the quiz",
                },
                numberOfQuestions: {
                  type: "integer",
                  description: "Number of questions to generate (default: 10)",
                },
                difficulty: {
                  type: "string",
                  description: "Difficulty level: easy, medium, hard, or mixed (default: mixed)",
                },
                includeCalculations: {
                  type: "boolean",
                  description: "Whether to include calculation-based questions (default: false)",
                },
              },
              required: ["title"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "analyze_document",
            description: "Analyze or process an uploaded document. Use this ONLY when a document has been explicitly attached/uploaded by the user and they want to analyze, summarize, or extract information from it.",
            parameters: {
              type: "object",
              properties: {
                analysisType: {
                  type: "string",
                  description: "Type of analysis: summary, key_points, questions, or detailed (default: summary)",
                },
                focusAreas: {
                  type: "string",
                  description: "Specific areas or topics to focus on in the analysis",
                },
              },
              required: [],
            },
          },
        },
      ];

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: systemContext }],
        tools: openaiTools,
        tool_choice: "auto",
      });

      const message = response.choices[0]?.message;
      const toolCalls = message?.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        return null;
      }

      const isMultiAction = toolCalls.length > 1;

      return {
        functionCalls: toolCalls.map((call) => ({
          name: call.function.name,
          args: JSON.parse(call.function.arguments || "{}"),
        })),
        isMultiAction,
      };
    } catch (error) {
      console.error("Error detecting intent:", error);
      return null;
    }
  }

  // Prompt Builders
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
    prompt += `\nReturn the quiz in the following JSON format:\n`;
    prompt += `{\n  "title": "Quiz Title",\n  "questions": [\n    {\n      "questionText": "Question text here",\n      "options": ["Option A", "Option B", "Option C", "Option D"],\n      "correctOption": 0,\n      "explanation": "Explanation for the correct answer",\n      "difficulty": "easy|medium|hard",\n      "includesCalculation": true|false\n    }\n  ]\n}\n\n`;
    prompt += `IMPORTANT JSON FORMATTING RULES:\n`;
    prompt += `- Make sure each question has exactly 4 options, and the correctOption index is 0-based (0, 1, 2, or 3)\n`;
    prompt += `- Properly escape all special characters in strings (quotes, backslashes, newlines)\n`;
    prompt += `- Use double quotes for all JSON strings\n`;
    prompt += `- Do NOT include any markdown formatting or code blocks in the response\n`;
    prompt += `- Return ONLY valid JSON, nothing else`;
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
    prompt += `\nReturn the flashcards in the following JSON format:\n`;
    prompt += `{\n  "title": "Flashcard Set Title",\n  "description": "Brief description of the flashcard set",\n  "flashcards": [\n    {\n      "front": "Question or term on the front of the card",\n      "back": "Answer or definition on the back of the card",\n      "difficulty": "easy|medium|hard",\n      "tags": ["tag1", "tag2"]\n    }\n  ]\n}\n\n`;
    prompt += `Guidelines:\n`;
    prompt += `- Make the front side concise (question, term, or concept)\n`;
    prompt += `- Make the back side comprehensive but clear (answer, definition, or explanation)\n`;
    prompt += `- Use appropriate difficulty levels based on content complexity\n`;
    prompt += `- Add relevant tags for categorization\n`;
    prompt += `- Ensure each flashcard tests a single concept\n`;
    prompt += `- Make flashcards that promote active recall and understanding\n\n`;
    prompt += `IMPORTANT JSON FORMATTING RULES:\n`;
    prompt += `- Properly escape all special characters in strings (quotes, backslashes, newlines)\n`;
    prompt += `- Use double quotes for all JSON strings\n`;
    prompt += `- Do NOT include any markdown formatting or code blocks in the response\n`;
    prompt += `- Return ONLY valid JSON, nothing else`;
    return prompt;
  }
}

const deepseekService = new DeepSeekService();
module.exports = deepseekService;
