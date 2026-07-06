import express from "express";
import cron from "node-cron";
import { checkSeela } from "./checker.js";
import { config, requireConfig } from "./config.js";
import { sendPush } from "./push.js";
import { addToken, readState, readTokens } from "./store.js";

requireConfig();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "seela-connect-push-backend"
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/state", async (req, res, next) => {
  try {
    res.json(await readState());
  } catch (error) {
    next(error);
  }
});

app.post("/devices", async (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!token) return res.status(400).json({ error: "Missing token" });
  const count = await addToken(token);
  res.json({ ok: true, registeredDevices: count });
});

app.post("/check-now", async (req, res, next) => {
  try {
    res.json(await checkSeela());
  } catch (error) {
    next(error);
  }
});

app.post("/push-test", async (req, res, next) => {
  try {
    const result = await sendPush({
      title: "Seela Connect Test",
      body: "Push-Mitteilungen sind eingerichtet.",
      data: { type: "test" }
    });
    res.json({ ok: true, result });
  } catch (error) {
    next(error);
  }
});

app.get("/devices/count", async (req, res, next) => {
  try {
    res.json({ count: (await readTokens()).length });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

cron.schedule(config.checkCron, async () => {
  try {
    const result = await checkSeela();
    console.log("Seela check complete", result);
  } catch (error) {
    console.error("Seela check failed", error);
  }
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Seela push backend listening on port ${config.port}`);
});
