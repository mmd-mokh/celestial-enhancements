import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export function AccountChip() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const to = email ? "/my-bookings" : "/auth";
  const label = email ? "رزروهای من" : "ورود / ثبت‌نام";

  return (
    <Link
      to={to}
      dir="rtl"
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.9)",
        color: "white",
        padding: "8px 14px",
        borderRadius: "9999px",
        fontSize: "13px",
        fontFamily: "Vazirmatn, sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backdropFilter: "blur(8px)",
      }}
    >
      <i className="bi bi-person-circle" style={{ fontSize: "16px" }} />
      <span>{label}</span>
    </Link>
  );
}