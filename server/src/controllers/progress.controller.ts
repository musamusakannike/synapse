import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import Course from '../models/course.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import StudySession from '../models/studySession.model';
import UserProgress from '../models/userProgress.model';
import { recordStudyDay, announceStreakProgress } from '../services/streak.service';
import { sendAchievement } from '../services/notification.service';
import User from '../models/user.model';

/**
 * Advances the user's streak for today and sends any achievement it earned.
 * Called after every recorded session; a no-op on the day's second session.
 */
async function awardStreakAchievements(userId: mongoose.Types.ObjectId | string): Promise<void> {
  try {
    const result = await recordStudyDay(userId);
    if (result) {
      await announceStreakProgress(userId, result);
    }
  } catch (error) {
    console.error('Failed to record study streak:', error);
  }
}

export const getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const progress = await UserProgress.find({ user: userId })
      .populate({ path: 'course', select: 'title description banner category difficulty' })
      .populate({ path: 'topic', select: 'title description' })
      .sort({ lastStudiedAt: -1 })
      .limit(4);

    const totalSessions = await StudySession.countDocuments({ user: userId });
    const totalFlashcards = await StudySession.aggregate([
      { $match: { user: userId._id } },
      { $group: { _id: null, total: { $sum: '$flashcardsStudied' } } },
    ]);

    const mcqStats = await StudySession.aggregate([
      { $match: { user: userId._id, type: 'mcq' } },
      { $group: { _id: null, totalAnswered: { $sum: '$mcqAnswered' }, totalCorrect: { $sum: '$mcqCorrect' } } },
    ]);

    const avgAccuracy = mcqStats.length > 0 && mcqStats[0].totalAnswered > 0
      ? Math.round((mcqStats[0].totalCorrect / mcqStats[0].totalAnswered) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        continueStudying: progress,
        quickStats: {
          totalSessions,
          totalFlashcards: totalFlashcards[0]?.total || 0,
          avgAccuracy,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const sessions = await StudySession.find({ user: userId }).sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter((s) => s.createdAt >= today);
    const todayStudyTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    // Read the stored streak rather than recomputing it here: the scheduler and
    // the achievement notifications work off the same field, and two
    // independent calculations would eventually disagree.
    const user = await User.findById(userId).select('currentStreak longestStreak lastStudyDate');
    const streak = user?.currentStreak ?? 0;
    const longestStreak = user?.longestStreak ?? 0;

    const totalFlashcards = sessions.reduce((sum, s) => sum + s.flashcardsStudied, 0);
    const mcqSessions = sessions.filter((s) => s.type === 'mcq');
    const totalMcqAnswered = mcqSessions.reduce((sum, s) => sum + s.mcqAnswered, 0);
    const totalMcqCorrect = mcqSessions.reduce((sum, s) => sum + s.mcqCorrect, 0);
    const avgAccuracy = totalMcqAnswered > 0 ? Math.round((totalMcqCorrect / totalMcqAnswered) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        streak,
        longestStreak,
        todayStudyTime,
        totalSessions: sessions.length,
        totalFlashcards,
        avgAccuracy,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getContinueStudying = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const progress = await UserProgress.find({
      user: userId,
      isCompleted: false,
      lastStudiedAt: { $ne: null },
    })
      .populate({ path: 'course', select: 'title description banner category difficulty' })
      .populate({ path: 'topic', select: 'title description' })
      .sort({ lastStudiedAt: -1 });

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

export const getNeedsImprovement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const progress = await UserProgress.find({
      user: userId,
      mcqsAttempted: { $gt: 0 },
    })
      .populate({ path: 'course', select: 'title description banner category difficulty' })
      .populate({ path: 'topic', select: 'title description' })
      .lean();

    const needsImprovement = progress
      .filter((p) => {
        const accuracy = (p.mcqsCorrect / p.mcqsAttempted) * 100;
        return accuracy < 60;
      })
      .map((p) => ({
        ...p,
        accuracy: Math.round((p.mcqsCorrect / p.mcqsAttempted) * 100),
      }));

    res.status(200).json({ success: true, data: needsImprovement });
  } catch (error) {
    next(error);
  }
};

export const submitFlashcardSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { course, topic, flashcardsStudied, duration } = req.body;

    await StudySession.create({
      user: userId,
      course,
      topic,
      type: 'flashcard',
      flashcardsStudied,
      duration,
    });

    const flashcardCount = await Flashcard.countDocuments({ topic });

    let progress = await UserProgress.findOne({ user: userId, course, topic });
    if (!progress) {
      progress = await UserProgress.create({
        user: userId,
        course,
        topic,
        flashcardsStudied,
        flashcardsTotal: flashcardCount,
        lastStudiedAt: new Date(),
      });
    } else {
      progress.flashcardsStudied += flashcardsStudied;
      progress.flashcardsTotal = flashcardCount;
      progress.lastStudiedAt = new Date();
      if (progress.flashcardsStudied >= flashcardCount && flashcardCount > 0) {
        const wasCompleted = progress.isCompleted;
        progress.isCompleted = true;
        if (!wasCompleted) {
          const courseDoc = await Course.findById(course).select('title');
          void sendAchievement(
            userId,
            'Topic Complete',
            `You have studied every flashcard in a topic of ${courseDoc?.title || 'this course'}. Try the practice questions next.`,
            `achievement:topic-complete:${userId}:${topic}`,
            `/course/${course}`
          );
        }
      }
      await progress.save();
    }

    void awardStreakAchievements(userId);

    res.status(200).json({ success: true, message: 'Flashcard session recorded.' });
  } catch (error) {
    next(error);
  }
};

export const submitMcqSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { course, topic, mcqAnswered, mcqCorrect, score, duration } = req.body;

    await StudySession.create({
      user: userId,
      course,
      topic,
      type: 'mcq',
      mcqAnswered,
      mcqCorrect,
      score,
      duration,
    });

    let progress = await UserProgress.findOne({ user: userId, course, topic });
    if (!progress) {
      const flashcardCount = await Flashcard.countDocuments({ topic });
      progress = await UserProgress.create({
        user: userId,
        course,
        topic,
        flashcardsTotal: flashcardCount,
        mcqsAttempted: mcqAnswered,
        mcqsCorrect: mcqCorrect,
        lastStudiedAt: new Date(),
      });
    } else {
      progress.mcqsAttempted += mcqAnswered;
      progress.mcqsCorrect += mcqCorrect;
      progress.lastStudiedAt = new Date();
      await progress.save();
    }

    // A perfect run is worth calling out, but only on a set big enough to mean
    // something — congratulating a 1-for-1 cheapens every other achievement.
    if (mcqAnswered >= 5 && mcqCorrect === mcqAnswered) {
      const courseDoc = await Course.findById(course).select('title');
      void sendAchievement(
        userId,
        'Perfect Score',
        `${mcqAnswered}/${mcqAnswered} on ${courseDoc?.title || 'this course'}. Flawless.`,
        `achievement:perfect:${userId}:${topic}:${mcqAnswered}`,
        `/course/${course}`
      );
    }

    void awardStreakAchievements(userId);

    res.status(200).json({ success: true, message: 'MCQ session recorded.' });
  } catch (error) {
    next(error);
  }
};
