import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";

type Console = {
  slug: string;
  name: string;
  tagline: string | null;
  features: string[] | null;
  icon: string | null;
  accent_from: string | null;
  accent_to: string | null;
  sort_order: number | null;
};

/**
 * Hydrates the consoles grid in the ported HTML (identified by
 * aria-label="کنسول‌های موجود") with DB-backed cards.
 */
export function ConsoleCards() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState<Console[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const find = () => {
      const el = document.querySelector<HTMLElement>(
        'div[aria-label="کنسول‌های موجود"]',
      );
      if (el) {
        el.innerHTML = "";
        setMount(el);
        return;
      }
      if (tries++ < 20) setTimeout(find, 100);
    };
    find();

    (async () => {
      const { data } = await supabase
        .from("consoles")
        .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
        .eq("active", true)
        .order("sort_order");
      if (!cancelled && data) setItems(data as Console[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!mount || !items) return null;

  return createPortal(
    <>
      {items.map((c) => (
        <article
          key={c.slug}
          className="console-card"
          role="listitem"
          data-console={c.slug}
          style={
            {
              ["--console-accent-from" as never]: c.accent_from ?? "#0070d1",
              ["--console-accent-to" as never]: c.accent_to ?? "#00b4d8",
            } as React.CSSProperties
          }
        >
          <div className="console-card-icon" aria-hidden="true">
            <i className={`bi ${c.icon ?? "bi-joystick"}`} />
          </div>
          <h3 className="console-card-title">{c.name}</h3>
          {c.tagline && <p className="console-card-tagline">{c.tagline}</p>}
          <ul
            className="console-card-features"
            aria-label={`ویژگی‌های ${c.name}`}
          >
            {(c.features ?? []).map((f, i) => (
              <li key={i} className="console-card-feature">
                <i className="bi bi-check-circle-fill" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </>,
    mount,
  );
}