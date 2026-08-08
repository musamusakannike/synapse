import { Request, Response, NextFunction } from 'express';
import MCQ from '../models/mcq.model';

export const getMcqsByTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mcqs = await MCQ.find({ topic: req.params.topicId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: mcqs });
  } catch (error) {
    next(error);
  }
};

export const createMcq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mcq = await MCQ.create(req.body);
    res.status(201).json({ success: true, data: mcq });
  } catch (error) {
    next(error);
  }
};

export const updateMcq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!mcq) {
      res.status(404).json({ success: false, message: 'MCQ not found.' });
      return;
    }

    res.status(200).json({ success: true, data: mcq });
  } catch (error) {
    next(error);
  }
};

export const deleteMcq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);

    if (!mcq) {
      res.status(404).json({ success: false, message: 'MCQ not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'MCQ deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateMcqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic, mcqs } = req.body;
    const docs = mcqs.map((m: any) => ({ ...m, topic }));
    const created = await MCQ.insertMany(docs);
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (error) {
    next(error);
  }
};
