export class CookieJar {
  #cookies = new Map();

  addFromHeaders(headers) {
    const setCookies = getSetCookieHeaders(headers);
    for (const header of setCookies) {
      const firstPart = header.split(";")[0];
      const separator = firstPart.indexOf("=");
      if (separator <= 0) continue;
      const name = firstPart.slice(0, separator).trim();
      const value = firstPart.slice(separator + 1).trim();
      this.#cookies.set(name, value);
    }
  }

  header() {
    return Array.from(this.#cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

function getSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const combined = headers.get("set-cookie");
  if (!combined) return [];
  return combined.split(/,(?=\s*[^;,\s]+=)/g);
}
