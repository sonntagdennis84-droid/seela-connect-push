import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = new URL("../data/", import.meta.url);
const stateFile = new URL("../data/state.json", import.meta.url);
const tokenFile = new URL("../data/tokens.json", import.meta.url);

export async function readState() {
  return readJson(stateFile, {});
}

export async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
}

export async function readTokens() {
  return readJson(tokenFile, []);
}

export async function addToken(token) {
  await ensureDataDir();
  const tokens = await readTokens();
  if (!tokens.includes(token)) tokens.push(token);
  await fs.writeFile(tokenFile, JSON.stringify(tokens, null, 2));
  return tokens.length;
}

async function readJson(fileUrl, fallback) {
  try {
    return JSON.parse(await fs.readFile(fileUrl, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function ensureDataDir() {
  await fs.mkdir(path.resolve(fileURLToPath(dataDir)), { recursive: true });
}
