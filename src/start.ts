import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Attach baseline security headers on every SSR response.
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const res = await next();
  if (res instanceof Response) {
    const h = res.headers;
    if (!h.has("X-Content-Type-Options")) h.set("X-Content-Type-Options", "nosniff");
    if (!h.has("Referrer-Policy")) h.set("Referrer-Policy", "strict-origin-when-cross-origin");
    if (!h.has("Permissions-Policy"))
      h.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      );
    if (!h.has("X-Frame-Options")) h.set("X-Frame-Options", "SAMEORIGIN");
  }
  return res;
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, securityHeadersMiddleware],
}));
