"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const course_controller_1 = require("../controllers/course.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const course_validation_1 = require("../validations/course.validation");
const pagination_validation_1 = require("../validations/pagination.validation");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed.'));
        }
    },
});
router.get('/', pagination_validation_1.validatePagination, course_controller_1.getCourses);
router.get('/popular', course_controller_1.getPopularTopics);
router.get('/categories', course_controller_1.getCourseCategories);
router.post('/categories', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), course_controller_1.createCourseCategory);
router.get('/:id', course_controller_1.getCourseById);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), upload.single('banner'), course_validation_1.validateCreateCourse, course_controller_1.createCourse);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), upload.single('banner'), course_validation_1.validateUpdateCourse, course_controller_1.updateCourse);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), course_controller_1.deleteCourse);
exports.default = router;
