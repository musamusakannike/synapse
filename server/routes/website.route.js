const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createWebsite,
  listWebsites,
  getWebsite,
  deleteWebsite,
  rescrapeWebsite,
} = require('../controllers/website.controller');

const router = express.Router();

// Routes
router.post('/', authenticate, createWebsite);
router.get('/', authenticate, listWebsites);
router.get('/:id', authenticate, getWebsite);
router.delete('/:id', authenticate, deleteWebsite);
router.post('/:id/rescrape', authenticate, rescrapeWebsite);

module.exports = router;