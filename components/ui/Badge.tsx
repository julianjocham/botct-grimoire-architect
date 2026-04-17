import { cn } from "@/lib/cn";

type BadgeVariant = "filled" | "outlined";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const base = "inline-flex items-center rounded-[3px] px-1.5 py-0.5 font-mono text-2xs";

const variants: Record<BadgeVariant, string> = {
  filled: "bg-blood text-parchment",
  outlined: "border border-jinx bg-jinx-bg-strong text-gold"
};

export function Badge({ variant = "outlined", className, children }: BadgeProps) {
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
