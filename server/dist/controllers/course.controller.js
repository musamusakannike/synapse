"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularTopics = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getCourses = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const topic_model_1 = __importDefault(require("../models/topic.model"));
const flashcard_model_1 = __importDefault(require("../models/flashcard.model"));
const mcq_model_1 = __importDefault(require("../models/mcq.model"));
const userProgress_model_1 = __importDefault(require("../models/userProgress.model"));
const r2_util_1 = require("../utils/r2.util");
const notification_service_1 = require("../services/notification.service");
const getCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;
        const includeDrafts = req.query.includeDrafts === 'true';
        const filter = includeDrafts ? {} : { isPublished: true };
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        if (req.query.difficulty && req.query.difficulty !== 'all') {
            filter.difficulty = req.query.difficulty;
        }
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { category: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        const courses = await course_model_1.default.find(filter)
            .populate({ path: 'topicCount' })
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await course_model_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: courses,
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
exports.getCourses = getCourses;
const chapter_model_1 = __importDefault(require("../models/chapter.model"));
const getCourseById = async (req, res, next) => {
    try {
        const course = await course_model_1.default.findById(req.params.id);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const registeredUsersCount = await userProgress_model_1.default.countDocuments({ course: req.params.id });
        const topics = await topic_model_1.default.find({ course: req.params.id });
        const chapters = await chapter_model_1.default.find({ course: req.params.id });
        let lessonCount = 0;
        let totalObtainableXp = 0;
        for (const t of topics) {
            if (t.contents && Array.isArray(t.contents)) {
                lessonCount += t.contents.length;
            }
            totalObtainableXp += t.xp || 50;
            if (t.exercise && t.exercise.questions && Array.isArray(t.exercise.questions)) {
                for (const q of t.exercise.questions) {
                    totalObtainableXp += q.xp || 20;
                }
            }
        }
        for (const c of chapters) {
            if (c.exercise && c.exercise.questions && Array.isArray(c.exercise.questions)) {
                for (const q of c.exercise.questions) {
                    totalObtainableXp += q.xp || 20;
                }
            }
        }
        const courseObj = course.toObject();
        res.status(200).json({
            success: true,
            data: {
                ...courseObj,
                registeredUsersCount,
                lessonCount,
                totalObtainableXp,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCourseById = getCourseById;
const createCourse = async (req, res, next) => {
    try {
        const { title, description, longDescription, category, difficulty, isPublished, banner } = req.body;
        let bannerUrl = typeof banner === 'string' ? banner : '';
        if (req.file) {
            const fileKey = `courses/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
            bannerUrl = await (0, r2_util_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
        }
        const course = await course_model_1.default.create({
            title,
            description,
            longDescription,
            category,
            difficulty,
            isPublished: isPublished === 'true' || isPublished === true,
            banner: bannerUrl,
        });
        if (course.isPublished) {
            void (0, notification_service_1.broadcastCoursePublished)(course);
        }
        res.status(201).json({ success: true, data: course });
    }
    catch (error) {
        next(error);
    }
};
exports.createCourse = createCourse;
const updateCourse = async (req, res, next) => {
    try {
        const { title, description, longDescription, category, difficulty, isPublished, banner } = req.body;
        const updates = {};
        if (title !== undefined)
            updates.title = title;
        if (description !== undefined)
            updates.description = description;
        if (longDescription !== undefined)
            updates.longDescription = longDescription;
        if (category !== undefined)
            updates.category = category;
        if (difficulty !== undefined)
            updates.difficulty = difficulty;
        if (isPublished !== undefined)
            updates.isPublished = isPublished === 'true' || isPublished === true;
        if (typeof banner === 'string')
            updates.banner = banner;
        if (req.file) {
            const fileKey = `courses/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
            updates.banner = await (0, r2_util_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
        }
        // Captured before the write so we can tell a genuine publish from a no-op
        // save on an already-published course.
        const wasPublished = await course_model_1.default.exists({ _id: req.params.id, isPublished: true });
        const course = await course_model_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        if (!wasPublished && course.isPublished) {
            void (0, notification_service_1.broadcastCoursePublished)(course);
        }
        res.status(200).json({ success: true, data: course });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res, next) => {
    try {
        const course = await course_model_1.default.findByIdAndDelete(req.params.id);
        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found.' });
            return;
        }
        const topics = await topic_model_1.default.find({ course: req.params.id }).select('_id');
        const topicIds = topics.map((t) => t._id);
        if (topicIds.length > 0) {
            await flashcard_model_1.default.deleteMany({ topic: { $in: topicIds } });
            await mcq_model_1.default.deleteMany({ topic: { $in: topicIds } });
            await userProgress_model_1.default.deleteMany({ topic: { $in: topicIds } });
        }
        await topic_model_1.default.deleteMany({ course: req.params.id });
        await userProgress_model_1.default.deleteMany({ course: req.params.id });
        res.status(200).json({ success: true, message: 'Course deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCourse = deleteCourse;
const getPopularTopics = async (req, res, next) => {
    try {
        const courses = await course_model_1.default.find({ isPublished: true })
            .populate({ path: 'topicCount' })
            .sort({ order: 1, createdAt: -1 })
            .limit(6);
        res.status(200).json({ success: true, data: courses });
    }
    catch (error) {
        next(error);
    }
};
exports.getPopularTopics = getPopularTopics;
