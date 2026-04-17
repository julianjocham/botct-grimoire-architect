import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "action" | "ghost" | "chip";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base = "cursor-pointer border-none font-display tracking-[0.05em] transition-all duration-100";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-townsfolk/70 text-white rounded-lg disabled:cursor-default",
  action: "bg-blood text-parchment rounded-lg disabled:bg-[#1a1a1a] disabled:text-[#666] disabled:cursor-default",
  ghost: "border border-subtle bg-transparent text-muted rounded-md font-body tracking-normal hover:text-foreground",
  chip: "bg-subtle text-gold rounded border-none"
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-5 py-2 text-sm"
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
