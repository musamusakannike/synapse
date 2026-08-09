"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogPost = exports.updateBlogPost = exports.createBlogPost = exports.getBlogPostById = exports.getBlogPostBySlug = exports.getBlogCategories = exports.getBlogPosts = void 0;
const blog_model_1 = __importDefault(require("../models/blog.model"));
const slug_util_1 = require("../utils/slug.util");
const r2_util_1 = require("../utils/r2.util");
const generateUniqueSlug = async (title, ignoreId) => {
    const base = (0, slug_util_1.slugify)(title);
    let slug = base;
    let suffix = 1;
    while (await blog_model_1.default.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
        suffix += 1;
        slug = `${base}-${suffix}`;
    }
    return slug;
};
const getBlogPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 9;
        const skip = (page - 1) * limit;
        const includeDrafts = req.query.includeDrafts === 'true';
        const filter = includeDrafts ? {} : { isPublished: true };
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        if (req.query.tag) {
            filter.tags = req.query.tag;
        }
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { excerpt: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        const posts = await blog_model_1.default.find(filter)
            .select('-content')
            .populate('author', 'name avatar')
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await blog_model_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogPosts = getBlogPosts;
const getBlogCategories = async (_req, res, next) => {
    try {
        const categories = await blog_model_1.default.distinct('category', { isPublished: true });
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogCategories = getBlogCategories;
const getBlogPostBySlug = async (req, res, next) => {
    try {
        const post = await blog_model_1.default.findOneAndUpdate({ slug: req.params.slug, isPublished: true }, { $inc: { views: 1 } }, { new: true }).populate('author', 'name avatar');
        if (!post) {
            res.status(404).json({ success: false, message: 'Blog post not found.' });
            return;
        }
        const related = await blog_model_1.default.find({
            _id: { $ne: post._id },
            isPublished: true,
            category: post.category,
        })
            .select('-content')
            .sort({ publishedAt: -1 })
            .limit(3);
        res.status(200).json({ success: true, data: post, related });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogPostBySlug = getBlogPostBySlug;
const getBlogPostById = async (req, res, next) => {
    try {
        const post = await blog_model_1.default.findById(req.params.id).populate('author', 'name avatar');
        if (!post) {
            res.status(404).json({ success: false, message: 'Blog post not found.' });
            return;
        }
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        next(error);
    }
};
exports.getBlogPostById = getBlogPostById;
const createBlogPost = async (req, res, next) => {
    try {
        const { title, excerpt, content, category, tags, isPublished, coverImage, seoTitle, seoDescription } = req.body;
        let coverImageUrl = typeof coverImage === 'string' ? coverImage : '';
        if (req.file) {
            const fileKey = `blog/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
            coverImageUrl = await (0, r2_util_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
        }
        const slug = await generateUniqueSlug(title);
        const published = isPublished === 'true' || isPublished === true;
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : Array.isArray(tags) ? tags : [];
        const post = await blog_model_1.default.create({
            title,
            slug,
            excerpt,
            content,
            category,
            tags: parsedTags,
            coverImage: coverImageUrl,
            author: req.user._id,
            isPublished: published,
            publishedAt: published ? new Date() : null,
            readingTimeMinutes: (0, slug_util_1.estimateReadingTime)(content || ''),
            seoTitle: seoTitle || '',
            seoDescription: seoDescription || '',
        });
        res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        next(error);
    }
};
exports.createBlogPost = createBlogPost;
const updateBlogPost = async (req, res, next) => {
    try {
        const { title, excerpt, content, category, tags, isPublished, coverImage, seoTitle, seoDescription } = req.body;
        const existing = await blog_model_1.default.findById(req.params.id);
        if (!existing) {
            res.status(404).json({ success: false, message: 'Blog post not found.' });
            return;
        }
        const updates = {};
        if (typeof title === 'string' && title !== existing.title) {
            updates.title = title;
            updates.slug = await generateUniqueSlug(title, String(req.params.id));
        }
        if (excerpt !== undefined)
            updates.excerpt = excerpt;
        if (content !== undefined) {
            updates.content = content;
            updates.readingTimeMinutes = (0, slug_util_1.estimateReadingTime)(content);
        }
        if (category !== undefined)
            updates.category = category;
        if (tags !== undefined)
            updates.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (typeof coverImage === 'string')
            updates.coverImage = coverImage;
        if (seoTitle !== undefined)
            updates.seoTitle = seoTitle;
        if (seoDescription !== undefined)
            updates.seoDescription = seoDescription;
        if (req.file) {
            const fileKey = `blog/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
            updates.coverImage = await (0, r2_util_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
        }
        if (isPublished !== undefined) {
            const published = isPublished === 'true' || isPublished === true;
            updates.isPublished = published;
            if (published && !existing.isPublished) {
                updates.publishedAt = new Date();
            }
        }
        const post = await blog_model_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).populate('author', 'name avatar');
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBlogPost = updateBlogPost;
const deleteBlogPost = async (req, res, next) => {
    try {
        const post = await blog_model_1.default.findByIdAndDelete(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Blog post not found.' });
            return;
        }
        res.status(200).json({ success: true, message: 'Blog post deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBlogPost = deleteBlogPost;
