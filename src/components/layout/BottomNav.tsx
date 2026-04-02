"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CHILD_NAV = [
  { href: "/home",      emoji: "🏠", label: "홈"   },
  { href: "/study",     emoji: "📖", label: "학습" },
  { href: "/quiz",      emoji: "🎯", label: "퀴즈" },
  { href: "/dashboard", emoji: "📊", label: "기록" },
  { href: "/settings",  emoji: "⚙️", label: "설정" },
];

const PARENT_NAV = [
  { href: "/parent",    emoji: "📊", label: "현황" },
  { href: "/words",     emoji: "📝", label: "단어" },
  { href: "/settings",  emoji: "⚙️", label: "설정" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const navItems = user?.role === "parent" ? PARENT_NAV : CHILD_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-md mx-auto flex">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                active ? "text-primary-600" : "text-gray-400")}>
              <span className="text-xl">{item.emoji}</span>
              <span className={cn("text-[10px] font-medium", active && "font-bold")}>{item.label}</span>
              {active && <div className="w-4 h-0.5 bg-primary-500 rounded-full mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
