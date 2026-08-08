import { Request, Response, NextFunction } from 'express';

const VALID_CONTENT_TYPES = ['text', 'latex', 'youtube', 'image', 'video', 'audio', 'code', 'quiz', 'exercise'];

function validateContentItem(item: any): string | null {
  if (!item.type || !VALID_CONTENT_TYPES.includes(item.type)) {
    return `Each content item must have a valid type: ${VALID_CONTENT_TYPES.join(', ')}.`;
  }
  if (!item.content || typeof item.content !== 'string' || item.content.trim().length === 0) {
    return 'Each content item must have non-empty content.';
  }
  if (item.type === 'quiz') {
    const quiz = item.quiz;
    if (!quiz || typeof quiz.question !== 'string' || quiz.question.trim().length === 0) {
      return 'Quiz steps must include a question.';
    }
    if (!Array.isArray(quiz.options) || quiz.options.length < 2 || quiz.options.length > 6) {
      return 'Quiz steps must include between 2 and 6 options.';
    }
    if (!quiz.options.some((o: any) => o && o.isCorrect)) {
      return 'Quiz steps must have at least one correct option.';
    }
  }
  if (item.type === 'exercise') {
    const exercise = item.exercise;
    if (!exercise || typeof exercise.instructions !== 'string' || exercise.instructions.trim().length === 0) {
      return 'Exercise steps must include instructions.';
    }
    if (typeof exercise.starterCode !== 'string' || exercise.starterCode.trim().length === 0) {
      return 'Exercise steps must include starter code.';
    }
  }
  return null;
}

export const validateCreateTopic = (req: Request, res: Response, next: NextFunction): void => {
  const { course, title, contents } = req.body;
  const errors: string[] = [];

  if (!course || typeof course !== 'string') {
    errors.push('Course ID is required.');
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Topic title is required.');
  }

  if (req.body.defaultFlow !== undefined && !['flat', 'guided'].includes(req.body.defaultFlow)) {
    errors.push('defaultFlow must be either "flat" or "guided".');
  }

  if (contents !== undefined) {
    if (!Array.isArray(contents)) {
      errors.push('Contents must be an array.');
    } else {
      for (const item of contents) {
        const error = validateContentItem(item);
        if (error) {
          errors.push(error);
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateUpdateTopic = (req: Request, res: Response, next: NextFunction): void => {
  const { contents } = req.body;
  const errors: string[] = [];

  if (req.body.title !== undefined && (typeof req.body.title !== 'string' || req.body.title.trim().length === 0)) {
    errors.push('Topic title cannot be empty.');
  }

  if (req.body.defaultFlow !== undefined && !['flat', 'guided'].includes(req.body.defaultFlow)) {
    errors.push('defaultFlow must be either "flat" or "guided".');
  }

  if (contents !== undefined) {
    if (!Array.isArray(contents)) {
      errors.push('Contents must be an array.');
    } else {
      for (const item of contents) {
        const error = validateContentItem(item);
        if (error) {
          errors.push(error);
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
