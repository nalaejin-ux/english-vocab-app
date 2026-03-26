import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

export const TYPE_LABELS: Record<string, string> = {
  verb: "동사",
  noun: "명사",
  adj: "형용사",
  adv: "부사",
};

export const CATEGORY_LABELS: Record<string, string> = {
  irregular_verb: "불규칙 동사",
  elementary: "초등 교과서",
};
