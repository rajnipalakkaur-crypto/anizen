import { useEffect } from "react";

const DEFAULT_DESC = "AniZen — Your Anime Universe. Stream anime in a cinematic, beautifully crafted experience.";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function usePageMeta({ title, description, image } = {}) {
  useEffect(() => {
    const full = title ? `${title} · AniZen` : "AniZen — Your Anime Universe";
    const desc = description ? description.slice(0, 160) : DEFAULT_DESC;
    document.title = full;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:card", "summary_large_image");
  }, [title, description, image]);
}