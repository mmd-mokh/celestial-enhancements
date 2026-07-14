import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "./constants";

export function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="relative mt-5 flex items-center justify-between" aria-label="مراحل رزرو">
      <div className="absolute inset-x-4 top-4 z-0 h-0.5 rounded-full bg-border" aria-hidden="true" />
      <div
        className="absolute right-4 top-4 z-0 h-0.5 rounded-full bg-primary transition-all duration-500"
        style={{ width: `calc((100% - 2rem) * ${step / (STEPS.length - 1)})` }}
        aria-hidden="true"
      />
      {STEPS.map(({ label, Icon }, index) => {
        const active = index === step;
        const done = index < step;
        return (
          <li key={label} className="relative z-10 flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold transition-all",
                done && "border-primary bg-primary text-primary-foreground",
                active &&
                  "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-110",
                !active && !done && "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Icon className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span
              className={cn(
                "text-[11px] font-medium transition-colors",
                active || done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}