const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  searchWikipedia,
  getWikipediaPage,
  importWikipediaPage,
} = require("../controllers/wikipedia.controller");

const router = express.Router();

// Public endpoints for search and page fetch
router.get("/search", searchWikipedia);
router.get("/page/:title", getWikipediaPage);

// Authenticated endpoint to import a page into user's Websites collection
router.post("/import", authenticate, importWikipediaPage);

module.exports = router;
