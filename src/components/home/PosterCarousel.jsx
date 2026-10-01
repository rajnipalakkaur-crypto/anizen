import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import { episodeUrl } from "@/lib/anime";

export default function PosterCarousel({ items, loading }) {
  const [i, setI] = useState(0);
  const count = items?.length || 0;

  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 md:pt-32">
        <div className="skeleton rounded-3xl h-[300px] md:h-[430px]" />
      </div>
    );
  }
  if (!count) return <div className="h-24" />;

  const cur = i % count;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 md:pt-32">
      <div className="relative overflow-hidden py-6 md:py-10 scene-3d [--pw:152px] [--gap:12px] sm:[--pw:200px] sm:[--gap:18px] md:[--pw:236px] md:[--gap:24px]">
        <span aria-hidden className="orb w-64 h-64 bg-primary/30 -top-16 left-[10%]" />
        <span aria-hidden className="orb w-56 h-56 bg-accent/20 -bottom-20 right-[8%]" />
        <div
          className="flex items-center justify-center preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ gap: "var(--gap)", transform: `translateX(calc(${(count - 1) / 2 - cur} * (var(--pw) + var(--gap))))` }}
        >
          {items.map((it, idx) => {
            const active = idx === cur;
            return (
              <div
                key={it.id}
                style={{
                  width: "var(--pw)",
                  transform: `rotateY(${Math.max(-2.5, Math.min(2.5, idx - cur)) * 15}deg) translateZ(${active ? 70 : -30}px) scale(${active ? 1.1 : 0.92})`,
                }}
                className={`relative shrink-0 aspect-[2/3] rounded-2xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${active ? "z-10 poster-glow glow-pulse" : "opacity-40 hover:opacity-70"}`}
              >
                {active ? (
                  <Link to={`/anime/${it.slug}`} className="block relative w-full h-full" aria-label={it.title}>
                    <Image src={it.poster_url || it.banner_url} alt={it.title} className="w-full h-full" />
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 h-7 px-3 inline-flex items-center rounded-full bg-primary text-[10px] font-semibold uppercase tracking-[0.18em] text-white whitespace-nowrap">
                      {it.type || "Anime"}
                    </span>
                  </Link>
                ) : (
                  <button onClick={() => setI(idx)} aria-label={`Show ${it.title}`} className="block w-full h-full">
                    <Image src={it.poster_url || it.banner_url} alt={it.title} className="w-full h-full" />
                  </button>
                )}

                {active && (
                  <>
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
                    <Link
                      to={episodeUrl(it.slug, 1)}
                      className="absolute left-1/2 -translate-x-1/2 bottom-[14%] inline-flex items-center gap-2 h-10 md:h-11 px-5 md:px-6 rounded-full bg-primary text-white text-sm font-semibold whitespace-nowrap transition-all duration-300 hover:brightness-110 active:scale-[0.98] glow"
                    >
                      <Play className="w-4 h-4 fill-white" /> Watch
                    </Link>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
          {items.map((it, idx) => (
            <button
              key={it.id}
              onClick={() => setI(idx)}
              aria-label={`Show ${it.title}`}
              className={`h-2 rounded-full transition-all duration-500 ${idx === cur ? "w-7 bg-primary" : "w-2 bg-white/25 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}