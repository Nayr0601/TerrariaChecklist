import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic `localStorage`-backed state. Reads are best-effort (private
 * browsing, disabled storage, or a bad JSON blob from a previous version
 * all fall back to `initialValue` instead of throwing) and writes are
 * silently skipped if storage is unavailable — this app must keep working
 * without persistence, it just won't remember anything between reloads.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));
  const initialRef = useRef(initialValue);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full/unavailable — persistence is a nice-to-have, not required for the app to function.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === "function" ? (next as (prev: T) => T)(prev) : next));
  }, []);

  useEffect(() => {
    initialRef.current = initialValue;
  }, [initialValue]);

  return [value, set];
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
