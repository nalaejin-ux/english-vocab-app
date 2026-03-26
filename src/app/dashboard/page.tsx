"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWordProgress } from "@/hooks/useWordProgress";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { BADGE_META } from "@/data/badges";
import { pct } from "@/lib/utils";
import type { StudySession, Reward, BadgeType } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats } = useWordProgress(user?.id ?? null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: s } = await supabase.from("study_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(14);
      const { data: r } = await supabase.from("rewards").select("*").eq("user_id", user.id);
      setSessions((s as StudySession[]) ?? []);
      setRewards((r as Reward[]) ?? []);
    };
    load();
  }, [user]);

  const earnedTypes = new Set(rewards.map((r) => r.badge_type));
  const totalWords = sessions.reduce((acc, s) => acc + s.words_studied, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.words_correct, 0);
  const accuracy = pct(totalCorrect, totalWords);

  return (
    <main className="app-container pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 학습 기록</h1>

      {/* 핵심 통계 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard emoji="⭐" label="마스터 단어" value={stats.mastered} color="green" />
        <StatCard emoji="🎯" label="정답률" value={`${accuracy}%`} color="blue" />
        <StatCard emoji="📖" label="총 학습 단어" value={totalWords} color="yellow" />
        <StatCard emoji="🔥" label="학습 세션" value={sessions.length} color="red" />
      </div>

      {/* 진행도 */}
      <div className="bg-white rounded-3xl p-5 shadow-card mb-6">
        <h2 className="font-bold text-gray-700 mb-4">단어 상태</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: "마스터", value: stats.mastered, color: "green" as const, emoji: "⭐" },
            { label: "학습 중", value: stats.learning, color: "blue" as const, emoji: "📖" },
            { label: "복습 필요", value: stats.weak, color: "yellow" as const, emoji: "🔁" },
          ].map(({ label, value, color, emoji }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{emoji} {label}</span>
                <span className="font-semibold text-gray-700">{value}개</span>
              </div>
              <ProgressBar value={pct(value, stats.total)} color={color} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* 최근 세션 */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-card mb-6">
          <h2 className="font-bold text-gray-700 mb-3">최근 학습</h2>
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 5).map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {s.session_type === "new_words" ? "📖 새 단어" : s.session_type === "review" ? "🔁 복습" : "🎯 퀴즈"}
                  </span>
                  <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString("ko-KR")}</p>
                </div>
                <span className="text-sm font-bold text-primary-600">{s.words_correct}/{s.words_studied}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 배지 */}
      <div className="bg-white rounded-3xl p-5 shadow-card mb-6">
        <h2 className="font-bold text-gray-700 mb-4">🏅 배지</h2>
        <div className="flex flex-wrap gap-2">
          {Object.values(BADGE_META).map((badge) => (
            <Badge key={badge.type} emoji={badge.emoji} label={badge.label} color={badge.color} locked={!earnedTypes.has(badge.type as BadgeType)} size="sm" />
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
