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
    return parseJson(config.firebaseServiceAccountJson, "FIREBASE_SERVICE_ACCOUNT_JSON");
  }

  if (config.firebaseServiceAccountBase64) {
    const json = Buffer.from(config.firebaseServiceAccountBase64, "base64").toString("utf8");
    return parseJson(json, "FIREBASE_SERVICE_ACCOUNT_BASE64");
  }

  if (!fs.existsSync(config.firebaseServiceAccount)) return null;
  return parseJson(fs.readFileSync(config.firebaseServiceAccount, "utf8"), config.firebaseServiceAccount);
}

export function checkPushConfig() {
  const serviceAccount = readServiceAccount();
  return {
    ok: !!serviceAccount?.project_id && !!serviceAccount?.client_email && !!serviceAccount?.private_key,
    projectId: serviceAccount?.project_id || null,
    hasClientEmail: !!serviceAccount?.client_email,
    hasPrivateKey: !!serviceAccount?.private_key
  };
}

function parseJson(value, source) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Firebase service account could not be parsed from ${source}. Please paste the complete value again.`);
  }
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
