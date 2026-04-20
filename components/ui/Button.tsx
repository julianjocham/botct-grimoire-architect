import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "action" | "ghost" | "chip";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "cursor-pointer border-none font-display tracking-[0.05em] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-townsfolk/70 text-white rounded-lg disabled:cursor-default",
  action: "bg-blood text-parchment rounded-lg disabled:bg-panel-dark disabled:text-muted disabled:cursor-default",
  ghost:
    "border border-faint bg-transparent text-muted rounded-md font-body tracking-normal hover:border-parchment-muted/35 hover:bg-elevated/40 hover:text-parchment-muted",
  chip: "bg-subtle text-gold-light rounded border-none"
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm sm:px-5"
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
