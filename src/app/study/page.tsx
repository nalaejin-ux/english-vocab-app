"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWordProgress } from "@/hooks/useWordProgress";
import { FlashCard } from "@/components/cards/FlashCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import type { VocabWord, AnswerChoice } from "@/types";
import { pct } from "@/lib/utils";

function StudyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReview = searchParams.get("mode") === "review";
  const { user } = useAuth();
  const { getTodayNewWords, getDueWords, updateWordProgress, saveSession } = useWordProgress(user?.id ?? null);

  const [words, setWords] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ word: VocabWord; answer: AnswerChoice }[]>([]);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!user) return;
    const w = isReview ? getDueWords() : getTodayNewWords();
    setWords(w.length > 0 ? w : getDueWords());
  }, [user, isReview]);

  const handleAnswer = async (answer: AnswerChoice) => {
    const word = words[index];
    await updateWordProgress(word.word, answer);
    const newResults = [...results, { word, answer }];
    setResults(newResults);

    if (index + 1 >= words.length) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      const correct = newResults.filter((r) => r.answer === "know").length;
      await saveSession({
        sessionType: isReview ? "review" : "new_words",
        wordsStudied: words.length,
        wordsCorrect: correct,
        wordsWrong: words.length - correct,
        durationSeconds: duration,
      });
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!user) return null;

  if (words.length === 0) return (
    <main className="app-container flex flex-col items-center justify-center min-h-dvh gap-6">
      <span className="text-6xl">🎉</span>
      <h2 className="text-2xl font-bold text-gray-800 text-center">오늘 학습할 단어가 없어요!</h2>
      <p className="text-gray-500 text-center">모든 단어를 학습했거나 복습이 없어요.</p>
      <Button size="lg" fullWidth onClick={() => router.push("/home")}>홈으로 가기</Button>
      <BottomNav />
    </main>
  );

  if (done) {
    const correct = results.filter((r) => r.answer === "know").length;
    return (
      <main className="app-container flex flex-col items-center justify-center min-h-dvh gap-6">
        <div className="text-center animate-bounce-in">
          <span className="text-7xl">{correct === words.length ? "🎯" : "👍"}</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">학습 완료!</h2>
          <p className="text-gray-500 mt-1">{words.length}개 중 {correct}개 알았어요</p>
        </div>
        <div className="w-full bg-white rounded-3xl p-5 shadow-card">
          <ProgressBar value={pct(correct, words.length)} color="green" size="md" showLabel />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <Button size="xl" fullWidth onClick={() => router.push("/quiz")}>퀴즈 풀기 🎯</Button>
          <Button size="lg" variant="secondary" fullWidth onClick={() => router.push("/home")}>홈으로</Button>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="app-container pt-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.back()} className="text-gray-400 text-2xl">←</button>
        <h2 className="font-bold text-gray-700">{isReview ? "복습하기" : "오늘의 학습"}</h2>
        <span className="text-sm text-gray-400">{index+1}/{words.length}</span>
      </div>
      <ProgressBar value={pct(index, words.length)} color="green" className="mb-6" />
      <FlashCard word={words[index]} onAnswer={handleAnswer} cardNumber={index+1} totalCards={words.length} />
      <BottomNav />
    </main>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="app-container flex items-center justify-center min-h-dvh"><span className="text-4xl animate-bounce">📖</span></div>}>
      <StudyContent />
    </Suspense>
  );
}
