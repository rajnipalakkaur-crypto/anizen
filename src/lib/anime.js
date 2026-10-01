export const animeUrl = (a) => `/anime/${a.slug}`;
export const episodeUrl = (slug, n) => `/anime/${slug}/episode-${n}`;

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatTime(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

export function formatDuration(s) {
  if (!s) return "";
  const m = Math.round(s / 60);
  return m ? `${m} min` : `${Math.round(s)} sec`;
}

export function matchesQuery(a, q) {
  const t = (q || "").trim().toLowerCase();
  if (!t) return true;
  return [a.title, a.alt_title, a.studio, ...(a.genres || [])].some((v) => v && v.toLowerCase().includes(t));
}

export function allGenres(list) {
  const m = {};
  list.forEach((a) => (a.genres || []).forEach((g) => (m[g] = (m[g] || 0) + 1)));
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function isSafeUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}