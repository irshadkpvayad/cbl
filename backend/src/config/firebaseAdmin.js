import admin from "firebase-admin";
import fs from "node:fs";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : null;
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountFile = serviceAccountPath && fs.existsSync(serviceAccountPath) ? JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")) : null;

const credential = serviceAccountJson
  ? admin.credential.cert(serviceAccountJson)
  : serviceAccountFile
    ? admin.credential.cert(serviceAccountFile)
    : process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey
      ? admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey
        })
      : admin.credential.applicationDefault();

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    ...(process.env.FIREBASE_STORAGE_BUCKET ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET } : {})
  });
}

export const firebaseAdmin = admin;
export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = process.env.FIREBASE_STORAGE_BUCKET ? admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET) : null;
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
