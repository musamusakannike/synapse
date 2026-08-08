import { Request, Response, NextFunction } from 'express';
import Flashcard from '../models/flashcard.model';

export const getFlashcardsByTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const flashcards = await Flashcard.find({ topic: req.params.topicId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
};

export const createFlashcard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const flashcard = await Flashcard.create(req.body);
    res.status(201).json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
};

export const updateFlashcard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const flashcard = await Flashcard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!flashcard) {
      res.status(404).json({ success: false, message: 'Flashcard not found.' });
      return;
    }

    res.status(200).json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const flashcard = await Flashcard.findByIdAndDelete(req.params.id);

    if (!flashcard) {
      res.status(404).json({ success: false, message: 'Flashcard not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Flashcard deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic, flashcards } = req.body;
    const docs = flashcards.map((f: { question: string; answer: string }) => ({ ...f, topic }));
    const created = await Flashcard.insertMany(docs);
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (error) {
    next(error);
  }
};
