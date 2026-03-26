"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { pct } from "@/lib/utils";
import { ALL_WORDS } from "@/data/words";
import type { StudySession, UserWordProgress } from "@/types";

export default function ParentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [children, setChildren] = useState<{ id: string; name: string; avatar_emoji: string }[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserWordProgress[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/onboarding"); return; }
    if (user.role !== "parent") { router.push("/home"); return; }

    // 모든 child 계정 불러오기
    const loadChildren = async () => {
      const { data } = await supabase
        .from("users")
        .select("id, name, avatar_emoji")
        .eq("role", "child");
      if (data && data.length > 0) {
        setChildren(data);
        setSelectedChild(data[0].id);
      }
    };
    loadChildren();
  }, [user, authLoading]);

  useEffect(() => {
    if (!selectedChild) return;
    const loadChildData = async () => {
      setLoadingData(true);
      const { data: prog } = await supabase
        .from("user_word_progress")
        .select("*")
        .eq("user_id", selectedChild);
      const { data: sess } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", selectedChild)
        .order("created_at", { ascending: false })
        .limit(7);
      setProgress((prog as UserWordProgress[]) ?? []);
      setSessions((sess as StudySession[]) ?? []);
      setLoadingData(false);
    };
    loadChildData();
  }, [selectedChild]);

  if (authLoading) return (
    <main className="app-container flex items-center justify-center min-h-dvh">
      <span className="text-4xl animate-bounce">📊</span>
    </main>
  );

  const mastered = progress.filter((p) => p.status === "mastered").length;
  const learning = progress.filter((p) => p.status === "learning" || p.status === "review_due").length;
  const weak = progress.filter((p) => p.status === "weak").length;
  const total = ALL_WORDS.length;
  const totalStudied = sessions.reduce((a, s) => a + s.words_studied, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.words_correct, 0);
  const accuracy = pct(totalCorrect, totalStudied);
  const child = children.find((c) => c.id === selectedChild);

  return (
    <main className="app-container pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">학부모 대시보드</p>
          <h1 className="text-2xl font-bold text-gray-800">👨‍👩‍👧 학습 현황</h1>
        </div>
      </div>

      {/* 자녀 선택 */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${
                selectedChild === c.id
                  ? "border-primary-400 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              <span>{c.avatar_emoji}</span>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {children.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-card text-center">
          <span className="text-5xl">👧</span>
          <p className="text-gray-600 mt-4 font-medium">등록된 자녀 계정이 없어요</p>
          <p className="text-gray-400 text-sm mt-2">자녀가 먼저 학생으로 가입해야 해요</p>
        </div>
      ) : loadingData ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-3xl animate-bounce">📊</span>
        </div>
      ) : (
        <>
          {/* 자녀 프로필 */}
          {child && (
            <div className="bg-white rounded-3xl p-5 shadow-card mb-4 flex items-center gap-4">
              <span className="text-4xl">{child.avatar_emoji}</span>
              <div>
                <p className="font-bold text-gray-800 text-lg">{child.name}</p>
                <p className="text-sm text-gray-400">총 {progress.length}개 단어 학습 중</p>
              </div>
            </div>
          )}

          {/* 전체 진행도 */}
          <div className="bg-white rounded-3xl p-5 shadow-card mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700">전체 진행도</span>
              <span className="text-primary-600 font-bold">{pct(mastered, total)}%</span>
            </div>
            <ProgressBar value={pct(mastered, total)} color="green" size="md" />
            <p className="text-xs text-gray-400 mt-2">{mastered} / {total} 단어 완료</p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard emoji="⭐" label="완전히 외운 단어" value={mastered} color="green" />
            <StatCard emoji="🎯" label="정답률" value={`${accuracy}%`} color="blue" />
            <StatCard emoji="📖" label="학습 중" value={learning} color="yellow" />
            <StatCard emoji="🔥" label="취약 단어" value={weak} color="red" />
          </div>

          {/* 최근 학습 기록 */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-card mb-4">
              <h2 className="font-bold text-gray-700 mb-3">최근 학습 기록</h2>
              <div className="flex flex-col gap-2">
                {sessions.map((s) => (
                  <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {s.session_type === "new_words" ? "📖 새 단어"
                          : s.session_type === "review" ? "🔁 복습"
                          : "🎯 퀴즈"}
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(s.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-600">{s.words_correct}/{s.words_studied}</p>
                      <p className="text-xs text-gray-400">{pct(s.words_correct, s.words_studied)}% 정답</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessions.length === 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-card text-center">
              <span className="text-4xl">📚</span>
              <p className="text-gray-500 mt-3">아직 학습 기록이 없어요</p>
              <p className="text-gray-400 text-sm mt-1">자녀가 학습을 시작하면 여기에 표시돼요</p>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </main>
  );
}
