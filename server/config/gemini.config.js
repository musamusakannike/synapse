const {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/genai");

let mime;
(async () => {
  const importedMime = await import('mime');
  mime = importedMime.default;
})();

function getMimeExtension(type) {
  if (!mime) throw new Error('MIME module not yet loaded.');
  return mime.getExtension(type);
}

// Helper functions for WAV conversion
function createWavHeader(dataLength, options) {
  const {
    numChannels,
    sampleRate,
    bitsPerSample,
  } = options;

  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

function parseMimeType(mimeType) {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [_, format] = fileType.split('/');

  const options = {
    numChannels: 1,
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options;
}

function convertToWav(rawData, mimeType) {
  const options = parseMimeType(mimeType)
  const wavHeader = createWavHeader(rawData.length, options);
  const buffer = Buffer.from(rawData, 'base64');

  return Buffer.concat([wavHeader, buffer]);
}


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

  async generateTTS(text) {
    const config = {
      temperature: 1,
      responseModalities: [
          'audio',
      ],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Zephyr',
          }
        }
      },
    };
    const model = 'gemini-2.5-pro-preview-tts';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: text,
          },
        ],
      },
    ];

    try {
        const response = await this.genAI.models.generateContentStream({
            model,
            config,
            contents,
        });

        let audioBuffer = Buffer.alloc(0);

        for await (const chunk of response) {
            if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
                continue;
            }
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
                const inlineData = chunk.candidates[0].content.parts[0].inlineData;
                let bufferChunk = Buffer.from(inlineData.data || '', 'base64');
                const fileExtension = getMimeExtension(inlineData.mimeType || '');
                if (!fileExtension) {
                    bufferChunk = convertToWav(inlineData.data || '', inlineData.mimeType || '');
                }
                audioBuffer = Buffer.concat([audioBuffer, bufferChunk]);
            }
        }
        return audioBuffer;
    } catch (error) {
        console.error("Error generating TTS:", error);
        throw new Error("Failed to generate TTS audio");
    }
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

  async generateFlashcards(content, settings) {
    const prompt = this.buildFlashcardPrompt(content, settings);

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
      console.error("Error generating flashcards:", error);
      throw new Error("Failed to generate flashcards");
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
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        safetySettings: this.safetySettings,
      });
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
    prompt += `{\n`;
    prompt += `  "title": "Flashcard Set Title",\n`;
    prompt += `  "description": "Brief description of the flashcard set",\n`;
    prompt += `  "flashcards": [\n`;
    prompt += `    {\n`;
    prompt += `      "front": "Question or term on the front of the card",\n`;
    prompt += `      "back": "Answer or definition on the back of the card",\n`;
    prompt += `      "difficulty": "easy|medium|hard",\n`;
    prompt += `      "tags": ["tag1", "tag2"]\n`;
    prompt += `    }\n`;
    prompt += `  ]\n`;
    prompt += `}\n\n`;

    prompt += `Guidelines:\n`;
    prompt += `- Make the front side concise (question, term, or concept)\n`;
    prompt += `- Make the back side comprehensive but clear (answer, definition, or explanation)\n`;
    prompt += `- Use appropriate difficulty levels based on content complexity\n`;
    prompt += `- Add relevant tags for categorization\n`;
    prompt += `- Ensure each flashcard tests a single concept\n`;
    prompt += `- Make flashcards that promote active recall and understanding`;

    return prompt;
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

    prompt += `\nCreate a structured outline with main sections and subsections. `;
    prompt += `The outline should be logical, progressive, and cover all essential aspects of the topic.\n\n`;

    prompt += `Return the outline in the following JSON format:\n`;
    prompt += `{\n`;
    prompt += `  "outline": [\n`;
    prompt += `    {\n`;
    prompt += `      "section": "Main Section Title",\n`;
    prompt += `      "subsections": ["Subsection 1", "Subsection 2", "Subsection 3"]\n`;
    prompt += `    }\n`;
    prompt += `  ]\n`;
    prompt += `}\n\n`;

    prompt += `Guidelines:\n`;
    prompt += `- Create 5-10 main sections depending on topic complexity\n`;
    prompt += `- Each section should have 2-5 subsections\n`;
    prompt += `- Progress from foundational concepts to advanced topics\n`;
    prompt += `- Ensure logical flow and coherence\n`;
    prompt += `- Make sections comprehensive but focused`;

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
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        safetySettings: this.safetySettings,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating section content:", error);
      throw new Error("Failed to generate section content");
    }
  }
}

module.exports = new GeminiService();
