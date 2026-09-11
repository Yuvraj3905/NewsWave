'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/AdminShell';
import { getIdentity, getToken, useRequireAuth } from '@/components/AdminAuth';
import { api } from '@/lib/api';
import { Manager, ManagerRole } from '@/lib/types';
import { formatIST } from '@/lib/format';

const ROLES: ManagerRole[] = ['superadmin', 'admin', 'editor'];
const ROLE_HINT: Record<ManagerRole, string> = {
  superadmin: 'Full access, incl. user management',
  admin: 'Content + subscribers, no user management',
  editor: 'Create/edit articles only',
};

export default function AdminUsersPage() {
  const ready = useRequireAuth(['superadmin']);
  const meId = getIdentity()?.id;
  const [items, setItems] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ManagerRole>('editor');
  const [creating, setCreating] = useState(false);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await api.adminListManagers(token));
    } catch (err: any) {
      setError(err?.message || 'Failed to load managers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setCreating(true);
    setError(null);
    try {
      await api.adminCreateManager(token, { username, password, role });
      setUsername('');
      setPassword('');
      setRole('editor');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  async function onChangeRole(id: string, newRole: ManagerRole) {
    const token = getToken();
    if (!token) return;
    try {
      await api.adminUpdateManager(token, id, { role: newRole });
      setItems((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)),
      );
    } catch (err: any) {
      alert(err?.message || 'Update failed');
      load();
    }
  }

  async function onResetPassword(id: string, username: string) {
    const token = getToken();
    if (!token) return;
    const pw = prompt(`New password for ${username} (min 6 chars):`);
    if (!pw) return;
    if (pw.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await api.adminUpdateManager(token, id, { password: pw });
      alert('Password updated');
    } catch (err: any) {
      alert(err?.message || 'Update failed');
    }
  }

  async function onDelete(id: string, username: string) {
    if (!confirm(`Delete manager "${username}"? This cannot be undone.`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await api.adminDeleteManager(token, id);
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Delete failed');
    }
  }

  if (!ready) return null;

  return (
    <AdminShell>
      <h1 className="text-xl sm:text-2xl font-extrabold text-brand-900 mb-6">
        Users &amp; Roles
      </h1>

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card p-3 sm:p-6 mb-6">
        <h2 className="font-bold text-ink-900 text-sm mb-3">Add Manager</h2>
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-4 items-end">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Username
            </label>
            <input
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Password
            </label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 text-sm"
              autoComplete="new-password"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ManagerRole)}
              className="w-full border border-ink-300 rounded px-3 py-2 text-sm bg-white"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded text-sm"
          >
            {creating ? 'Adding...' : 'Add Manager'}
          </button>
        </form>
        <p className="text-[11px] text-ink-500 mt-2">{ROLE_HINT[role]}</p>
      </div>

      {error && (
        <div className="bg-white border border-accent-500/40 rounded p-3 text-sm text-accent-600 mb-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-ink-300/40 rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-surface-100 text-ink-700 text-left">
            <tr>
              <th className="px-3 py-2.5">Username</th>
              <th className="px-3 py-2.5">Role</th>
              <th className="px-3 py-2.5">Created</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-500">
                  No managers.
                </td>
              </tr>
            )}
            {items.map((m) => {
              const isSelf = m.id === meId;
              return (
                <tr
                  key={m.id}
                  className="border-t border-ink-300/40 hover:bg-surface-50"
                >
                  <td className="px-3 py-3 font-semibold text-ink-900">
                    {m.username}
                    {isSelf && (
                      <span className="ml-2 text-[10px] text-ink-500">(you)</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={m.role}
                      onChange={(e) =>
                        onChangeRole(m.id, e.target.value as ManagerRole)
                      }
                      className="border border-ink-300 rounded px-2 py-1 text-xs bg-white"
                      aria-label={`Role for ${m.username}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-ink-500 text-xs whitespace-nowrap">
                    {formatIST(m.created_at)}
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onResetPassword(m.id, m.username)}
                      className="text-brand-700 hover:underline text-xs font-semibold mr-3"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => onDelete(m.id, m.username)}
                      disabled={isSelf}
                      className="text-accent-600 hover:underline disabled:opacity-40 disabled:no-underline text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
