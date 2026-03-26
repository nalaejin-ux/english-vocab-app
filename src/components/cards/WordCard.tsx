"use client";
import { useState } from "react";
import { Vocabulary } from "@/types";

interface WordCardProps {
  vocab: Vocabulary;
  onRate: (rating: "know" | "unsure" | "dontknow") => void;
}

export default function WordCard({ vocab, onRate }: WordCardProps) {
  const [flipped, setFlipped] = useState(false);
  const categoryLabel =
    vocab.category === "irregular_verb" ? "불규칙 동사"
    : vocab.category === "adjective" ? "형용사"
    : vocab.category === "adverb" ? "부사"
    : vocab.category === "sight_word" ? "필수 단어" : "명사";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={[
          "bg-white rounded-3xl shadow-lg p-6 min-h-[240px] flex flex-col items-center justify-center text-center cursor-pointer select-none border-2 transition-all duration-200",
          flipped ? "border-green-400 bg-green-50" : "border-gray-100"
        ].join(" ")}
        onClick={() => setFlipped(true)}
      >
        {!flipped ? (
          <>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">{categoryLabel}</span>
            <p className="text-5xl font-bold text-gray-800 mb-3 tracking-tight">{vocab.word}</p>
            {vocab.category === "irregular_verb" && vocab.past_tense && (
              <p className="text-sm text-gray-400 mt-1">{vocab.present_form} / {vocab.past_tense} / {vocab.past_participle}</p>
            )}
            <p className="text-sm text-green-500 mt-6 font-medium">👆 탭해서 뜻 확인</p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold text-gray-800 mb-2">{vocab.meaning}</p>
            <p className="text-2xl text-green-600 font-semibold mb-4">{vocab.word}</p>
            {vocab.example_sentence && (
              <div className="bg-white rounded-2xl p-3 w-full border border-green-200">
                <p className="text-sm text-gray-600 italic">&ldquo;{vocab.example_sentence}&rdquo;</p>
                <p className="text-xs text-gray-400 mt-1">{vocab.example_sentence_kr}</p>
              </div>
            )}
          </>
        )}
      </div>
      {flipped && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm text-gray-500 font-medium">알고 있었나요?</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onRate("know")} className="flex flex-col items-center py-4 rounded-2xl bg-green-100 border-2 border-green-300 text-green-800 active:scale-95 transition-all font-semibold"><span className="text-2xl mb-1">😄</span><span className="text-sm">알아요!</span></button>
            <button onClick={() => onRate("unsure")} className="flex flex-col items-center py-4 rounded-2xl bg-yellow-100 border-2 border-yellow-300 text-yellow-800 active:scale-95 transition-all font-semibold"><span className="text-2xl mb-1">🤔</span><span className="text-sm">헷갈려요</span></button>
            <button onClick={() => onRate("dontknow")} className="flex flex-col items-center py-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-800 active:scale-95 transition-all font-semibold"><span className="text-2xl mb-1">😅</span><span className="text-sm">몰라요</span></button>
          </div>
        </div>
      )}
    </div>
  );
}
