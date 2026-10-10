export type Locale =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt-BR"
  | "zh"
  | "ar"
  | "hi";

export const LOCALES: Locale[] = ["en", "es", "fr", "de", "pt-BR", "zh", "ar", "hi"];

export const LOCALE_NAMES: Record<Locale, string> = {
  "en":    "English",
  "es":    "Español",
  "fr":    "Français",
  "de":    "Deutsch",
  "pt-BR": "Português (Brasil)",
  "zh":    "中文",
  "ar":    "العربية",
  "hi":    "हिन्दी",
};

export const RTL_LOCALES: Locale[] = ["ar"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(x: string): x is Locale {
  return (LOCALES as string[]).includes(x);
}

/** Normalize a browser language tag to a supported Locale, or null. */
export function normalizeBrowserLocale(tag: string): Locale | null {
  if (!tag) return null;
  const lower = tag.toLowerCase();
  // pt-BR is our specific target; catch pt-br, pt_br, pt
  if (lower.startsWith("pt")) return "pt-BR";
  // pick primary subtag
  const primary = lower.split(/[-_]/)[0];
  if (isLocale(primary)) return primary;
  return null;
}

export type Dictionary = Record<string, string>;