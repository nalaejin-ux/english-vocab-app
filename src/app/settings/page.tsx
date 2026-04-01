"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = createClient();

  const [childEmail, setChildEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState("");
  const [linkError, setLinkError] = useState("");

  const handleSignOut = async () => {
    await signOut();
    router.push("/onboarding");
  };

  const handleLinkChild = async () => {
    if (!childEmail.trim()) return;
    setLinking(true);
    setLinkMsg("");
    setLinkError("");

    const { data: childUser, error } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("email", childEmail.trim().toLowerCase())
      .maybeSingle();

    if (error || !childUser) {
      setLinkError("해당 이메일로 가입된 계정을 찾을 수 없어요.");
      setLinking(false);
      return;
    }

    if (childUser.role !== "child") {
      setLinkError("학생 계정만 연결할 수 있어요.");
      setLinking(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ child_id: childUser.id })
      .eq("id", user!.id);

    if (updateError) {
      setLinkError("연결에 실패했어요. 다시 시도해주세요.");
    } else {
      setLinkMsg(`${childUser.name} 계정과 연결됐어요! 🎉`);
      setChildEmail("");
      setTimeout(() => router.push("/parent"), 1500);
    }
    setLinking(false);
  };

  return (
    <main className="app-container pt-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ 설정</h1>

      {/* 프로필 */}
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

      {/* 학부모 전용 - 자녀 연결 */}
      {user?.role === "parent" && (
        <div className="bg-white rounded-3xl p-5 shadow-card mb-4">
          <h2 className="font-bold text-gray-700 mb-1">👧 자녀 계정 연결</h2>
          <p className="text-xs text-gray-400 mb-4">자녀가 가입할 때 사용한 이메일을 입력해주세요</p>

          {user.child_id ? (
            <div className="bg-primary-50 rounded-2xl p-4 text-center">
              <p className="text-primary-700 font-semibold">✅ 자녀 계정이 연결되어 있어요</p>
              <button
                onClick={async () => {
                  await supabase.from("users").update({ child_id: null }).eq("id", user.id);
                  router.refresh();
                }}
                className="text-xs text-gray-400 mt-2 underline"
              >
                연결 해제
              </button>
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="자녀 이메일 입력"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400 mb-3"
              />
              {linkError && (
                <p className="text-red-500 text-sm mb-3 bg-red-50 rounded-xl px-3 py-2">{linkError}</p>
              )}
              {linkMsg && (
                <p className="text-primary-600 text-sm mb-3 bg-primary-50 rounded-xl px-3 py-2">{linkMsg}</p>
              )}
              <Button size="lg" fullWidth onClick={handleLinkChild} disabled={linking}>
                {linking ? "연결 중..." : "자녀 계정 연결하기 🔗"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* 앱 정보 */}
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
