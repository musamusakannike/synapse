import { Request, Response, NextFunction } from 'express';
import Topic from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import UserProgress from '../models/userProgress.model';

export const reorderTopics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topicIds = req.body.topicIds || req.body.order;
    const { chapterId } = req.body;
    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      res.status(400).json({ success: false, message: 'topicIds or order array is required.' });
      return;
    }
    await Promise.all(
      topicIds.map((id: string, index: number) => {
        const updateData: Record<string, unknown> = { order: index };
        if (chapterId !== undefined) {
          updateData.chapter = chapterId || null;
        }
        return Topic.findByIdAndUpdate(id, updateData);
      })
    );
    res.status(200).json({ success: true, message: 'Topics reordered successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getTopicsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topics = await Topic.find({ course: req.params.courseId })
      .select('-contents -exercise')
      .populate({ path: 'flashcardCount' })
      .populate({ path: 'mcqCount' })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate({ path: 'flashcardCount' })
      .populate({ path: 'mcqCount' });

    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found.' });
      return;
    }

    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found.' });
      return;
    }

    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);

    if (!topic) {
      res.status(404).json({ success: false, message: 'Topic not found.' });
      return;
    }

    await Flashcard.deleteMany({ topic: req.params.id });
    await MCQ.deleteMany({ topic: req.params.id });
    await UserProgress.deleteMany({ topic: req.params.id });

    res.status(200).json({ success: true, message: 'Topic deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
