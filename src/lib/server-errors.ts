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