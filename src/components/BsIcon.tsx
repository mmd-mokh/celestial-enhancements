import {
  Star,
  Tag,
  Truck,
  ShieldCheck,
  Headset,
  CheckCircle2,
  Gamepad,
  Gamepad2,
  Quote,
  Users,
  Trophy,
  History,
  CalendarDays,
  PiggyBank,
  Shuffle,
  type LucideIcon,
} from "lucide-react";

/**
 * Drop-in replacement for `<i className="bi bi-...">` glyphs.
 * Maps bootstrap-icons class names to Lucide icons so we can drop the
 * bootstrap-icons CSS bundle from the critical path.
 */
const MAP: Record<string, { Icon: LucideIcon; fill?: boolean }> = {
  "bi-star-fill": { Icon: Star, fill: true },
  "bi-tag-fill": { Icon: Tag, fill: true },
  "bi-truck": { Icon: Truck },
  "bi-shield-check": { Icon: ShieldCheck },
  "bi-headset": { Icon: Headset },
  "bi-check-circle-fill": { Icon: CheckCircle2, fill: false },
  "bi-controller": { Icon: Gamepad2 },
  "bi-joystick": { Icon: Gamepad },
  "bi-chat-quote-fill": { Icon: Quote, fill: true },
  "bi-people-fill": { Icon: Users, fill: true },
  "bi-trophy-fill": { Icon: Trophy, fill: true },
  "bi-clock-history": { Icon: History },
  "bi-calendar-week": { Icon: CalendarDays },
  "bi-piggy-bank-fill": { Icon: PiggyBank, fill: true },
  "bi-shuffle": { Icon: Shuffle },
};

type Props = {
  name: string;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
};

export function BsIcon({ name, className, size = 20, ...rest }: Props) {
  const entry = MAP[name] ?? { Icon: CheckCircle2 };
  const { Icon, fill } = entry;
  return (
    <Icon
      className={className}
      width={size}
      height={size}
      strokeWidth={2}
      {...(fill ? { fill: "currentColor" } : {})}
      {...rest}
    />
  );
}