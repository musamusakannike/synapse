const Website = require("../models/website.model");
const GeminiService = require("../config/gemini.config");
const axios = require("axios");
const cheerio = require("cheerio");
const { createChatWithAttachment } = require("./chat.controller");

function extractReadableText(html) {
  const $ = cheerio.load(html);
  // Remove script/style/noscript
  ["script", "style", "noscript"].forEach((sel) => $(sel).remove());
  const title = $("title").first().text().trim();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  return { title, text: bodyText };
}

function buildWebsiteSummaryPrompt(url, title) {
  return `You're an assistant that summarizes website content for study notes.\n` +
    `Summarize the key points, definitions, and provide a concise bullet list of actionable takeaways.\n` +
    `Include important entities, dates, and any noteworthy data.\n\n` +
    `URL: ${url}\nTitle: ${title || "(untitled)"}`;
}

// POST /api/websites
// Body: { url }
async function createWebsite(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { url } = req.body || {};
    if (!url) return res.status(400).json({ message: "URL is required" });

    let site = await Website.create({
      userId,
      url,
      processingStatus: "processing",
    });

    try {
      const response = await axios.get(url, { timeout: 20000 });
      const { title, text } = extractReadableText(response.data);

      const prompt = buildWebsiteSummaryPrompt(url, title);
      const summary = await GeminiService.processDocument(
        Buffer.from(text || "", "utf8"),
        "text/plain",
        prompt
      );

      site.title = title || site.title;
      site.extractedContent = text;
      site.summary = summary;
      site.processingStatus = "completed";
      site.scrapedAt = new Date();
      await site.save();

      // Create a chat with website attachment
      try {
        const chatTitle = `${site.title || url} - Website`;
        const messageContent = `I've scraped the website "${site.title || url}".\n\nSummary: ${summary}\n\nYou can ask me questions about this website!`;
        
        await createChatWithAttachment(
          userId,
          chatTitle,
          "website",
          site._id,
          "Website",
          "website",
          {
            websiteId: site._id,
            title: site.title,
            url: site.url,
            summary: summary,
            extractedContent: text.substring(0, 5000), // Limit text size in attachment
          },
          messageContent
        );
      } catch (chatError) {
        console.error("Failed to create chat for website:", chatError);
        // Continue without failing the website creation
      }
    } catch (processingError) {
      console.error("Website processing failed:", processingError);
      site.processingStatus = "failed";
      site.processingError = processingError?.message || "Processing failed";
      await site.save();
    }

    return res.status(201).json(site);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/websites
async function listWebsites(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const sites = await Website.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(sites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /api/websites/:id
async function getWebsite(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const site = await Website.findOne({ _id: id, userId });
    if (!site) return res.status(404).json({ message: "Website not found" });
    return res.status(200).json(site);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/websites/:id
async function deleteWebsite(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const site = await Website.findOneAndDelete({ _id: id, userId });
    if (!site) return res.status(404).json({ message: "Website not found" });
    return res.status(200).json({ message: "Website deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/websites/:id/rescrape
async function rescrapeWebsite(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const site = await Website.findOne({ _id: id, userId });
    if (!site) return res.status(404).json({ message: "Website not found" });

    site.processingStatus = "processing";
    site.processingError = undefined;
    await site.save();

    try {
      const response = await axios.get(site.url, { timeout: 20000 });
      const { title, text } = extractReadableText(response.data);
      const prompt = buildWebsiteSummaryPrompt(site.url, title);
      const summary = await GeminiService.processDocument(
        Buffer.from(text || "", "utf8"),
        "text/plain",
        prompt
      );

      site.title = title || site.title;
      site.extractedContent = text;
      site.summary = summary;
      site.processingStatus = "completed";
      site.scrapedAt = new Date();
      await site.save();
    } catch (processingError) {
      console.error("Website re-scrape failed:", processingError);
      site.processingStatus = "failed";
      site.processingError = processingError?.message || "Processing failed";
      await site.save();
    }

    return res.status(200).json(site);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createWebsite,
  listWebsites,
  getWebsite,
  deleteWebsite,
  rescrapeWebsite,
};