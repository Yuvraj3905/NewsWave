'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ArticleTranslation, Language } from '@/lib/types';
import { LANG_LABELS } from './LanguageContext';
import { getToken } from './AdminAuth';

interface Props {
  articleId: string;
}

const LANGS: Language[] = ['hi', 'pa'];

interface Draft {
  title: string;
  description: string;
  content: string;
}

export function TranslationsManager({ articleId }: Props) {
  const [items, setItems] = useState<ArticleTranslation[]>([]);
  const [drafts, setDrafts] = useState<Record<Language, Draft>>({
    en: { title: '', description: '', content: '' },
    hi: { title: '', description: '', content: '' },
    pa: { title: '', description: '', content: '' },
  });
  const [busy, setBusy] = useState<Language | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const refresh = () => {
    const token = getToken();
    if (!token) return;
    api
      .adminListTranslations(token, articleId)
      .then((rows) => {
        setItems(rows);
        setDrafts((prev) => {
          const next = { ...prev };
          rows.forEach((r) => {
            next[r.language] = {
              title: r.title,
              description: r.description || '',
              content: r.content,
            };
          });
          return next;
        });
      })
      .catch((e) => setError(e?.message || 'Failed to load translations'));
  };

  useEffect(() => {
    refresh();
  }, [articleId]);

  const save = async (lang: Language) => {
    const token = getToken();
    if (!token) return;
    setBusy(lang);
    setError(null);
    setInfo(null);
    try {
      const d = drafts[lang];
      await api.adminUpsertTranslation(token, articleId, {
        language: lang,
        title: d.title,
        description: d.description || undefined,
        content: d.content,
      });
      setInfo(`${LANG_LABELS[lang]} saved`);
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (lang: Language) => {
    const token = getToken();
    if (!token) return;
    if (!confirm(`Delete ${LANG_LABELS[lang]} translation?`)) return;
    setBusy(lang);
    try {
      await api.adminDeleteTranslation(token, articleId, lang);
      setDrafts((prev) => ({
        ...prev,
        [lang]: { title: '', description: '', content: '' },
      }));
      refresh();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setBusy(null);
    }
  };

  const update = (lang: Language, field: keyof Draft, value: string) => {
    setDrafts((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  };

  return (
    <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-6">
      <h2 className="text-lg font-bold text-brand-900 mb-1">
        Translations
      </h2>
      <p className="text-xs text-ink-500 mb-4">
        Add the same article in Hindi and Punjabi. English is the base language above.
      </p>

      {error && (
        <div className="bg-accent-500/10 border border-accent-500/40 rounded p-2 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}
      {info && (
        <div className="bg-brand-50 border border-brand-500/40 rounded p-2 text-sm text-brand-700 mb-3">
          {info}
        </div>
      )}

      <div className="space-y-6">
        {LANGS.map((lang) => {
          const exists = items.find((t) => t.language === lang);
          const d = drafts[lang];
          return (
            <div
              key={lang}
              className="border border-ink-300/40 rounded-lg p-4 bg-surface-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink-900">
                  {LANG_LABELS[lang]} ({lang})
                  {exists && (
                    <span className="ml-2 text-[11px] uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                      Saved
                    </span>
                  )}
                </h3>
                {exists && (
                  <button
                    type="button"
                    onClick={() => remove(lang)}
                    disabled={busy === lang}
                    className="text-xs text-accent-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Title"
                  value={d.title}
                  onChange={(e) => update(lang, 'title', e.target.value)}
                  className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Short description"
                  rows={2}
                  value={d.description}
                  onChange={(e) => update(lang, 'description', e.target.value)}
                  className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
                />
                <textarea
                  placeholder="Content"
                  rows={8}
                  value={d.content}
                  onChange={(e) => update(lang, 'content', e.target.value)}
                  className="w-full border border-ink-300 rounded px-3 py-2 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => save(lang)}
                  disabled={
                    busy === lang ||
                    !d.title.trim() ||
                    !d.content.trim() ||
                    d.title.trim().length < 3 ||
                    d.content.trim().length < 10
                  }
                  className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white text-sm font-semibold px-4 py-1.5 rounded"
                >
                  {busy === lang
                    ? 'Saving...'
                    : exists
                      ? 'Update'
                      : 'Save translation'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
