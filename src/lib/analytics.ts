/**
 * Small GA4 helper. No-op when gtag isn't loaded (env not set, SSR, or
 * blocked by an ad-blocker), so call sites don't need to guard.
 */
type GtagFn = (...args: unknown[]) => void;

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: GtagFn };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", name, params);
}