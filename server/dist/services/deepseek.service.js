"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class DeepSeekService {
    static get baseUrl() {
        return process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    }
    static get apiKey() {
        return process.env.DEEPSEEK_API_KEY;
    }
    static get model() {
        return process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    }
    /**
     * Main method to invoke DeepSeek Chat Completion with streaming capability.
     * If DEEPSEEK_API_KEY is missing, simulates realistic dummy streaming responses.
     */
    static async streamChatCompletion(messages, onChunk) {
        const apiKey = this.apiKey;
        // Fallback to simulated dummy response if no API key is provided
        if (!apiKey) {
            return this.simulateDummyStream(messages, onChunk);
        }
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    stream: true,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`DeepSeek API error [${response.status}]: ${errorText}`);
                throw new Error(`DeepSeek API request failed with status ${response.status}`);
            }
            if (!response.body) {
                throw new Error('No response body returned from DeepSeek API stream.');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullText = '';
            let buffer = '';
            while (true) {
                const { value, done } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]')
                        continue;
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const jsonStr = trimmed.slice(6);
                            const parsed = JSON.parse(jsonStr);
                            const deltaContent = parsed.choices?.[0]?.delta?.content || '';
                            if (deltaContent) {
                                fullText += deltaContent;
                                onChunk(deltaContent);
                            }
                        }
                        catch (err) {
                            // Ignore partial JSON parse errors on stream chunk boundary
                        }
                    }
                }
            }
            // Handle any trailing buffer
            if (buffer.trim() && buffer.trim() !== 'data: [DONE]' && buffer.startsWith('data: ')) {
                try {
                    const parsed = JSON.parse(buffer.slice(6));
                    const deltaContent = parsed.choices?.[0]?.delta?.content || '';
                    if (deltaContent) {
                        fullText += deltaContent;
                        onChunk(deltaContent);
                    }
                }
                catch (_) { }
            }
            return fullText;
        }
        catch (error) {
            console.warn('Falling back to dummy AI streaming due to DeepSeek API error:', error.message);
            return this.simulateDummyStream(messages, onChunk);
        }
    }
    /**
     * Helper to simulate real-time streaming when no key is set or API fails.
     */
    static async simulateDummyStream(messages, onChunk) {
        const lastUserMessage = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
        const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
        let fullResponse = '';
        if (systemPrompt.includes('SUMMARIZER')) {
            fullResponse = `**Summary:**\n- Key Concept: ${lastUserMessage.slice(0, 50)}...\n- Highlighting core principles, key terms, and active recall points for effective study.\n- Remember to review flashcards and test yourself with quiz practice for maximum retention.`;
        }
        else if (systemPrompt.includes('QUIZ_GENERATOR')) {
            fullResponse = JSON.stringify([
                {
                    question: `What is the core principle of ${lastUserMessage.slice(0, 30)}?`,
                    options: [
                        { text: 'Fundamental building block and standard execution context', isCorrect: true },
                        { text: 'Secondary legacy fallback option', isCorrect: false },
                        { text: 'Unused dynamic property identifier', isCorrect: false },
                        { text: 'Global static override scope', isCorrect: false },
                    ],
                    explanation: 'This option represents the core definition according to standard documentation.',
                },
                {
                    question: `Which scenario best demonstrates practical usage of ${lastUserMessage.slice(0, 30)}?`,
                    options: [
                        { text: 'Encapsulating private state and preventing scope leaks', isCorrect: true },
                        { text: 'Forcing synchronous thread blocking', isCorrect: false },
                        { text: 'Bypassing strict type validation checks', isCorrect: false },
                        { text: 'Direct hardware memory address allocation', isCorrect: false },
                    ],
                    explanation: 'Encapsulation and scope isolation are primary design objectives.',
                },
            ], null, 2);
        }
        else if (systemPrompt.includes('FLASHCARD_GENERATOR')) {
            fullResponse = JSON.stringify([
                {
                    front: `What is ${lastUserMessage.slice(0, 30)}?`,
                    back: 'A central concept in this domain that encapsulates key functionality and structure.',
                },
                {
                    front: `Why is ${lastUserMessage.slice(0, 30)} important?`,
                    back: 'It allows modularity, efficient performance, and reliable state management.',
                },
            ], null, 2);
        }
        else if (systemPrompt.includes('QA_AI')) {
            fullResponse = `### Explanation for: "${lastUserMessage}"\n\nGreat question! In modern concepts, **${lastUserMessage.slice(0, 30)}** works by establishing clear boundaries and rules.\n\n1. **Core Concept**: It defines how data or operations flow.\n2. **Best Practice**: Always structure your logic cleanly and write tests to verify behavior.`;
        }
        else {
            fullResponse = `Here is AI assistance for your query:\n\nRegarding "${lastUserMessage}", it is important to focus on fundamental principles, consistent practice, and active revision.`;
        }
        // Stream out words in small chunks
        const chunks = fullResponse.split(/(?<=\s)/);
        for (const chunk of chunks) {
            onChunk(chunk);
            await new Promise((res) => setTimeout(res, 25));
        }
        return fullResponse;
    }
    /**
     * Summarize notes or text snippet.
     */
    static async summarize(text, onChunk) {
        const messages = [
            {
                role: 'system',
                content: 'You are SUMMARIZER, an expert AI tutor on SabiLearn. Provide a clear, concise, and structured bullet-point summary of the user input text.',
            },
            {
                role: 'user',
                content: text,
            },
        ];
        return this.streamChatCompletion(messages, onChunk || (() => { }));
    }
    /**
     * Generate multiple-choice quiz questions for a general topic or prompt.
     */
    static async generateQuiz(topic, count = 3, onChunk) {
        const messages = [
            {
                role: 'system',
                content: `You are QUIZ_GENERATOR AI tutor on SabiLearn. Generate ${count} multiple-choice questions for the requested topic.
Output strictly valid JSON in the following schema format without any markdown formatting wrappers if possible, or inside a clean \`\`\`json code block:
[
  {
    "question": "Question text here?",
    "options": [
      { "text": "Option A", "isCorrect": true },
      { "text": "Option B", "isCorrect": false },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Brief explanation of correct answer."
  }
]`,
            },
            {
                role: 'user',
                content: `Generate ${count} quiz questions about: ${topic}`,
            },
        ];
        const rawResult = await this.streamChatCompletion(messages, onChunk || (() => { }));
        return this.parseQuizResponse(rawResult);
    }
    /**
     * Generate quiz questions specifically for a course or topic context.
     */
    static async generateQuizForContext(contextType, title, descriptionOrContent, count = 3, difficulty = 'medium', onChunk) {
        const messages = [
            {
                role: 'system',
                content: `You are QUIZ_GENERATOR AI tutor on SabiLearn. Generate ${count} ${difficulty}-difficulty multiple choice quiz questions based on the provided ${contextType} context.
Output strictly valid JSON in this schema format:
[
  {
    "question": "Question text?",
    "options": [
      { "text": "Option 1", "isCorrect": true },
      { "text": "Option 2", "isCorrect": false },
      { "text": "Option 3", "isCorrect": false },
      { "text": "Option 4", "isCorrect": false }
    ],
    "explanation": "Why this answer is correct."
  }
]`,
            },
            {
                role: 'user',
                content: `${contextType.toUpperCase()} TITLE: ${title}\nCONTEXT / CONTENT:\n${descriptionOrContent}`,
            },
        ];
        const rawResult = await this.streamChatCompletion(messages, onChunk || (() => { }));
        return this.parseQuizResponse(rawResult);
    }
    /**
     * Generate flashcards for a topic.
     */
    static async generateFlashcards(topic, count = 3, onChunk) {
        const messages = [
            {
                role: 'system',
                content: `You are FLASHCARD_GENERATOR AI tutor on SabiLearn. Generate ${count} flashcards for study.
Output strictly valid JSON in the format:
[
  {
    "front": "Question or term on front of card",
    "back": "Detailed answer or definition on back of card"
  }
]`,
            },
            {
                role: 'user',
                content: `Generate ${count} flashcards for topic: ${topic}`,
            },
        ];
        const rawResult = await this.streamChatCompletion(messages, onChunk || (() => { }));
        return this.parseFlashcardResponse(rawResult);
    }
    /**
     * Answer study Q&A questions.
     */
    static async askQA(question, context, onChunk) {
        const messages = [
            {
                role: 'system',
                content: 'You are QA_AI, an encouraging, clear, and expert tutor on SabiLearn. Answer the user study question thoroughly with explanations and examples.',
            },
            {
                role: 'user',
                content: context ? `Context:\n${context}\n\nQuestion: ${question}` : question,
            },
        ];
        return this.streamChatCompletion(messages, onChunk || (() => { }));
    }
    static parseQuizResponse(raw) {
        try {
            const cleanJson = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed))
                return parsed;
        }
        catch (e) {
            console.warn('Failed to parse quiz response JSON from AI, fallback returning raw text format');
        }
        return [
            {
                question: `Generated question for topic`,
                options: [
                    { text: 'Sample Option A', isCorrect: true },
                    { text: 'Sample Option B', isCorrect: false },
                ],
                explanation: raw,
            },
        ];
    }
    static parseFlashcardResponse(raw) {
        try {
            const cleanJson = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed))
                return parsed;
        }
        catch (e) {
            console.warn('Failed to parse flashcard response JSON from AI');
        }
        return [
            {
                front: 'Study Front',
                back: raw,
            },
        ];
    }
}
exports.DeepSeekService = DeepSeekService;
