'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export function NewsletterCard() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState('loading');
    try {
      await api.subscribe(email);
      setState('ok');
      setEmail('');
    } catch {
      setState('err');
    }
  }

  return (
    <section className="bg-white border border-navy-100 rounded-lg shadow-card p-5 dark:bg-navy-800 dark:border-navy-700">
      <h3 className="font-bold text-navy-900 uppercase text-sm tracking-wider mb-1 dark:text-white">
        Stay Updated
      </h3>
      <p className="text-xs text-navy-500 mb-4 dark:text-navy-300">
        Get the latest news updates in your inbox.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full min-w-0 border border-navy-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-navy-700 dark:border-navy-600 dark:text-navy-50 dark:placeholder:text-navy-400"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded transition"
        >
          {state === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {state === 'ok' && (
        <p className="text-xs text-green-600 mt-2">
          Submitted. Awaiting editor approval.
        </p>
      )}
      {state === 'err' && (
        <p className="text-xs text-brand-500 mt-2">Could not subscribe. Try again.</p>
      )}
      <p className="text-[11px] text-navy-400 mt-3 dark:text-navy-400">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </section>
  );
}
