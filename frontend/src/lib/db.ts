import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "synapse";

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Set standard connection options
  const client = new MongoClient(uri as string);

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  // Let's create unique indexes on user email to ensure uniqueness
  try {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
  } catch (error) {
    console.error("Index creation error:", error);
  }

  return { client, db };
}

export interface UserDocument {
  _id?: string;
  name: string;
  email: string;
  password?: string; // hashed for email/password
  googleAuth: boolean;
  premium: boolean;
  generationsToday: number;
  lastGenerationResetDate: string; // YYYY-MM-DD
  style: string; // textual, visual, case-study, analytical, qa
  level: string; // high school, undergraduate, postgrad, self-learner
  goals: string; // custom free text
  createdAt: Date;
}

export interface CourseDocument {
  _id?: string;
  userId: string;
  title: string;
  level: string;
  style: string;
  outline: {
    modules: Array<{
      title: string;
      description: string;
      lessons: Array<{
        title: string;
        description: string;
        isCompleted?: boolean;
        generatedLessonId?: string; // references lesson document
      }>;
    }>;
  };
  createdAt: Date;
}

export interface LessonDocument {
  _id?: string;
  courseId: string;
  userId: string;
  moduleTitle: string;
  lessonTitle: string;
  summary: string;
  content: string; // rich markdown generated lesson
  sequenceOrder: number; // to fetch "previous lesson" properly
  createdAt: Date;
}

export interface QuizDocument {
  _id?: string;
  userId: string;
  title: string;
  topic: string;
  questions: Array<{
    question: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank";
    options?: string[]; // for multiple choice
    answer: string; // correct option text, 'true'/'false', or correct fill blank phrase
    explanation: string;
  }>;
  attempts?: Array<{
    score: number;
    total: number;
    takenAt: Date;
  }>;
  createdAt: Date;
}

export interface VideoDocument {
  _id?: string;
  userId: string;
  title: string;
  topic: string;
  styleTheme: "emerald" | "lime" | "slate" | "white";
  scenes: Array<{
    sceneNumber: number;
    title: string;
    bulletPoints: string[];
    illustrationPrompt: string; // high fidelity description for mockup
    narration: string; // voiceover text
    durationSeconds: number;
  }>;
  createdAt: Date;
}
