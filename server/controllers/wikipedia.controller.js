const axios = require("axios");
const cheerio = require("cheerio");
const Website = require("../models/website.model");

function htmlToText(html) {
  const $ = cheerio.load(html || "");
  ["script", "style", "noscript"].forEach((sel) => $(sel).remove());
  return $("body").text().replace(/\s+/g, " ").trim();
}

function buildWikiUrl(title, lang = "en") {
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  return `https://${lang}.wikipedia.org/wiki/${encoded}`;
}

// GET /api/wikipedia/search?q=...&lang=en&limit=20
async function searchWikipedia(req, res) {
  try {
    const q = (req.query.q || req.query.query || "").trim();
    const lang = (req.query.lang || "en").trim();
    const limit = Math.min(parseInt(req.query.limit || "20", 10) || 20, 50);

    if (!q) return res.status(400).json({ message: "Missing search query" });

    const url = `https://${lang}.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(
      q
    )}&limit=${limit}`;

    const { data } = await axios.get(url, { timeout: 15000, headers: { "User-Agent": "SynapseApp/1.0" } });
    // Pass through relevant fields
    return res.json({ lang, query: q, results: data?.pages || [] });
  } catch (error) {
    console.error("Wikipedia search error:", error?.message || error);
    return res.status(500).json({ message: "Failed to search Wikipedia" });
  }
}

// GET /api/wikipedia/page/:title?lang=en
async function getWikipediaPage(req, res) {
  try {
    const titleParam = req.params.title;
    const lang = (req.query.lang || "en").trim();
    if (!titleParam) return res.status(400).json({ message: "Missing page title" });

    const encoded = encodeURIComponent(titleParam.replace(/ /g, "_"));

    const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
    const htmlUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/mobile-html/${encoded}`;

    const [summaryRes, htmlRes] = await Promise.all([
      axios.get(summaryUrl, { timeout: 15000, headers: { "User-Agent": "SynapseApp/1.0" } }),
      axios.get(htmlUrl, { timeout: 20000, headers: { "User-Agent": "SynapseApp/1.0" } }),
    ]);

    const summary = summaryRes?.data || {};
    const contentHtml = htmlRes?.data || "";

    const out = {
      lang,
      title: summary.title || titleParam,
      description: summary.description || "",
      extract: summary.extract || "",
      extract_html: summary.extract_html || "",
      thumbnail: summary.thumbnail || null,
      originalimage: summary.originalimage || null,
      url: summary.content_urls?.desktop?.page || buildWikiUrl(titleParam, lang),
      contentHtml,
      pageid: summary.pageid,
      timestamp: new Date().toISOString(),
    };

    return res.json(out);
  } catch (error) {
    console.error("Wikipedia page fetch error:", error?.message || error);
    return res.status(500).json({ message: "Failed to fetch Wikipedia page" });
  }
}

// POST /api/wikipedia/import { title, lang }
async function importWikipediaPage(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, lang = "en" } = req.body || {};
    if (!title) return res.status(400).json({ message: "Title is required" });

    // Fetch page details
    const encoded = encodeURIComponent(title.replace(/ /g, "_"));
    const htmlUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/mobile-html/${encoded}`;
    const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

    const [htmlRes, summaryRes] = await Promise.all([
      axios.get(htmlUrl, { timeout: 20000, headers: { "User-Agent": "SynapseApp/1.0" } }),
      axios.get(summaryUrl, { timeout: 15000, headers: { "User-Agent": "SynapseApp/1.0" } }),
    ]);

    const contentHtml = htmlRes?.data || "";
    const summary = summaryRes?.data || {};

    // Convert HTML to text for better AI context usage
    const text = htmlToText(contentHtml);

    const site = await Website.create({
      userId,
      url: buildWikiUrl(title, lang),
      title: summary.title || title,
      extractedContent: text,
      summary: summary.extract || "",
      processingStatus: "completed",
      scrapedAt: new Date(),
    });

    return res.status(201).json(site);
  } catch (error) {
    console.error("Wikipedia import error:", error?.message || error);
    return res.status(500).json({ message: "Failed to import Wikipedia page" });
  }
}

module.exports = {
  searchWikipedia,
  getWikipediaPage,
  importWikipediaPage,
};
