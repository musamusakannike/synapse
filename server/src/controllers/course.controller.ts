import { Request, Response, NextFunction } from 'express';
import Course, { ICourse } from '../models/course.model';
import Topic from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import UserProgress from '../models/userProgress.model';
import { uploadToR2 } from '../utils/r2.util';
import { broadcastCoursePublished } from '../services/notification.service';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const skip = (page - 1) * limit;

    const includeDrafts = req.query.includeDrafts === 'true';
    const filter: Record<string, unknown> = includeDrafts ? {} : { isPublished: true };

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

    const courses = await Course.find(filter)
      .populate({ path: 'topicCount' })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

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
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({ path: 'topicCount' });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req: MulterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, longDescription, category, difficulty, isPublished, banner } = req.body;

    let bannerUrl = typeof banner === 'string' ? banner : '';
    if (req.file) {
      const fileKey = `courses/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
      bannerUrl = await uploadToR2(req.file.buffer, fileKey, req.file.mimetype);
    }

    const course = await Course.create({
      title,
      description,
      longDescription,
      category,
      difficulty,
      isPublished: isPublished === 'true' || isPublished === true,
      banner: bannerUrl,
    });

    if (course.isPublished) {
      void broadcastCoursePublished(course);
    }

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: MulterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, longDescription, category, difficulty, isPublished, banner } = req.body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (longDescription !== undefined) updates.longDescription = longDescription;
    if (category !== undefined) updates.category = category;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (isPublished !== undefined) updates.isPublished = isPublished === 'true' || isPublished === true;
    if (typeof banner === 'string') updates.banner = banner;

    if (req.file) {
      const fileKey = `courses/${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
      updates.banner = await uploadToR2(req.file.buffer, fileKey, req.file.mimetype);
    }

    // Captured before the write so we can tell a genuine publish from a no-op
    // save on an already-published course.
    const wasPublished = await Course.exists({ _id: req.params.id, isPublished: true });

    const course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    if (!wasPublished && course.isPublished) {
      void broadcastCoursePublished(course);
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const topics = await Topic.find({ course: req.params.id }).select('_id');
    const topicIds = topics.map((t) => t._id);

    if (topicIds.length > 0) {
      await Flashcard.deleteMany({ topic: { $in: topicIds } });
      await MCQ.deleteMany({ topic: { $in: topicIds } });
      await UserProgress.deleteMany({ topic: { $in: topicIds } });
    }
    await Topic.deleteMany({ course: req.params.id });
    await UserProgress.deleteMany({ course: req.params.id });

    res.status(200).json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getPopularTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate({ path: 'topicCount' })
      .sort({ order: 1, createdAt: -1 })
      .limit(6);

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};
