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
  const [allWords, setAllWords] = useState<VocabWord[]>(ALL_WORDS as VocabWord[]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadProgress = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);

    // 기본 단어 + custom_words 합치기
    const { data: customWords } = await supabase
      .from("custom_words")
      .select("*");

    const custom: VocabWord[] = (customWords ?? []).map((w: any) => ({
      id: w.id,
      word: w.word,
      meaning: w.meaning,
      type: w.type,
      category: "elementary" as const,
      difficulty: 1 as const,
      order_index: 9999,
      example_sentence: w.example_sentence,
      past: undefined,
      past_participle: undefined,
    }));

    setAllWords([...(ALL_WORDS as VocabWord[]), ...custom]);

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
    const unlearned = allWords.filter((w) => !learnedWords.has(w.word));
    return shuffle(unlearned).slice(0, DAILY_NEW_WORDS);
  }, [progress, allWords]);

  const getDueWords = useCallback((): VocabWord[] => {
    const dueProgress = progress.filter(
      (p) => p.status !== "mastered" && isDueForReview(p.next_review_at)
    );
    const dueWordIds = new Set(dueProgress.map((p) => p.vocab_id));
    return shuffle(allWords.filter((w) => dueWordIds.has(w.word)));
  }, [progress, allWords]);

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
    total: allWords.length,
    mastered: progress.filter((p) => p.status === "mastered").length,
    learning: progress.filter((p) => p.status === "learning" || p.status === "review_due").length,
    weak: progress.filter((p) => p.status === "weak").length,
    newRemaining: allWords.length - progress.length,
    dueCount: getDueWords().length,
    customCount: allWords.length - ALL_WORDS.length,
  };

  return { progress, loading, stats, allWords, getTodayNewWords, getDueWords, updateWordProgress, saveSession, reload: loadProgress };
}
