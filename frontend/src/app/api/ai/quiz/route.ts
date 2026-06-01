import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase, QuizDocument } from "@/lib/db";
import { verifyJWT } from "@/lib/jwt";
import { generateQuizQuestions, generateQuizQuestionsChunked } from "@/lib/deepseek";
import { checkAndIncrementUsage } from "@/lib/paystack";
import { buildDocumentContext } from "@/lib/document-context";
import { ObjectId } from "mongodb";

// Question limits
const FREE_MAX_QUESTIONS = 15;
const PREMIUM_MAX_QUESTIONS = 100;

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJWT(token);
  return payload ? payload.userId : null;
}

/**
 * GET user's quizzes or a specific quiz
 */
export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");

    // Get user to check premium status
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { premium: 1 } }
    );
    const isPremium = user?.premium || false;

    if (quizId) {
      const quiz = await db.collection("quizzes").findOne({
        _id: new ObjectId(quizId),
        userId,
      });
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        quiz,
        userLimits: {
          isPremium,
          maxQuestions: isPremium ? PREMIUM_MAX_QUESTIONS : FREE_MAX_QUESTIONS,
          premiumMaxQuestions: PREMIUM_MAX_QUESTIONS,
        }
      });
    }

    const quizzes = await db
      .collection("quizzes")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      quizzes,
      userLimits: {
        isPremium,
        maxQuestions: isPremium ? PREMIUM_MAX_QUESTIONS : FREE_MAX_QUESTIONS,
        premiumMaxQuestions: PREMIUM_MAX_QUESTIONS,
      }
    });
  } catch (error: any) {
    console.error("GET Quiz Error:", error);
    return NextResponse.json({ error: "Failed to retrieve quiz" }, { status: 500 });
  }
}

function extractNumQuestions(topic: string): { topicCleaned: string; count?: number } {
  const regexes = [
    // Matches "10 questions", "10 qns", "10 items", "10 quiz questions", etc.
    /(?:^|\b)(\d+)\s*(?:quiz\s+)?(?:questions?|qns?|items?)\b/i,
    // Matches "questions: 10", "questions 10", "qns 10", etc.
    /\b(?:questions?|qns?|items?)\b\s*(?:of|about|on|for)?\s*(\d+)\b/i,
    // Matches "generate 10 questions", "make 10 questions", etc.
    /\b(?:generate|make|create)\s+(\d+)\s*(?:quiz\s+)?(?:questions?|qns?|items?)\b/i
  ];

  for (const regex of regexes) {
    const match = topic.match(regex);
    if (match) {
      const count = parseInt(match[1], 10);
      if (!isNaN(count) && count > 0) {
        // Remove the matched part
        let topicCleaned = topic.replace(match[0], "");
        
        // Clean multiple times to handle successive leading patterns (like "generate" then "about")
        let prev = "";
        while (topicCleaned !== prev) {
          prev = topicCleaned;
          topicCleaned = topicCleaned
            .trim()
            // Remove leading punctuation
            .replace(/^[-—–,:;()\[\]{}.]+\s*/g, "")
            // Remove leading helper verbs
            .replace(/^(?:generate|make|create|spin\s+up|build|give\s+me)\s+/i, "")
            // Remove leading prepositions
            .replace(/^(?:on|about|for|of|to|in|with|from)\s+/i, "")
            // Remove trailing punctuation
            .replace(/\s*[-—–,:;()\[\]{}.]+$/g, "")
            // Remove empty parentheses/brackets/braces
            .replace(/\(\s*\)/g, "")
            .replace(/\[\s*\]/g, "")
            .replace(/\{\s*\}/g, "");
        }
        
        topicCleaned = topicCleaned.replace(/\s+/g, " ").trim();
        return { topicCleaned: topicCleaned || topic, count };
      }
    }
  }

  return { topicCleaned: topic };
}

/**
 * POST spin up a new quiz
 */
