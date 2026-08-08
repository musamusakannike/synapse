import { Request, Response, NextFunction } from 'express';

export const validateCreateNotification = (req: Request, res: Response, next: NextFunction): void => {
  const { title, message } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Notification title is required.');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Notification message is required.');
  }

  if (req.body.type && !['info', 'success', 'warning', 'announcement'].includes(req.body.type)) {
    errors.push('Type must be info, success, warning, or announcement.');
  }

  const categories = ['welcome', 'course', 'achievement', 'streak', 'reminder', 'system', 'custom'];
  if (req.body.category && !categories.includes(req.body.category)) {
    errors.push(`Category must be one of: ${categories.join(', ')}.`);
  }

  if (req.body.scheduledFor !== undefined) {
    const when = new Date(req.body.scheduledFor);
    if (Number.isNaN(when.getTime())) {
      errors.push('scheduledFor must be a valid date.');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
