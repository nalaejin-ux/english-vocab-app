"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWordProgress } from "@/hooks/useWordProgress";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { pct } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, loading } = useWordProgress(user?.id ?? null);

  if (authLoading || loading) {
    return <main className="app-container flex items-center justify-center min-h-dvh"><span className="text-4xl animate-bounce">📚</span></main>;
  }

  if (!user) { router.push("/onboarding"); return null; }

  const masteredPct = pct(stats.mastered, stats.total);
  const dueCount = stats.dueCount;

  return (
    <main className="app-container pt-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">좋은 하루예요!</p>
          <h1 className="text-2xl font-bold text-gray-800">{user.avatar_emoji} {user.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">오늘의 목표</p>
          <p className="text-lg font-bold text-primary-600">5단어</p>
        </div>
      </div>

      {/* 전체 진행도 */}
      <div className="bg-white rounded-3xl p-5 shadow-card mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-gray-700">전체 진행도</span>
          <span className="text-primary-600 font-bold">{masteredPct}%</span>
        </div>
        <ProgressBar value={masteredPct} size="md" color="green" />
        <p className="text-xs text-gray-400 mt-2">{stats.mastered} / {stats.total} 단어 완료</p>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard emoji="⭐" label="완전히 외운 단어" value={stats.mastered} color="green" />
        <StatCard emoji="📖" label="학습 중" value={stats.learning} color="blue" />
        <StatCard emoji="🔁" label="복습 필요" value={dueCount} color="yellow" sub={dueCount > 0 ? "오늘 복습하세요!" : "없음"} />
        <StatCard emoji="🆕" label="새 단어 남음" value={stats.newRemaining} color="purple" />
      </div>

      {/* 오늘의 학습 버튼 */}
      <div className="flex flex-col gap-3 mb-4">
        <Button size="xl" fullWidth onClick={() => router.push("/study")}>
          📖 오늘의 학습 시작
        </Button>
        {dueCount > 0 && (
          <Button size="lg" variant="secondary" fullWidth onClick={() => router.push("/study?mode=review")}>
            🔁 복습하기 ({dueCount}개)
          </Button>
        )}
        <Button size="lg" variant="secondary" fullWidth onClick={() => router.push("/quiz")}>
          🎯 퀴즈 풀기
        </Button>
      </div>

      <BottomNav />
    </main>
  );
}
