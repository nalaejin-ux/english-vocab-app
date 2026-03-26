import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  total?: number;
  current?: number;
  color?: "green" | "yellow" | "red" | "blue";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color = "green",
  size = "md",
  showLabel,
  current,
  total,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-gray-100 overflow-hidden", {
        "h-2": size === "sm",
        "h-3": size === "md",
      })}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", {
            "bg-primary-500": color === "green",
            "bg-accent-400":  color === "yellow",
            "bg-red-400":     color === "red",
            "bg-blue-400":    color === "blue",
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">
            {current !== undefined && total !== undefined
              ? `${current} / ${total}`
              : `${pct}%`}
          </span>
        </div>
      )}
    </div>
  );
}
