// 로컬 스토리지 기반 오프라인 스토어 (Supabase 없이도 동작)
import { UserWordProgress, StudySession, KnowledgeRating } from '@/types';
import { calculateNextReview } from './spaced-repetition';
import { VOCABULARY_DATA } from '@/data/vocabulary';
import { format } from 'date-fns';

const PROGRESS_KEY = 'vocab_progress';
const SESSIONS_KEY = 'vocab_sessions';
const USER_KEY = 'vocab_user';

export interface LocalUser {
  id: string;
  name: string;
  role: 'child' | 'parent';
  childName?: string;
  avatar_emoji: string;
}

export function getUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user: LocalUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAllProgress(): Record<string, UserWordProgress> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(PROGRESS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveProgress(progress: Record<string, UserWordProgress>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function updateWordProgress(vocabId: string, rating: KnowledgeRating) {
  const all = getAllProgress();
  const existing = all[vocabId] || {
    id: `p_${vocabId}`,
    user_id: 'local',
    vocab_id: vocabId,
    status: 'new' as const,
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    correct_count: 0,
    incorrect_count: 0,
  };
  const updated = { ...existing, ...calculateNextReview(existing, rating) };
  all[vocabId] = updated;
  saveProgress(all);
  return updated;
}

export function getTodayPlan() {
  const all = getAllProgress();
  const today = format(new Date(), 'yyyy-MM-dd');

  // 복습 대상
  const reviewWords = VOCABULARY_DATA
    .map((v, i) => ({ vocab: { ...v, id: `v_${i}` }, progress: all[`v_${i}`] }))
    .filter(({ progress }) =>
      progress &&
      progress.status !== 'new' &&
      progress.next_review_at &&
      new Date(progress.next_review_at) <= new Date()
    )
    .map(({ vocab, progress }) => ({ ...progress, vocabulary: vocab }));

  // 새 단어 (아직 학습 안 한 것, 하루 5개)
  const learnedIds = new Set(Object.keys(all));
  const newWords = VOCABULARY_DATA
    .map((v, i) => ({ ...v, id: `v_${i}` }))
    .filter(v => !learnedIds.has(v.id))
    .slice(0, 5);

  return { newWords, reviewWords, today };
}

export function getSessions(): StudySession[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveSession(session: StudySession) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getWeeklyStats() {
  const sessions = getSessions();
  const progress = getAllProgress();
  const today = new Date();
  const dates: string[] = [];
  const studiedCounts: number[] = [];
  const correctRates: number[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    dates.push(dateStr);
    const daySessions = sessions.filter(s => s.date === dateStr);
    const totalStudied = daySessions.reduce((a, s) => a + s.new_words_count + s.review_words_count, 0);
    const totalCorrect = daySessions.reduce((a, s) => a + s.correct_count, 0);
    const totalAnswered = daySessions.reduce((a, s) => a + s.correct_count + s.incorrect_count, 0);
    studiedCounts.push(totalStudied);
    correctRates.push(totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0);
  }

  const masteredCount = Object.values(progress).filter(p => p.status === 'mastered').length;
  const streak = calcStreak(sessions);

  return { dates, studiedCounts, correctRates, streakDays: streak, totalMastered: masteredCount };
}

function calcStreak(sessions: StudySession[]): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    if (sessions.some(s => s.date === dateStr && s.completed)) streak++;
    else break;
  }
  return streak;
}

export const BADGES = [
  { id: 'first_study', name: '첫 발걸음', emoji: '🌱', description: '처음 학습 완료!', condition_type: 'sessions', condition_value: 1 },
  { id: 'streak_3', name: '3일 연속', emoji: '🔥', description: '3일 연속 학습!', condition_type: 'streak', condition_value: 3 },
  { id: 'streak_7', name: '일주일 영웅', emoji: '⭐', description: '7일 연속 학습!', condition_type: 'streak', condition_value: 7 },
  { id: 'mastered_10', name: '단어 마스터', emoji: '🏆', description: '단어 10개 완전 정복!', condition_type: 'mastered', condition_value: 10 },
  { id: 'mastered_50', name: '영어 박사', emoji: '🎓', description: '단어 50개 완전 정복!', condition_type: 'mastered', condition_value: 50 },
  { id: 'correct_100', name: '백발백중', emoji: '🎯', description: '정답 100개 달성!', condition_type: 'correct', condition_value: 100 },
];

export function getEarnedBadges() {
  const stats = getWeeklyStats();
  const sessions = getSessions();
  const totalCorrect = Object.values(getAllProgress()).reduce((a, p) => a + p.correct_count, 0);
  return BADGES.map(b => {
    let earned = false;
    if (b.condition_type === 'sessions') earned = sessions.length >= b.condition_value;
    if (b.condition_type === 'streak') earned = stats.streakDays >= b.condition_value;
    if (b.condition_type === 'mastered') earned = stats.totalMastered >= b.condition_value;
    if (b.condition_type === 'correct') earned = totalCorrect >= b.condition_value;
    return { ...b, earned };
  });
}
