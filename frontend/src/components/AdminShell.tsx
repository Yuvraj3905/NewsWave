'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken, getToken } from './AdminAuth';
import { api } from '@/lib/api';

const NAV = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/articles/new', label: 'New Article' },
  { href: '/admin/ads', label: 'Ads' },
  { href: '/admin/subscribers', label: 'Subscribers' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  function logout() {
    clearToken();
    router.replace('/admin');
  }

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    let cancelled = false;
    api
      .adminSubscriberCount(token)
      .then((c) => {
        if (!cancelled) setPendingCount(c?.pending ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const bestMatch = NAV.map((n) => n.href)
    .filter((h) => pathname === h || pathname.startsWith(h + '/'))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
      <div className="grid gap-3 sm:gap-6 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="bg-white rounded-lg border border-ink-300/40 shadow-card p-2 sm:p-4 h-max md:sticky md:top-4">
          <div className="hidden md:block text-xs uppercase tracking-widest text-ink-500 mb-2">
            Manager
          </div>
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
            {NAV.map((item) => {
              const active = item.href === bestMatch;
              const isSubs = item.href === '/admin/subscribers';
              const showBadge =
                isSubs && pendingCount !== null && pendingCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-brand-700 text-white'
                      : 'text-ink-700 hover:bg-surface-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {showBadge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                      aria-label={`${pendingCount} pending`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="whitespace-nowrap md:mt-3 text-left px-3 py-2 rounded text-sm font-medium text-accent-600 hover:bg-accent-500/10"
            >
              Logout
            </button>
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
