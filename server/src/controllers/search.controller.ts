import { Request, Response, NextFunction } from 'express';
import Course from '../models/course.model';
import Topic from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';

export const globalSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = (req.query.q as string || '').trim();
    const type = (req.query.type as string) || 'all';
    const limit = 5;

    if (!q) {
      res.status(200).json({ success: true, data: { courses: [], topics: [], flashcards: [], mcqs: [] } });
      return;
    }

    const regex = new RegExp(q, 'i');

    const results: { courses: unknown[]; topics: unknown[]; flashcards: unknown[]; mcqs: unknown[] } = {
      courses: [],
      topics: [],
      flashcards: [],
      mcqs: [],
    };

    if (type === 'all' || type === 'courses') {
      results.courses = await Course.find({
        isPublished: true,
        $or: [{ title: regex }, { description: regex }],
      })
        .select('title description category difficulty')
        .limit(limit)
        .lean();
    }

    if (type === 'all' || type === 'topics') {
      results.topics = await Topic.find({
        $or: [{ title: regex }, { description: regex }],
      })
        .populate({ path: 'course', select: 'title' })
        .select('title course')
        .limit(limit)
        .lean();
    }

    if (type === 'all' || type === 'flashcards') {
      results.flashcards = await Flashcard.find({ question: regex })
        .populate({ path: 'topic', select: 'title' })
        .select('question topic')
        .limit(limit)
        .lean();
    }

    if (type === 'all' || type === 'mcqs') {
      results.mcqs = await MCQ.find({ question: regex })
        .populate({ path: 'topic', select: 'title' })
        .select('question topic')
        .limit(limit)
        .lean();
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
