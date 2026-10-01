import React from "react";
import AnimeCard from "@/components/anime/AnimeCard";
import CardSkeleton from "@/components/anime/CardSkeleton";
import Section from "./Section";

const ITEM = "w-[42vw] sm:w-[200px] lg:w-[210px] shrink-0 snap-start";

export default function AnimeRow({ title, subtitle, items, loading, viewAll }) {
  if (!loading && !items?.length) return null;
  return (
    <Section title={title} subtitle={subtitle} viewAll={viewAll}>
      <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} className={ITEM} />)
          : items.map((a) => <AnimeCard key={a.id} anime={a} className={ITEM} />)}
      </div>
    </Section>
  );
}