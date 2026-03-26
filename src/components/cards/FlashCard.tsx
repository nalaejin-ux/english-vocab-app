"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TYPE_LABELS } from "@/lib/utils";
import type { VocabWord } from "@/types";

interface FlashCardProps {
  word: VocabWord;
  onAnswer: (answer: "know" | "unsure" | "dont_know") => void;
  cardNumber: number;
  totalCards: number;
}

export function FlashCard({ word, onAnswer, cardNumber, totalCards }: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleReveal = () => {
    if (!answered) setRevealed(true);
  };

  const handleAnswer = (ans: "know" | "unsure" | "dont_know") => {
    if (answered) return;
    setAnswered(true);
    setTimeout(() => {
      setRevealed(false);
      setAnswered(false);
      onAnswer(ans);
    }, 300);
  };

  const isVerb = word.type === "verb";

  return (
    <div className="flex flex-col gap-4 w-full animate-fade-up">
      {/* 진행 표시 */}
      <div className="flex items-center justify-between text-sm text-gray-400 px-1">
        <span>{cardNumber} / {totalCards}</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
          {TYPE_LABELS[word.type] ?? word.type}
        </span>
      </div>

      {/* 카드 본체 */}
      <div
        onClick={handleReveal}
        className={cn(
          "relative w-full min-h-[220px] rounded-3xl shadow-card flex flex-col items-center justify-center gap-3 px-6 py-8 cursor-pointer transition-all duration-200 select-none",
          revealed
            ? "bg-white border-2 border-primary-200"
            : "bg-gradient-to-br from-primary-50 to-white border-2 border-transparent",
          "active:scale-98"
        )}
      >
        {/* 뜻 (항상 표시) */}
        <p className="text-gray-400 text-sm font-medium tracking-wide">한국어 뜻</p>
        <p className="text-3xl font-bold text-gray-800 text-center leading-tight">
          {word.meaning}
        </p>

        {/* 영어 (탭 후 표시) */}
        {revealed ? (
          <div className="flex flex-col items-center gap-2 mt-2 animate-bounce-in">
            <div className="w-8 h-0.5 bg-gray-200 rounded-full" />
            <p className="text-4xl font-bold text-primary-600 tracking-wide">
              {word.word}
            </p>

            {/* 불규칙동사 3단변화 */}
            {isVerb && word.past && (
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                <VerbChip label="현재" value={word.word} />
                <VerbChip label="과거" value={word.past} />
                {word.past_participle && (
                  <VerbChip label="과거분사" value={word.past_participle} />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-1 text-gray-300">
            <div className="w-12 h-1 bg-gray-200 rounded-full" />
            <p className="text-sm">탭해서 확인하기 👆</p>
          </div>
        )}
      </div>

      {/* 답변 버튼 */}
      {revealed && !answered && (
        <div className="grid grid-cols-3 gap-3 animate-fade-up">
          <AnswerBtn
            emoji="😅"
            label="몰라요"
            color="bg-red-50 border-red-200 text-red-600 active:bg-red-100"
            onClick={() => handleAnswer("dont_know")}
          />
          <AnswerBtn
            emoji="🤔"
            label="헷갈려요"
            color="bg-yellow-50 border-yellow-200 text-yellow-700 active:bg-yellow-100"
            onClick={() => handleAnswer("unsure")}
          />
          <AnswerBtn
            emoji="😄"
            label="알아요"
            color="bg-primary-50 border-primary-200 text-primary-700 active:bg-primary-100"
            onClick={() => handleAnswer("know")}
          />
        </div>
      )}
    </div>
  );
}

function VerbChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-primary-50 rounded-xl px-3 py-1.5 gap-0.5">
      <span className="text-[10px] text-primary-400 font-medium">{label}</span>
      <span className="text-sm font-bold text-primary-700">{value}</span>
    </div>
  );
}

function AnswerBtn({
  emoji, label, color, onClick,
}: {
  emoji: string; label: string; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 py-4 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95",
        color
      )}
    >
      <span className="text-2xl">{emoji}</span>
      {label}
    </button>
  );
}
