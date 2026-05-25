'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { getToken, useRequireAuth } from '@/components/AdminAuth';
import { Article } from '@/lib/types';

const ArticleForm = dynamic(
  () => import('@/components/ArticleForm').then((m) => m.ArticleForm),
  {
    ssr: false,
    loading: () => (
      <div className="text-sm text-ink-500">Loading editor...</div>
    ),
  },
);
const TranslationsManager = dynamic(
  () =>
    import('@/components/TranslationsManager').then(
      (m) => m.TranslationsManager,
    ),
  { ssr: false },
);
const ImagesManager = dynamic(
  () => import('@/components/ImagesManager').then((m) => m.ImagesManager),
  { ssr: false },
);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const ready = useRequireAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/articles/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        return res.json();
      })
      .then(setArticle)
      .catch((err) => setError(err.message));
  }, [ready, params.id]);

  if (!ready) return null;

  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold text-brand-900 mb-6">
        Edit Article
      </h1>
      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}
      {!article && !error && (
        <div className="text-sm text-ink-500">Loading...</div>
      )}
      {article && (
        <div className="space-y-6">
          <ArticleForm initial={article} />
          <TranslationsManager articleId={article.id} />
          <ImagesManager articleId={article.id} />
        </div>
      )}
    </AdminShell>
  );
}
