const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const deepseekService = require("../config/deepseek.config");
const Topic = require("../models/topic.model");
const Document = require("../models/document.model");
const Website = require("../models/website.model");
const Course = require("../models/course.model");
const Quiz = require("../models/quiz.model");
const FlashcardSet = require("../models/flashcard.model");
const { validationResult } = require("express-validator");
const { ToolLoopAgent, pipeAgentUIStreamToResponse, tool } = require("ai");
const { z } = require("zod");

// Helper functions for executing function calling actions

/**
 * Execute flashcard generation from function call
 */
const executeFlashcardGeneration = async (args, userId, chatId) => {
  const { topic, numberOfCards = 10, difficulty = "medium", includeExamples = false } = args;
  
  const settings = {
    numberOfCards: Math.min(Math.max(numberOfCards, 5), 30), // Clamp between 5-30
    difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium",
    includeDefinitions: true,
    includeExamples,
    focusAreas: [],
  };

  // Generate flashcards using the gemini service
  const generatedData = await deepseekService.generateFlashcards(topic, settings);

  // Create flashcard set
  const flashcardSet = new FlashcardSet({
    userId,
    title: generatedData.title || `${topic} - Flashcards`,
    description: generatedData.description || `Flashcards generated from chat about ${topic}`,
    sourceType: "manual",
    sourceId: null,
    sourceModel: null,
    flashcards: generatedData.flashcards,
    settings,
  });

  await flashcardSet.save();

  return {
    type: "flashcard",
    data: {
      flashcardSetId: flashcardSet._id,
      title: flashcardSet.title,
      description: flashcardSet.description,
      flashcardCount: flashcardSet.flashcards.length,
      flashcards: flashcardSet.flashcards,
    },
    message: `I've created ${flashcardSet.flashcards.length} flashcards for "${topic}"! You can access them in your Flashcards section.`,
  };
};

/**
 * Execute course generation from function call
 */
const executeCourseGeneration = async (args, userId) => {
  const {
    title,
    description = "",
    level = "intermediate",
    detailLevel = "moderate",
    includeExamples = true,
    includePracticeQuestions = false,
  } = args;

  const settings = {
    level: ["beginner", "intermediate", "advanced"].includes(level) ? level : "intermediate",
    detailLevel: ["basic", "moderate", "comprehensive"].includes(detailLevel) ? detailLevel : "moderate",
    includeExamples,
    includePracticeQuestions,
  };

  // Create course with initial status
  const course = await Course.create({
    userId,
    title,
    description: description || undefined,
    settings,
    status: "generating_outline",
    outline: [],
    content: [],
  });

  // Start async generation (same as course.controller.js)
  generateCourseOutlineAsync(course._id, title, description, settings, userId);

  return {
    type: "course",
    data: {
      courseId: course._id,
      title: course.title,
      description: course.description,
      status: course.status,
      settings: course.settings,
    },
    message: `I'm generating a comprehensive course on "${title}" for you! This may take a few minutes. You can check the progress in your Courses section.`,
  };
};

// Async function to generate course outline and content (copied from course.controller.js)
async function generateCourseOutlineAsync(courseId, title, description, settings, userId) {
  try {
    const outlineData = await deepseekService.generateCourseOutline(title, description, settings);

    const course = await Course.findById(courseId);
    if (!course) return;

    course.outline = outlineData.outline || [];
    course.status = "generating_content";
    await course.save();

    const contentArray = [];
    for (const section of course.outline) {
      const sectionContent = await deepseekService.generateSectionContent(
        title,
        section.section,
        null,
        settings
      );
      contentArray.push({
        section: section.section,
        subsection: null,
        explanation: sectionContent,
      });

      if (section.subsections && section.subsections.length > 0) {
        for (const subsection of section.subsections) {
          const subsectionContent = await deepseekService.generateSectionContent(
            title,
            section.section,
            subsection,
            settings
          );
          contentArray.push({
            section: section.section,
            subsection: subsection,
            explanation: subsectionContent,
          });
        }
      }
    }

    course.content = contentArray;
    course.status = "completed";
    await course.save();

    // Create a chat with course attachment
    try {
      const chatTitle = `${course.title} - Course`;
      const messageContent = `I've generated a complete course for you: "${course.title}"\n\nThe course includes ${course.outline.length} main sections with detailed content. You can ask me questions about any topic in the course!`;
      
      await createChatWithAttachment(
        userId,
        chatTitle,
        "course",
        course._id,
        "Course",
        "course",
        {
          courseId: course._id,
          title: course.title,
          outline: course.outline,
          settings: course.settings,
        },
        messageContent
      );
    } catch (chatError) {
      console.error("Failed to create chat for course:", chatError);
    }
  } catch (error) {
    console.error("Error generating course:", error);
    const course = await Course.findById(courseId);
    if (course) {
      course.status = "failed";
      await course.save();
    }
  }
}

