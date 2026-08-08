export interface IUserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyProgress: boolean;
  language: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  role: 'user' | 'admin';
  firebaseUid?: string;
  settings?: IUserSettings;
}

export type TopicContentType = 'text' | 'latex' | 'youtube' | 'image' | 'video' | 'audio' | 'code' | 'quiz' | 'exercise';

export interface TopicQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface TopicQuiz {
  question: string;
  options: TopicQuizOption[];
  explanation?: string;
}

export interface TopicExercise {
  instructions: string;
  starterCode: string;
  language: string;
  expectedOutput?: string;
  solution?: string;
}

export interface TopicContent {
  type: TopicContentType;
  content: string;
  language?: string;
  title?: string;
  quiz?: TopicQuiz;
  exercise?: TopicExercise;
}

export type TopicFlow = 'flat' | 'guided';

export interface Topic {
  _id: string;
  course: string;
  title: string;
  description: string;
  contents: TopicContent[];
  order: number;
  isPublished: boolean;
  defaultFlow: TopicFlow;
  flashcardCount?: number;
  mcqCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  longDescription: string;
  banner: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  whatYouWillLearn: string[];
  isPublished: boolean;
  order: number;
  isFree: boolean;
  /** Price in kobo (NGN smallest unit). Ignored when isFree is true. */
  price: number;
  topicCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  _id: string;
  topic: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface MCQOption {
  text: string;
  isCorrect: boolean;
}

export interface MCQ {
  _id: string;
  topic: string;
  question: string;
  options: MCQOption[];
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  _id: string;
  user: string;
  course: string;
  topic: string;
  type: 'flashcard' | 'mcq';
  flashcardsStudied: number;
  mcqAnswered: number;
  mcqCorrect: number;
  duration: number;
  score: number;
  createdAt: string;
}

export interface UserProgress {
  _id: string;
  user: string;
  course: Course | string;
  topic: Topic | string;
  flashcardsStudied: number;
  flashcardsTotal: number;
  mcqsAttempted: number;
  mcqsCorrect: number;
  lastStudiedAt: string;
  isCompleted: boolean;
  accuracy?: number;
}

export interface Notification {
  _id: string;
  user: string | null;
  type: 'info' | 'success' | 'warning' | 'announcement';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface DashboardData {
  continueStudying: UserProgress[];
  quickStats: {
    totalSessions: number;
    totalFlashcards: number;
    avgAccuracy: number;
  };
}

export interface ProgressStats {
  streak: number;
  todayStudyTime: number;
  totalSessions: number;
  totalFlashcards: number;
  avgAccuracy: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'none';

export interface PaymentStatus {
  subscription: {
    status: SubscriptionStatus;
    currentPeriodEnd?: string;
  };
  purchasedCourseIds: string[];
}

export interface CheckoutInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface VerifyResponse {
  status: TransactionStatus;
  type: 'course_purchase' | 'subscription';
}
