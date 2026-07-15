import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronLeft, Gamepad2, Zap, Tag, HelpCircle, type LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; Icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "#consoles", label: "کنسول‌ها", Icon: Gamepad2 },
  { href: "#how-it-works", label: "چطور کار می‌کنه؟", Icon: Zap },
  { href: "#pricing", label: "قیمت‌ها", Icon: Tag },
  { href: "#faq", label: "سوالات متداول", Icon: HelpCircle },
];

/**
 * shadcn-based site header. Preserves the ported CSS classes so the visual
 * design (frosted glass, sticky, RTL nav) stays identical, but replaces the
 * imperative drawer + focus-trap JS with a shadcn Sheet.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 80);
        // scroll-spy
        const y = window.scrollY + 120;
        const secs = document.querySelectorAll<HTMLElement>("main section[id]");
        let cur = "";
        secs.forEach((s) => {
          if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) cur = s.id;
        });
        setActiveId(cur);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn("site-header", scrolled && "is-scrolled")}
      role="banner"
      data-site-header
    >
      <div className="header-gradient" aria-hidden="true" />
      <div className="site-header__inner">
        <Link to="/" className="nav-logo" aria-label="کنسولتو - صفحه اصلی">
          <img
            src="/assets/logo/logo1.png"
            alt=""
            className="nav-logo__img logo-shrink"
            width={44}
            height={44}
          />
        </Link>

        <nav id="primary-navigation" className="primary-nav" aria-label="منوی اصلی">
          <ul className="primary-nav__list" role="list">
            {NAV.map((item) => {
              const active = "#" + activeId === item.href;
              return (
                <li key={item.href} className="primary-nav__item">
                  <a
                    href={item.href}
                    className={cn("primary-nav__link header-links", active && "is-active")}
                    aria-current={active ? "location" : undefined}
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-center">
          <ThemeToggle />
        </div>

        <a
          href="#pricing"
          aria-label="رزرو کنسول"
          className="btn btn-enhanced nav-cta"
          onClick={() => {
            void import("@/lib/analytics").then((m) =>
              m.trackEvent("cta_click", { location: "header" }),
            );
          }}
        >
          <span>همین الان رزرو کن</span>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </a>

        <div className="nav-actions">
          <button
            type="button"
            className="nav-hamburger"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-4 top-full z-50 mt-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-elegant)] lg:hidden"
          dir="rtl"
        >
          <nav aria-label="منوی موبایل">
            <ul className="flex flex-col gap-1" role="list">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted focus-visible:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    <item.Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="#pricing"
            className="btn-premium mt-4 flex min-h-12 w-full items-center justify-center gap-2"
            onClick={() => {
              setOpen(false);
              void import("@/lib/analytics").then((m) =>
                m.trackEvent("cta_click", { location: "header_mobile" }),
              );
            }}
          >
            <span>همین الان رزرو کن</span>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </header>
  );
}