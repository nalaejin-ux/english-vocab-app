import { cn } from "@/lib/utils";

interface StatCardProps {
  emoji: string;
  label: string;
  value: number | string;
  sub?: string;
  color?: "green" | "yellow" | "blue" | "red" | "purple";
  className?: string;
}

const COLOR_MAP = {
  green:  "bg-primary-50  text-primary-700",
  yellow: "bg-accent-50   text-accent-700",
  blue:   "bg-blue-50     text-blue-700",
  red:    "bg-red-50      text-red-600",
  purple: "bg-purple-50   text-purple-700",
};

export function StatCard({ emoji, label, value, sub, color = "green", className }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl p-4 flex flex-col gap-1", COLOR_MAP[color], className)}>
      <span className="text-2xl">{emoji}</span>
      <span className="text-2xl font-bold leading-none">{value}</span>
      <span className="text-xs font-medium opacity-80 leading-tight">{label}</span>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}
