import { useEffect, useRef, useState } from "react";

/**
 * Lightweight IntersectionObserver-based reveal hook.
 * Sets `revealed=true` once the element scrolls into view (default 20%),
 * replacing framer-motion's `whileInView` for the site's simple fade-in-up.
 *
 * Correctness first: the element is revealed on mount (via rAF) so content
 * is NEVER left stuck at `opacity: 0` if the observer fails to fire (older
 * engines, SSR/hydration edge cases, headless contexts). The observer is kept
 * only as a progressive enhancement for the staggered scroll-in animation.
 */
export function useReveal<T extends HTMLElement>(amount = 0.2) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Reveal immediately (next frame) so the CSS transition still plays and
    // the element can never remain invisible.
    const raf = requestAnimationFrame(() => setRevealed(true));

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return () => cancelAnimationFrame(raf);

    // If already in view at mount, the rAF above handles it.
    // Otherwise observe so the reveal can be deferred until scrolled in.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: amount, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [amount]);

  return { ref, revealed };
}
