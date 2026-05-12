'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function SubscribePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>(
    'idle',
  );
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await api.subscribe(email, name || undefined);
      setStatus('ok');
      setMessage('Subscribed. Watch your inbox for updates.');
      setEmail('');
      setName('');
    } catch (err: any) {
      setStatus('err');
      setMessage(err?.message || 'Subscription failed');
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg border border-ink-300/40 shadow-card p-8">
        <h1 className="text-2xl font-extrabold text-brand-900">
          Subscribe to NewsWave
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Get the latest regional and national headlines delivered to your inbox.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded transition"
          >
            {status === 'loading' ? 'Submitting...' : 'Subscribe'}
          </button>
          {message && (
            <p
              className={`text-sm ${
                status === 'ok' ? 'text-green-600' : 'text-accent-600'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
