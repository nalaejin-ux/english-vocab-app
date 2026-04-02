"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Step = "welcome" | "role" | "name" | "done";
type Role = "child" | "parent";

const AVATARS = ["🐶","🐱","🐰","🐻","🦊","🐸","🦋","⭐"];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<Role>("child");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("🐶");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) { setError("모든 항목을 입력해주세요."); return; }
    setLoading(true); setError("");
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr || !data.user) { setError(signUpErr?.message ?? "회원가입에 실패했어요."); setLoading(false); return; }
    await supabase.from("users").insert({ id: data.user.id, email, name: name.trim(), role, avatar_emoji: avatar });
    setStep("done"); setLoading(false);
  };

  if (step === "welcome") return (
    <main className="app-container flex flex-col items-center justify-center min-h-dvh gap-8">
      <div className="flex flex-col items-center gap-4 animate-bounce-in">
        <span className="text-7xl">📚</span>
        <h1 className="text-3xl font-bold text-gray-800 text-center leading-tight">나은이의<br />영어 단어장</h1>
        <p className="text-gray-500 text-center text-base leading-relaxed">매일 5개씩, 뇌가 기억하는 방법으로<br />영어 단어를 외워봐요!</p>
      </div>
<div className="flex flex-col gap-3 w-full">
  <Button size="xl" fullWidth className="bg-primary-500 hover:bg-primary-600" onClick={async () => {
    const em = prompt("이메일") ?? ""; const pw = prompt("비밀번호") ?? "";
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (!error) router.push("/home"); else alert("로그인 실패: " + error.message);
  }}>단어공부 시작 📚</Button>
  <Button size="lg" variant="ghost" fullWidth onClick={() => setStep("role")}>새로운 계정 만들기</Button>
</div>
    </main>
  );

  if (step === "role") return (
    <main className="app-container flex flex-col justify-center min-h-dvh gap-8">
      <div className="text-center"><p className="text-gray-400 text-sm mb-2">1 / 3단계</p><h2 className="text-2xl font-bold text-gray-800">누가 사용할까요?</h2></div>
      <div className="grid grid-cols-2 gap-4">
        {(["child","parent"] as Role[]).map((r) => (
          <button key={r} onClick={() => setRole(r)} className={cn("rounded-3xl p-6 flex flex-col items-center gap-3 border-2 transition-all", role===r?"border-primary-400 bg-primary-50":"border-gray-200 bg-white")}>
            <span className="text-5xl">{r==="child"?"👧":"👨‍👩‍👧"}</span>
            <span className="font-bold text-gray-800">{r==="child"?"학생이에요":"학부모예요"}</span>
            <span className="text-xs text-gray-400 text-center">{r==="child"?"단어를 외울거예요":"학습 현황을 볼거예요"}</span>
          </button>
        ))}
      </div>
      <Button size="xl" fullWidth onClick={() => setStep("name")}>다음 →</Button>
    </main>
  );

  if (step === "name") return (
    <main className="app-container flex flex-col justify-center min-h-dvh gap-6">
      <div className="text-center"><p className="text-gray-400 text-sm mb-2">2 / 3단계</p><h2 className="text-2xl font-bold text-gray-800">이름을 알려주세요!</h2></div>
      <div><p className="text-sm text-gray-500 mb-2 text-center">아바타 선택</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {AVATARS.map((a) => (<button key={a} onClick={() => setAvatar(a)} className={cn("w-12 h-12 text-2xl rounded-2xl border-2 transition-all", avatar===a?"border-primary-400 bg-primary-50 scale-110":"border-gray-200 bg-white")}>{a}</button>))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div><label className="text-sm font-medium text-gray-600 mb-1 block">이름</label><input type="text" placeholder="이름을 입력하세요" value={name} onChange={(e)=>setName(e.target.value)} className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400"/></div>
        <div><label className="text-sm font-medium text-gray-600 mb-1 block">이메일</label><input type="email" placeholder="이메일 주소" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400"/></div>
        <div><label className="text-sm font-medium text-gray-600 mb-1 block">비밀번호</label><input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-primary-400"/></div>
      </div>
      {error && <p className="text-red-500 text-sm text-center bg-red-50 rounded-2xl py-2">{error}</p>}
      <Button size="xl" fullWidth onClick={handleRegister} disabled={loading}>{loading?"가입 중...":"계정 만들기 ✨"}</Button>
    </main>
  );

  return (
    <main className="app-container flex flex-col items-center justify-center min-h-dvh gap-8">
      <div className="flex flex-col items-center gap-4 animate-bounce-in">
        <span className="text-7xl">{avatar}</span>
        <h2 className="text-2xl font-bold text-gray-800">환영해요, {name}님! 🎉</h2>
        <p className="text-gray-500 text-center">오늘부터 매일 5개씩<br />영어 단어를 함께 외워봐요!</p>
      </div>
      <Button size="xl" fullWidth onClick={() => router.push("/home")}>학습 시작하기 🚀</Button>
    </main>
  );
}
