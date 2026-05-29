'use client';

import dynamic from 'next/dynamic';
import { AdminShell } from '@/components/AdminShell';
import { useRequireAuth } from '@/components/AdminAuth';

const ArticleForm = dynamic(
  () => import('@/components/ArticleForm').then((m) => m.ArticleForm),
  {
    ssr: false,
    loading: () => (
      <div className="text-sm text-ink-500">Loading editor...</div>
    ),
  },
);

export default function NewArticlePage() {
  const ready = useRequireAuth();
  if (!ready) return null;
  return (
    <AdminShell>
      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900 mb-4 sm:mb-6">
        New Article
      </h1>
      <ArticleForm />
    </AdminShell>
  );
}
