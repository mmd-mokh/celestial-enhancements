import { useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { reportLovableError } from "@/lib/lovable-error-reporting";

/**
 * Shared branded error boundary UI used by route errorComponents and the
 * router's defaultErrorComponent. Retries by invalidating the loader AND
 * resetting the boundary — `reset()` alone clears the UI without re-running.
 */
export function RouteErrorFallback({
  error,
  reset,
  boundary = "route_error_component",
}: {
  error: Error;
  reset: () => void;
  boundary?: string;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary });
  }, [error, boundary]);

  return (
    <div
      dir="rtl"
      className="flex min-h-dvh items-center justify-center bg-background px-4"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">این صفحه بارگذاری نشد</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          لطفاً دوباره تلاش کنید یا به صفحه اصلی برگردید.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            تلاش مجدد
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Shared branded not-found UI used by router defaultNotFoundComponent. */
export function RouteNotFoundFallback() {
  return (
    <div
      dir="rtl"
      className="flex min-h-dvh items-center justify-center bg-background px-4"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-foreground">۴۰۴</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">صفحه پیدا نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          آدرسی که وارد کردی وجود ندارد یا جابه‌جا شده است.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}