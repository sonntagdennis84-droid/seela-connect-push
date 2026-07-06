import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8787),
  seelaBaseUrl: process.env.SEELA_BASE_URL || "https://www.seela-connect.de",
  seelaUsername: process.env.SEELA_USERNAME,
  seelaPassword: process.env.SEELA_PASSWORD,
  checkCron: process.env.CHECK_CRON || "*/5 * * * *",
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || "./firebase-service-account.json",
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  firebaseServiceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  sendBaselinePush: String(process.env.SEND_BASELINE_PUSH || "false").toLowerCase() === "true"
};

export function requireConfig() {
  const missing = [];
  if (!config.seelaUsername) missing.push("SEELA_USERNAME");
  if (!config.seelaPassword) missing.push("SEELA_PASSWORD");
  if (missing.length) {
    throw new Error(`Missing required environment values: ${missing.join(", ")}`);
  }
}
