import { Request, Response, NextFunction } from 'express';

export const validateCreateCourse = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, category } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Course title is required.');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Course description is required.');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Course category is required.');
  }

  if (req.body.difficulty && !['beginner', 'intermediate', 'advanced'].includes(req.body.difficulty)) {
    errors.push('Difficulty must be beginner, intermediate, or advanced.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateUpdateCourse = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  if (req.body.title !== undefined && (typeof req.body.title !== 'string' || req.body.title.trim().length === 0)) {
    errors.push('Course title cannot be empty.');
  }

  if (req.body.description !== undefined && (typeof req.body.description !== 'string' || req.body.description.trim().length === 0)) {
    errors.push('Course description cannot be empty.');
  }

  if (req.body.difficulty && !['beginner', 'intermediate', 'advanced'].includes(req.body.difficulty)) {
    errors.push('Difficulty must be beginner, intermediate, or advanced.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};
