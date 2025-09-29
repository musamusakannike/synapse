const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  // Uses local service account JSON. Ensure this file exists and is secured.
  const serviceAccount = process.env.SERVICE_ACCOUNT_KEY && JSON.parse(process.env.SERVICE_ACCOUNT_KEY)

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
