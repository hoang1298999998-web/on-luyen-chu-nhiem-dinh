"use client";

import type { Attempt } from "./types";

const HISTORY_KEY = "btcb.history.v1";
const CURRENT_EXAM_KEY = "btcb.currentExam.v1";
const DISPLAY_NAME_KEY = "btcb.displayName";
const MAX_HISTORY = 100;

export type CurrentExam = {
  id: string;
  started_at: string; // ISO
  duration_seconds: number;
  display_name: string | null;
  question_ids: string[];
  option_order: Record<string, string[]>; // qid -> thứ tự id đáp án đã xáo trộn
  answers: Record<string, string>; // qid -> selected option id
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getHistory(): Attempt[] {
  if (typeof window === "undefined") return [];
  return safeParse<Attempt[]>(window.localStorage.getItem(HISTORY_KEY)) ?? [];
}

export function getAttemptById(id: string): Attempt | null {
  return getHistory().find((a) => a.id === id) ?? null;
}

export function saveAttempt(attempt: Attempt) {
  if (typeof window === "undefined") return;
  const history = getHistory();
  history.unshift(attempt);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

export function getCurrentExam(): CurrentExam | null {
  if (typeof window === "undefined") return null;
  return safeParse<CurrentExam>(window.localStorage.getItem(CURRENT_EXAM_KEY));
}

export function saveCurrentExam(exam: CurrentExam) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_EXAM_KEY, JSON.stringify(exam));
}

export function clearCurrentExam() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CURRENT_EXAM_KEY);
}

export function getDisplayName(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(DISPLAY_NAME_KEY) ?? "";
}

export function setDisplayName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISPLAY_NAME_KEY, name);
}
