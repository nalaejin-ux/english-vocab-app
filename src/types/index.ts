export type UserRole = "child" | "parent";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_emoji?: string;
  child_id?: string;
  created_at: string;
}

export type WordType = "verb" | "noun" | "adj" | "adv";
export type WordCategory = "irregular_verb" | "elementary";

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  type: WordType;
  category: WordCategory;
  past?: string;
  past_participle?: string;
  difficulty: 1 | 2 | 3;
  example_sentence?: string;
  order_index: number;
}

export type WordStatus =
  | "new"
  | "learning"
  | "weak"
  | "review_due"
  | "mastered";

export interface UserWordProgress {
  id: string;
  user_id: string;
  vocab_id: string;
  status: WordStatus;
  correct_count: number;
  wrong_count: number;
  last_studied_at: string | null;
  next_review_at: string | null;
  streak: number;
  created_at: string;
  updated_at: string;
  vocab?: VocabWord;
}

export type SessionType = "new_words" | "review" | "quiz";

export interface StudySession {
  id: string;
  user_id: string;
  session_type: SessionType;
  words_studied: number;
  words_correct: number;
  words_wrong: number;
  duration_seconds: number;
  completed: boolean;
  created_at: string;
}

export type BadgeType =
  | "first_word"
  | "streak_3"
  | "streak_7"
  | "mastered_10"
  | "mastered_50"
  | "mastered_100"
  | "perfect_quiz"
  | "daily_complete";

export interface Reward {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface BadgeMeta {
  type: BadgeType;
  label: string;
  description: string;
  emoji: string;
  color: string;
}

export type AnswerChoice = "know" | "unsure" | "dont_know";

export interface QuizResult {
  vocab_id: string;
  word: string;
  meaning: string;
  answer: AnswerChoice;
  correct: boolean;
}

export interface WeeklyStats {
  date: string;
  words_studied: number;
  words_correct: number;
  sessions: number;
}

export interface ProgressSummary {
  total_words: number;
  mastered: number;
  learning: number;
  weak: number;
  new_remaining: number;
  today_studied: number;
  current_streak: number;
  weekly_stats: WeeklyStats[];
}

export const REVIEW_INTERVALS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
};

export const MASTERY_STREAK = 5;
