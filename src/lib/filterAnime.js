import { matchesQuery } from "./anime";

export function filterAnime(list, p) {
  let out = list.filter(
    (a) =>
      matchesQuery(a, p.q) &&
      (!p.genre || (a.genres || []).includes(p.genre)) &&
      (!p.year || String(a.release_year) === p.year) &&
      (!p.rating || (a.rating || 0) >= Number(p.rating)) &&
      (!p.status || a.status === p.status) &&
      (!p.type || a.type === p.type) &&
      (!p.lang || (p.lang === "dub" ? a.has_dub : a.has_sub))
  );
  const sorters = {
    popular: (a, b) => (b.views || 0) - (a.views || 0),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    title: (a, b) => a.title.localeCompare(b.title),
  };
  if (sorters[p.sort]) out = [...out].sort(sorters[p.sort]);
  return out;
}