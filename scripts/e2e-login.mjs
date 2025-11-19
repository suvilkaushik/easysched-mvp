import { chromium } from "playwright";
import fs from "fs";

(async () => {
  const results = {
    console: [],
    networkFailures: [],
    finalUrl: null,
    localStorage: {},
  };
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    results.console.push({ type: msg.type(), text: msg.text() });
  });

  page.on("requestfailed", (req) => {
    results.networkFailures.push({
      url: req.url(),
      failureText: req.failure()?.errorText,
    });
  });
  page.on("request", (r) => {
    results.console.push({ type: "request", url: r.url(), method: r.method() });
  });
  page.on("response", async (res) => {
    try {
      const ct = res.headers()["content-type"] || "";
      let body = null;
      if (ct.includes("application/json") || ct.includes("text")) {
        body = await res.text();
      }
      results.console.push({
        type: "response",
        url: res.url(),
        status: res.status(),
        body: body ? body.slice(0, 200) : null,
      });
    } catch (e) {
      results.console.push({
        type: "response",
        url: res.url(),
        status: res.status(),
        body: "error reading body",
      });
    }
  });

  try {
    await page.goto("http://localhost:3000/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Fill the sign-in form
    await page.fill("#email", "alice@example.com");
    await page.fill("#password", "AlicePass1!");

    // Submit the form — click the button
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    results.finalUrl = page.url();

    // Read localStorage
    const ls = await page.evaluate(() => {
      return {
        sessionId: localStorage.getItem("easysched:sessionId"),
        all: { ...localStorage },
      };
    });
    results.localStorage = ls;

    // Also attempt to fetch /api/auth/session in the page context (will include cookies)
    const sessionFetch = await page.evaluate(async () => {
      try {
        const r = await fetch("/api/auth/session", { credentials: "include" });
        const txt = await r.text();
        return { ok: r.ok, status: r.status, body: txt };
      } catch (err) {
        return { error: String(err) };
      }
    });
    results.sessionFetch = sessionFetch;
  } catch (err) {
    results.error = String(err);
  } finally {
    await browser.close();
    fs.writeFileSync(
      "/tmp/e2e-login-result.json",
      JSON.stringify(results, null, 2)
    );
    console.log("Wrote /tmp/e2e-login-result.json");
  }
})();
