'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

type StorageState<T> = {
  value: T;
  hydrated: boolean;
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const resolvedInitial = useMemo(() => initialValue, [initialValue]);
  const [state, setState] = useState<StorageState<T>>({
    value: resolvedInitial,
    hydrated: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      const nextValue = item ? (JSON.parse(item) as T) : resolvedInitial;
      setState({
        value: nextValue,
        hydrated: true
      });
    } catch {
      setState({
        value: resolvedInitial,
        hydrated: true
      });
    }
  }, [key, resolvedInitial]);

  useEffect(() => {
    if (!state.hydrated || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(state.value));
    } catch {
      // Ignore write errors so UI remains functional.
    }
  }, [key, state.hydrated, state.value]);

  const setStoredValue: Dispatch<SetStateAction<T>> = (nextValue) => {
    setState((current) => ({
      value:
        typeof nextValue === 'function'
          ? (nextValue as (previous: T) => T)(current.value)
          : nextValue,
      hydrated: current.hydrated
    }));
  };

  return [state.value, setStoredValue, state.hydrated];
}
