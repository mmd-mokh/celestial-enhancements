import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Sun, Moon, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: string };

const NAV: NavItem[] = [
  { href: "#consoles", label: "کنسول‌ها", icon: "bi-controller" },
  { href: "#how-it-works", label: "چطور کار می‌کنه؟", icon: "bi-lightning-charge-fill" },
  { href: "#pricing", label: "قیمت‌ها", icon: "bi-tag-fill" },
  { href: "#faq", label: "سوالات متداول", icon: "bi-question-circle-fill" },
];

/**
 * shadcn-based site header. Preserves the ported CSS classes so the visual
 * design (frosted glass, sticky, RTL nav) stays identical, but replaces the
 * imperative drawer + focus-trap JS with a shadcn Sheet.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
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

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <header
      className={cn("site-header", scrolled && "is-scrolled")}
      role="banner"
      data-site-header
    >
      <div className="header-gradient" aria-hidden="true" />
      <div className="site-header__inner">
        <Link to="/" className="nav-logo" aria-label="گیمیو - صفحه اصلی">
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
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={dark ? "تغییر به تم روشن" : "تغییر به تم تاریک"}
            title="تغییر تم"
          >
            {dark ? <Sun className="tw-h-5 tw-w-5" /> : <Moon className="tw-h-5 tw-w-5" />}
          </button>
        </div>

        <a href="#pricing" aria-label="رزرو کنسول" className="btn btn-enhanced nav-cta">
          <span>همین الان رزرو کن</span>
          <ArrowLeft className="tw-h-4 tw-w-4" aria-hidden="true" />
        </a>

        <div className="nav-actions">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="nav-hamburger"
                aria-label="باز کردن منو"
                aria-expanded={open}
              >
                {open ? <X className="tw-h-6 tw-w-6" /> : <Menu className="tw-h-6 tw-w-6" />}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="tw-flex tw-flex-col tw-gap-6" dir="rtl">
              <SheetHeader className="tw-text-right">
                <SheetTitle className="tw-flex tw-items-center tw-gap-2">
                  <img
                    src="/assets/logo/logo1.png"
                    alt=""
                    className="tw-h-9 tw-w-9"
                  />
                  <span>گیمیو</span>
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="منوی موبایل">
                <ul className="tw-flex tw-flex-col tw-gap-1" role="list">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <SheetClose asChild>
                        <a
                          href={item.href}
                          className="tw-flex tw-items-center tw-gap-3 tw-rounded-md tw-px-3 tw-py-3 tw-text-base tw-font-semibold hover:tw-bg-muted"
                        >
                          <i className={`bi ${item.icon} tw-text-primary tw-text-lg`} aria-hidden="true" />
                          <span>{item.label}</span>
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="tw-mt-auto">
                <SheetClose asChild>
                  <a
                    href="#pricing"
                    className="btn btn-enhanced tw-flex tw-items-center tw-justify-center tw-gap-2 tw-w-full"
                  >
                    <span>همین الان رزرو کن</span>
                    <ArrowLeft className="tw-h-4 tw-w-4" />
                  </a>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}