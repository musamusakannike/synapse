import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Firebase Admin credentials are missing. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
  );
}

// Remove surrounding quotes if present
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.substring(1, privateKey.length - 1);
}

if (!admin.apps.length) {
  const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    }),
  });
}

export async function verifyGoogleToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("verifyGoogleToken error:", error);
    throw new Error("Invalid or expired authentication token");
  }
}

export { admin };
