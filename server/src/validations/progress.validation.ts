import { Request, Response, NextFunction } from 'express';

export const validateFlashcardSession = (req: Request, res: Response, next: NextFunction): void => {
  const { course, topic, flashcardsStudied, duration } = req.body;
  const errors: string[] = [];

  if (!course || typeof course !== 'string') {
    errors.push('Course ID is required.');
  }

  if (!topic || typeof topic !== 'string') {
    errors.push('Topic ID is required.');
  }

  if (flashcardsStudied === undefined || typeof flashcardsStudied !== 'number' || flashcardsStudied < 0) {
    errors.push('flashcardsStudied must be a non-negative number.');
  }

  if (duration === undefined || typeof duration !== 'number' || duration < 0) {
    errors.push('duration must be a non-negative number (seconds).');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateMcqSession = (req: Request, res: Response, next: NextFunction): void => {
  const { course, topic, mcqAnswered, mcqCorrect, score, duration } = req.body;
  const errors: string[] = [];

  if (!course || typeof course !== 'string') {
    errors.push('Course ID is required.');
  }

  if (!topic || typeof topic !== 'string') {
    errors.push('Topic ID is required.');
  }

  if (mcqAnswered === undefined || typeof mcqAnswered !== 'number' || mcqAnswered < 0) {
    errors.push('mcqAnswered must be a non-negative number.');
  }

  if (mcqCorrect === undefined || typeof mcqCorrect !== 'number' || mcqCorrect < 0) {
    errors.push('mcqCorrect must be a non-negative number.');
  }

  if (score === undefined || typeof score !== 'number' || score < 0 || score > 100) {
    errors.push('score must be a number between 0 and 100.');
  }

  if (duration === undefined || typeof duration !== 'number' || duration < 0) {
    errors.push('duration must be a non-negative number (seconds).');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
