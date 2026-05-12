'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,hi,pa',
          autoDisplay: false,
          layout:
            window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        'google_translate_element',
      );
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="google_translate_element"
      className="fixed bottom-4 right-4 z-50 bg-white rounded shadow-card p-1.5 border border-ink-300/40"
      aria-label="Translate this page"
    />
  );
}
