"use client";

import { useCallback, useEffect, useState } from "react";

export type AvatarType = "boy1" | "boy2" | "girl1" | "girl2" | "fox" | "rabbit" | "lion" | "panda" | "unicorn" | "bear";

export interface DailyChallenge {
  id: string;
  type: "color" | "numbers" | "game" | "learn";
  target: number;
  current: number;
  reward: { stars: number; coins: number };
  completed: boolean;
  date: string;
}

export interface WeeklyReport {
  weekStart: string;
  pagesCompleted: number;
  gamesPlayed: number;
  starsEarned: number;
  timeSpent: number; // minutes
  favoriteCategory: string;
}

export interface Progress {
  name: string;
  avatar: AvatarType;
  stars: number;
  coins: number;
  level: number;
  xp: number;
  xpToNext: number;
  completed: string[];
  unlocked: string[];
  purchases: string[]; // ['premium-animals', 'all-access', 'remove-ads']
  lastReward: string | null;
  streak: number;
  leftHanded: boolean;
  bigUi: boolean;
  colorblind: boolean;
  lang: string;
  sound: boolean;
  music: boolean;
  musicTrack: number;
  voice: boolean;
  voiceType: "teacher-male" | "teacher-female" | "kid-boy" | "kid-girl" | "friendly";
  companionMode: boolean;
  companionVolume: number;
  bestBalloon: number;
  bestDots: number;
  darkMode: boolean;
  dailyChallenges: DailyChallenge[];
  weeklyReports: WeeklyReport[];
  hallOfFame: { category: string; value: number; date: string }[];
  totalPlayTime: number; // minutes
  lastPlayDate: string | null;
}

const KEY = "mcw.progress.v1";

export const DEFAULT_PROGRESS: Progress = {
  name: "Artist",
  avatar: "boy1" as AvatarType,
  stars: 0,
  coins: 30,
  level: 1,
  xp: 0,
  xpToNext: 100,
  completed: [],
  unlocked: ["brush", "bucket", "crayon", "marker", "pencil", "eraser"],
  lastReward: null,
  streak: 0,
  leftHanded: false,
  bigUi: false,
  colorblind: false,
  lang: "en-US",
  sound: true,
  music: true,
  musicTrack: 0,
  voice: true,
  voiceType: "friendly" as const,
  companionMode: true,
  companionVolume: 0.7,
  purchases: [],
  bestBalloon: 0,
  bestDots: 0,
  darkMode: false,
  dailyChallenges: [],
  weeklyReports: [],
  hallOfFame: [],
  totalPlayTime: 0,
  lastPlayDate: null,
};

/** lightweight obfuscation so kids/tampering can't trivially edit stars */
function encode(p: Progress) {
  const json = JSON.stringify(p);
  if (typeof window === "undefined") return json;
  return window.btoa(encodeURIComponent(json));
}
function decode(raw: string): Progress | null {
  try {
    const json = raw.startsWith("{") ? raw : decodeURIComponent(window.atob(raw));
    return { ...DEFAULT_PROGRESS, ...(JSON.parse(json) as Progress) };
  } catch {
    return null;
  }
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  const raw = window.localStorage.getItem(KEY);
  return (raw && decode(raw)) || DEFAULT_PROGRESS;
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, encode(p));
}

export function addXP(p: Progress, amount: number): Progress {
  let newXp = p.xp + amount;
  let newLevel = p.level;
  let newXpToNext = p.xpToNext;
  
  // Level up logic
  while (newXp >= newXpToNext) {
    newXp -= newXpToNext;
    newLevel++;
    newXpToNext = Math.round(newXpToNext * 1.2); // Each level needs 20% more XP
  }
  
  return {
    ...p,
    xp: newXp,
    level: newLevel,
    xpToNext: newXpToNext,
  };
}

export function generateDailyChallenges(): DailyChallenge[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: `daily-${today}-1`,
      type: "color",
      target: 3,
      current: 0,
      reward: { stars: 5, coins: 15 },
      completed: false,
      date: today,
    },
    {
      id: `daily-${today}-2`,
      type: "numbers",
      target: 1,
      current: 0,
      reward: { stars: 10, coins: 25 },
      completed: false,
      date: today,
    },
    {
      id: `daily-${today}-3`,
      type: "game",
      target: 500, // balloon score
      current: 0,
      reward: { stars: 8, coins: 20 },
      completed: false,
      date: today,
    },
  ];
}

export function refreshChallengesIfNeeded(p: Progress): Progress {
  const today = new Date().toISOString().slice(0, 10);
  const lastChallengeDate = p.dailyChallenges[0]?.date;
  
  if (lastChallengeDate !== today) {
    return {
      ...p,
      dailyChallenges: generateDailyChallenges(),
    };
  }
  return p;
}

export const AVATARS: { id: AvatarType; emoji: string; label: string }[] = [
  { id: "boy1", emoji: "👦", label: "Boy 1" },
  { id: "boy2", emoji: "👨", label: "Boy 2" },
  { id: "girl1", emoji: "👧", label: "Girl 1" },
  { id: "girl2", emoji: "👩", label: "Girl 2" },
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "rabbit", emoji: "🐰", label: "Rabbit" },
  { id: "lion", emoji: "🦁", label: "Lion" },
  { id: "panda", emoji: "🐼", label: "Panda" },
  { id: "unicorn", emoji: "🦄", label: "Unicorn" },
  { id: "bear", emoji: "🐻", label: "Bear" },
];

export const MUSIC_TRACKS = [
  { id: 0, name: "🎵 Gentle Piano", emoji: "🎹" },
  { id: 1, name: "🎵 Happy Ukulele", emoji: "🎸" },
  { id: 2, name: "🎵 Calm Flute", emoji: "🎼" },
  { id: 3, name: "🎵 Soft Strings", emoji: "🎻" },
];

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => {
    setProgress((prev) => {
      const delta = typeof patch === "function" ? patch(prev) : patch;
      const next = { ...prev, ...delta };
      saveProgress(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    saveProgress(DEFAULT_PROGRESS);
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return { progress, update, reset, ready };
}

export const LANGS = [
  { code: "en-US", label: "English", flag: "🇬🇧" },
  { code: "ar-SA", label: "العربية", flag: "🇸🇦" },
  { code: "fr-FR", label: "Français", flag: "🇫🇷" },
  { code: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { code: "es-ES", label: "Español", flag: "🇪🇸" },
  { code: "it-IT", label: "Italiano", flag: "🇮🇹" },
  { code: "tr-TR", label: "Türkçe", flag: "🇹🇷" },
  { code: "ru-RU", label: "Русский", flag: "🇷🇺" },
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
];
