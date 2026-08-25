import { useCallback, useEffect, useState } from 'react';

/**
 * Everything the user creates lives in their browser. There are no accounts,
 * so a namespaced localStorage key per concern is the whole persistence layer.
 */
export const KEYS = {
  theme: 'mise.theme',
  favorites: 'mise.favorites',
  notes: 'mise.notes',
  pantry: 'mise.pantry',
  shoppingList: 'mise.shoppingList',
  mealPlan: 'mise.mealPlan',
  myRecipes: 'mise.myRecipes',
  cookProgress: 'mise.cookProgress',
  units: 'mise.units',
  recentSearches: 'mise.recentSearches',
};

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    // Private mode, disabled storage, or a value written by an older version.
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Notify other hooks in this same tab; the native event is cross-tab only.
    window.dispatchEvent(new CustomEvent('mise:storage', { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

/**
 * localStorage-backed state that stays in sync across every component using the
 * same key, and across browser tabs.
 */
export function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => readStorage(key, fallback));

  useEffect(() => {
    const resync = (event) => {
      const changed = event.detail?.key ?? event.key;
      if (changed === key || changed === undefined) {
        setValue(readStorage(key, fallback));
      }
    };
    window.addEventListener('mise:storage', resync);
    window.addEventListener('storage', resync);
    return () => {
      window.removeEventListener('mise:storage', resync);
      window.removeEventListener('storage', resync);
    };
    // `fallback` is intentionally not a dependency: callers pass a fresh
    // literal on every render, which would restart the effect forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, update];
}

/** Toggles membership of an id in a persisted array. */
export function useIdSet(key) {
  const [ids, setIds] = usePersistentState(key, []);

  const toggle = useCallback(
    (id) =>
      setIds((current) =>
        current.includes(id)
          ? current.filter((entry) => entry !== id)
          : [...current, id]
      ),
    [setIds]
  );

  const has = useCallback((id) => ids.includes(id), [ids]);

  return { ids, setIds, toggle, has };
}

/** Bundles every user-owned key so the settings page can export or wipe it. */
export function exportUserData() {
  const payload = { exportedAt: new Date().toISOString(), version: 2, data: {} };
  for (const [name, key] of Object.entries(KEYS)) {
    payload.data[name] = readStorage(key, null);
  }
  return payload;
}

export function importUserData(payload) {
  if (!payload || typeof payload.data !== 'object') {
    throw new Error('That file is not a Mise backup.');
  }
  for (const [name, key] of Object.entries(KEYS)) {
    if (payload.data[name] !== undefined && payload.data[name] !== null) {
      writeStorage(key, payload.data[name]);
    }
  }
}

export function clearUserData() {
  for (const key of Object.values(KEYS)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing we can do if storage is unavailable */
    }
  }
  window.dispatchEvent(new CustomEvent('mise:storage', { detail: {} }));
}
