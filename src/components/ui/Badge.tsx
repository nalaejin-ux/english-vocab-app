import { cn } from "@/lib/utils";

interface BadgeProps {
  emoji: string;
  label: string;
  description?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  locked?: boolean;
  className?: string;
}

export function Badge({
  emoji, label, description, color = "bg-yellow-100 text-yellow-700",
  size = "md", locked = false, className,
}: BadgeProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1 rounded-2xl p-3 transition-all",
      locked ? "opacity-40 grayscale" : color,
      { "min-w-[60px]": size === "sm", "min-w-[80px]": size === "md", "min-w-[100px]": size === "lg" },
      className
    )}>
      <span className={cn({ "text-2xl": size === "sm", "text-3xl": size === "md", "text-4xl": size === "lg" })}>
        {locked ? "🔒" : emoji}
      </span>
      <span className={cn("font-semibold text-center leading-tight", {
        "text-xs": size === "sm", "text-sm": size === "md", "text-base": size === "lg",
      })}>
        {label}
      </span>
      {description && <span className="text-xs text-center opacity-70 leading-tight">{description}</span>}
    </div>
  );
}
