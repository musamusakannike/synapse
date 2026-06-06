import axios from "axios";
import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";
import { sendSubscriptionSuccessEmail } from "./mail";


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_BASE_URL ||
  "https://sabilearn.online";
export const PREMIUM_SUBSCRIPTION_PRICE_NGN = 2500;
export const PREMIUM_SUBSCRIPTION_PRICE_KOBO = PREMIUM_SUBSCRIPTION_PRICE_NGN * 100;
export const PREMIUM_SUBSCRIPTION_PLAN = "premium_monthly";

function getPaystackErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return typeof error.response?.data?.message === "string"
      ? error.response.data.message
      : error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function getPaystackSecretKey() {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  return PAYSTACK_SECRET_KEY;
}

export function addOneSubscriptionMonth(date: Date) {
  const next = new Date(date);
  const day = next.getDate();

  next.setDate(1);
  next.setMonth(next.getMonth() + 1);

  const lastDayOfTargetMonth = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0
  ).getDate();

  next.setDate(Math.min(day, lastDayOfTargetMonth));
  return next;
}

function isSubscriptionActive(user: { premium?: unknown; subscriptionExpiresAt?: unknown }) {
  if (!user.premium || !user.subscriptionExpiresAt) return false;

  return new Date(user.subscriptionExpiresAt as string | Date).getTime() > Date.now();
}

export async function syncUserSubscriptionStatus(userId: string) {
  if (!ObjectId.isValid(userId)) return false;

  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (!user) return false;

  const active = isSubscriptionActive({
    premium: user.premium,
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  });

  if (!active && user.premium) {
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { premium: false, subscriptionStatus: "expired" } }
    );
  }

  return active;
}

export async function activateMonthlySubscription(
  userId: string,
  payment: {
    reference: string;
    amount: number;
    currency: string;
    paidAt?: string;
    customerCode?: string;
  }
) {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID in payment metadata");
  }

  if (payment.amount !== PREMIUM_SUBSCRIPTION_PRICE_KOBO || payment.currency !== "NGN") {
    throw new Error("Payment amount or currency does not match the Premium monthly plan");
  }

  const { db } = await connectToDatabase();
  const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date();
  const subscriptionExpiresAt = addOneSubscriptionMonth(paidAt);

  const existingPayment = await db.collection("payments").findOne({
    reference: payment.reference,
    status: "success",
  });

  if (existingPayment) {
    return {
      alreadyProcessed: true,
      subscriptionExpiresAt: existingPayment.subscriptionExpiresAt as Date,
    };
  }

  await db.collection("payments").updateOne(
    { reference: payment.reference },
    {
      $setOnInsert: {
        reference: payment.reference,
        userId,
        amount: payment.amount,
        currency: payment.currency,
        status: "success",
        plan: PREMIUM_SUBSCRIPTION_PLAN,
        paidAt,
        subscriptionExpiresAt,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        premium: true,
        subscriptionStatus: "active",
        subscriptionStartedAt: paidAt,
        subscriptionExpiresAt,
        paystackCustomerCode: payment.customerCode,
        paystackLastReference: payment.reference,
      },
    }
  );

  // Retrieve user to send subscription success email asynchronously
  db.collection("users")
    .findOne({ _id: new ObjectId(userId) })
    .then((user) => {
      if (user && user.email) {
        sendSubscriptionSuccessEmail(
          user.email,
          user.name || "Scholar",
          payment.reference,
          payment.amount,
          subscriptionExpiresAt
        ).catch((err) => {
          console.error("Failed to send subscription success email:", err);
        });
      }
    })
    .catch((err) => {
      console.error("Error retrieving user for subscription success email:", err);
    });

  return { alreadyProcessed: false, subscriptionExpiresAt };

}

/**
 * Initialize a subscription payment with Paystack
 */
export async function initializeTransaction(
  email: string,
  amountInNGN: number,
  userId: string
) {
  try {
    if (!ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    const amountInKobo = amountInNGN * 100; // Paystack requires lowest currency unit (Kobo)
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo.toString(),
        currency: "NGN",
        callback_url: `${APP_BASE_URL}/api/payments/verify`,
        metadata: {
          userId,
          plan: PREMIUM_SUBSCRIPTION_PLAN,
          interval: "monthly",
          app: "sabilearn",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${getPaystackSecretKey()}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data?.data; // Returns { authorization_url, access_code, reference }
  } catch (error: unknown) {
    console.error("Paystack Initialize Error:", getPaystackErrorMessage(error, "Unknown error"));
    throw new Error(getPaystackErrorMessage(error, "Failed to initialize transaction with Paystack"));
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
          Authorization: `Bearer ${getPaystackSecretKey()}`,
        },
      }
    );

    return response.data?.data; // Returns full transaction details, check data.status === 'success'
  } catch (error: unknown) {
    console.error("Paystack Verify Error:", getPaystackErrorMessage(error, "Unknown error"));
    throw new Error(getPaystackErrorMessage(error, "Failed to verify transaction with Paystack"));
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

  const premiumActive = await syncUserSubscriptionStatus(userId);

  // Premium users are always allowed
  if (premiumActive) {
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

/**
 * Refund a single generation previously counted by {@link checkAndIncrementUsage}.
 *
 * Call this when an AI generation fails AFTER usage was incremented, so a free
 * user doesn't lose a generation for work that never produced a result. It only
 * decrements today's counter (never below 0) and is a no-op once the daily
 * counter has already reset to a new day.
 */
export async function refundUsage(userId: string): Promise<void> {
  if (!ObjectId.isValid(userId)) return;

  const { db } = await connectToDatabase();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Only decrement if the reservation happened today and the counter is > 0,
  // so we never go negative or refund into a freshly reset day.
  await db.collection("users").updateOne(
    {
      _id: new ObjectId(userId),
      lastGenerationResetDate: today,
      generationsToday: { $gt: 0 },
    },
    { $inc: { generationsToday: -1 } }
  );
}
