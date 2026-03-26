"use client";

import { useState, useEffect } from "react";
import { cn, shuffle } from "@/lib/utils";
import type { VocabWord } from "@/types";

interface QuizCardProps {
  word: VocabWord;
  allWords: VocabWord[];
  cardNumber: number;
  totalCards: number;
  onAnswer: (correct: boolean) => void;
}

export function QuizCard({ word, allWords, cardNumber, totalCards, onAnswer }: QuizCardProps) {
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const wrongs = allWords.filter((w) => w.id !== word.id).map((w) => w.meaning);
    const shuffledWrongs = shuffle(wrongs).slice(0, 3);
    setChoices(shuffle([word.meaning, ...shuffledWrongs]));
    setSelected(null);
    setAnswered(false);
  }, [word, allWords]);

  const handleSelect = (choice: string) => {
    if (answered) return;
    setSelected(choice);
    setAnswered(true);
    const correct = choice === word.meaning;
    setTimeout(() => onAnswer(correct), 800);
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-up">
      <div className="flex items-center justify-between text-sm text-gray-400 px-1">
        <span>{cardNumber} / {totalCards}</span>
        <span className="text-xs">뜻을 선택하세요</span>
      </div>

      <div className="w-full min-h-[140px] rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex flex-col items-center justify-center gap-2 px-6 py-8 shadow-lg">
        <p className="text-primary-100 text-sm font-medium">이 단어의 뜻은?</p>
        <p className="text-4xl font-bold text-white tracking-wide">{word.word}</p>
        {word.type === "verb" && word.past && (
          <p className="text-primary-200 text-sm mt-1">{word.word} - {word.past} - {word.past_participle}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice) => {
          const isCorrect = choice === word.meaning;
          const isSelected = choice === selected;
          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              className={cn(
                "py-4 px-3 rounded-2xl border-2 font-semibold text-sm text-center transition-all duration-200 leading-tight",
                !answered
                  ? "bg-white border-gray-200 text-gray-700 active:scale-95 hover:border-primary-300 hover:bg-primary-50"
                  : isCorrect
                  ? "bg-primary-500 border-primary-500 text-white scale-105"
                  : isSelected
                  ? "bg-red-400 border-red-400 text-white"
                  : "bg-gray-50 border-gray-100 text-gray-300"
              )}
            >
              {choice}
              {answered && isCorrect && " ✓"}
              {answered && isSelected && !isCorrect && " ✗"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
