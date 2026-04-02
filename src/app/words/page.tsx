"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CustomWord {
  id: string;
  word: string;
  meaning: string;
  type: string;
  example_sentence: string | null;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "noun", label: "명사" },
  { value: "verb", label: "동사" },
  { value: "adj",  label: "형용사" },
  { value: "adv",  label: "부사" },
];

export default function WordsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [words, setWords] = useState<CustomWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    word: "",
    meaning: "",
    type: "noun",
    example_sentence: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/onboarding"); return; }
    if (user.role !== "parent") { router.push("/home"); return; }
    loadWords();
  }, [user, authLoading]);

  const loadWords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("custom_words")
      .select("*")
      .order("created_at", { ascending: false });
    setWords((data as CustomWord[]) ?? []);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.word.trim() || !form.meaning.trim()) return;
    setSaving(true);

    const { error } = await supabase.from("custom_words").insert({
      word: form.word.trim(),
      meaning: form.meaning.trim(),
      type: form.type,
      example_sentence: form.example_sentence.trim() || null,
      created_by: user!.id,
    });

    if (!error) {
      setForm({ word: "", meaning: "", type: "noun", example_sentence: "" });
      setShowForm(false);
      setSuccessMsg("단어가 추가됐어요! 🎉");
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadWords();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("custom_words").delete().eq("id", id);
    await loadWords();
    setDeleteId(null);
  };

  if (authLoading || loading) return (
    <main className="app-container flex items-center justify-center min-h-dvh">
      <span className="text-4xl animate-bounce">📝</span>
    </main>
  );

  return (
    <main className="app-container pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">학부모 메뉴</p>
          <h1 className="text-2xl font-bold text-gray-800">📝 단어 관리</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-500 text-white px-4 py-2 rounded-2xl font-semibold text-sm"
        >
          {showForm ? "취소" : "+ 추가"}
        </button>
      </div>

      {successMsg && (
        <div className="bg-primary-50 text-primary-700 rounded-2xl px-4 py-3 text-sm font-medium mb-4">
          {successMsg}
        </div>
      )}

      {/* 단어 추가 폼 */}
      {showForm && (
        <div className="bg-white rounded-3xl p-5 shadow-card mb-4 animate-fade-up">
          <h2 className="font-bold text-gray-700 mb-4">새 단어 추가</h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">영어 단어 *</label>
              <input
                type="text"
                placeholder="예: beautiful"
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">한국어 뜻 *</label>
              <input
                type="text"
                placeholder="예: 아름다운"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">품사</label>
              <div className="flex gap-2 flex-wrap">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                      form.type === t.value
                        ? "border-primary-400 bg-primary-50 text-primary-700"
                        : "border-gray-200 text-gray-500"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">예문 (선택)</label>
              <input
                type="text"
                placeholder="예: She is very beautiful."
                value={form.example_sentence}
                onChange={(e) => setForm({ ...form, example_sentence: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400"
              />
            </div>

            <Button size="lg" fullWidth onClick={handleSave} disabled={saving || !form.word.trim() || !form.meaning.trim()}>
              {saving ? "저장 중..." : "단어 저장하기 ✨"}
            </Button>
          </div>
        </div>
      )}

      {/* 단어 목록 */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-6">
        {words.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl">📚</span>
            <p className="text-gray-500 mt-3">아직 추가한 단어가 없어요</p>
            <p className="text-gray-400 text-sm mt-1">위에서 + 추가 버튼을 눌러주세요</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-xs text-gray-400 font-medium">총 {words.length}개 단어</p>
            </div>
            {words.map((w) => (
              <div key={w.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{w.word}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {TYPE_OPTIONS.find((t) => t.value === w.type)?.label ?? w.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{w.meaning}</p>
                  {w.example_sentence && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">{w.example_sentence}</p>
                  )}
                </div>
                {deleteId === w.id ? (
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => handleDelete(w.id)} className="text-xs text-red-500 font-medium">삭제</button>
                    <button onClick={() => setDeleteId(null)} className="text-xs text-gray-400">취소</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(w.id)} className="text-gray-300 hover:text-red-400 ml-3 text-lg">✕</button>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
