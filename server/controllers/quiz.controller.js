const Quiz = require("../models/quiz.model");
const Document = require("../models/document.model");
const Website = require("../models/website.model");
const GeminiService = require("../config/gemini.config");
const { createChatWithAttachment } = require("./chat.controller");

// POST /api/quizzes
// Body: { title, description?, sourceType: 'topic'|'document'|'website', sourceId?, sourceModel?, content?, settings? }
async function createQuiz(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      description,
      sourceType = "topic",
      sourceId,
      sourceModel,
      content,
      settings = {},
    } = req.body || {};

    if (!title) return res.status(400).json({ message: "Title is required" });

    // Determine quiz content for generation
    let generationContent = content || "";
    if (!generationContent) {
      if (sourceType === "document" && sourceId) {
        const doc = await Document.findOne({ _id: sourceId, userId });
        if (!doc) return res.status(404).json({ message: "Source document not found" });
        generationContent = doc.extractedText || doc.summary || "";
        if (!generationContent) {
          return res.status(400).json({ message: "Document has no content to generate quiz from" });
        }
      } else if (sourceType === "website" && sourceId) {
        const site = await Website.findOne({ _id: sourceId, userId });
        if (!site) return res.status(404).json({ message: "Source website not found" });
        generationContent = site.extractedContent || site.summary || "";
        if (!generationContent) {
          return res.status(400).json({ message: "Website has no content to generate quiz from" });
        }
      } else if (sourceType === "topic") {
        generationContent = description || title;
      }
    }

    // Generate questions via Gemini
    const quizJSON = await GeminiService.generateQuiz(generationContent, settings);

    const quiz = await Quiz.create({
      userId,
      title: quizJSON.title || title,
      description: description || undefined,
      sourceType,
      sourceId: sourceId || undefined,
      sourceModel:
        sourceModel ||
        (sourceType === "document"
          ? "Document"
          : sourceType === "website"
          ? "Website"
          : undefined),
      questions: quizJSON.questions || [],
      settings: {
        numberOfQuestions: settings.numberOfQuestions ?? (quizJSON.questions?.length || 10),
        difficulty: settings.difficulty ?? "mixed",
        includeCalculations: settings.includeCalculations ?? false,
        timeLimit: settings.timeLimit,
      },
    });

    // Create a chat with quiz attachment
    try {
      const chatTitle = `${quiz.title} - Quiz`;
      const messageContent = `I've generated a quiz for you: "${quiz.title}"\n\nThis quiz contains ${quiz.questions.length} questions. You can start the quiz and track your progress!`;
      
      await createChatWithAttachment(
        userId,
        chatTitle,
        "quiz",
        quiz._id,
        "Quiz",
        "quiz",
        {
          quizId: quiz._id,
          title: quiz.title,
          questions: quiz.questions,
          settings: quiz.settings,
        },
        messageContent
      );
    } catch (chatError) {
      console.error("Failed to create chat for quiz:", chatError);
      // Continue without failing the quiz creation
    }

    return res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/quizzes
async function listQuizzes(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/quizzes/:id
async function getQuiz(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.status(200).json(quiz);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/quizzes/:id
async function deleteQuiz(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const quiz = await Quiz.findOneAndDelete({ _id: id, userId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.status(200).json({ message: "Quiz deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/quizzes/:id/attempt
// Body: { answers: [{ questionIndex, selectedOption, timeSpent? }] }
async function submitAttempt(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { answers = [] } = req.body || {};

    const quiz = await Quiz.findOne({ _id: id, userId });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let correct = 0;
    const evaluated = answers.map((a) => {
      const q = quiz.questions[a.questionIndex];
      const isCorrect = q && typeof a.selectedOption === "number" && q.correctOption === a.selectedOption;
      if (isCorrect) correct += 1;
      return {
        questionIndex: a.questionIndex,
        selectedOption: a.selectedOption,
        isCorrect: !!isCorrect,
        timeSpent: typeof a.timeSpent === "number" ? a.timeSpent : undefined,
      };
    });

    const attempt = {
      answers: evaluated,
      score: correct,
      totalQuestions: quiz.questions.length,
      completedAt: new Date(),
    };
    quiz.attempts.push(attempt);
    await quiz.save();

    return res.status(200).json({ attempt, quizId: quiz._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createQuiz,
  listQuizzes,
  getQuiz,
  deleteQuiz,
  submitAttempt,
};
