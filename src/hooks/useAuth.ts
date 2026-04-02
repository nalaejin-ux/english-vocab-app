"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profile) {
            setUser(profile as AppUser);
          } else {
            // users 테이블에 프로필이 없으면 null로 처리 후 온보딩으로
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();

            setUser(profile ? (profile as AppUser) : null);
          } else {
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
