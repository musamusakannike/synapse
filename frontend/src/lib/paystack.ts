import axios from "axios";
import { connectToDatabase, UserDocument } from "./db";
import { ObjectId } from "mongodb";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_mockkey";
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || "http://localhost:3000";

/**
 * Initialize a subscription payment with Paystack
 */
export async function initializeTransaction(
  email: string,
  amountInNGN: number,
  userId: string
) {
  try {
    const amountInKobo = amountInNGN * 100; // Paystack requires lowest currency unit (Kobo)
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo.toString(),
        callback_url: `${PAYSTACK_CALLBACK_URL}/api/payments/verify`,
        metadata: {
          userId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data?.data; // Returns { authorization_url, access_code, reference }
  } catch (error: any) {
    console.error("Paystack Initialize Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to initialize transaction with Paystack"
    );
  }
}

/**
 * Verify payment reference with Paystack
 */
export async function verifyTransaction(reference: string) {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data?.data; // Returns full transaction details, check data.status === 'success'
  } catch (error: any) {
    console.error("Paystack Verify Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to verify transaction with Paystack"
    );
  }
}

/**
 * Freemium rate limiter
 * Limits free users to 3 AI operations (course outlines, lessons, quizzes, tutor question answers) per day.
 * Premium users have unlimited access.
 */
export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  premium: boolean;
  generationsToday: number;
  limit: number;
}> {
  const { db } = await connectToDatabase();
  
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) {
    return { allowed: false, premium: false, generationsToday: 0, limit: 3 };
  }

  // Premium users are always allowed
  if (user.premium) {
    return { allowed: true, premium: true, generationsToday: 0, limit: Infinity };
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  let generationsToday = user.generationsToday || 0;
  const lastResetDate = user.lastGenerationResetDate;

  // Reset counters if a new day has arrived
  if (lastResetDate !== today) {
    generationsToday = 0;
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          generationsToday: 0,
          lastGenerationResetDate: today,
        },
      }
    );
  }

  const limit = 3;

  if (generationsToday >= limit) {
    return { allowed: false, premium: false, generationsToday, limit };
  }

  // Increment usage count
  const newCount = generationsToday + 1;
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        generationsToday: newCount,
        lastGenerationResetDate: today,
      },
    }
  );

  return { allowed: true, premium: false, generationsToday: newCount, limit };
}
