"use client";

import { useCallback, useEffect, useState } from "react";

/** the child-designed buddy look (animal OR human kid) */
export interface BuddyCustom {
  kind?: "animal" | "boy" | "girl";
  ear: "round" | "pointy" | "long" | "floppy";
  fur: string;
  belly: string;
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "long" | "pony" | "curly";
  shirt?: string;
  cheeks: boolean;
  accessory: "none" | "crown" | "bow" | "glasses" | "party";
}

export interface Progress {
  name: string;
  avatar: string;
  stars: number;
  coins: number;
  completed: string[];
  unlocked: string[];
  achievements: string[];
  lastReward: string | null;
  streak: number;
  leftHanded: boolean;
  bigUi: boolean;
  colorblind: boolean;
  lang: string;
  sound: boolean;
  music: boolean;
  musicTrack: string;
  voice: boolean;
  voiceChar: string;
  buddyOn: boolean;
  buddyFace: string;
  buddyCustom: BuddyCustom | null;
  buddyPos: { x: number; y: number } | null;
  /** cloud sync code — enter it on any device to restore this child */
  syncCode: string;
  premiumUnlocked: boolean;
  bestBalloon: number;
  bestDots: number;
  bestShadow: number;
  seenHint: boolean;
  chestProgress: number;
  sleepMinutes: number;
}

export interface Profile {
  id: string;
  data: Progress;
}

const ROOT_KEY = "mcw.profiles.v2";
const LEGACY_KEY = "mcw.progress.v1";

export const AVATARS = ["🦄", "🐱", "🐶", "🦊", "🐼", "🐵", "🦁", "🐸", "🐰", "🐯", "🐨", "🐧"];

export const DEFAULT_PROGRESS: Progress = {
  name: "Artist",
  avatar: "🦄",
  stars: 0,
  coins: 30,
  completed: [],
  unlocked: ["brush", "bucket", "crayon", "marker", "pencil", "eraser"],
  achievements: [],
  lastReward: null,
  streak: 0,
  leftHanded: false,
  bigUi: false,
  colorblind: false,
  lang: "en-US",
  sound: true,
  music: true,
  musicTrack: "lullaby",
  voice: true,
  voiceChar: "teacher_f",
  buddyOn: true,
  buddyFace: "🦊",
  buddyCustom: null,
  buddyPos: null,
  syncCode: "",
  premiumUnlocked: false,
  bestBalloon: 0,
  bestDots: 0,
  bestShadow: 0,
  seenHint: false,
  chestProgress: 0,
  sleepMinutes: 0,
};

interface Store {
  activeId: string;
  profiles: Profile[];
}

function encode(s: Store) {
  const json = JSON.stringify(s);
  if (typeof window === "undefined") return json;
  return window.btoa(encodeURIComponent(json));
}
function decode(raw: string): Store | null {
  try {
    const json = raw.startsWith("{") ? raw : decodeURIComponent(window.atob(raw));
    return JSON.parse(json) as Store;
  } catch {
    return null;
  }
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeSyncCode() {
  let c = "";
  for (let i = 0; i < 6; i++) c += CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0];
  return c;
}

function freshProfile(name = "Artist", avatar = "🦄"): Profile {
  return {
    id: `p${Date.now()}${Math.floor(Math.random() * 999)}`,
    data: { ...DEFAULT_PROGRESS, name, avatar, syncCode: makeSyncCode() },
  };
}

function loadStore(): Store {
  if (typeof window === "undefined") {
    const p = freshProfile();
    return { activeId: p.id, profiles: [p] };
  }
  const raw = window.localStorage.getItem(ROOT_KEY);
  const parsed = raw && decode(raw);
  if (parsed && parsed.profiles?.length) {
    // hydrate any missing fields on older profiles
    parsed.profiles = parsed.profiles.map((p) => ({ ...p, data: { ...DEFAULT_PROGRESS, ...p.data } }));
    return parsed;
  }
  // migrate the old single-profile save
  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const json = legacy.startsWith("{") ? legacy : decodeURIComponent(window.atob(legacy));
      const data = { ...DEFAULT_PROGRESS, ...(JSON.parse(json) as Progress) };
      const p: Profile = { id: `p${Date.now()}`, data };
      return { activeId: p.id, profiles: [p] };
    } catch {
      /* ignore */
    }
  }
  const p = freshProfile();
  return { activeId: p.id, profiles: [p] };
}

function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROOT_KEY, encode(s));
}

export function useProgress() {
  const [store, setStore] = useState<Store | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setReady(true);
  }, []);

  const active = store?.profiles.find((p) => p.id === store.activeId) ?? null;
  const progress = active?.data ?? DEFAULT_PROGRESS;

  // cloud auto-save: push this child's progress to the server (debounced)
  useEffect(() => {
    if (!ready || !progress.syncCode) return;
    const t = window.setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: progress.syncCode, data: progress }),
      }).catch(() => undefined);
    }, 2000);
    return () => window.clearTimeout(t);
  }, [progress, ready]);

  const update = useCallback((patch: Partial<Progress> | ((p: Progress) => Partial<Progress>)) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next: Store = {
        ...prev,
        profiles: prev.profiles.map((p) => {
          if (p.id !== prev.activeId) return p;
          const delta = typeof patch === "function" ? patch(p.data) : patch;
          return { ...p, data: { ...p.data, ...delta } };
        }),
      };
      saveStore(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStore((prev) => {
      if (!prev) return prev;
      const next: Store = {
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === prev.activeId ? { ...p, data: { ...DEFAULT_PROGRESS, name: p.data.name, avatar: p.data.avatar } } : p,
        ),
      };
      saveStore(next);
      return next;
    });
  }, []);

  const addProfile = useCallback((name: string, avatar: string) => {
    setStore((prev) => {
      const base = prev ?? loadStore();
      if (base.profiles.length >= 4) return base;
      const p = freshProfile(name || "Artist", avatar);
      const next: Store = { activeId: p.id, profiles: [...base.profiles, p] };
      saveStore(next);
      return next;
    });
  }, []);

  const switchProfile = useCallback((id: string) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next = { ...prev, activeId: id };
      saveStore(next);
      return next;
    });
  }, []);

  /** import a profile restored from the cloud (by sync code) */
  const importProfile = useCallback((data: Progress) => {
    setStore((prev) => {
      const base = prev ?? loadStore();
      const d: Progress = { ...DEFAULT_PROGRESS, ...data, syncCode: data.syncCode || makeSyncCode() };
      const p: Profile = { id: `p${Date.now()}`, data: d };
      const next: Store = { activeId: p.id, profiles: [...base.profiles, p] };
      saveStore(next);
      return next;
    });
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setStore((prev) => {
      if (!prev || prev.profiles.length <= 1) return prev;
      const profiles = prev.profiles.filter((p) => p.id !== id);
      const next: Store = { activeId: prev.activeId === id ? profiles[0].id : prev.activeId, profiles };
      saveStore(next);
      return next;
    });
  }, []);

  return {
    progress,
    update,
    reset,
    ready,
    profiles: store?.profiles ?? [],
    activeId: store?.activeId ?? "",
    addProfile,
    switchProfile,
    deleteProfile,
    importProfile,
  };
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
