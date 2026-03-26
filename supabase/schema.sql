-- =====================================================
-- 초등 영어 단어 암기 앱 - Supabase Schema
-- =====================================================

-- 1. users 테이블 (Supabase Auth 확장)
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null,
  role        text not null check (role in ('child', 'parent')),
  avatar_emoji text default '📚',
  child_id    uuid references public.users(id),  -- 부모 계정의 경우 자녀 id
  created_at  timestamptz default now()
);

alter table public.users enable row level security;
create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- 2. vocabulary 테이블
create table public.vocabulary (
  id              uuid primary key default gen_random_uuid(),
  word            text not null,
  meaning         text not null,
  type            text not null check (type in ('verb', 'noun', 'adj', 'adv')),
  category        text not null check (category in ('irregular_verb', 'elementary')),
  past            text,
  past_participle text,
  difficulty      int not null default 1 check (difficulty between 1 and 3),
  example_sentence text,
  order_index     int not null default 0,
  created_at      timestamptz default now()
);

alter table public.vocabulary enable row level security;
create policy "Vocabulary is readable by all authenticated users"
  on public.vocabulary for select using (auth.role() = 'authenticated');

-- 인덱스
create index idx_vocabulary_category on public.vocabulary(category);
create index idx_vocabulary_order    on public.vocabulary(order_index);

-- 3. user_word_progress 테이블
create table public.user_word_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  vocab_id        text not null,  -- vocabulary.id or word string for local fallback
  status          text not null default 'new'
                    check (status in ('new','learning','weak','review_due','mastered')),
  correct_count   int not null default 0,
  wrong_count     int not null default 0,
  streak          int not null default 0,
  last_studied_at timestamptz,
  next_review_at  timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  unique(user_id, vocab_id)
);

alter table public.user_word_progress enable row level security;
create policy "Users manage own word progress"
  on public.user_word_progress for all using (auth.uid() = user_id);

-- 자동 updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trg_word_progress_updated_at
  before update on public.user_word_progress
  for each row execute procedure update_updated_at();

-- 복습 일정 인덱스
create index idx_word_progress_user_review
  on public.user_word_progress(user_id, next_review_at)
  where status != 'mastered';

-- 4. study_sessions 테이블
create table public.study_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  session_type     text not null check (session_type in ('new_words','review','quiz')),
  words_studied    int not null default 0,
  words_correct    int not null default 0,
  words_wrong      int not null default 0,
  duration_seconds int not null default 0,
  completed        boolean not null default false,
  created_at       timestamptz default now()
);

alter table public.study_sessions enable row level security;
create policy "Users manage own sessions"
  on public.study_sessions for all using (auth.uid() = user_id);

-- 부모가 자녀 세션 조회 가능 (child_id 연결된 경우)
create policy "Parents can read child sessions"
  on public.study_sessions for select
  using (
    user_id in (
      select child_id from public.users
      where id = auth.uid() and child_id is not null
    )
  );

create index idx_sessions_user_date
  on public.study_sessions(user_id, created_at desc);

-- 5. rewards 테이블
create table public.rewards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  badge_type  text not null,
  earned_at   timestamptz default now(),

  unique(user_id, badge_type)
);

alter table public.rewards enable row level security;
create policy "Users manage own rewards"
  on public.rewards for all using (auth.uid() = user_id);

-- =====================================================
-- Seed: vocabulary 200개 삽입 예시 (일부)
-- 실제로는 src/data/words.ts 데이터를 스크립트로 삽입
-- =====================================================
-- insert into public.vocabulary (word, meaning, type, category, past, past_participle, difficulty, order_index)
-- values
--   ('be', '~이다/되다/있다', 'verb', 'irregular_verb', 'was/were', 'been', 1, 1),
--   ('begin', '시작하다', 'verb', 'irregular_verb', 'began', 'begun', 2, 4),
--   ...
