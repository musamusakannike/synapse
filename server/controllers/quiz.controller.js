const Quiz = require("../models/quiz.model");
const Document = require("../models/document.model");
const Website = require("../models/website.model");
const Course = require("../models/course.model");
const GeminiService = require("../config/gemini.config");
const { createChatWithAttachment } = require("./chat.controller");

// Async function to generate quiz questions in parts
async function generateQuizAsync(quizId, content, settings, numberOfQuestions, userId) {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return;

    let allQuestions = [];
    
    // Always generate in batches of max 10 questions to avoid JSON parsing errors
    const batchSize = 10;
    const numBatches = Math.ceil(numberOfQuestions / batchSize);
    
    for (let i = 0; i < numBatches; i++) {
      const questionsInBatch = Math.min(batchSize, numberOfQuestions - (i * batchSize));
      
      // Add context to help AI generate diverse questions across batches
      let batchContent = content;
      if (numBatches > 1) {
        const batchNumber = i + 1;
        if (batchNumber === 1) {
          batchContent += `\n\nGenerate the FIRST batch of questions (${questionsInBatch} questions) focusing on foundational concepts and introductory topics.`;
        } else if (batchNumber === numBatches) {
          batchContent += `\n\nGenerate the FINAL batch of questions (${questionsInBatch} questions) focusing on advanced concepts and complex topics. Make sure questions are different from previous batches.`;
        } else {
          batchContent += `\n\nGenerate batch ${batchNumber} of questions (${questionsInBatch} questions) focusing on intermediate concepts. Make sure questions are different from previous batches.`;
        }
      }
      
      const batchSettings = { ...settings, numberOfQuestions: questionsInBatch };
      const batchResult = await GeminiService.generateQuiz(batchContent, batchSettings);
      
      if (batchResult.questions && batchResult.questions.length > 0) {
        allQuestions = [...allQuestions, ...batchResult.questions];
        
        // Update quiz with current progress
        quiz.questions = allQuestions;
        if (i === 0 && batchResult.title) {
          quiz.title = batchResult.title;
        }
        await quiz.save();
      }
    }
    
    // Mark as completed
    quiz.status = "completed";
    await quiz.save();

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
      // Continue without failing the quiz generation
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    const quiz = await Quiz.findById(quizId);
    if (quiz) {
      quiz.status = "failed";
      await quiz.save();
    }
  }
}

// POST /api/quizzes
// Body: { title, description?, sourceType: 'topic'|'document'|'website'|'course', sourceId?, sourceModel?, content?, settings? }
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
      } else if (sourceType === "course" && sourceId) {
        const course = await Course.findOne({ _id: sourceId, userId });
        if (!course) return res.status(404).json({ message: "Source course not found" });
        // Build content from course outline and content
        let courseContent = `Course: ${course.title}\n`;
        if (course.description) courseContent += `Description: ${course.description}\n\n`;
        if (course.content && course.content.length > 0) {
          courseContent += "Course Content:\n";
          course.content.forEach((section) => {
            courseContent += `\n## ${section.section}\n`;
            if (section.subsection) courseContent += `### ${section.subsection}\n`;
            courseContent += section.explanation + "\n";
          });
        } else if (course.outline && course.outline.length > 0) {
          courseContent += "Course Outline:\n";
          course.outline.forEach((section) => {
            courseContent += `\n## ${section.section}\n`;
            if (section.subsections) {
              section.subsections.forEach((sub) => {
                courseContent += `- ${sub}\n`;
              });
            }
          });
        }
        generationContent = courseContent;
        if (!generationContent || generationContent.length < 50) {
          return res.status(400).json({ message: "Course has insufficient content to generate quiz from" });
        }
      } else if (sourceType === "topic") {
        generationContent = description || title;
      }
    }

    // Get number of questions from settings
    const numberOfQuestions = settings.numberOfQuestions ?? 10;
    
    // Create quiz with initial status
    const quiz = await Quiz.create({
      userId,
      title,
      description: description || undefined,
      sourceType,
      sourceId: sourceId || undefined,
      sourceModel:
        sourceModel ||
        (sourceType === "document"
          ? "Document"
          : sourceType === "website"
          ? "Website"
          : sourceType === "course"
          ? "Course"
          : undefined),
      questions: [],
      status: "generating",
      settings: {
        numberOfQuestions: numberOfQuestions,
        difficulty: settings.difficulty ?? "mixed",
        includeCalculations: settings.includeCalculations ?? false,
        timeLimit: settings.timeLimit,
      },
    });

    // Generate questions asynchronously
    generateQuizAsync(quiz._id, generationContent, settings, numberOfQuestions, userId);

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
