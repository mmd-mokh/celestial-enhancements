import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SITE_URL, absUrl } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light dark" },
      { name: "theme-color", content: "#0f172a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "گیمیو" },
      {
        title: "گیمیو | اجاره کنسول PS5، Xbox و Nintendo Switch در تهران",
      },
      {
        name: "description",
        content:
          "اجاره کنسول PS5، Xbox Series X و Nintendo Switch در تهران با تحویل درب منزل، پکیج روزانه تا ماهانه و رزرو آنلاین در ۳ دقیقه.",
      },
      {
        name: "keywords",
        content:
          "اجاره کنسول بازی، اجاره PS5، اجاره پلی استیشن ۵، کرایه Xbox، اجاره Xbox Series X، اجاره نینتندو سوییچ، کرایه کنسول بازی تهران، اجاره کنسول برای مهمانی، اجاره تجهیزات گیمینگ، گیمیو",
      },
      {
        property: "og:title",
        content: "گیمیو - اجاره کنسول بازی PS5 و Xbox در تهران",
      },
      {
        property: "og:description",
        content:
          "تجربه کنسول‌های نسل جدید بدون پرداخت میلیون‌ها تومان. اجاره روزانه، هفتگی، و ماهانه با تحویل درب منزل.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fa_IR" },
      { property: "og:site_name", content: "گیمیو" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "گیمیو - اجاره کنسول بازی" },
      {
        name: "twitter:description",
        content: "PS5، Xbox، Switch - اجاره کن، تجربه کن، لذت ببر!",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/assets/logo/logo1.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/assets/logo/logo1.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "stylesheet", href: "/css/index.css" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "گیمیو",
          alternateName: "Gamio",
          url: SITE_URL,
          logo: absUrl("/assets/logo/logo1.png"),
          description:
            "اجاره کنسول بازی PS5، Xbox Series X و Nintendo Switch در تهران با تحویل درب منزل.",
          areaServed: "IR",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              availableLanguage: ["Persian", "Farsi"],
              areaServed: "IR",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "گیمیو",
          image: absUrl("/assets/logo/logo1.png"),
          url: SITE_URL,
          priceRange: "$$",
          description:
            "اجاره کنسول بازی PS5، Xbox Series X و Nintendo Switch با تحویل درب منزل در تهران.",
          address: {
            "@type": "PostalAddress",
            addressCountry: "IR",
            addressLocality: "Tehran",
          },
          areaServed: { "@type": "City", name: "Tehran" },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Saturday",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "00:00",
              closes: "23:59",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "گیمیو",
          url: SITE_URL,
          inLanguage: "fa-IR",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/consoles?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('gamio-theme');if(s==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
