"use client";
import React, { useEffect, useState } from "react";
import {
  Brain,
  FileText,
  MessageCircle,
  BookOpen,
  HelpCircle,
  Globe,
  Plus,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";
import api from "@/lib/api";
import Loader from "./Loader";
import HelpButton from "./HelpButton";
import { helpConfigs } from "@/config/helpConfigs";

interface DashboardStats {
  documents: number;
  chats: number;
  topics: number;
  quizzes: number;
  websites: number;
}

interface UserProgress {
  studyStreak: number;
  studyTime: {
    hours: number;
    minutes: number;
    formatted: string;
  };
  topicsMastered: number;
  totalActivities: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  icon: string;
  color: string;
}

// Helper function to get icon component based on icon name
const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    FileText,
    MessageCircle,
    BookOpen,
    HelpCircle,
    Globe,
  };
  return icons[iconName] || FileText;
};

// Helper function to get relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    chats: 0,
    topics: 0,
    quizzes: 0,
    websites: 0,
  });
  const [userProgress, setUserProgress] = useState<UserProgress>({
    studyStreak: 0,
    studyTime: { hours: 0, minutes: 0, formatted: '0h 0m' },
    topicsMastered: 0,
    totalActivities: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, progressRes, activityRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/progress"),
          api.get("/dashboard/activity?limit=5"),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }

        if (progressRes.data?.success) {
          setUserProgress(progressRes.data.data);
        }

        if (activityRes.data?.success) {
          setRecentActivity(activityRes.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback to individual endpoints if dashboard endpoints fail
        try {
          const [documentsRes, chatsRes, topicsRes, quizzesRes, websitesRes] = await Promise.all([
            api.get("/documents"),
            api.get("/chats"),
            api.get("/topics"),
            api.get("/quizzes"),
            api.get("/websites"),
          ]);

          setStats({
            documents: documentsRes.data?.length || 0,
            chats: (chatsRes.data?.chats?.length as number) || 0,
            topics: topicsRes.data?.length || 0,
            quizzes: quizzesRes.data?.length || 0,
            websites: websitesRes.data?.length || 0,
          });
        } catch (fallbackError) {
          console.error("Failed to fetch fallback data:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: "Upload Document",
      description: "Add PDFs, slides, or text files",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/documents",
    },
    {
      title: "Start Chat",
      description: "Ask questions about your materials",
      icon: MessageCircle,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/chat",
    },
    {
      title: "Create Topic",
      description: "Generate study materials on any subject",
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/topics",
    },
    {
      title: "Take Quiz",
      description: "Test your knowledge with AI-generated quizzes",
      icon: HelpCircle,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/quizzes",
    },
  ];

  const statCards = [
    {
      title: "Documents",
      value: stats.documents,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Chats",
      value: stats.chats,
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Topics",
      value: stats.topics,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Quizzes",
      value: stats.quizzes,
      icon: HelpCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Websites",
      value: stats.websites,
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">
            Ready to accelerate your learning journey?
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-gray-800 font-mono">SYNAPSE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div data-help="quick-actions">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all transform hover:scale-105 group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Learning Progress Section */}
      <div data-help="progress" className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Learning Journey</h2>
            <p className="text-gray-600 mt-1">Track your progress and stay motivated</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Study Streak</p>
                <p className="text-2xl font-bold text-blue-600">{userProgress.studyStreak} days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Time Studied</p>
                <p className="text-2xl font-bold text-blue-600">{userProgress.studyTime.formatted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Topics Mastered</p>
                <p className="text-2xl font-bold text-blue-600">{userProgress.topicsMastered}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const IconComponent = getIconComponent(activity.icon);
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600',
                  orange: 'bg-orange-100 text-orange-600',
                  indigo: 'bg-indigo-100 text-indigo-600',
                };
                const colorClass = colorClasses[activity.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-600';

                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-600">{getRelativeTime(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Start using Synapse to see your activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <HelpButton helpConfig={helpConfigs.dashboard} />
    </div>
  );
};

export default DashboardOverview;
