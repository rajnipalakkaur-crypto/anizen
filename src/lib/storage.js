import { useSyncExternalStore } from "react";

const listeners = new Set();
const cache = {};

export const KEYS = {
  watchlist: "anizen:watchlist",
  history: "anizen:history",
  recent: "anizen:recent",
  prefs: "anizen:prefs",
};

export const DEFAULTS = {
  [KEYS.watchlist]: [],
  [KEYS.history]: {},
  [KEYS.recent]: [],
  [KEYS.prefs]: { autoNext: true, volume: 1, rate: 1 },
};

function read(key) {
  if (!(key in cache)) {
    try {
      cache[key] = JSON.parse(localStorage.getItem(key)) ?? DEFAULTS[key];
    } catch {
      cache[key] = DEFAULTS[key];
    }
  }
  return cache[key];
}

function write(key, value) {
  cache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStored(key) {
  return useSyncExternalStore(subscribe, () => read(key));
}

export function toggleWatchlist(animeId) {
  const list = read(KEYS.watchlist);
  const next = list.includes(animeId) ? list.filter((id) => id !== animeId) : [animeId, ...list];
  write(KEYS.watchlist, next);
  return next.includes(animeId);
}

export function saveProgress(episodeId, entry) {
  const h = read(KEYS.history);
  write(KEYS.history, { ...h, [episodeId]: { ...h[episodeId], ...entry, updated_at: Date.now() } });
}

export function removeHistory(episodeId) {
  const h = { ...read(KEYS.history) };
  delete h[episodeId];
  write(KEYS.history, h);
}

export function clearHistory() {
  write(KEYS.history, {});
}

export function addRecentSearch(q) {
  const t = q.trim();
  if (!t) return;
  write(KEYS.recent, [t, ...read(KEYS.recent).filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 8));
}

export function clearRecentSearches() {
  write(KEYS.recent, []);
}

export function setPref(patch) {
  write(KEYS.prefs, { ...read(KEYS.prefs), ...patch });
}