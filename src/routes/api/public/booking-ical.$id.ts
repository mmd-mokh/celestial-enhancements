import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const CONSOLE_LABEL: Record<string, string> = {
  ps5: "PlayStation 5",
  xbox: "Xbox Series X",
  switch: "Nintendo Switch",
};

function fmtDate(d: string) {
  return d.replace(/-/g, "");
}
function esc(s: string) {
  return s.replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

export const Route = createFileRoute("/api/public/booking-ical/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_RE.test(params.id)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("bookings")
          .select("id, name, console_type, package_type, start_date, end_date, notes, status")
          .eq("id", params.id)
          .maybeSingle();
        if (error || !data) return new Response("Not found", { status: 404 });
        if (!data.start_date || !data.end_date) return new Response("No dates", { status: 400 });

        const console = CONSOLE_LABEL[data.console_type ?? ""] ?? data.console_type ?? "";
        const end = new Date(data.end_date);
        end.setDate(end.getDate() + 1); // DTEND is exclusive for all-day events
        const dtend = end.toISOString().slice(0, 10).replace(/-/g, "");
        const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        const ics = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Gamio//Booking//FA",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "BEGIN:VEVENT",
          `UID:${data.id}@gamio`,
          `DTSTAMP:${now}`,
          `DTSTART;VALUE=DATE:${fmtDate(data.start_date)}`,
          `DTEND;VALUE=DATE:${dtend}`,
          `SUMMARY:${esc(`رزرو گیمیو - ${console}`)}`,
          `DESCRIPTION:${esc(`پکیج: ${data.package_type ?? "-"}\nوضعیت: ${data.status}\n${data.notes ?? ""}`)}`,
          `STATUS:${data.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
          "END:VEVENT",
          "END:VCALENDAR",
        ].join("\r\n");

        return new Response(ics, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="gamio-booking-${data.id.slice(0, 8)}.ics"`,
          },
        });
      },
    },
  },
});