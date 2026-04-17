import { cn } from "@/lib/cn";
import { SectionLabel } from "./SectionLabel";

interface PanelProps {
  title?: string;
  titleColor?: "gold" | "muted";
  className?: string;
  children: React.ReactNode;
}

export function Panel({ title, titleColor = "gold", className, children }: PanelProps) {
  return (
    <div className={cn("bg-surface border-subtle rounded-[10px] border px-3 py-3 sm:px-4 sm:py-3.5", className)}>
      {title && (
        <SectionLabel color={titleColor} className="mb-3">
          {title}
        </SectionLabel>
      )}
      {children}
    </div>
  );
}
