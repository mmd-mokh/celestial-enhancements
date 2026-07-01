import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Pkg = {
  slug: string;
  name: string;
  description: string | null;
  duration_hours: number | null;
  price: number | null;
  features: string[] | null;
  badge: string | null;
  popular: boolean | null;
  sort_order: number | null;
};

type Props = {
  onReserve: (slug: string) => void;
};

const ICONS = ["bi-joystick", "bi-trophy-fill", "bi-clock-history", "bi-calendar-week"];

function toFa(n: number): string {
  return n.toLocaleString("fa-IR");
}

/**
 * Hydrates the `.pricing-grid` container in the ported HTML with DB-backed
 * cards. Falls back silently if the container isn't mounted yet.
 */
export function PricingCards({ onReserve }: Props) {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState<Pkg[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const find = () => {
      const el = document.querySelector<HTMLElement>(".pricing-grid");
      if (el) {
        // Clear the static HTML cards so the React grid replaces them.
        el.innerHTML = "";
        setMount(el);
        return;
      }
      if (tries++ < 20) setTimeout(find, 100);
    };
    find();

    (async () => {
      const { data } = await supabase
        .from("packages")
        .select("slug,name,description,duration_hours,price,features,badge,popular,sort_order")
        .eq("active", true)
        .order("sort_order");
      if (!cancelled && data) setItems(data as Pkg[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!mount || !items) return null;

  return createPortal(
    <>
      {items.map((p, i) => {
        const icon = ICONS[i % ICONS.length];
        const featured = !!p.popular;
        return (
          <motion.div
            key={p.slug}
            data-package={p.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={cn(
              "pricing-card-enhanced tw-flex tw-flex-col tw-place-items-center tw-gap-4 tw-rounded-xl tw-p-4 md:tw-p-6 lg:tw-p-8 tw-bg-white",
              featured
                ? "pricing-card-featured tw-shadow-2xl tw-bg-gradient-to-br tw-from-primary-50 tw-to-white tw-border-[3px] tw-border-primary tw-relative lg:tw-scale-105"
                : "tw-shadow-lg",
            )}
          >
            {featured && (
              <>
                <span className="pricing-card-accent-stripe" aria-hidden="true" />
                <span className="pricing-card-featured-glow" aria-hidden="true" />
              </>
            )}
            <i className={`bi ${icon} tw-text-primary tw-text-5xl icon-standard`} />
            <h4 className="tw-text-2xl tw-font-bold tw-text-gray-800">{p.name}</h4>
            {p.description && (
              <p className="tw-text-center tw-text-gray-700 tw-text-sm">{p.description}</p>
            )}
            <div className="tw-text-center tw-my-2">
              <div
                className={cn(
                  "tw-font-bold tw-text-primary",
                  featured ? "pricing-featured-price tw-text-6xl" : "tw-text-5xl",
                )}
              >
                {p.price != null ? toFa(p.price) : "-"}
              </div>
              <div className="tw-text-gray-700 tw-text-base tw-mt-1">
                تومان{p.duration_hours ? ` / ${toFa(p.duration_hours)} ساعت` : ""}
              </div>
              {p.badge && (
                <div className="tw-inline-block tw-text-xs tw-text-white tw-bg-green-600 tw-px-3 tw-py-1 tw-rounded-full tw-font-semibold tw-mt-3">
                  {p.badge}
                </div>
              )}
            </div>
            <hr className="tw-w-full tw-border-gray-200" />
            <ul className="tw-flex tw-flex-col tw-gap-3 tw-text-right tw-w-full tw-text-sm">
              {(p.features ?? []).map((f, k) => (
                <li key={k} className="tw-flex tw-items-start tw-gap-2">
                  <i className="bi bi-check-circle-fill tw-text-primary tw-mt-1 tw-text-base" />
                  <span className="tw-text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onReserve(p.slug)}
              className="btn btn-enhanced tw-mt-4 !tw-w-full"
            >
              رزرو کن
            </button>
          </motion.div>
        );
      })}
    </>,
    mount,
  );
}