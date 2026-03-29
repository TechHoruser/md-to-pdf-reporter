'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [isHydrated, setIsHydrated] = useState(false);

  const resolvedInitial = useMemo(() => initialValue, [initialValue]);
  const [storedValue, setStoredValue] = useState<T>(resolvedInitial);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? (JSON.parse(item) as T) : resolvedInitial);
    } catch {
      setStoredValue(resolvedInitial);
    } finally {
      setIsHydrated(true);
    }
  }, [key, resolvedInitial]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignore write errors so UI remains functional.
    }
  }, [isHydrated, key, storedValue]);

  return [storedValue, setStoredValue, isHydrated];
}
