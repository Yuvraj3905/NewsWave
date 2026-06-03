'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { Language } from '@/lib/types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const LANG_KEY = 'newswave:language';
const COOKIE_NAME = 'newswave_lang';

const setCookie = (val: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${val}; path=/; max-age=31536000; samesite=lax`;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem(LANG_KEY) as Language) || 'en';
    setLanguageState(saved);
    setCookie(saved);
  }, []);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANG_KEY, lang);
        setCookie(lang);
        // Re-render server components (e.g. article page) that read the
        // language cookie, so the switch applies without a manual reload.
        router.refresh();
      }
    },
    [router],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  pa: 'ਪੰਜਾਬੀ',
};

export const LANG_OPTIONS: Language[] = ['en', 'hi', 'pa'];
