"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALL_WORDS } from "@/data/words";
import { calculateNextReview, isDueForReview } from "@/lib/spaced-repetition";
import { todayStr } from "@/lib/utils";
import type {
  UserWordProgress,
  VocabWord,
  AnswerChoice,
  WordStatus,
} from "@/types";

const DAILY_NEW_WORDS = 5;

export function useWordProgress(userId: string | null) {
  const [progress, setProgress] = useState<UserWordProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 전체 progress 로드
  const loadProgress = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from("user_word_progress")
      .select("*, vocab:vocabulary(*)")
      .eq("user_id", userId);

    setProgress((data as UserWordProgress[]) ?? []);
    setLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // 오늘의 새 단어 5개 선택
  const getTodayNewWords = useCallback((): VocabWord[] => {
    const learnedIds = new Set(progress.map((p) => p.vocab_id));
    const unlearned = ALL_WORDS.filter((w) => !learnedIds.has(w.word))
      .sort((a, b) => a.order_index - b.order_index)
      .slice(0, DAILY_NEW_WORDS);
    return unlearned as VocabWord[];
  }, [progress]);

  // 오늘 복습 대상 단어
  const getDueWords = useCallback((): UserWordProgress[] => {
    return progress.filter(
      (p) =>
        p.status !== "mastered" && isDueForReview(p.next_review_at)
    );
  }, [progress]);

  // 단어 상태 업데이트 (답변 후 호출)
  const updateWordProgress = useCallback(
    async (vocabId: string, answer: AnswerChoice) => {
      if (!userId) return;

      const existing = progress.find((p) => p.vocab_id === vocabId);
      const update = calculateNextReview(
        answer,
        existing?.streak ?? 0,
        existing?.correct_count ?? 0,
        existing?.wrong_count ?? 0
      );

      if (existing) {
        await supabase
          .from("user_word_progress")
          .update(update)
          .eq("id", existing.id);
      } else {
        await supabase.from("user_word_progress").insert({
          user_id: userId,
          vocab_id: vocabId,
          ...update,
        });
      }

      await loadProgress();
    },
    [userId, progress, supabase, loadProgress]
  );

  // 오늘 학습 세션 저장
  const saveSession = useCallback(
    async (params: {
      sessionType: "new_words" | "review" | "quiz";
      wordsStudied: number;
      wordsCorrect: number;
      wordsWrong: number;
      durationSeconds: number;
    }) => {
      if (!userId) return;
      await supabase.from("study_sessions").insert({
        user_id: userId,
        session_type: params.sessionType,
        words_studied: params.wordsStudied,
        words_correct: params.wordsCorrect,
        words_wrong: params.wordsWrong,
        duration_seconds: params.durationSeconds,
        completed: true,
      });
    },
    [userId, supabase]
  );

  // 통계
  const stats = {
    total: ALL_WORDS.length,
    mastered: progress.filter((p) => p.status === "mastered").length,
    learning: progress.filter((p) => p.status === "learning" || p.status === "review_due").length,
    weak: progress.filter((p) => p.status === "weak").length,
    newRemaining: ALL_WORDS.length - progress.length,
    dueCount: getDueWords().length,
  };

  return {
    progress,
    loading,
    stats,
    getTodayNewWords,
    getDueWords,
    updateWordProgress,
    saveSession,
    reload: loadProgress,
  };
}
