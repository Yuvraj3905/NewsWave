'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setToken } from '@/components/AdminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(username, password);
      setToken(data.access_token);
      router.replace('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-lg border border-ink-300/40 shadow-card p-8">
        <h1 className="text-2xl font-extrabold text-brand-900">
          Manager Login
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Sign in to access the NewsWave dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Username
            </label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="text-sm text-accent-600">{error}</p>}
        </form>
      </div>
    </div>
  );
}
