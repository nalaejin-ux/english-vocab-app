import { addDays, startOfDay } from "date-fns";
import type { AnswerChoice, WordStatus } from "@/types";

const MASTERY_STREAK = 5;

const INTERVALS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
};

export interface ReviewUpdate {
  status: WordStatus;
  streak: number;
  correct_count: number;
  wrong_count: number;
  next_review_at: string;
  last_studied_at: string;
}

export function calculateNextReview(
  answer: AnswerChoice,
  currentStreak: number,
  correctCount: number,
  wrongCount: number
): ReviewUpdate {
  const now = new Date();
  const today = startOfDay(now);
  let newStreak = currentStreak;
  let newStatus: WordStatus;
  let nextReview: Date;

  if (answer === "know") {
    newStreak = currentStreak + 1;
    if (newStreak >= MASTERY_STREAK) {
      newStatus = "mastered";
      nextReview = addDays(today, 30);
    } else {
      newStatus = "review_due";
      const days = INTERVALS[Math.min(newStreak, 4)] ?? 14;
      nextReview = days === 0 ? today : addDays(today, days);
    }
  } else if (answer === "unsure") {
    newStreak = Math.max(0, currentStreak - 1);
    newStatus = "weak";
    nextReview = addDays(today, 1);
  } else {
    newStreak = 0;
    newStatus = "weak";
    nextReview = today;
  }

  return {
    status: newStatus,
    streak: newStreak,
    correct_count: answer === "know" ? correctCount + 1 : correctCount,
    wrong_count: answer === "dont_know" ? wrongCount + 1 : wrongCount,
    next_review_at: nextReview.toISOString(),
    last_studied_at: now.toISOString(),
  };
}

export function isDueForReview(nextReviewAt: string | null): boolean {
  if (!nextReviewAt) return false;
  return new Date(nextReviewAt) <= new Date();
}

export const ANSWER_LABELS: Record<AnswerChoice, { label: string; color: string; emoji: string }> = {
  know:      { label: "알아요",   color: "bg-primary-500 text-white", emoji: "😄" },
  unsure:    { label: "헷갈려요", color: "bg-accent-400 text-white",  emoji: "🤔" },
  dont_know: { label: "몰라요",   color: "bg-red-400 text-white",     emoji: "😅" },
};
