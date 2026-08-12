"use client";

import { useEffect } from "react";
import { getStoredUILang, isRTL, LS_KEY } from "@/lib/i18n";

/** keeps <html lang/dir> in sync with the chosen UI language (landing + game) */
export default function LangEffect() {
  useEffect(() => {
    const apply = (lang: string) => {
      document.documentElement.lang = lang;
      document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
    };
    apply(getStoredUILang());
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) apply(e.newValue === "ar" ? "ar" : "en");
    };
    const onCustom = (e: Event) => apply((e as CustomEvent<string>).detail);
    window.addEventListener("storage", onStorage);
    window.addEventListener("mcw-lang", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mcw-lang", onCustom);
    };
  }, []);
  return null;
}

export function setUILang(lang: "en" | "ar") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, lang);
  window.dispatchEvent(new CustomEvent("mcw-lang", { detail: lang }));
}
