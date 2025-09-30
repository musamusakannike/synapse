const Chat = require("../models/chat.model");
const Document = require("../models/document.model");
const Topic = require("../models/topic.model");
const Quiz = require("../models/quiz.model");
const Website = require("../models/website.model");

/**
 * Get dashboard statistics for the authenticated user
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Get counts for all user resources
    const [documentsCount, chatsCount, topicsCount, quizzesCount, websitesCount] = await Promise.all([
      Document.countDocuments({ userId }),
      Chat.countDocuments({ userId }),
      Topic.countDocuments({ userId }),
      Quiz.countDocuments({ userId }),
      Website.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        documents: documentsCount,
        chats: chatsCount,
        topics: topicsCount,
        quizzes: quizzesCount,
        websites: websitesCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

/**
 * Get user progress and analytics data
 */
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Calculate study streak (days with activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent activities to calculate streak
    const recentChats = await Chat.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    const recentDocuments = await Document.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    const recentTopics = await Topic.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    const recentQuizzes = await Quiz.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    // Combine all activities and sort by date
    const allActivities = [
      ...recentChats.map(chat => ({ type: 'chat', date: chat.createdAt })),
      ...recentDocuments.map(doc => ({ type: 'document', date: doc.createdAt })),
      ...recentTopics.map(topic => ({ type: 'topic', date: topic.createdAt })),
      ...recentQuizzes.map(quiz => ({ type: 'quiz', date: quiz.createdAt })),
    ].sort((a, b) => b.date - a.date);

    // Calculate study streak
    let studyStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group activities by date
    const activitiesByDate = {};
    allActivities.forEach(activity => {
      const dateKey = activity.date.toISOString().split('T')[0];
      if (!activitiesByDate[dateKey]) {
        activitiesByDate[dateKey] = [];
      }
      activitiesByDate[dateKey].push(activity);
    });

    // Calculate consecutive days with activity
    let currentDate = new Date(today);
    while (currentDate >= thirtyDaysAgo) {
      const dateKey = currentDate.toISOString().split('T')[0];
      if (activitiesByDate[dateKey] && activitiesByDate[dateKey].length > 0) {
        studyStreak++;
      } else if (studyStreak > 0) {
        break; // Break streak if no activity on a day
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Estimate study time (rough calculation based on activities)
    const totalActivities = allActivities.length;
    const estimatedMinutesPerActivity = 15; // Average time per activity
    const totalStudyMinutes = totalActivities * estimatedMinutesPerActivity;
    const studyHours = Math.floor(totalStudyMinutes / 60);
    const studyMinutes = totalStudyMinutes % 60;

    // Get total topics for mastery count
    const totalTopics = await Topic.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        studyStreak,
        studyTime: {
          hours: studyHours,
          minutes: studyMinutes,
          formatted: `${studyHours}h ${studyMinutes}m`
        },
        topicsMastered: totalTopics,
        totalActivities: totalActivities
      },
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user progress",
      error: error.message,
    });
  }
};

/**
 * Get recent activity for the dashboard
 */
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent activities from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentChats, recentDocuments, recentTopics, recentQuizzes] = await Promise.all([
      Chat.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(limit),

      Document.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      })
      .select('filename title createdAt')
      .sort({ createdAt: -1 })
      .limit(limit),

      Topic.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(limit),

      Quiz.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      })
      .select('title score createdAt')
      .sort({ createdAt: -1 })
      .limit(limit),
    ]);

    // Format activities with consistent structure
    const activities = [
      ...recentChats.map(chat => ({
        id: chat._id,
        type: 'chat',
        title: chat.title || 'Chat session',
        description: 'Chat session completed',
        createdAt: chat.createdAt,
        icon: 'MessageCircle',
        color: 'green'
      })),
      ...recentDocuments.map(doc => ({
        id: doc._id,
        type: 'document',
        title: doc.filename || doc.title || 'Document',
        description: 'Document uploaded',
        createdAt: doc.createdAt,
        icon: 'FileText',
        color: 'blue'
      })),
      ...recentTopics.map(topic => ({
        id: topic._id,
        type: 'topic',
        title: topic.title || 'Topic',
        description: 'Topic created',
        createdAt: topic.createdAt,
        icon: 'BookOpen',
        color: 'purple'
      })),
      ...recentQuizzes.map(quiz => ({
        id: quiz._id,
        type: 'quiz',
        title: quiz.title || 'Quiz',
        description: quiz.score ? `Quiz completed with ${quiz.score}% score` : 'Quiz completed',
        createdAt: quiz.createdAt,
        icon: 'HelpCircle',
        color: 'orange'
      })),
    ];

    // Sort all activities by creation date and limit
    const sortedActivities = activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    res.json({
      success: true,
      data: sortedActivities,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getUserProgress,
  getRecentActivity,
};
