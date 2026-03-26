"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/onboarding");
  };

  return (
    <main className="app-container pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ 설정</h1>

      {user && (
        <div className="bg-white rounded-3xl p-5 shadow-card mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{user.avatar_emoji ?? "👤"}</span>
            <div>
              <p className="font-bold text-gray-800 text-lg">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                {user.role === "child" ? "학생" : "학부모"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-card mb-4 overflow-hidden">
        {[
          { emoji: "📖", label: "하루 목표 단어 수", value: "5개" },
          { emoji: "🔔", label: "학습 알림", value: "켜짐" },
          { emoji: "🌙", label: "다크 모드", value: "꺼짐" },
        ].map(({ emoji, label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{emoji}</span>
              <span className="text-gray-700 font-medium">{label}</span>
            </div>
            <span className="text-gray-400 text-sm">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-card mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs text-gray-400 mb-1">앱 정보</p>
          <p className="text-gray-700 font-medium">버전 0.1.0 MVP</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">단어 데이터</p>
          <p className="text-gray-700 font-medium">불규칙 동사 100개 + 초등 교과서 100개</p>
        </div>
      </div>

      <Button size="lg" variant="danger" fullWidth onClick={handleSignOut}>
        로그아웃
      </Button>

      <BottomNav />
    </main>
  );
}
