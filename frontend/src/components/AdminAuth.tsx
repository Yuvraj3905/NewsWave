'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function useRequireAuth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin');
    } else {
      setReady(true);
    }
  }, [router]);

  return ready;
}
