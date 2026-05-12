'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useNewsFilter } from './LocationContext';
import { LANG_LABELS, LANG_OPTIONS, useLanguage } from './LanguageContext';
import { api } from '@/lib/api';
import { Category, Language, Location } from '@/lib/types';

const FALLBACK_LOCATIONS = [
  'Punjab',
  'Haryana',
  'Chandigarh',
  'National',
  'International',
];

const FALLBACK_CATEGORIES = [
  'Sports',
  'Business',
  'Health',
  'Automobile',
  'Politics',
  'Crime',
  'Entertainment',
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function Header() {
  const { location, category, search, setLocation, setCategory, setSearch } = useNewsFilter();
  const { language, setLanguage } = useLanguage();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    api
      .listLocations()
      .then(setLocations)
      .catch(() =>
        setLocations(
          FALLBACK_LOCATIONS.map((n, i) => ({
            id: `fb-${i}`,
            name: n,
            slug: slugify(n),
          })),
        ),
      );
    api
      .listCategories()
      .then(setCategories)
      .catch(() =>
        setCategories(
          FALLBACK_CATEGORIES.map((n, i) => ({
            id: `fb-${i}`,
            name: n,
            slug: slugify(n),
          })),
        ),
      );
  }, []);

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm">
      <div className="bg-navy-900 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-navy-200">Follow Us:</span>
            <SocialRow />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent border border-navy-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Choose language"
            >
              {LANG_OPTIONS.map((l) => (
                <option
                  key={l}
                  value={l}
                  className="text-navy-900"
                >
                  {LANG_LABELS[l]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            className="lg:hidden p-2 -ml-2 text-navy-900"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="leading-none">
              <div className="font-extrabold text-2xl md:text-3xl tracking-tight">
                <span className="text-navy-900">News</span>
                <span className="text-brand-500">Wave</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-navy-500 mt-0.5">
                Your Region. Your News.
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold flex-1 justify-center">
            <NavBtn
              active={category === ''}
              onClick={() => setCategory('')}
              label="Home"
            />
            {categories.slice(0, 6).map((c) => (
              <NavBtn
                key={c.id}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
                label={c.name}
              />
            ))}
            {categories.length > 6 && (
              <div className="relative group">
                <button className="px-3 py-2 text-navy-700 hover:text-brand-600 transition flex items-center gap-1">
                  More
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-navy-100 shadow-lg rounded-md py-2 min-w-[160px] hidden group-hover:block z-50">
                  {categories.slice(6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.slug)}
                      className="block w-full text-left px-4 py-1.5 text-sm text-navy-700 hover:bg-surface-100 hover:text-brand-600"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="p-2 text-navy-700 hover:text-brand-600"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="hidden md:block border border-navy-200 rounded px-2 py-1.5 text-xs text-navy-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </select>
            <Link
              href="/subscribe"
              className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-4 py-2 rounded transition shadow-sm"
            >
              Subscribe
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-navy-100 bg-surface-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news..."
                className="flex-1 border border-navy-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-xs text-navy-500 hover:text-brand-500 px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden border-t border-navy-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="md:hidden w-full border border-navy-200 rounded px-2 py-2 text-sm bg-white"
                aria-label="Location"
              >
                <option value="">All Locations</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCategory('');
                    setMobileOpen(false);
                  }}
                  className={`px-3 py-2 rounded text-sm font-semibold ${
                    category === ''
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-100 text-navy-700'
                  }`}
                >
                  Home
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategory(c.slug);
                      setMobileOpen(false);
                    }}
                    className={`px-3 py-2 rounded text-sm font-semibold ${
                      category === c.slug
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-100 text-navy-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 transition relative ${
        active
          ? 'text-brand-500'
          : 'text-navy-800 hover:text-brand-500'
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full" />
      )}
    </button>
  );
}

function SocialRow() {
  return (
    <div className="flex items-center gap-2 text-white">
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="hover:text-brand-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07C2 17.1 5.66 21.27 10.44 22v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22C18.34 21.27 22 17.1 22 12.07z" />
        </svg>
      </a>
      <a
        href="https://x.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X / Twitter"
        className="hover:text-brand-300"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.86l-5.37-6.97L4 22H.74l8.03-9.18L1.5 2h7.04l4.86 6.42L18.244 2z" />
        </svg>
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="hover:text-brand-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
        </svg>
      </a>
      <a
        href="https://youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="hover:text-brand-300"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.8.5-5.8.5-5.8s0-4-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
        </svg>
      </a>
    </div>
  );
}
