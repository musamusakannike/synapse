const Topic = require("../models/topic.model");
const GeminiService = require("../config/gemini.config");

// POST /api/topics
// Body: { title, description?, content?, customizations? }
async function createTopic(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, content, customizations = {} } = req.body || {};
    if (!title) return res.status(400).json({ message: "Title is required" });

    // If content missing, generate via Gemini from title/customizations
    let generatedContent = undefined;
    if (!content) {
      generatedContent = await GeminiService.generateTopicExplanation(title, customizations);
    }

    const topic = await Topic.create({
      userId,
      title,
      description: description || undefined,
      content: content || generatedContent || "",
      customizations,
      generatedContent: generatedContent,
    });

    return res.status(201).json(topic);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/topics
async function listTopics(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const topics = await Topic.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(topics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/topics/:id
async function getTopic(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const topic = await Topic.findOne({ _id: id, userId });
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    return res.status(200).json(topic);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/topics/:id
// Body can include: { title?, description?, content?, customizations? }
async function updateTopic(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body || {};

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    return res.status(200).json(topic);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/topics/:id
async function deleteTopic(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const topic = await Topic.findOneAndDelete({ _id: id, userId });
    if (!topic) return res.status(404).json({ message: "Topic not found" });
    return res.status(200).json({ message: "Topic deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/topics/:id/generate
// Body: { customizations? } – regenerates generatedContent based on title/customizations
async function regenerateTopicContent(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { customizations = {} } = req.body || {};

    const topic = await Topic.findOne({ _id: id, userId });
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const generated = await GeminiService.generateTopicExplanation(
      topic.title,
      Object.keys(customizations).length ? customizations : topic.customizations || {}
    );

    topic.generatedContent = generated;
    // optionally refresh content if you want it to mirror generated output
    if (!topic.content || topic.content.trim().length === 0) {
      topic.content = generated;
    }
    if (Object.keys(customizations).length) {
      topic.customizations = customizations;
    }
    await topic.save();

    return res.status(200).json(topic);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  regenerateTopicContent,
};