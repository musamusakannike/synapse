const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(authenticate);

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

// POST /api/courses/:id/video - Start video generation (async)
router.post("/:id/video", courseController.generateCourseVideo);

// GET /api/courses/:id/video - Poll video generation status
router.get("/:id/video", courseController.getCourseVideoStatus);

// GET /api/courses/:id/video/download - Stream the rendered .mp4
router.get("/:id/video/download", courseController.downloadCourseVideo);

module.exports = router;
