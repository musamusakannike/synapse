import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { getAuth } from 'firebase-admin/auth';
import User from '../models/user.model';
import { generateToken } from '../utils/token.util';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { sendEmail } from '../utils/email.util';
import { sendWelcomeNotification } from '../services/notification.service';

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, level } = req.body;
    const name = `${firstName} ${lastName}`;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email is already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      firstName,
      lastName,
      level: level || 'beginner',
    });

    const token = generateToken({ id: newUser.id, role: newUser.role });

    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to SabiLearn!',
        html: `<p>Hi ${firstName},</p><p>Welcome to SabiLearn! Your account has been created successfully. Start exploring courses and ace your exams.</p>`,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Fire-and-forget: the account exists, so a failed nudge must not fail signup.
    void sendWelcomeNotification(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        level: newUser.level,
        role: newUser.role,
        currentStreak: newUser.currentStreak ?? 0,
        longestStreak: newUser.longestStreak ?? 0,
        totalXp: newUser.totalXp ?? 0,
        settings: newUser.settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user with email & password
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        role: user.role,
        avatar: user.avatar,
        currentStreak: user.currentStreak ?? 0,
        longestStreak: user.longestStreak ?? 0,
        totalXp: user.totalXp ?? 0,
        settings: user.settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone,
        bio: req.user.bio,
        avatar: req.user.avatar,
        level: req.user.level,
        role: req.user.role,
        currentStreak: req.user.currentStreak ?? 0,
        longestStreak: req.user.longestStreak ?? 0,
        totalXp: req.user.totalXp ?? 0,
        firebaseUid: req.user.firebaseUid,
        settings: req.user.settings || {
          emailNotifications: true,
          pushNotifications: false,
          weeklyProgress: true,
          language: 'en',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth login — verifies Firebase ID token and syncs user to MongoDB
 */
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
      return;
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      res.status(400).json({ success: false, message: 'Google account must have an email address.' });
      return;
    }

    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (!user) {
      const displayName = name || email.split('@')[0];
      const firstName = name ? name.split(' ')[0] : '';
      const lastName = name ? name.split(' ').slice(1).join(' ') : '';

      user = await User.create({
        email,
        name: displayName,
        firstName,
        lastName,
        avatar: picture || '',
        firebaseUid: uid,
        level: 'beginner',
        role: 'user',
      });

      // Only on first sign-in — returning users take the branch below.
      void sendWelcomeNotification(user);
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        role: user.role,
        avatar: user.avatar,
        currentStreak: user.currentStreak ?? 0,
        longestStreak: user.longestStreak ?? 0,
        totalXp: user.totalXp ?? 0,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apple OAuth login — verifies Firebase ID token (from Apple sign-in) and syncs user to MongoDB
 */
export const appleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ success: false, message: 'Firebase ID token is required.' });
      return;
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      res.status(400).json({ success: false, message: 'Apple account must have an email address.' });
      return;
    }

    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (!user) {
      const displayName = name || email.split('@')[0];
      const firstName = name ? name.split(' ')[0] : '';
      const lastName = name ? name.split(' ').slice(1).join(' ') : '';

      user = await User.create({
        email,
        name: displayName,
        firstName,
        lastName,
        avatar: picture || '',
        firebaseUid: uid,
        level: 'beginner',
        role: 'user',
      });

      // Only on first sign-in — returning users take the branch below.
      void sendWelcomeNotification(user);
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        role: user.role,
        avatar: user.avatar,
        currentStreak: user.currentStreak ?? 0,
        longestStreak: user.longestStreak ?? 0,
        totalXp: user.totalXp ?? 0,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password — sends a Firebase password reset link via email
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'A valid email address is required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(200).json({ success: true, message: 'If an account exists for that email, a password reset link has been sent.' });
      return;
    }

    const link = await getAuth().generatePasswordResetLink(email);

    try {
      await sendEmail({
        to: email,
        subject: 'Reset your SabiLearn password',
        html: `<p>You requested a password reset for your SabiLearn account.</p><p>Click <a href="${link}">here</a> to reset your password.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.status(200).json({ success: true, message: 'If an account exists for that email, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Request account deletion via email (for Play Store web requirement)
 */
export const requestAccountDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, reason } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'A valid email address is required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (user) {
      try {
        await sendEmail({
          to: email,
          subject: 'Account Deletion Request Received - SabiLearn',
          html: `<p>Hi ${user.firstName || user.name || 'there'},</p>
                 <p>We received a request to delete your SabiLearn account associated with this email address.</p>
                 <p><strong>Reason provided:</strong> ${reason ? String(reason) : 'None provided'}</p>
                 <p>If you wish to proceed immediately, you can log in to your account on our website and confirm deletion directly. Otherwise, our team will process your deletion request within 7 business days.</p>
                 <p>If you did not request this deletion, please log into your account immediately and change your password.</p>
                 <p>Best regards,<br/>SabiLearn Privacy Team</p>`,
        });
      } catch (emailError) {
        console.error('Failed to send deletion request email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists for that email, account deletion instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
};

