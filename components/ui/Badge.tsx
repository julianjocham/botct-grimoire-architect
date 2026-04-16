import { cn } from "@/lib/cn";

type BadgeVariant = "filled" | "outlined";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const base = "inline-flex items-center rounded-[3px] px-[5px] py-[2px] font-mono text-2xs";

const variants: Record<BadgeVariant, string> = {
  filled: "bg-blood text-parchment",
  outlined: "border border-[#7a6200] bg-[#2a1f00] text-gold"
};

export function Badge({ variant = "outlined", className, children }: BadgeProps) {
  return <span className={cn(base, variants[variant], className)}>{children}</span>;
}
