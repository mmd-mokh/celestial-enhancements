import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function OptionButton({
  children,
  onClick,
  selected,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-4 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
        selected
          ? "border-primary !bg-primary !text-primary-foreground shadow-lg shadow-primary/40 ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] [&_.text-muted-foreground]:text-primary-foreground/80"
          : "border-border bg-card text-card-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent hover:shadow-sm",
      )}
    >
      {selected && <span className="sr-only">انتخاب شد</span>}
      {selected && (
        <span
          className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-primary-foreground text-primary shadow"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      )}
      {children}
    </button>
  );
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-left font-medium text-foreground">{value}</dd>
    </div>
  );
}