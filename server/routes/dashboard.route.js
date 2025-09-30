const express = require("express");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  getDashboardStats,
  getUserProgress,
  getRecentActivity,
} = require("../controllers/dashboard.controller");

const router = express.Router();

// Dashboard routes
router.get("/stats", authenticate, getDashboardStats);
router.get("/progress", authenticate, getUserProgress);
router.get("/activity", authenticate, getRecentActivity);

module.exports = router;
