const express = require('express');
const { getGeminiReply } = require('../controllers/gemini.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, getGeminiReply);

module.exports = router;
