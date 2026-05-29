'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from './AdminAuth';

const NAV = [
  { href: '/admin/dashboard', label: 'Overview' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/articles/new', label: 'New Article' },
  { href: '/admin/subscribers', label: 'Subscribers' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace('/admin');
  }

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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-3 py-2 rounded text-sm font-medium transition ${
                    active
                      ? 'bg-brand-700 text-white'
                      : 'text-ink-700 hover:bg-surface-100'
                  }`}
                >
                  {item.label}
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
