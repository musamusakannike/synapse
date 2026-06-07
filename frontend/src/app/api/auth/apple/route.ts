import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { sendWelcomeEmail } from "@/lib/mail";
import jwt from "jsonwebtoken";
import crypto from "crypto";

interface JWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

let cachedAppleKeys: JWK[] | null = null;
let cacheExpiry = 0;

async function getApplePublicKeys(): Promise<JWK[]> {
  const now = Date.now();
  if (cachedAppleKeys && now < cacheExpiry) return cachedAppleKeys;
  const res = await fetch("https://appleid.apple.com/auth/keys");
  const data = await res.json();
  cachedAppleKeys = data.keys as JWK[];
  cacheExpiry = now + 60 * 60 * 1000; // cache 1 hour
  return cachedAppleKeys;
}

function jwkToPem(jwk: JWK): string {
  const key = crypto.createPublicKey({ key: jwk as any, format: "jwk" });
  return key.export({ type: "spki", format: "pem" }) as string;
}

async function verifyAppleToken(identityToken: string): Promise<{
  sub: string;
  email?: string;
} | null> {
  try {
    const decoded = jwt.decode(identityToken, { complete: true });
    if (!decoded || typeof decoded === "string" || !decoded.header?.kid) {
      return null;
    }

    const keys = await getApplePublicKeys();
    const matchingKey = keys.find((k) => k.kid === decoded.header.kid);
    if (!matchingKey) {
      console.error("[Apple Auth] No matching key found for kid:", decoded.header.kid);
      return null;
    }

    const pem = jwkToPem(matchingKey);
    const payload = jwt.verify(identityToken, pem, {
      algorithms: ["RS256"],
      audience: process.env.APPLE_CLIENT_ID || "com.sabilearn.app",
      issuer: "https://appleid.apple.com",
    }) as { sub: string; email?: string };

    return payload;
  } catch (error) {
    console.error("[Apple Auth] Token verification failed:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { identityToken, fullName, email: providedEmail } = await request.json();

    if (!identityToken) {
      return NextResponse.json({ error: "Identity token is required" }, { status: 400 });
    }

    const applePayload = await verifyAppleToken(identityToken);
    if (!applePayload) {
      return NextResponse.json({ error: "Invalid Apple identity token" }, { status: 401 });
    }

    const appleUserId = applePayload.sub;
    const email = applePayload.email || providedEmail;

    if (!email) {
      return NextResponse.json(
        { error: "Email not provided by Apple. Please allow email sharing during sign-in." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let user = await db.collection("users").findOne({
      $or: [{ appleId: appleUserId }, { email: email.toLowerCase() }],
    });

    const isNewUser = !user;

    if (!user) {
      const name = fullName
        ? `${fullName.givenName || ""} ${fullName.familyName || ""}`.trim()
        : email.split("@")[0];

      const today = new Date().toISOString().split("T")[0];

      const result = await db.collection("users").insertOne({
        name,
        email: email.toLowerCase(),
        appleId: appleUserId,
        googleAuth: false,
        appleAuth: true,
        premium: false,
        generationsToday: 0,
        lastGenerationResetDate: today,
        style: "textual",
        level: "self-learner",
        goals: "",
        createdAt: new Date(),
      });

      user = {
        _id: result.insertedId,
        name,
        email: email.toLowerCase(),
        premium: false,
      } as any;

      sendWelcomeEmail(email.toLowerCase(), name).catch((err) => {
        console.error("Failed to send welcome email for Apple sign-in:", err);
      });
    } else if (!user.appleId) {
      // Link Apple ID to existing account
      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { appleId: appleUserId, appleAuth: true } }
      );
    }

    const token = signJWT({
      userId: user!._id.toString(),
      email: user!.email,
      name: user!.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user!._id.toString(),
        name: user!.name,
        email: user!.email,
        premium: user!.premium || false,
      },
    });
  } catch (error: any) {
    console.error("Apple Auth Error:", error);
    return NextResponse.json({ error: error.message || "Apple authentication failed" }, { status: 500 });
  }
}
