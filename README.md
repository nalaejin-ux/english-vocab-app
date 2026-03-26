# 📚 나은이의 영어 단어장

초등학교 4학년을 위한 뇌인지 기반 영어 단어 암기 PWA

## 🚀 빠른 시작

### 1. 저장소 클론 & 의존성 설치

```bash
git clone <repo-url>
cd english-vocab-app
npm install
```

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 Supabase 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Supabase 데이터베이스 설정

Supabase Dashboard → SQL Editor에서 실행:

```
supabase/schema.sql
```

### 4. 단어 데이터 시드

```bash
npm install -D ts-node
npx ts-node --project tsconfig.json supabase/seed.ts
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 📁 폴더 구조

```
english-vocab-app/
├── public/
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── onboarding/     # 온보딩 (역할 선택 + 회원가입)
│   │   ├── home/           # 홈 (진행도 + 학습 진입)
│   │   ├── study/          # 플래시카드 학습
│   │   ├── quiz/           # 4지선다 퀴즈
│   │   ├── dashboard/      # 학습 통계 + 배지
│   │   └── settings/       # 설정 + 로그아웃
│   ├── components/
│   │   ├── ui/             # Button, Card, ProgressBar, Badge
│   │   ├── cards/          # FlashCard
│   │   ├── quiz/           # QuizCard
│   │   ├── dashboard/      # StatCard
│   │   └── layout/         # BottomNav
│   ├── data/
│   │   ├── words.ts        # 단어 200개
│   │   └── badges.ts       # 배지 메타데이터
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useWordProgress.ts
│   ├── lib/
│   │   ├── supabase/
│   │   ├── spaced-repetition.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
└── supabase/
    ├── schema.sql
    └── seed.ts
```

---

## 🗄️ DB 테이블

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 (child / parent) |
| `vocabulary` | 단어 200개 |
| `user_word_progress` | 단어별 학습 상태 + 복습 일정 |
| `study_sessions` | 세션별 학습 기록 |
| `rewards` | 획득 배지 |

---

## 🧠 간격 반복 알고리즘

| 연속 정답 | 다음 복습 |
|----------|----------|
| 0회 | 당일 |
| 1회 | 1일 후 |
| 2회 | 3일 후 |
| 3회 | 7일 후 |
| 4회 | 14일 후 |
| 5회+ | 마스터 |

---

## 📱 화면 목록

1. **온보딩** — 역할 선택 + 회원가입
2. **홈** — 전체 진행도 + 오늘의 학습
3. **학습** — 플래시카드 (알아요/헷갈려요/몰라요)
4. **퀴즈** — 4지선다
5. **기록** — 통계 + 배지
6. **설정** — 프로필 + 로그아웃

---

## 🔧 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + RLS)
- Pretendard Font
