'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ManagerRole } from '@/lib/types';

const TOKEN_KEY = 'newswave:admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export interface AdminIdentity {
  id: string;
  username: string;
  role: ManagerRole;
}

// Decodes the JWT payload for UI gating only. The backend RolesGuard is the
// real enforcement — a tampered token just fails server-side.
export function getIdentity(): AdminIdentity | null {
  const token = getToken();
  if (!token) return null;
  try {
    const seg = token.split('.')[1];
    const b64 = seg.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    return { id: payload.sub, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export function getRole(): ManagerRole | null {
  return getIdentity()?.role ?? null;
}

// Pass allowedRoles to also gate by role (redirects to dashboard if the role
// isn't permitted). No arg = any authenticated manager.
export function useRequireAuth(allowedRoles?: ManagerRole[]) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const identity = getIdentity();
    if (!identity) {
      router.replace('/admin');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(identity.role)) {
      router.replace('/admin/dashboard');
      return;
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return ready;
}
