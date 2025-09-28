"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Search,
  Eye,
  Calendar,
  Clock,
  Target,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import api from "@/lib/api";

interface Topic {
  _id: string;
  title: string;
  description: string;
  content: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  createdAt: string;
  updatedAt: string;
}

const TopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "beginner" as const,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await api.get("/topics");
      setTopics(response.data || []);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!formData.title.trim() || !formData.description.trim()) return;

    setGenerating(true);
    try {
      const response = await api.post("/topics", formData);
      setTopics([response.data, ...topics]);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", difficulty: "beginner" });
    } catch (error) {
      console.error("Failed to create topic:", error);
      alert("Failed to create topic. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const updateTopic = async () => {
    if (!editingTopic || !formData.title.trim() || !formData.description.trim()) return;

    try {
      const response = await api.put(`/topics/${editingTopic._id}`, formData);
      setTopics(topics.map(topic => 
        topic._id === editingTopic._id ? response.data : topic
      ));
      setEditingTopic(null);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", difficulty: "beginner" });
    } catch (error) {
      console.error("Failed to update topic:", error);
      alert("Failed to update topic. Please try again.");
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await api.delete(`/topics/${id}`);
      setTopics(topics.filter(topic => topic._id !== id));
      if (selectedTopic?._id === id) {
        setSelectedTopic(null);
        setShowTopicModal(false);
      }
    } catch (error) {
      console.error("Failed to delete topic:", error);
      alert("Failed to delete topic. Please try again.");
    }
  };

  const regenerateContent = async (id: string) => {
    if (!confirm("Are you sure you want to regenerate the content for this topic?")) return;

    try {
      const response = await api.post(`/topics/${id}/generate`);
      setTopics(topics.map(topic => 
        topic._id === id ? response.data : topic
      ));
      if (selectedTopic?._id === id) {
        setSelectedTopic(response.data);
      }
    } catch (error) {
      console.error("Failed to regenerate content:", error);
      alert("Failed to regenerate content. Please try again.");
    }
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      description: topic.description,
      difficulty: topic.difficulty,
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTopic(null);
    setFormData({ title: "", description: "", difficulty: "beginner" });
  };

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex overflow-x-hidden w-full py-2 lg:py-4">
      <Sidebar />
      <main className="flex-1 mx-auto overflow-y-auto bg-white border border-gray-200 lg:rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
            <p className="text-gray-600 mt-1">
              Create and manage AI-generated study materials
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Create Topic</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Topics Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No topics found" : "No topics yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Create your first topic to get started with AI-generated study materials"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Topic
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <div
                key={topic._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        topic.difficulty
                      )}`}
                    >
                      {topic.difficulty}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{topic.estimatedTime || 30} min</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(topic.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setSelectedTopic(topic);
                        setShowTopicModal(true);
                      }}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(topic)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => regenerateContent(topic._id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => deleteTopic(topic._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Topic Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingTopic ? "Edit Topic" : "Create New Topic"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Calculus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what you want to learn about this topic..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={closeModal}
                  disabled={generating}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTopic ? updateTopic : createTopic}
                  disabled={generating || !formData.title.trim() || !formData.description.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    generating || !formData.title.trim() || !formData.description.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {generating ? "Generating..." : editingTopic ? "Update Topic" : "Create Topic"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topic Content Modal */}
        {showTopicModal && selectedTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedTopic.title}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        selectedTopic.difficulty
                      )}`}
                    >
                      {selectedTopic.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{selectedTopic.estimatedTime || 30} min</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="prose max-w-none">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedTopic.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {selectedTopic.content || "Content is being generated..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TopicsPage;
