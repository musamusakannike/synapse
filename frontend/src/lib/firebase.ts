import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.substring(1, privateKey.length - 1);
}

if (!admin.apps.length && projectId && clientEmail && privateKey) {
  try {
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export async function verifyGoogleToken(idToken: string) {
  try {
    // Handle mock tokens from local development - decode without Firebase verification
    if (idToken.endsWith('.mock-signature')) {
      console.warn("Mock token detected - decoding for local development only.");
      try {
        const payloadBase64 = idToken.split(".")[1];
        if (payloadBase64) {
          const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
          const payload = JSON.parse(payloadJson);
          return {
            uid: payload.user_id || payload.sub,
            email: payload.email,
            name: payload.name,
            email_verified: payload.email_verified,
            picture: payload.picture,
            iss: payload.iss,
            aud: payload.aud,
            auth_time: payload.auth_time,
            sub: payload.sub,
            iat: payload.auth_time,
            exp: payload.auth_time + 3600,
            firebase: {
              identities: {
                'google.com': [payload.sub],
              },
              sign_in_provider: 'google.com',
            },
          } as unknown as admin.auth.DecodedIdToken;
        }
      } catch (decodeErr) {
        console.error("Mock token decode failed:", decodeErr);
      }
      return null;
    }

    if (!admin.apps.length) {
      console.warn("Firebase Admin not initialized, using direct token simulation.");
      // In local development, if Firebase fails to initialize due to certificate issues, we will allow token parsing or a dev mock.
      // But we will try to call the real admin SDK first.
      return null;
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("verifyGoogleToken error:", error);
    // If it fails (like expired/invalid), we return null
    return null;
  }
}

export { admin };
