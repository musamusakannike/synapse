import admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "synapsebotai",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "mock-client-email@synapsebotai.iam.gserviceaccount.com",
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY_FOR_LOCAL_DEVELOPMENT\n-----END PRIVATE KEY-----\n",
      }),
    });
  } catch (error) {
    console.warn("Firebase Admin initialization failed, using mock mode:", error);
    // In development, we'll allow the app to continue with mock verification
  }
}

export async function verifyGoogleToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Firebase Admin token verification failed:", error);
    return null;
  }
}
