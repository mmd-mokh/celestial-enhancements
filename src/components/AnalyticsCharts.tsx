import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

type Booking = {
  id: string; console_type: string | null; package_type: string | null;
  status: string; created_at: string;
};

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export function AnalyticsCharts({ rows }: { rows: Booking[] }) {
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      if (map.has(day)) map.set(day, (map.get(day) ?? 0) + 1);
    }
    return Array.from(map, ([date, count]) => ({ date: date.slice(5), count }));
  }, [rows]);

  const byConsole = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.console_type ?? "—";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [rows]);

  const byPackage = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = r.package_type ?? "—";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader className="pb-2"><CardTitle className="text-sm">رزروها در ۳۰ روز اخیر</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">تفکیک بر اساس کنسول</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byConsole} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {byConsole.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader className="pb-2"><CardTitle className="text-sm">پکیج‌های محبوب</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPackage} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}