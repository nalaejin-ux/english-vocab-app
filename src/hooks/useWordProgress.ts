"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ALL_WORDS } from "@/data/words";
import { calculateNextReview, isDueForReview } from "@/lib/spaced-repetition";
import { shuffle } from "@/lib/utils";
import type { UserWordProgress, VocabWord, AnswerChoice } from "@/types";

const DAILY_NEW_WORDS = 5;

export function useWordProgress(userId: string | null) {
  const [progress, setProgress] = useState<UserWordProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadProgress = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("user_word_progress")
      .select("*")
      .eq("user_id", userId);
    setProgress((data as UserWordProgress[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const getTodayNewWords = useCallback((): VocabWord[] => {
    const learnedWords = new Set(progress.map((p) => p.vocab_id));
    const unlearned = (ALL_WORDS as VocabWord[]).filter((w) => !learnedWords.has(w.word));
    // 랜덤 섞은 후 5개 선택
    return shuffle(unlearned).slice(0, DAILY_NEW_WORDS);
  }, [progress]);

  const getDueWords = useCallback((): VocabWord[] => {
    const dueProgress = progress.filter(
      (p) => p.status !== "mastered" && isDueForReview(p.next_review_at)
    );
    const dueWordIds = new Set(dueProgress.map((p) => p.vocab_id));
    const due = (ALL_WORDS as VocabWord[]).filter((w) => dueWordIds.has(w.word));
    // 복습도 랜덤 순서로
    return shuffle(due);
  }, [progress]);

  const updateWordProgress = useCallback(async (word: string, answer: AnswerChoice) => {
    if (!userId) return;
    const existing = progress.find((p) => p.vocab_id === word);
    const update = calculateNextReview(
      answer,
      existing?.streak ?? 0,
      existing?.correct_count ?? 0,
      existing?.wrong_count ?? 0
    );

    if (existing) {
      await supabase.from("user_word_progress").update({
        status: update.status,
        streak: update.streak,
        correct_count: update.correct_count,
        wrong_count: update.wrong_count,
        next_review_at: update.next_review_at,
        last_studied_at: update.last_studied_at,
      }).eq("id", existing.id);
    } else {
      await supabase.from("user_word_progress").insert({
        user_id: userId,
        vocab_id: word,
        status: update.status,
        streak: update.streak,
        correct_count: update.correct_count,
        wrong_count: update.wrong_count,
        next_review_at: update.next_review_at,
        last_studied_at: update.last_studied_at,
      });
    }
    await loadProgress();
  }, [userId, progress, loadProgress]);

  const saveSession = useCallback(async (params: {
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
  }, [userId]);

  const stats = {
    total: ALL_WORDS.length,
    mastered: progress.filter((p) => p.status === "mastered").length,
    learning: progress.filter((p) => p.status === "learning" || p.status === "review_due").length,
    weak: progress.filter((p) => p.status === "weak").length,
    newRemaining: ALL_WORDS.length - progress.length,
    dueCount: getDueWords().length,
  };

  return { progress, loading, stats, getTodayNewWords, getDueWords, updateWordProgress, saveSession, reload: loadProgress };
}
