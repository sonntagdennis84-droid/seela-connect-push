import fs from "node:fs";
import admin from "firebase-admin";
import { config } from "./config.js";
import { readTokens } from "./store.js";

let initialized = false;

export function initPush() {
  if (initialized) return true;

  const serviceAccount = readServiceAccount();
  if (!serviceAccount) return false;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  initialized = true;
  return true;
}

function readServiceAccount() {
  if (config.firebaseServiceAccountJson) {
    return JSON.parse(config.firebaseServiceAccountJson);
  }

  if (config.firebaseServiceAccountBase64) {
    const json = Buffer.from(config.firebaseServiceAccountBase64, "base64").toString("utf8");
    return JSON.parse(json);
  }

  if (!fs.existsSync(config.firebaseServiceAccount)) return null;
  return JSON.parse(fs.readFileSync(config.firebaseServiceAccount, "utf8"));
}

export async function sendPush({ title, body, data = {} }) {
  if (!initPush()) {
    console.log("Firebase service account not found. Push skipped.");
    return { sent: 0, skipped: true };
  }

  const tokens = await readTokens();
  if (!tokens.length) return { sent: 0, skipped: true };

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]))
  });

  return {
    sent: response.successCount,
    failed: response.failureCount
  };
}
