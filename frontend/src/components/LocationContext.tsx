'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface LocationContextValue {
  location: string;
  category: string;
  search: string;
  setLocation: (loc: string) => void;
  setCategory: (cat: string) => void;
  setSearch: (q: string) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined,
);

const LOC_KEY = 'newswave:location';
const CAT_KEY = 'newswave:category';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<string>('');
  const [category, setCategoryState] = useState<string>('');
  const [search, setSearchState] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setLocationState(localStorage.getItem(LOC_KEY) || '');
    setCategoryState(localStorage.getItem(CAT_KEY) || '');
  }, []);

  const setLocation = useCallback((loc: string) => {
    setLocationState(loc);
    if (typeof window !== 'undefined') {
      if (loc) localStorage.setItem(LOC_KEY, loc);
      else localStorage.removeItem(LOC_KEY);
    }
  }, []);

  const setCategory = useCallback((cat: string) => {
    setCategoryState(cat);
    if (typeof window !== 'undefined') {
      if (cat) localStorage.setItem(CAT_KEY, cat);
      else localStorage.removeItem(CAT_KEY);
    }
  }, []);

  const setSearch = useCallback((q: string) => setSearchState(q), []);

  return (
    <LocationContext.Provider
      value={{ location, category, search, setLocation, setCategory, setSearch }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useNewsFilter() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useNewsFilter must be used inside LocationProvider');
  return ctx;
}