export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, documentIds, numQuestions } = body;
    if ((!topic || topic.trim() === "") && (!documentIds || documentIds.length === 0)) {
      return NextResponse.json({ error: "Please provide a topic or upload a document" }, { status: 400 });
    }

    // Daily Limit Checker
    const usage = await checkAndIncrementUsage(userId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Daily generation limit reached",
          code: "LIMIT_REACHED",
          limit: usage.limit,
          generationsToday: usage.generationsToday,
        },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = {
      style: user.style || "textual",
      level: user.level || "self-learner",
      goals: user.goals || "",
    };

    // Build document context if provided
    let documentContext = "";
    if (documentIds && documentIds.length > 0) {
      documentContext = await buildDocumentContext(documentIds, userId);
    }

    // Parse question count and clean up topic
    let topicText = topic?.trim() || "";
    let parsedCount: number | undefined;

    if (topicText) {
      const parsed = extractNumQuestions(topicText);
      topicText = parsed.topicCleaned;
      parsedCount = parsed.count;
    }

    // Determine final question count: parsedCount takes priority if present, else body param, fallback to 5
    let finalNumQuestions = 5;
    if (parsedCount !== undefined) {
      finalNumQuestions = parsedCount;
    } else if (numQuestions !== undefined) {
      finalNumQuestions = parseInt(numQuestions, 10) || 5;
    }

    // Get user premium status to enforce limits
    const isPremium = user?.premium || false;
    const userMaxQuestions = isPremium ? PREMIUM_MAX_QUESTIONS : FREE_MAX_QUESTIONS;

    // Enforce limits: min 1, max based on subscription
    if (finalNumQuestions > userMaxQuestions) {
      finalNumQuestions = userMaxQuestions;
    } else if (finalNumQuestions < 1) {
      finalNumQuestions = 5;
    }

    const finalTopic = topicText || "Quiz based on the uploaded document(s)";

    // Spin questions using DeepSeek (chunked for large quizzes)
    let quizData;
    if (finalNumQuestions > 20) {
      // Use chunked generation for large quizzes to ensure exact count
      quizData = await generateQuizQuestionsChunked(finalTopic, userProfile, documentContext, finalNumQuestions);
    } else {
      quizData = await generateQuizQuestions(finalTopic, userProfile, documentContext, finalNumQuestions);
    }

    // Save to MongoDB
    const result = await db.collection("quizzes").insertOne({
      userId,
      title: quizData.title || `Quiz: ${finalTopic}`,
      topic: finalTopic,
      questions: quizData.questions,
      attempts: [],
      createdAt: new Date(),
    });

    // Build response with optional warning for partial generation
    const response: any = {
      success: true,
      quizId: result.insertedId.toString(),
      generationsToday: usage.generationsToday,
      limit: usage.limit,
      userLimits: {
        isPremium,
        maxQuestions: userMaxQuestions,
        premiumMaxQuestions: PREMIUM_MAX_QUESTIONS,
      }
    };

    // Add warning if some chunks failed but we still got partial results
    if (quizData.failedChunks && quizData.failedChunks > 0) {
      response.warning = `Generated ${quizData.generatedCount} of ${quizData.requestedCount} questions due to AI processing issues. You can regenerate for more questions.`;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("POST Quiz Error:", error);
    return NextResponse.json({ error: error.message || "Failed to spin up quiz" }, { status: 500 });
  }
}

/**
 * PUT log quiz attempt results
 */
export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, score, total } = await request.json();
    if (!quizId || score === undefined || total === undefined) {
      return NextResponse.json({ error: "Missing score/total parameters" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("quizzes").updateOne(
      { _id: new ObjectId(quizId), userId },
      {
        $push: {
          attempts: {
            score,
            total,
            takenAt: new Date(),
          },
        } as any,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT Quiz Attempt Error:", error);
    return NextResponse.json({ error: "Failed to record quiz score" }, { status: 500 });
  }
}
