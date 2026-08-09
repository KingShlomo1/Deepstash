import { useCallback, useEffect, useState } from "react";

const KEY = "deepstash.v1";

export interface AppState {
  saved: string[]; // idea ids
  quizBest: Record<string, number>; // quizId -> best %
  seenIdeas: string[];
  streakDates: string[]; // ISO yyyy-mm-dd
}

const empty: AppState = { saved: [], quizBest: {}, seenIdeas: [], streakDates: [] };

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function save(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Consecutive-day streak ending today (or yesterday). */
export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const d = new Date();
  // Allow the streak to still count if they haven't opened today yet.
  if (!set.has(today())) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function useStore() {
  const [state, setState] = useState<AppState>(load);

  // Record today's visit for the streak once on mount.
  useEffect(() => {
    setState((s) => {
      if (s.streakDates.includes(today())) return s;
      return { ...s, streakDates: [...s.streakDates, today()].slice(-400) };
    });
  }, []);

  useEffect(() => save(state), [state]);

  const toggleSave = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved],
    }));
  }, []);

  const markSeen = useCallback((id: string) => {
    setState((s) => (s.seenIdeas.includes(id) ? s : { ...s, seenIdeas: [...s.seenIdeas, id] }));
  }, []);

  const recordQuiz = useCallback((quizId: string, percent: number) => {
    setState((s) => ({
      ...s,
      quizBest: { ...s.quizBest, [quizId]: Math.max(percent, s.quizBest[quizId] ?? 0) },
    }));
  }, []);

  return { state, toggleSave, markSeen, recordQuiz };
}
