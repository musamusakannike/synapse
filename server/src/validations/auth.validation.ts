import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, firstName, lastName } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push('First name is required.');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push('Last name is required.');
  }

  if (req.body.level && !['beginner', 'intermediate', 'advanced'].includes(req.body.level)) {
    errors.push('Level must be beginner, intermediate, or advanced.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email address is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

export const validateRequestAccountDeletion = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email address is required.');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, errors });
    return;
  }

  next();
};

