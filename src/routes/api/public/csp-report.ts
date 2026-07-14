import { createFileRoute } from "@tanstack/react-router";

// Best-effort rate limit: single-worker in-memory bucket. Prevents log spam
// from a broken CSP without needing a durable store.
const bucket = { count: 0, resetAt: 0 };
const LIMIT = 60; // reports per window
const WINDOW_MS = 60 * 1000;

function throttled(): boolean {
  const now = Date.now();
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }
  bucket.count += 1;
  return bucket.count > LIMIT;
}

export const Route = createFileRoute("/api/public/csp-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (throttled()) return new Response(null, { status: 204 });
        try {
          const raw = await request.text();
          // Truncate to avoid unbounded logs from malformed payloads.
          const payload = raw.slice(0, 4096);
          console.warn("[csp-report]", payload);
        } catch {
          // ignore malformed reports
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});