import { Request, Response, NextFunction } from 'express';

export const validateCreateFlashcard = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, question, answer } = req.body;
  const errors: string[] = [];

  if (!topic || typeof topic !== 'string') {
    errors.push('Topic ID is required.');
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    errors.push('Question is required.');
  }

  if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
    errors.push('Answer is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateUpdateFlashcard = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  if (req.body.question !== undefined && (typeof req.body.question !== 'string' || req.body.question.trim().length === 0)) {
    errors.push('Question cannot be empty.');
  }

  if (req.body.answer !== undefined && (typeof req.body.answer !== 'string' || req.body.answer.trim().length === 0)) {
    errors.push('Answer cannot be empty.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateBulkCreateFlashcards = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, flashcards } = req.body;
  const errors: string[] = [];

  if (!topic || typeof topic !== 'string') {
    errors.push('Topic ID is required.');
  }

  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    errors.push('Flashcards array is required and must not be empty.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
