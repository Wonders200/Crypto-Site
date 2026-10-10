"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import {
  type Locale, DEFAULT_LOCALE, LOCALES, RTL_LOCALES,
  normalizeBrowserLocale, isLocale,
} from "./types";
import { DICTIONARIES } from "./dictionaries";
import en from "./dictionaries/en";

const STORAGE_KEY = "cs.locale";

type I18nCtx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
};

const Ctx = createContext<I18nCtx | null>(null);

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {}
  const nav = typeof navigator !== "undefined" ? (navigator.language || "") : "";
  const detected = normalizeBrowserLocale(nav);
  return detected ?? DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with default on both server and first client render (no hydration mismatch).
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // After hydration completes, swap to user's detected/stored locale.
  // Deferred by two rAFs so React 18 has fully finished hydrating before
  // we introduce a locale-driven re-render. Prevents #418/#422 hydration errors.
  useEffect(() => {
    let raf1 = 0, raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const detected = detectInitialLocale();
        if (detected !== DEFAULT_LOCALE) setLocaleState(detected);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Keep <html> attributes + storage in sync
  useEffect(() => {
    if (typeof document === "undefined") return;
    const isRTL = RTL_LOCALES.includes(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    try { localStorage.setItem(STORAGE_KEY, locale); } catch {}
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    if (LOCALES.includes(l)) setLocaleState(l);
  }, []);

  const t = useCallback((key: string): string => {
    const dict = DICTIONARIES[locale] || {};
    if (key in dict && dict[key]) return dict[key];
    // Fallback chain: current locale  English  key itself
    if (key in en && (en as any)[key]) return (en as any)[key];
    return key;
  }, [locale]);

  const value = useMemo<I18nCtx>(() => ({
    locale,
    setLocale,
    t,
    isRTL: RTL_LOCALES.includes(locale),
  }), [locale, setLocale, t]);

  // Expose for testing from browser DevTools
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__setLocale = setLocale;
    (window as any).__getLocale = () => locale;
  }, [setLocale, locale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used inside <I18nProvider>");
  return c;
}