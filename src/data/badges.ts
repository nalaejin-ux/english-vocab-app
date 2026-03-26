import type { BadgeMeta, BadgeType } from "@/types";

export const BADGE_META: Record<BadgeType, BadgeMeta> = {
  first_word: {
    type: "first_word",
    label: "첫 걸음",
    description: "첫 단어를 외웠어요!",
    emoji: "🌱",
    color: "bg-green-100 text-green-700",
  },
  streak_3: {
    type: "streak_3",
    label: "3일 연속",
    description: "3일 연속 학습 달성!",
    emoji: "🔥",
    color: "bg-orange-100 text-orange-700",
  },
  streak_7: {
    type: "streak_7",
    label: "7일 연속",
    description: "7일 연속 학습 달성!",
    emoji: "⚡",
    color: "bg-yellow-100 text-yellow-700",
  },
  mastered_10: {
    type: "mastered_10",
    label: "단어 마스터 10",
    description: "단어 10개를 완전히 외웠어요!",
    emoji: "⭐",
    color: "bg-blue-100 text-blue-700",
  },
  mastered_50: {
    type: "mastered_50",
    label: "단어 마스터 50",
    description: "단어 50개를 완전히 외웠어요!",
    emoji: "🏆",
    color: "bg-purple-100 text-purple-700",
  },
  mastered_100: {
    type: "mastered_100",
    label: "단어 마스터 100",
    description: "단어 100개를 완전히 외웠어요!",
    emoji: "👑",
    color: "bg-yellow-100 text-yellow-700",
  },
  perfect_quiz: {
    type: "perfect_quiz",
    label: "완벽한 퀴즈",
    description: "퀴즈를 100% 맞혔어요!",
    emoji: "🎯",
    color: "bg-red-100 text-red-700",
  },
  daily_complete: {
    type: "daily_complete",
    label: "오늘 학습 완료",
    description: "오늘의 학습을 모두 마쳤어요!",
    emoji: "✅",
    color: "bg-teal-100 text-teal-700",
  },
};
