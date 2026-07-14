import {
  Cpu,
  Gamepad,
  Gamepad2,
  Joystick,
  Rocket,
  Tv,
  CalendarDays,
  PackageCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { PACKAGES } from "@/components/PricingCards";

export type ConsoleOpt = { value: string; label: string; tagline: string };
export type ConsoleAvailability = { capacity: number; booked: number; remaining: number };
export type PackageOpt = { value: string; label: string; desc: string; hours: number };

export const FALLBACK_CONSOLES: ConsoleOpt[] = [
  { value: "ps5", label: "PlayStation 5", tagline: "نسل جدید سونی" },
  { value: "ps4", label: "PlayStation 4", tagline: "کلاسیک محبوب سونی" },
  { value: "xbox", label: "Xbox Series X", tagline: "قدرت مایکروسافت" },
  { value: "xbox-series-s", label: "Xbox Series S", tagline: "نسل جدید، فشرده" },
  { value: "xbox-one", label: "Xbox One", tagline: "انتخاب مقرون‌به‌صرفه" },
  { value: "switch", label: "Nintendo Switch", tagline: "بازی همه‌جا" },
];

export const PACKAGE_HOURS: Record<string, number> = {
  daily: 24,
  weekend: 72,
  weekly: 168,
  monthly: 720,
};

export const FALLBACK_PACKAGES: PackageOpt[] = PACKAGES.map((p) => ({
  value: p.slug,
  label: p.name,
  desc: p.description,
  hours: PACKAGE_HOURS[p.slug] ?? 24,
}));

export const CONSOLE_ICON: Record<string, LucideIcon> = {
  ps5: Rocket,
  ps4: Joystick,
  xbox: Gamepad2,
  "xbox-series-s": Cpu,
  "xbox-one": Gamepad,
  switch: Tv,
};

export const PACKAGE_BADGE: Record<string, string> = {
  monthly: "بهترین قیمت",
  weekend: "پرطرفدار",
};

export const STEPS = [
  { label: "کنسول", Icon: Gamepad2 },
  { label: "پکیج", Icon: PackageCheck },
  { label: "تاریخ", Icon: CalendarDays },
  { label: "تماس", Icon: UserRound },
] as const;