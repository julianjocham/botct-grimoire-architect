import { cn } from "@/lib/cn";

type LabelColor = "gold" | "muted" | "amber" | "blood" | "dim";

const colorMap: Record<LabelColor, string> = {
  gold: "text-gold",
  muted: "text-muted",
  amber: "text-amber",
  blood: "text-blood-light",
  dim: "text-dim"
};

interface SectionLabelProps {
  color?: LabelColor;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SectionLabel({ color = "gold", mono = false, className, children }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "text-2xs tracking-[0.08em] uppercase",
        mono ? "font-mono" : "font-display",
        colorMap[color],
        className
      )}
    >
      {children}
    </div>
  );
}
