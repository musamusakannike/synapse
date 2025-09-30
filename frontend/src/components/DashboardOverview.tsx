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

interface DashboardStats {
  documents: number;
  chats: number;
  topics: number;
  quizzes: number;
  websites: number;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    chats: 0,
    topics: 0,
    quizzes: 0,
    websites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      color: "bg-green-100 text-green-600",
      href: "/dashboard/chat",
    },
    {
      title: "Create Topic",
      description: "Generate study materials on any subject",
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
      href: "/dashboard/topics",
    },
    {
      title: "Take Quiz",
      description: "Test your knowledge with AI-generated quizzes",
      icon: HelpCircle,
      color: "bg-orange-100 text-orange-600",
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
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Topics",
      value: stats.topics,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Quizzes",
      value: stats.quizzes,
      icon: HelpCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Websites",
      value: stats.websites,
      icon: Globe,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
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
      <div>
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
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-gray-200">
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
                <p className="text-2xl font-bold text-blue-600">7 days</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Time Studied</p>
                <p className="text-2xl font-bold text-green-600">12h 30m</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Topics Mastered</p>
                <p className="text-2xl font-bold text-purple-600">{stats.topics}</p>
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
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Document uploaded</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Chat session completed</p>
                <p className="text-sm text-gray-600">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Quiz completed with 85% score</p>
                <p className="text-sm text-gray-600">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
