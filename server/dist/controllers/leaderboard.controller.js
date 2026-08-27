"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const xpLog_model_1 = __importDefault(require("../models/xpLog.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const getLeaderboard = async (req, res, next) => {
    try {
        const timeframe = req.query.timeframe || '24h';
        const limit = parseInt(req.query.limit, 10) || 50;
        let startDate = new Date();
        if (timeframe === '24h') {
            startDate.setHours(startDate.getHours() - 24);
        }
        else if (timeframe === '3d') {
            startDate.setDate(startDate.getDate() - 3);
        }
        else if (timeframe === '1w') {
            startDate.setDate(startDate.getDate() - 7);
        }
        else if (timeframe === '1m') {
            startDate.setDate(startDate.getDate() - 30);
        }
        else {
            startDate.setHours(startDate.getHours() - 24);
        }
        const leaderboardData = await xpLog_model_1.default.aggregate([
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
            const topUsers = await user_model_1.default.find()
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
    }
    catch (error) {
        next(error);
    }
};
exports.getLeaderboard = getLeaderboard;
