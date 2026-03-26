/**
 * 단어 데이터를 Supabase vocabulary 테이블에 삽입하는 시드 스크립트
 * 실행: npx ts-node --project tsconfig.json supabase/seed.ts
 * (또는 Supabase Studio SQL 에디터에서 직접 INSERT 실행)
 */

import { createClient } from "@supabase/supabase-js";
import { ALL_WORDS } from "../src/data/words";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // 서비스 롤 키 필요
);

async function seed() {
  console.log(`🌱 Seeding ${ALL_WORDS.length} words...`);

  const rows = ALL_WORDS.map((w) => ({
    word:            w.word,
    meaning:         w.meaning,
    type:            w.type,
    category:        w.category,
    past:            w.past ?? null,
    past_participle: w.past_participle ?? null,
    difficulty:      w.difficulty,
    order_index:     w.order_index,
  }));

  const { error } = await supabase
    .from("vocabulary")
    .upsert(rows, { onConflict: "word" });

  if (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }

  console.log("✅ Seed complete!");
}

seed();
