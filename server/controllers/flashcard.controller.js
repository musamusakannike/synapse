const FlashcardSet = require("../models/flashcard.model");
const Topic = require("../models/topic.model");
const Document = require("../models/document.model");
const Website = require("../models/website.model");
const geminiService = require("../config/gemini.config");
const { validationResult } = require("express-validator");

const getUserFlashcardSets = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const flashcardSets = await FlashcardSet.find({
      userId: req.user._id,
      isActive: true,
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title description sourceType sourceId flashcards studyStats createdAt updatedAt")
      .populate("sourceId", "title originalName url");

    const total = await FlashcardSet.countDocuments({
      userId: req.user._id,
      isActive: true,
    });

    // Add flashcard count and study progress
    const flashcardSetsWithStats = flashcardSets.map((set) => ({
      id: set._id,
      title: set.title,
      description: set.description,
      sourceType: set.sourceType,
      sourceId: set.sourceId,
      flashcardCount: set.flashcards.length,
      studyStats: set.studyStats,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
    }));

    res.json({
      flashcardSets: flashcardSetsWithStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get flashcard sets error:", error);
    res.status(500).json({ error: "Failed to fetch flashcard sets" });
  }
};

const getFlashcardSet = async (req, res) => {
  try {
    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceId", "title originalName url");

    if (!flashcardSet) {
      return res.status(404).json({ error: "Flashcard set not found" });
    }

    res.json({ flashcardSet });
  } catch (error) {
    console.error("Get flashcard set error:", error);
    res.status(500).json({ error: "Failed to fetch flashcard set" });
  }
};

const generateFlashcards = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      sourceType,
      sourceId,
      title,
      description,
      settings = {},
    } = req.body;

    // Validate source and get content
    let sourceContent = "";
    let sourceTitle = "";
    let sourceRef = null;
    let sourceModel = null;

    if (sourceType !== "manual") {
      if (!sourceId) {
        return res.status(400).json({ error: "sourceId is required for non-manual flashcard generation" });
      }

      switch (sourceType) {
        case "topic":
          const topic = await Topic.findOne({ _id: sourceId, userId: req.user._id });
          if (!topic) return res.status(404).json({ error: "Topic not found" });
          sourceContent = topic.generatedContent || topic.content;
          sourceTitle = topic.title;
          sourceRef = topic._id;
          sourceModel = "Topic";
          break;

        case "document":
          const doc = await Document.findOne({ _id: sourceId, userId: req.user._id });
          if (!doc) return res.status(404).json({ error: "Document not found" });
          sourceContent = doc.extractedText;
          sourceTitle = doc.originalName;
          sourceRef = doc._id;
          sourceModel = "Document";
          break;

        case "website":
          const site = await Website.findOne({ _id: sourceId, userId: req.user._id });
          if (!site) return res.status(404).json({ error: "Website not found" });
          sourceContent = site.extractedContent;
          sourceTitle = site.title || site.url;
          sourceRef = site._id;
          sourceModel = "Website";
          break;

        default:
          return res.status(400).json({ error: "Invalid source type" });
      }
    }

    // Set default settings
    const flashcardSettings = {
      numberOfCards: settings.numberOfCards || 10,
      difficulty: settings.difficulty || "medium",
      includeDefinitions: settings.includeDefinitions !== false,
      includeExamples: settings.includeExamples || false,
      focusAreas: settings.focusAreas || [],
    };

    // Generate flashcards using AI
    const generatedData = await geminiService.generateFlashcards(
      sourceContent,
      flashcardSettings
    );

    // Create flashcard set
    const flashcardSet = new FlashcardSet({
      userId: req.user._id,
      title: title || generatedData.title || `${sourceTitle} - Flashcards`,
      description: description || generatedData.description || `Flashcards generated from ${sourceTitle}`,
      sourceType,
      sourceId: sourceRef,
      sourceModel,
      flashcards: generatedData.flashcards,
      settings: flashcardSettings,
    });

    await flashcardSet.save();

    res.status(201).json({
      message: "Flashcards generated successfully",
      flashcardSet: {
        id: flashcardSet._id,
        title: flashcardSet.title,
        description: flashcardSet.description,
        sourceType: flashcardSet.sourceType,
        flashcardCount: flashcardSet.flashcards.length,
        createdAt: flashcardSet.createdAt,
      },
    });
  } catch (error) {
    console.error("Generate flashcards error:", error);
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
};

const updateFlashcardSet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, flashcards } = req.body;

    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({ error: "Flashcard set not found" });
    }

    if (title) flashcardSet.title = title;
    if (description) flashcardSet.description = description;
    if (flashcards) flashcardSet.flashcards = flashcards;

    await flashcardSet.save();

    res.json({
      message: "Flashcard set updated successfully",
      flashcardSet: {
        id: flashcardSet._id,
        title: flashcardSet.title,
        description: flashcardSet.description,
        flashcardCount: flashcardSet.flashcards.length,
        updatedAt: flashcardSet.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update flashcard set error:", error);
    res.status(500).json({ error: "Failed to update flashcard set" });
  }
};

const deleteFlashcardSet = async (req, res) => {
  try {
    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({ error: "Flashcard set not found" });
    }

    // Soft delete - mark as inactive
    flashcardSet.isActive = false;
    await flashcardSet.save();

    res.json({ message: "Flashcard set deleted successfully" });
  } catch (error) {
    console.error("Delete flashcard set error:", error);
    res.status(500).json({ error: "Failed to delete flashcard set" });
  }
};

const updateStudyStats = async (req, res) => {
  try {
    const { score, sessionDuration } = req.body;

    const flashcardSet = await FlashcardSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!flashcardSet) {
      return res.status(404).json({ error: "Flashcard set not found" });
    }

    // Update study statistics
    const currentSessions = flashcardSet.studyStats.totalStudySessions;
    const currentAverage = flashcardSet.studyStats.averageScore;
    
    flashcardSet.studyStats.totalStudySessions = currentSessions + 1;
    flashcardSet.studyStats.averageScore = 
      (currentAverage * currentSessions + score) / (currentSessions + 1);
    flashcardSet.studyStats.lastStudied = new Date();

    await flashcardSet.save();

    res.json({
      message: "Study stats updated successfully",
      studyStats: flashcardSet.studyStats,
    });
  } catch (error) {
    console.error("Update study stats error:", error);
    res.status(500).json({ error: "Failed to update study stats" });
  }
};

module.exports = {
  getUserFlashcardSets,
  getFlashcardSet,
  generateFlashcards,
  updateFlashcardSet,
  deleteFlashcardSet,
  updateStudyStats,
};
