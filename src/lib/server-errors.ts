/**
 * Wrap a raw error from a Supabase client (or any thrown value) into a
 * loggable, boundary-friendly `Error` that keeps enough context for Server
 * Logs while never leaking DB internals to the client.
 *
 * `console.error(rawError)` first preserves stack + original code/details in
 * Server Logs; the thrown wrapper is what reaches the route errorComponent.
 */
export function throwLogged(
  op: string,
  rawError: unknown,
  publicMessage = "Request failed. Please try again.",
): never {
  console.error(`[server-fn:${op}]`, rawError);
  throw new Error(publicMessage);
}

export function isLocalBackendUnavailableError(rawError: unknown) {
  const code =
    rawError && typeof rawError === "object" && "code" in rawError
      ? String((rawError as { code?: unknown }).code)
      : "";
  const message =
    rawError instanceof Error
      ? rawError.message
      : rawError && typeof rawError === "object" && "message" in rawError
        ? String((rawError as { message?: unknown }).message)
        : String(rawError ?? "");

  return (
    code === "PGRST202" ||
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find the table") ||
    message.includes("Could not find the function") ||
    message.includes("Missing public backend environment variables")
  );
}

export function warnLocalFallback(op: string, rawError: unknown) {
  console.warn(`[server-fn:${op}] Local backend data unavailable; using fallback data.`, rawError);
}