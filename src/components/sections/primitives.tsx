import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";

/**
 * Common outer <section> shell used by every landing section.
 * Handles horizontal padding, vertical rhythm, max-width wrapper, and background.
 */
type SectionShellProps = {
  id?: string;
  ariaLabelledBy?: string;
  bg?: "white" | "gray";
  className?: string;
  innerClassName?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "id" | "className" | "children">;

export function SectionShell({
  id,
  ariaLabelledBy,
  bg = "white",
  className,
  innerClassName,
  children,
  ...rest
}: SectionShellProps) {
  return (
    <section
      role="region"
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "relative flex w-full flex-col place-content-center place-items-center px-6 py-16 md:px-12 lg:px-20",
        bg === "gray" ? "bg-gray-50" : "bg-white",
        className,
      )}
      {...rest}
    >
      <div className={cn("max-w-7xl mx-auto w-full", innerClassName)}>{children}</div>
    </section>
  );
}

/** Standard eyebrow + h2 heading block used across sections. */
type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  titleId?: string;
  description?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3 text-center", className)}>
      {eyebrow && <h3 className="text-xl text-primary font-semibold">{eyebrow}</h3>}
      <h2 id={titleId} className="text-2xl md:text-4xl font-bold">
        {title}
      </h2>
      {description && (
        <p className="text-gray-700 mt-4 max-w-[700px] mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Fade-in-up reveal wrapper used by section grid cards.
 * CSS-transition + IntersectionObserver replacement for framer-motion.
 */
type FadeInUpProps = {
  index?: number;
  step?: number;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "children">;

export function FadeInUp({
  index = 0,
  step = 0.08,
  className,
  children,
  style,
  ...rest
}: FadeInUpProps) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal-up", revealed && "is-visible", className)}
      style={{ transitionDelay: `${index * step}s`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}