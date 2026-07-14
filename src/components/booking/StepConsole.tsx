import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OptionButton } from "./OptionButton";
import {
  CONSOLE_ICON,
  type ConsoleAvailability,
  type ConsoleOpt,
} from "./constants";

export function StepConsole({
  consoles,
  value,
  remainingBySlug,
  onSelect,
}: {
  consoles: ConsoleOpt[];
  value: string;
  remainingBySlug: Record<string, ConsoleAvailability>;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {consoles.map((consoleItem) => {
        const Icon = CONSOLE_ICON[consoleItem.value] ?? Gamepad2;
        const selected = value === consoleItem.value;
        const avail = remainingBySlug[consoleItem.value];
        const soldOut = avail ? avail.remaining <= 0 : false;
        return (
          <OptionButton
            key={consoleItem.value}
            selected={selected}
            disabled={soldOut}
            onClick={() => onSelect(consoleItem.value)}
          >
            <span
              className={cn(
                "grid h-12 w-12 place-items-center rounded-full transition-colors",
                selected
                  ? "bg-primary-foreground text-primary ring-2 ring-primary-foreground/60"
                  : "bg-primary/10 text-primary",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="font-semibold">{consoleItem.label}</span>
            <span className="text-xs text-muted-foreground">{consoleItem.tagline}</span>
            {avail && (
              <span
                className={cn(
                  "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  soldOut
                    ? "bg-destructive/15 text-destructive"
                    : selected
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary/10 text-primary",
                )}
              >
                {soldOut ? "ناموجود" : "موجود"}
              </span>
            )}
          </OptionButton>
        );
      })}
    </div>
  );
}