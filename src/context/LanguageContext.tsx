"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("streamsync_lang") as Language | null;
    if (saved === "es" || saved === "en") {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.startsWith("es") ? "es" : "en";
      setLanguageState(browserLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("streamsync_lang", lang);
    trackEvent("language_switched", { language: lang });
  };

  const t = translations[language] || translations.es;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
