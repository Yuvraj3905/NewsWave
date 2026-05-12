'use client';

import { AdminShell } from '@/components/AdminShell';
import { ArticleForm } from '@/components/ArticleForm';
import { useRequireAuth } from '@/components/AdminAuth';

export default function NewArticlePage() {
  const ready = useRequireAuth();
  if (!ready) return null;
  return (
    <AdminShell>
      <h1 className="text-2xl font-extrabold text-brand-900 mb-6">
        New Article
      </h1>
      <ArticleForm />
    </AdminShell>
  );
}
