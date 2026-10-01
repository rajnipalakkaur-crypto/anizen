import React, { useState } from "react";
import { CalendarX } from "lucide-react";
import AnimeCard from "@/components/anime/AnimeCard";
import CardSkeleton from "@/components/anime/CardSkeleton";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useAnimeList } from "@/lib/queries";
import { WEEKDAYS } from "@/lib/anime";
import usePageMeta from "@/hooks/usePageMeta";

const today = WEEKDAYS[(new Date().getDay() + 6) % 7];

export default function Schedule() {
  usePageMeta({ title: "Schedule", description: "Weekly anime release schedule on AniZen." });
  const [day, setDay] = useState(today);
  const { data: list = [], isLoading, isError, refetch } = useAnimeList();
  const items = list.filter((a) => a.status !== "Completed" && a.airing_day === day);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 md:pt-32">
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">Weekly Schedule</h1>
      <p className="text-white/45 mt-2 text-sm">New episodes, every day of the week.</p>
      <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {WEEKDAYS.map((d) => (
          <button key={d} onClick={() => setDay(d)} className={`shrink-0 h-11 px-5 rounded-full text-sm transition-all ${d === day ? "bg-primary text-white glow" : "glass text-white/60 hover:text-white"}`}>
            {d.slice(0, 3)}{d === today && <span className="ml-1.5 text-[10px] opacity-70">Today</span>}
          </button>
        ))}
      </div>
      <div className="mt-10">
        {isError ? <ErrorState onRetry={refetch} /> : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {items.map((a) => <AnimeCard key={a.id} anime={a} />)}
          </div>
        ) : (
          <EmptyState icon={CalendarX} title={`Nothing airing on ${day}`} text="Check another day of the week." />
        )}
      </div>
    </div>
  );
}