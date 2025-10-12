const express = require("express");
const { generateTTS } = require("../controllers/tts.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/", authenticate, generateTTS);

module.exports = router;
