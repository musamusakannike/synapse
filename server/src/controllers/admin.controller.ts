import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import Course from '../models/course.model';
import Topic from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import StudySession from '../models/studySession.model';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalUsers, totalCourses, totalTopics, totalFlashcards, totalMcqs, activeSessions] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Topic.countDocuments(),
      Flashcard.countDocuments(),
      MCQ.countDocuments(),
      StudySession.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalCourses, totalTopics, totalFlashcards, totalMcqs, activeSessions },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoursePerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courses = await Course.find()
      .populate({ path: 'topicCount' })
      .lean();

    const performance = await Promise.all(
      courses.map(async (course) => {
        const sessions = await StudySession.find({ course: course._id });
        const mcqSessions = sessions.filter((s) => s.type === 'mcq');
        const avgScore = mcqSessions.length > 0
          ? Math.round(mcqSessions.reduce((sum, s) => sum + s.score, 0) / mcqSessions.length)
          : 0;

        const enrolledUsers = await StudySession.distinct('user', { course: course._id });

        const topics = await Topic.find({ course: course._id }).select('_id');
        const topicIds = topics.map((t) => t._id);
        const flashcardCount = await Flashcard.countDocuments({ topic: { $in: topicIds } });
        const mcqCount = await MCQ.countDocuments({ topic: { $in: topicIds } });

        return {
          courseId: course._id,
          title: course.title,
          category: course.category,
          enrollment: enrolledUsers.length,
          avgScore,
          topicCount: (course as any).topicCount || 0,
          flashcardCount,
          mcqCount,
        };
      })
    );

    res.status(200).json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

export const getUserGrowth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const growth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          date: { $first: '$createdAt' },
        },
      },
      { $sort: { date: 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          count: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: growth });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessions = await StudySession.find()
      .populate({ path: 'user', select: 'name firstName lastName' })
      .populate({ path: 'course', select: 'title' })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};
