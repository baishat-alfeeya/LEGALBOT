"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { languages, Language, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

// Bump this version whenever the language list changes — forces a reset of stale stored values
const LANG_STORAGE_KEY = "legalbot-lang";
const LANG_VERSION_KEY = "legalbot-lang-version";
const CURRENT_VERSION = "2";

const validLanguageCodes = Object.keys(languages) as Language[];

function getSafeStoredLanguage(): Language {
  try {
    const version = localStorage.getItem(LANG_VERSION_KEY);
    // If version mismatch, clear old preference and default to English
    if (version !== CURRENT_VERSION) {
      localStorage.removeItem(LANG_STORAGE_KEY);
      localStorage.setItem(LANG_VERSION_KEY, CURRENT_VERSION);
      return "en";
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && validLanguageCodes.includes(stored as Language)) {
      return stored as Language;
    }
  } catch {
    // localStorage unavailable (SSR / private browsing)
  }
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start with "en" on server — hydrate from localStorage on client
  const [language, setLanguageState] = useState<Language>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const lang = getSafeStoredLanguage();
    setLanguageState(lang);
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (!validLanguageCodes.includes(lang)) return; // guard against invalid values
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      localStorage.setItem(LANG_VERSION_KEY, CURRENT_VERSION);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: string): string => {
    // Safe lookup with English fallback
    const langData = translations[language];
    const enData = translations["en"];
    if (langData && key in langData) return langData[key];
    if (enData && key in enData) return enData[key];
    return key; // last resort: return the key itself
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
