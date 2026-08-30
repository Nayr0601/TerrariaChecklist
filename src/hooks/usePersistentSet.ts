import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

/** A set of string ids persisted to localStorage as a JSON array — used for
 * hidden items and the progression checklist (each keyed independently). */
export function usePersistentSet(storageKey: string) {
  const [ids, setIds] = useLocalStorage<string[]>(storageKey, []);
  const set = useMemo(() => new Set(ids), [ids]);

  const has = useCallback((id: string) => set.has(id), [set]);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setIds],
  );

  const add = useCallback(
    (id: string) => {
      setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [setIds],
  );

  const remove = useCallback(
    (id: string) => {
      setIds((prev) => prev.filter((x) => x !== id));
    },
    [setIds],
  );

  const clear = useCallback(() => setIds([]), [setIds]);

  return { ids: set, has, toggle, add, remove, clear, size: ids.length };
}
