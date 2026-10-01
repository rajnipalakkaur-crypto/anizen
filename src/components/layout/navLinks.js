export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Browse", to: "/browse" },
  { label: "Genres", to: "/genres" },
  { label: "Latest", to: "/browse?sort=latest" },
  { label: "Popular", to: "/browse?sort=popular" },
  { label: "Schedule", to: "/schedule" },
  { label: "Party", to: "/party" },
];

export function isActiveLink(link, location) {
  const [path, query] = link.to.split("?");
  if (path !== location.pathname) return false;
  const sort = new URLSearchParams(location.search).get("sort");
  if (query) return query === `sort=${sort}`;
  return path !== "/browse" || !sort || !["latest", "popular"].includes(sort);
}