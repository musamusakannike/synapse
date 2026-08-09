"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const blog_controller_1 = require("../controllers/blog.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const blog_validation_1 = require("../validations/blog.validation");
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
router.get('/', pagination_validation_1.validatePagination, blog_controller_1.getBlogPosts);
router.get('/categories', blog_controller_1.getBlogCategories);
router.get('/slug/:slug', blog_controller_1.getBlogPostBySlug);
router.get('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), blog_controller_1.getBlogPostById);
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), upload.single('coverImage'), blog_validation_1.validateCreateBlogPost, blog_controller_1.createBlogPost);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), upload.single('coverImage'), blog_validation_1.validateUpdateBlogPost, blog_controller_1.updateBlogPost);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('admin'), blog_controller_1.deleteBlogPost);
exports.default = router;
