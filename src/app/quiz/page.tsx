"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWordProgress } from "@/hooks/useWordProgress";
import { QuizCard } from "@/components/quiz/QuizCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ALL_WORDS } from "@/data/words";
import { shuffle, pct } from "@/lib/utils";
import type { VocabWord } from "@/types";

const QUIZ_SIZE = 10;

export default function QuizPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { progress, saveSession } = useWordProgress(user?.id ?? null);

  const [quizWords, setQuizWords] = useState<VocabWord[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState<VocabWord[]>([]);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // 학습한 단어 중에서 퀴즈 출제
    const learnedIds = new Set(progress.map((p) => p.vocab_id));
    const pool = ALL_WORDS.filter((w) => learnedIds.has(w.word) || learnedIds.has(w.id ?? "")) as VocabWord[];
    const selected = shuffle(pool).slice(0, QUIZ_SIZE);
    setQuizWords(selected.length > 0 ? selected : shuffle(ALL_WORDS as VocabWord[]).slice(0, QUIZ_SIZE));
  }, [progress]);

  const handleAnswer = async (correct: boolean) => {
    const word = quizWords[index];
    if (correct) setScore((s) => s + 1);
    else setWrongs((w) => [...w, word]);

    if (index + 1 >= quizWords.length) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      const finalScore = correct ? score + 1 : score;
      await saveSession({ sessionType: "quiz", wordsStudied: quizWords.length, wordsCorrect: finalScore, wordsWrong: quizWords.length - finalScore, durationSeconds: duration });
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (quizWords.length === 0) return (
    <main className="app-container flex items-center justify-center min-h-dvh">
      <span className="text-4xl animate-bounce">🎯</span>
    </main>
  );

  if (done) {
    const isPerfect = score === quizWords.length;
    return (
      <main className="app-container flex flex-col items-center justify-center min-h-dvh gap-6">
        <div className="text-center animate-bounce-in">
          <span className="text-7xl">{isPerfect ? "🏆" : score >= quizWords.length * 0.7 ? "⭐" : "💪"}</span>
          <h2 className="text-3xl font-bold text-gray-800 mt-4">{score} / {quizWords.length}</h2>
          <p className="text-gray-500 mt-1">{isPerfect ? "완벽해요! 🎉" : "잘했어요! 계속 연습해봐요"}</p>
        </div>
        {wrongs.length > 0 && (
          <div className="w-full bg-white rounded-3xl p-5 shadow-card">
            <p className="font-bold text-gray-700 mb-3">틀린 단어 ({wrongs.length}개)</p>
            <div className="flex flex-col gap-2">
              {wrongs.map((w) => (
                <div key={w.word} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-bold text-primary-600">{w.word}</span>
                  <span className="text-gray-500 text-sm">{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 w-full">
          <Button size="xl" fullWidth onClick={() => { setIndex(0); setScore(0); setWrongs([]); setDone(false); setQuizWords(shuffle(quizWords)); }}>다시 풀기 🔄</Button>
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
        <h2 className="font-bold text-gray-700">퀴즈</h2>
        <span className="text-sm text-primary-600 font-bold">점수: {score}</span>
      </div>
      <ProgressBar value={pct(index, quizWords.length)} color="blue" className="mb-6" />
      <QuizCard word={quizWords[index]} allWords={quizWords} cardNumber={index+1} totalCards={quizWords.length} onAnswer={handleAnswer} />
      <BottomNav />
    </main>
  );
}
