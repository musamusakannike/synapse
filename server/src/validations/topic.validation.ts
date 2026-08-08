import { Request, Response, NextFunction } from 'express';

const VALID_CONTENT_TYPES = ['text', 'latex', 'youtube', 'image', 'video', 'audio', 'code'];

export const validateCreateTopic = (req: Request, res: Response, next: NextFunction): void => {
  const { course, title, contents } = req.body;
  const errors: string[] = [];

  if (!course || typeof course !== 'string') {
    errors.push('Course ID is required.');
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Topic title is required.');
  }

  if (contents !== undefined) {
    if (!Array.isArray(contents)) {
      errors.push('Contents must be an array.');
    } else {
      for (const item of contents) {
        if (!item.type || !VALID_CONTENT_TYPES.includes(item.type)) {
          errors.push(`Each content item must have a valid type: ${VALID_CONTENT_TYPES.join(', ')}.`);
          break;
        }
        if (!item.content || typeof item.content !== 'string' || item.content.trim().length === 0) {
          errors.push('Each content item must have non-empty content.');
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

  if (contents !== undefined) {
    if (!Array.isArray(contents)) {
      errors.push('Contents must be an array.');
    } else {
      for (const item of contents) {
        if (!item.type || !VALID_CONTENT_TYPES.includes(item.type)) {
          errors.push(`Each content item must have a valid type: ${VALID_CONTENT_TYPES.join(', ')}.`);
          break;
        }
        if (!item.content || typeof item.content !== 'string' || item.content.trim().length === 0) {
          errors.push('Each content item must have non-empty content.');
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
