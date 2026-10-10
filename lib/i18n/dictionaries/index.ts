import type { Dictionary, Locale } from "../types";
import en from "./en";
import es from "./es";
import fr from "./fr";
import de from "./de";
import ptBR from "./pt-BR";
import zh from "./zh";
import ar from "./ar";
import hi from "./hi";

export const DICTIONARIES: Record<Locale, Dictionary> = {
  "en":    en,
  "es":    es,
  "fr":    fr,
  "de":    de,
  "pt-BR": ptBR,
  "zh":    zh,
  "ar":    ar,
  "hi":    hi,
};

export { en };