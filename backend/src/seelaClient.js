import * as cheerio from "cheerio";
import { CookieJar } from "./cookieJar.js";
import { config } from "./config.js";

export class SeelaClient {
  constructor() {
    this.baseUrl = config.seelaBaseUrl.replace(/\/$/, "");
    this.jar = new CookieJar();
  }

  async login() {
    await this.#request("/login.php");

    const body = new URLSearchParams({
      btnSubmit: "Login",
      username: config.seelaUsername,
      password: config.seelaPassword
    });

    const response = await this.#request("/login.php?page=login", {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });

    const redirectLocation = response.headers.get("location");
    const finalResponse = redirectLocation ? await this.#request(redirectLocation) : response;
    const html = await finalResponse.text();
    const text = extractText(html);
    if (text.includes("Ungültiges Login") || !text.includes("Sonntag")) {
      throw new Error("Seela login failed. Please check username/password.");
    }
    return { ok: true };
  }

  async fetchPage(path) {
    const response = await this.#request(path);
    if (!response.ok) {
      throw new Error(`Seela request failed for ${path}: HTTP ${response.status}`);
    }
    return response.text();
  }

  async #request(path, options = {}) {
    const response = await fetch(new URL(path, this.baseUrl), {
      redirect: "follow",
      ...options,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "SeelaConnectPushMonitor/0.1",
        cookie: this.jar.header(),
        ...(options.headers || {})
      }
    });
    this.jar.addFromHeaders(response.headers);
    return response;
  }
}

export function extractText(html) {
  const $ = cheerio.load(html);
  $("script,style,noscript").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

export function extractTitle(html) {
  const $ = cheerio.load(html);
  return $("title").first().text().trim();
}
