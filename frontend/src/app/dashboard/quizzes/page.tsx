"use client";
import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Trophy,
  Calendar,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import api from "@/lib/api";

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty: "beginner" | "intermediate" | "advanced";
  timeLimit?: number;
  createdAt: string;
}

interface QuizAttempt {
  _id: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: number[];
}

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "beginner" as const,
    topic: "",
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0 && showQuizModal && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showQuizModal, showResults]);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get("/quizzes");
      setQuizzes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async () => {
    if (!formData.title.trim() || !formData.topic.trim()) return;

    try {
      const response = await api.post("/quizzes", formData);
      setQuizzes([response.data, ...quizzes]);
      setShowCreateModal(false);
      setFormData({ title: "", description: "", difficulty: "beginner", topic: "" });
    } catch (error) {
      console.error("Failed to create quiz:", error);
      alert("Failed to create quiz. Please try again.");
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(quiz => quiz._id !== id));
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      alert("Failed to delete quiz. Please try again.");
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
    setQuizResults(null);
    setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    setShowQuizModal(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      const response = await api.post(`/quizzes/${selectedQuiz._id}/attempt`, {
        answers,
      });
      setQuizResults(response.data);
      setShowResults(true);
      setTimeLeft(null);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setQuizResults(null);
    setTimeLeft(null);
  };

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
            <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
            <p className="text-gray-600 mt-1">
              Test your knowledge with AI-generated quizzes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Create Quiz</span>
          </button>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first quiz to test your knowledge
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        quiz.difficulty
                      )}`}
                    >
                      {quiz.difficulty}
                    </span>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <HelpCircle size={14} />
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                  </div>

                  {quiz.timeLimit && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{quiz.timeLimit} minutes</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(quiz.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => startQuiz(quiz)}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play size={16} />
                      <span className="text-sm font-medium">Start Quiz</span>
                    </button>
                    
                    <button
                      onClick={() => deleteQuiz(quiz._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Quiz Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Quiz</h2>
              
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
                    placeholder="e.g., Calculus Fundamentals Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., derivatives, limits, integration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the quiz..."
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createQuiz}
                  disabled={!formData.title.trim() || !formData.topic.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    !formData.title.trim() || !formData.topic.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Create Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Taking Modal */}
        {showQuizModal && selectedQuiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              {showResults && quizResults ? (
                // Results View
                <div className="text-center">
                  <div className="mb-6">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                    <p className="text-gray-600">Here are your results</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {Math.round((quizResults.score / quizResults.totalQuestions) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {quizResults.score}
                        </div>
                        <div className="text-sm text-gray-600">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600 mb-1">
                          {quizResults.totalQuestions - quizResults.score}
                        </div>
                        <div className="text-sm text-gray-600">Incorrect</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeQuizModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                // Quiz Taking View
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                      <p className="text-gray-600">
                        Question {currentQuestion + 1} of {selectedQuiz.questions.length}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {timeLeft !== null && (
                        <div className="flex items-center space-x-2 text-orange-600">
                          <Clock size={20} />
                          <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                        </div>
                      )}
                      <button
                        onClick={closeQuizModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {selectedQuiz.questions[currentQuestion] && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        {selectedQuiz.questions[currentQuestion].question}
                      </h3>

                      <div className="space-y-3">
                        {selectedQuiz.questions[currentQuestion].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full text-left p-4 rounded-lg border transition-colors ${
                              answers[currentQuestion] === index
                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                          >
                            <span className="font-medium mr-3">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentQuestion === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-600 hover:bg-gray-700 text-white"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex items-center space-x-2">
                      {selectedQuiz.questions.map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index === currentQuestion
                              ? "bg-blue-600"
                              : answers[index] !== -1
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    {currentQuestion === selectedQuiz.questions.length - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizzesPage;
