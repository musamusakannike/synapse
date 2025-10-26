const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// POST /api/courses - Create a new course
router.post("/", courseController.createCourse);

// GET /api/courses - List all courses for the user
router.get("/", courseController.listCourses);

// GET /api/courses/:id - Get a specific course
router.get("/:id", courseController.getCourse);

// DELETE /api/courses/:id - Delete a course
router.delete("/:id", courseController.deleteCourse);

// POST /api/courses/:id/regenerate - Regenerate course content
router.post("/:id/regenerate", courseController.regenerateCourse);

// GET /api/courses/:id/pdf - Generate and download PDF
router.get("/:id/pdf", courseController.generateCoursePDF);

module.exports = router;
