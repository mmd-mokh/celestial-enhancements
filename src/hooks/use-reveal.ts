import { useEffect, useRef, useState } from "react";

/**
 * Lightweight IntersectionObserver-based reveal hook.
 * Sets `revealed=true` once the element scrolls into view (default 20%).
 * Replaces framer-motion's `whileInView` for the site's simple fade-in-up.
 */
export function useReveal<T extends HTMLElement>(amount = 0.2) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
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
      { threshold: amount },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [amount]);

  return { ref, revealed };
}