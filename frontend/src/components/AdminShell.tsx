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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="bg-white rounded-lg border border-ink-300/40 shadow-card p-4 h-max">
          <div className="text-xs uppercase tracking-widest text-ink-500 mb-2">
            Manager
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.href === bestMatch;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded text-sm font-medium transition ${
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
              className="mt-3 text-left px-3 py-2 rounded text-sm font-medium text-accent-600 hover:bg-accent-500/10"
            >
              Logout
            </button>
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