/**
 * Execute quiz generation from function call
 */
const executeQuizGeneration = async (args, userId) => {
  const {
    title,
    description = "",
    numberOfQuestions = 10,
    difficulty = "mixed",
    includeCalculations = false,
  } = args;

  const settings = {
    numberOfQuestions: Math.min(Math.max(numberOfQuestions, 5), 50), // Clamp between 5-50
    difficulty: ["easy", "medium", "hard", "mixed"].includes(difficulty) ? difficulty : "mixed",
    includeCalculations,
  };

  // Create quiz with initial status
  const quiz = await Quiz.create({
    userId,
    title,
    description: description || undefined,
    sourceType: "topic",
    questions: [],
    status: "generating",
    settings,
  });

  // Generate quiz content (topic-based)
  const generationContent = description || title;
  generateQuizAsync(quiz._id, generationContent, settings, settings.numberOfQuestions, userId);

  return {
    type: "quiz",
    data: {
      quizId: quiz._id,
      title: quiz.title,
      description: quiz.description,
      status: quiz.status,
      settings: quiz.settings,
    },
    message: `I'm generating a quiz on "${title}" with ${settings.numberOfQuestions} questions! You can check the progress in your Quizzes section.`,
  };
};

// Async function to generate quiz questions (adapted from quiz.controller.js)
async function generateQuizAsync(quizId, content, settings, numberOfQuestions, userId) {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return;

    let allQuestions = [];
    const batchSize = 10;
    const numBatches = Math.ceil(numberOfQuestions / batchSize);
    
    for (let i = 0; i < numBatches; i++) {
      const questionsInBatch = Math.min(batchSize, numberOfQuestions - (i * batchSize));
      
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
      const batchResult = await deepseekService.generateQuiz(batchContent, batchSettings);
      
      if (batchResult.questions && batchResult.questions.length > 0) {
        allQuestions = [...allQuestions, ...batchResult.questions];
        
        quiz.questions = allQuestions;
        if (i === 0 && batchResult.title) {
          quiz.title = batchResult.title;
        }
        await quiz.save();
      }
    }
    
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

/**
 * Execute document analysis from function call
 */
const executeDocumentAnalysis = async (args, documentContent, documentName) => {
  const { analysisType = "summary", focusAreas = "" } = args;

  let prompt = "";
  switch (analysisType) {
    case "key_points":
      prompt = `Extract and list the key points from this document. Focus on the most important concepts, facts, and takeaways.`;
      break;
    case "questions":
      prompt = `Generate study questions based on this document. Create questions that test understanding of the main concepts.`;
      break;
    case "detailed":
      prompt = `Provide a detailed analysis of this document including: main themes, key concepts, important details, and conclusions.`;
      break;
    case "summary":
    default:
      prompt = `Summarize this document concisely, highlighting the main points and key information.`;
      break;
  }

  if (focusAreas) {
    prompt += `\n\nFocus specifically on: ${focusAreas}`;
  }

  prompt += `\n\nDocument: ${documentName}\nContent: ${documentContent}`;

  const analysis = await deepseekService.generateChatResponse(
    [{ role: "user", content: prompt }],
    ""
  );

  return {
    type: "document_analysis",
    data: {
      analysisType,
      focusAreas,
    },
    message: analysis,
  };
};

const getUserChats = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      userId: req.user._id,
      isActive: true,
      isArchived: false,
    })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .select("title type sourceId sourceModel lastActivity createdAt messages isArchived isFavorite")
      .populate("sourceId", "title originalName url");

    const total = await Chat.countDocuments({
      userId: req.user._id,
      isActive: true,
      isArchived: false,
    });

    // Add message count and last message preview
    const chatsWithPreview = chats.map((chat) => ({
      id: chat._id,
      title: chat.title,
      type: chat.type,
      sourceId: chat.sourceId,
      sourceModel: chat.sourceModel,
      messageCount: chat.messages.length,
      lastMessage:
        chat.messages.length > 0
          ? {
              role: chat.messages[chat.messages.length - 1].role,
              content:
                chat.messages[chat.messages.length - 1].content.substring(
                  0,
                  100
                ) + "...",
              timestamp: chat.messages[chat.messages.length - 1].timestamp,
            }
          : null,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      isArchived: chat.isArchived,
      isFavorite: chat.isFavorite,
    }));

    res.json({
      chats: chatsWithPreview,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

const getChatWithMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceId", "title originalName url");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ chat });
  } catch (error) {
    console.error("Get chat error:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
};

// Helper function to map Vercel AI SDK UIMessage array back to database schema
const mapUIMessagesToDbMessages = (uiMessages) => {
  return uiMessages
    .filter((msg) => msg.role !== "system")
    .map((msg) => {
      const dbMsg = {
        role: msg.role,
        content: msg.content || "",
        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        attachments: [],
      };

      if (msg.attachments) {
        dbMsg.attachments = [...msg.attachments];
      }

      if (msg.toolInvocations) {
        for (const invocation of msg.toolInvocations) {
          if (invocation.state === "result" && invocation.result) {
            const res = invocation.result;
            if (["flashcard", "quiz", "course"].includes(res.type)) {
              // Check if already in attachments to avoid duplicates
              const exists = dbMsg.attachments.some(
                (att) =>
                  att.type === res.type &&
                  String(att.data?.flashcardSetId || att.data?.quizId || att.data?.courseId) ===
                    String(res.data?.flashcardSetId || res.data?.quizId || res.data?.courseId)
              );
              if (!exists) {
                dbMsg.attachments.push({
                  type: res.type,
                  data: res.data,
                  metadata: { createdAt: new Date() },
                });
              }
            }
          }
        }
      }

      return dbMsg;
    });
};

const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, messages } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceId");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if the chat has a document attached (for document analysis detection)
    const hasDocument = chat.type === "document" && chat.sourceId;

    // Define tools
    const tools = {
      generate_flashcards: tool({
        description: "Generate flashcards for studying a topic. Use this when the user specifically requests to generate, create, or build flashcards or study cards.",
        parameters: z.object({
          topic: z.string().describe("The topic or subject to generate flashcards about"),
          numberOfCards: z.number().optional().describe("Number of flashcards to generate (default: 10, range: 5-30)"),
          difficulty: z.enum(["easy", "medium", "hard"]).optional().describe("Difficulty level (default: medium)"),
          includeExamples: z.boolean().optional().describe("Whether to include examples (default: false)"),
        }),
        execute: async (args) => {
          return await executeFlashcardGeneration(args, req.user._id, chat._id);
        },
      }),
      generate_course: tool({
        description: "Generate a comprehensive course outline and start generating course content on a topic. Use this when the user specifically requests to create, make, or build a course, study guide, or structured course on a topic.",
        parameters: z.object({
          title: z.string().describe("The title or topic of the course"),
          description: z.string().optional().describe("Optional description or specific focus areas of the course"),
          level: z.enum(["beginner", "intermediate", "advanced"]).optional().describe("Target level (default: intermediate)"),
          detailLevel: z.enum(["basic", "moderate", "comprehensive"]).optional().describe("How detailed the content should be (default: moderate)"),
          includeExamples: z.boolean().optional().describe("Whether to include examples (default: true)"),
          includePracticeQuestions: z.boolean().optional().describe("Whether to include practice questions (default: false)"),
        }),
        execute: async (args) => {
          return await executeCourseGeneration(args, req.user._id);
        },
      }),
      generate_quiz: tool({
        description: "Generate a quiz or test questions on a topic. Use this when the user specifically requests to generate, create, or build a quiz, test, assessment, or practice questions.",
        parameters: z.object({
          title: z.string().describe("The title or topic of the quiz"),
          description: z.string().optional().describe("Optional description or specific focus areas for the quiz"),
          numberOfQuestions: z.number().optional().describe("Number of questions to generate (default: 10, range: 5-50)"),
          difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional().describe("Difficulty level (default: mixed)"),
          includeCalculations: z.boolean().optional().describe("Whether to include calculation-based questions (default: false)"),
        }),
        execute: async (args) => {
          return await executeQuizGeneration(args, req.user._id);
        },
      }),
    };

    if (hasDocument) {
      tools.analyze_document = tool({
        description: "Analyze or extract information from the uploaded document. Use this ONLY when the user asks to summarize, analyze, query, or extract information from the attached document.",
        parameters: z.object({
          analysisType: z.enum(["summary", "key_points", "questions", "detailed"]).optional().describe("Type of analysis (default: summary)"),
          focusAreas: z.string().optional().describe("Specific areas or topics in the document to focus on"),
        }),
        execute: async (args) => {
          return await executeDocumentAnalysis(
            args,
            chat.sourceId.extractedText || chat.sourceId.summary,
            chat.sourceId.originalName
          );
        },
      });
    }

    // Initialize agent
    const agent = new ToolLoopAgent({
      model: deepseekService.sdkModel,
      instructions: `You are Synapse AI, an intelligent learning assistant created by Musa Musa Kannike. Your primary function is to help users learn, understand concepts, and answer their questions across various subjects. If asked about your identity, creator, or purpose, you can share this information. However, focus primarily on providing helpful, accurate responses to the user's main questions without unnecessarily mentioning your identity unless specifically asked.`,
      tools,
    });

    // Prepare context
    let context = "";
    if (chat.sourceId) {
      switch (chat.type) {
        case "topic":
          context = `Topic: ${chat.sourceId.title}\nContent: ${
            chat.sourceId.generatedContent || chat.sourceId.content
          }`;
          break;
        case "document":
          context = `Document: ${chat.sourceId.originalName}\nContent: ${chat.sourceId.extractedText}`;
          break;
        case "website":
          context = `Website: ${chat.sourceId.url}\nContent: ${chat.sourceId.extractedContent}`;
          break;
      }
    }

    // Construct UI Messages input
    const uiMessages = [];
    const systemPrompt = `You are Synapse AI, an intelligent learning assistant created by Musa Musa Kannike. Your primary function is to help users learn, understand concepts, and answer their questions across various subjects. If asked about your identity, creator, or purpose, you can share this information. However, focus primarily on providing helpful, accurate responses to the user's main questions without unnecessarily mentioning your identity unless specifically asked.`;
    
    uiMessages.push({
      id: "system-instruction",
      role: "system",
      content: systemPrompt,
    });

    if (context) {
      uiMessages.push({
        id: "system-context",
        role: "system",
        content: `CONTEXT:\n${context}\n\nUse this context to inform your responses where relevant.`,
      });
    }

    // Get input messages from request body, fallback to simple content
    const inputMessages = messages || [{ role: "user", content: content }];

    // Map input messages to conform with AI SDK expectations
    const processedMessages = inputMessages
      .filter((m) => m.role !== "system")
      .map((m, idx) => ({
        id: m.id || `msg-${idx}-${Date.now()}`,
        role: m.role,
        content: m.content || "",
        attachments: m.attachments,
        toolInvocations: m.toolInvocations,
      }));

    uiMessages.push(...processedMessages);

    // Stream response using Vercel AI SDK
    await pipeAgentUIStreamToResponse({
      response: res,
      agent,
      uiMessages,
      onFinish: async ({ messages: finalMessages }) => {
        try {
          const chatToUpdate = await Chat.findById(chat._id);
          if (chatToUpdate) {
            chatToUpdate.messages = mapUIMessagesToDbMessages(finalMessages);

            // Auto-generate title if this is the first real exchange (e.g. 1 user + 1 assistant message)
            if (
              chatToUpdate.messages.length <= 3 &&
              (chatToUpdate.title === "New Chat" || chatToUpdate.title.includes("Chat"))
            ) {
              const firstUserMsg = chatToUpdate.messages.find((m) => m.role === "user");
              if (firstUserMsg) {
                const generatedTitle = await deepseekService.generateChatTitle(firstUserMsg.content);
                chatToUpdate.title = generatedTitle;
              }
            }

            chatToUpdate.lastActivity = new Date();
            await chatToUpdate.save();
          }
        } catch (dbError) {
          console.error("Failed to save chat on stream finish:", dbError);
        }
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
};

const createNewChat = async (req, res) => {
  try {
    const { title, type = "general", sourceId } = req.body || {};

    let chatTitle = title || "New Chat";
    let chatType = type;
    let sourceModel = undefined;
    let sourceRef = undefined;

    // If creating a chat tied to a source, validate and set defaults
    if (chatType !== "general") {
      if (!sourceId) {
        return res.status(400).json({ error: "sourceId is required for non-general chats" });
      }

      if (chatType === "topic") {
        const topic = await Topic.findOne({ _id: sourceId, userId: req.user._id });
        if (!topic) return res.status(404).json({ error: "Topic not found" });
        sourceModel = "Topic";
        sourceRef = topic._id;
        if (!title) chatTitle = `${topic.title} - Chat`;
      } else if (chatType === "document") {
        const doc = await Document.findOne({ _id: sourceId, userId: req.user._id });
        if (!doc) return res.status(404).json({ error: "Document not found" });
        sourceModel = "Document";
        sourceRef = doc._id;
        if (!title) chatTitle = `${doc.originalName} - Chat`;
      } else if (chatType === "website") {
        const site = await Website.findOne({ _id: sourceId, userId: req.user._id });
        if (!site) return res.status(404).json({ error: "Website not found" });
        sourceModel = "Website";
        sourceRef = site._id;
        if (!title) chatTitle = `${site.title || site.url} - Chat`;
      } else if (chatType !== "general") {
        return res.status(400).json({ error: "Invalid chat type" });
      }
    }

    const chat = new Chat({
      userId: req.user._id,
      title: chatTitle,
      type: chatType,
      sourceId: sourceRef,
      sourceModel,
      messages: [],
    });

    await chat.save();

    res.status(201).json({
      message: "Chat created successfully",
      chat: {
        id: chat._id,
        title: chat.title,
        type: chat.type,
        sourceId: chat.sourceId,
        sourceModel: chat.sourceModel,
        messages: chat.messages,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error("Create chat error:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
};

const updateChatTitle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.title = title;
    await chat.save();

    res.json({
      message: "Chat title updated successfully",
      title: chat.title,
    });
  } catch (error) {
    console.error("Update chat title error:", error);
    res.status(500).json({ error: "Failed to update chat title" });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Soft delete - mark as inactive
    chat.isActive = false;
    await chat.save();

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
};

const bulkDeleteChats = async (req, res) => {
  try {
    const { chatIds } = req.body;

    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({ error: "chatIds array is required" });
    }

    // Soft delete all chats that belong to the user
    const result = await Chat.updateMany(
      {
        _id: { $in: chatIds },
        userId: req.user._id,
      },
      {
        $set: { isActive: false },
      }
    );

    res.json({
      message: "Chats deleted successfully",
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk delete chats error:", error);
    res.status(500).json({ error: "Failed to delete chats" });
  }
};

const archiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.isArchived = true;
    await chat.save();

    res.json({
      message: "Chat archived successfully",
      isArchived: chat.isArchived,
    });
  } catch (error) {
    console.error("Archive chat error:", error);
    res.status(500).json({ error: "Failed to archive chat" });
  }
};

const unarchiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.isArchived = false;
    await chat.save();

    res.json({
      message: "Chat unarchived successfully",
      isArchived: chat.isArchived,
    });
  } catch (error) {
    console.error("Unarchive chat error:", error);
    res.status(500).json({ error: "Failed to unarchive chat" });
  }
};

const getArchivedChats = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      userId: req.user._id,
      isActive: true,
      isArchived: true,
    })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .select("title type sourceId sourceModel lastActivity createdAt messages isArchived isFavorite")
      .populate("sourceId", "title originalName url");

    const total = await Chat.countDocuments({
      userId: req.user._id,
      isActive: true,
      isArchived: true,
    });

    // Add message count and last message preview
    const chatsWithPreview = chats.map((chat) => ({
      id: chat._id,
      title: chat.title,
      type: chat.type,
      sourceId: chat.sourceId,
      sourceModel: chat.sourceModel,
      messageCount: chat.messages.length,
      lastMessage:
        chat.messages.length > 0
          ? {
              role: chat.messages[chat.messages.length - 1].role,
              content:
                chat.messages[chat.messages.length - 1].content.substring(
                  0,
                  100
                ) + "...",
              timestamp: chat.messages[chat.messages.length - 1].timestamp,
            }
          : null,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      isArchived: chat.isArchived,
      isFavorite: chat.isFavorite,
    }));

    res.json({
      chats: chatsWithPreview,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get archived chats error:", error);
    res.status(500).json({ error: "Failed to fetch archived chats" });
  }
};

const favoriteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.isFavorite = true;
    await chat.save();

    res.json({
      message: "Chat marked as favorite",
      isFavorite: chat.isFavorite,
    });
  } catch (error) {
    console.error("Favorite chat error:", error);
    res.status(500).json({ error: "Failed to favorite chat" });
  }
};

const unfavoriteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.isFavorite = false;
    await chat.save();

    res.json({
      message: "Chat removed from favorites",
      isFavorite: chat.isFavorite,
    });
  } catch (error) {
    console.error("Unfavorite chat error:", error);
    res.status(500).json({ error: "Failed to unfavorite chat" });
  }
};

const getFavoriteChats = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      userId: req.user._id,
      isActive: true,
      isFavorite: true,
    })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .select("title type sourceId sourceModel lastActivity createdAt messages isArchived isFavorite")
      .populate("sourceId", "title originalName url");

    const total = await Chat.countDocuments({
      userId: req.user._id,
      isActive: true,
      isFavorite: true,
    });

    // Add message count and last message preview
    const chatsWithPreview = chats.map((chat) => ({
      id: chat._id,
      title: chat.title,
      type: chat.type,
      sourceId: chat.sourceId,
      sourceModel: chat.sourceModel,
      messageCount: chat.messages.length,
      lastMessage:
        chat.messages.length > 0
          ? {
              role: chat.messages[chat.messages.length - 1].role,
              content:
                chat.messages[chat.messages.length - 1].content.substring(
                  0,
                  100
                ) + "...",
              timestamp: chat.messages[chat.messages.length - 1].timestamp,
            }
          : null,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      isArchived: chat.isArchived,
      isFavorite: chat.isFavorite,
    }));

    res.json({
      chats: chatsWithPreview,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get favorite chats error:", error);
    res.status(500).json({ error: "Failed to fetch favorite chats" });
  }
};

const editMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const messageIndex = Number.parseInt(req.params.messageIndex);

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceId");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Validate message index
    if (messageIndex < 0 || messageIndex >= chat.messages.length) {
      return res.status(400).json({ error: "Invalid message index" });
    }

    // Validate that the message is a user message
    if (chat.messages[messageIndex].role !== "user") {
      return res.status(400).json({ error: "Can only edit user messages" });
    }

    // Update the message content
    chat.messages[messageIndex].content = content;
    chat.messages[messageIndex].timestamp = new Date();

    // Remove all messages after the edited message
    chat.messages = chat.messages.slice(0, messageIndex + 1);

    await chat.save();

    res.json({
      message: "Message edited successfully",
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({ error: "Failed to edit message" });
  }
};

const regenerateResponse = async (req, res) => {
  try {
    const messageIndex = Number.parseInt(req.params.messageIndex);

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceId");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Validate message index
    if (messageIndex < 0 || messageIndex >= chat.messages.length) {
      return res.status(400).json({ error: "Invalid message index" });
    }

    // Validate that the message is an assistant message
    if (chat.messages[messageIndex].role !== "assistant") {
      return res.status(400).json({ error: "Can only regenerate assistant messages" });
    }

    // Remove the assistant message and all messages after it
    chat.messages = chat.messages.slice(0, messageIndex);

    await chat.save();

    res.json({
      message: "Response regenerated successfully",
      messages: chat.messages,
    });
  } catch (error) {
    console.error("Regenerate response error:", error);
    res.status(500).json({ error: "Failed to regenerate response" });
  }
};

// Helper function to create a chat with an attachment
const createChatWithAttachment = async (
  userId,
  title,
  type,
  sourceId,
  sourceModel,
  attachmentType,
  attachmentData,
  messageContent
) => {
  try {
    const chat = new Chat({
      userId,
      title,
      type,
      sourceId,
      sourceModel,
      messages: [
        {
          role: "assistant",
          content: messageContent,
          attachments: [
            {
              type: attachmentType,
              data: attachmentData,
              metadata: {
                createdAt: new Date(),
              },
            },
          ],
        },
      ],
    });

    await chat.save();
    return chat;
  } catch (error) {
    console.error("Error creating chat with attachment:", error);
    throw error;
  }
};

module.exports = {
  getUserChats,
  getChatWithMessages,
  sendMessage,
  createNewChat,
  updateChatTitle,
  deleteChat,
  bulkDeleteChats,
  archiveChat,
  unarchiveChat,
  getArchivedChats,
  favoriteChat,
  unfavoriteChat,
  getFavoriteChats,
  editMessage,
  regenerateResponse,
  createChatWithAttachment, // Export helper function
};
