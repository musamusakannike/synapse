"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFirebase = void 0;
const app_1 = require("firebase-admin/app");
const initFirebase = () => {
    try {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (serviceAccountPath) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(serviceAccountPath),
            });
            console.log('Firebase Admin initialized successfully from service account file.');
        }
        else if (process.env.FIREBASE_PROJECT_ID) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin initialized successfully from environment variables.');
        }
        else {
            console.warn('Warning: Firebase configuration environment variables are missing. Firebase features may not function properly.');
        }
    }
    catch (error) {
        console.error('Firebase Admin initialization failed:', error);
    }
};
exports.initFirebase = initFirebase;
