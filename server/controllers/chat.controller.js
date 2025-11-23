const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const geminiService = require("../config/gemini.config");
const Topic = require("../models/topic.model");
const Document = require("../models/document.model");
const Website = require("../models/website.model");
const { validationResult } = require("express-validator");

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

const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceId");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Add user message
    chat.messages.push({
      role: "user",
      content,
    });

    // Prepare context based on chat type
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

    // Generate AI response
    const aiResponse = await geminiService.generateChatResponse(
      chat.messages.slice(-10), // Last 10 messages for context
      context
    );

    // Add AI response
    chat.messages.push({
      role: "assistant",
      content: aiResponse,
    });

    await chat.save();

    res.json({
      message: "Message sent successfully",
      userMessage: {
        role: "user",
        content,
        timestamp: chat.messages[chat.messages.length - 2].timestamp,
      },
      aiResponse: {
        role: "assistant",
        content: aiResponse,
        timestamp: chat.messages[chat.messages.length - 1].timestamp,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
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
};
