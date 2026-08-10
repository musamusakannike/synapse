import { Request, Response, NextFunction } from 'express';

export const validateSummarize = (req: Request, res: Response, next: NextFunction): void => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Text content is required for summarization.' });
    return;
  }
  next();
};

export const validateGenerateQuiz = (req: Request, res: Response, next: NextFunction): void => {
  const { topic } = req.body;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Topic is required to generate quiz questions.' });
    return;
  }
  next();
};

export const validateGenerateFlashcards = (req: Request, res: Response, next: NextFunction): void => {
  const { topic } = req.body;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Topic is required to generate flashcards.' });
    return;
  }
  next();
};

export const validateQA = (req: Request, res: Response, next: NextFunction): void => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Question string is required.' });
    return;
  }
  next();
};

export const validateCourseQuiz = (req: Request, res: Response, next: NextFunction): void => {
  const { count, difficulty } = req.body;
  const errors: string[] = [];

  if (count !== undefined && (typeof count !== 'number' || count < 1 || count > 20)) {
    errors.push('Count must be a number between 1 and 20.');
  }

  if (difficulty !== undefined && !['easy', 'medium', 'hard'].includes(difficulty)) {
    errors.push('Difficulty must be one of: easy, medium, hard.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }
  next();
};

export const validateTopicQuiz = (req: Request, res: Response, next: NextFunction): void => {
  const { count, difficulty } = req.body;
  const errors: string[] = [];

  if (count !== undefined && (typeof count !== 'number' || count < 1 || count > 20)) {
    errors.push('Count must be a number between 1 and 20.');
  }

  if (difficulty !== undefined && !['easy', 'medium', 'hard'].includes(difficulty)) {
    errors.push('Difficulty must be one of: easy, medium, hard.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }
  next();
};
