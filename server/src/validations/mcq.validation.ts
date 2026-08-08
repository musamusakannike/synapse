import { Request, Response, NextFunction } from 'express';

export const validateCreateMcq = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, question, options } = req.body;
  const errors: string[] = [];

  if (!topic || typeof topic !== 'string') {
    errors.push('Topic ID is required.');
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    errors.push('Question is required.');
  }

  if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
    errors.push('Options must have between 2 and 6 entries.');
  } else {
    const hasCorrect = options.some((opt: any) => opt.isCorrect === true);
    if (!hasCorrect) {
      errors.push('At least one option must be marked as correct.');
    }
    for (const opt of options) {
      if (!opt.text || typeof opt.text !== 'string' || opt.text.trim().length === 0) {
        errors.push('Each option must have non-empty text.');
        break;
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateUpdateMcq = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  if (req.body.question !== undefined && (typeof req.body.question !== 'string' || req.body.question.trim().length === 0)) {
    errors.push('Question cannot be empty.');
  }

  if (req.body.options !== undefined) {
    if (!Array.isArray(req.body.options) || req.body.options.length < 2 || req.body.options.length > 6) {
      errors.push('Options must have between 2 and 6 entries.');
    } else {
      const hasCorrect = req.body.options.some((opt: any) => opt.isCorrect === true);
      if (!hasCorrect) {
        errors.push('At least one option must be marked as correct.');
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateBulkCreateMcqs = (req: Request, res: Response, next: NextFunction): void => {
  const { topic, mcqs } = req.body;
  const errors: string[] = [];

  if (!topic || typeof topic !== 'string') {
    errors.push('Topic ID is required.');
  }

  if (!Array.isArray(mcqs) || mcqs.length === 0) {
    errors.push('MCQs array is required and must not be empty.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
