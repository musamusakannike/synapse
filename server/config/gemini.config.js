const {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/genai");

class GeminiService {
  constructor() {
    // CHANGE: The class name for instantiation is now GoogleGenerativeAI.
    this.genAI = new GoogleGenAI({});

    this.safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  async generateTopicExplanation(topic, customizations) {
    const prompt = this.buildTopicPrompt(topic, customizations);

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        safetySettings: this.safetySettings,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating topic explanation:", error);
      throw new Error("Failed to generate topic explanation");
    }
  }

  // NOTE: This method remains valid with the new SDK. No changes needed.
  async processDocument(fileBuffer, mimeType, prompt) {
    try {
      // If we already have plain text, avoid Files API and send as text parts directly.
      if (mimeType === "text/plain") {
        const textContent = Buffer.isBuffer(fileBuffer)
          ? fileBuffer.toString("utf8")
          : String(fileBuffer || "");

        const response = await this.genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: prompt }] },
            { role: "user", parts: [{ text: textContent }] },
          ],
          safetySettings: this.safetySettings,
        });
        return response.text;
      }

      // Otherwise, upload binary content using Files API and reference it in the request
      let uploadedFile;
      try {
        uploadedFile = await this.genAI.files.upload({
          file: fileBuffer,
          mimeType,
        });

        const result = await this.genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [uploadedFile, { text: prompt }],
            },
          ],
          safetySettings: this.safetySettings,
        });

        const response = await result.response;
        return response.text;
      } finally {
        if (uploadedFile?.name) {
          try {
            await this.genAI.files.delete({ name: uploadedFile.name });
          } catch (cleanupErr) {
            // Non-fatal cleanup error
            console.warn("Failed to delete uploaded file:", cleanupErr?.message || cleanupErr);
          }
        }
      }
    } catch (error) {
      console.error("Error processing document:", error);
      throw new Error("Failed to process document");
    }
  }

  // NOTE: This method remains valid with the new SDK. No changes needed.
  async generateQuiz(content, settings) {
    const prompt = this.buildQuizPrompt(content, settings);

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        },
        safetySettings: this.safetySettings,
      });
      const jsonText = response.text;
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error("Failed to generate quiz");
    }
  }

  async generateChatResponse(messages, context = "") {
    try {
      // Format history for the chat session.
      const conversationHistory = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // The last message is the new prompt to the model.
      const latestMessage = conversationHistory.pop();
      if (!latestMessage || latestMessage.role !== "user") {
        throw new Error("The last message must be from the user.");
      }

      // Optional context injection
      if (context) {
        conversationHistory.unshift(
          { role: "user", parts: [{ text: `CONTEXT: ${context}` }] },
          { role: "model", parts: [{ text: "Acknowledged. I will use this context." }] }
        );
      }

      // Stateless call using full history + latest user message
      const contents = [...conversationHistory, latestMessage];
      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        safetySettings: this.safetySettings,
      });
      const response = await result.response;
      return response.text;
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  // Helpers
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
      prompt += `- Focus specifically on these areas: ${customizations.focusAreas.join(
        ", "
      )}\n`;
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
    prompt += `- Include calculations: ${
      settings.includeCalculations ? "Yes" : "No"
    }\n`;

    prompt += `\nReturn the quiz in the following JSON format:\n`;
    prompt += `{\n      "title": "Quiz Title",\n      "questions": [\n        {\n          "questionText": "Question text here",\n          "options": ["Option A", "Option B", "Option C", "Option D"],\n          "correctOption": 0,\n          "explanation": "Explanation for the correct answer",\n          "difficulty": "easy|medium|hard",\n          "includesCalculation": true|false\n        }\n      ]\n    }\n\n`;

    prompt += `Make sure each question has exactly 4 options, and the correctOption index is 0-based (0, 1, 2, or 3).`;

    return prompt;
  }
}

module.exports = new GeminiService();