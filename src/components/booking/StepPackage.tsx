import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/i18n";
import { OptionButton } from "./OptionButton";
import { PACKAGE_BADGE, type PackageOpt } from "./constants";

export function StepPackage({
  packages,
  value,
  onSelect,
}: {
  packages: PackageOpt[];
  value: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {packages.map((packageItem) => {
        const badge = PACKAGE_BADGE[packageItem.value];
        const days = Math.max(1, Math.ceil(packageItem.hours / 24));
        const selected = value === packageItem.value;
        return (
          <OptionButton
            key={packageItem.value}
            selected={selected}
            onClick={() => onSelect(packageItem.value)}
          >
            {badge && (
              <span
                className={cn(
                  "absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  selected ? "bg-primary-foreground text-primary" : "bg-primary/15 text-primary",
                )}
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {badge}
              </span>
            )}
            <span className="text-base font-semibold">{packageItem.label}</span>
            <span className="text-sm text-muted-foreground">{packageItem.desc}</span>
            <span className="text-[11px] text-muted-foreground/80">
              {toFaDigits(days)} روز
            </span>
          </OptionButton>
        );
      })}
    </div>
  );
}