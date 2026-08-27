import { Request, Response, NextFunction } from 'express';
import XpLog from '../models/xpLog.model';
import User from '../models/user.model';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const timeframe = (req.query.timeframe as string) || '24h';
    const limit = parseInt(req.query.limit as string, 10) || 50;

    let startDate = new Date();
    if (timeframe === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (timeframe === '3d') {
      startDate.setDate(startDate.getDate() - 3);
    } else if (timeframe === '1w') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === '1m') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setHours(startDate.getHours() - 24);
    }

    const leaderboardData = await XpLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$user',
          periodXp: { $sum: '$xp' },
        },
      },
      {
        $sort: { periodXp: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 1,
          periodXp: 1,
          name: '$userDetails.name',
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
          avatar: '$userDetails.avatar',
          level: '$userDetails.level',
          currentStreak: '$userDetails.currentStreak',
          totalXp: '$userDetails.totalXp',
        },
      },
    ]);

    // If few users have logs in that timeframe, fallback to top users by totalXp
    if (leaderboardData.length === 0) {
      const topUsers = await User.find()
        .select('_id name firstName lastName avatar level currentStreak totalXp')
        .sort({ totalXp: -1 })
        .limit(limit);

      const fallbackData = topUsers.map((u) => ({
        _id: u._id,
        periodXp: u.totalXp || 0,
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        avatar: u.avatar,
        level: u.level,
        currentStreak: u.currentStreak,
        totalXp: u.totalXp,
      }));

      res.status(200).json({
        success: true,
        data: fallbackData,
        timeframe,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: leaderboardData,
      timeframe,
    });
  } catch (error) {
    next(error);
  }
};
