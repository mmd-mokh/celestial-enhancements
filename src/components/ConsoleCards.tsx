import { motion } from "framer-motion";
import { BsIcon } from "@/components/BsIcon";

export type ConsoleRow = {
  slug: string;
  name: string;
  tagline: string | null;
  features: string[] | null;
  icon: string | null;
  accent_from: string | null;
  accent_to: string | null;
  sort_order: number | null;
};

/** Standalone renderer for console cards. Used by /consoles and landing. */
export function ConsoleList({ items }: { items: ConsoleRow[] }) {
  return (
    <>
      {items.map((c, i) => (
        <motion.article
          key={c.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
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
            <BsIcon name={c.icon ?? "bi-joystick"} size={40} />
          </div>
          <h3 className="console-card-title">{c.name}</h3>
          {c.tagline && <p className="console-card-tagline">{c.tagline}</p>}
          <ul className="console-card-features" aria-label={`ویژگی‌های ${c.name}`}>
            {(c.features ?? []).map((f, i) => (
              <li key={i} className="console-card-feature">
                <BsIcon name="bi-check-circle-fill" size={16} aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </motion.article>
      ))}
    </>
  );
}