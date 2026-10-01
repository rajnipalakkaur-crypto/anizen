import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Filter({ label, value, options, onChange }) {
  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
      <SelectTrigger className="h-10 rounded-full glass border-white/10 w-full sm:w-auto sm:min-w-[130px] text-sm" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="bg-card border-white/10">
        <SelectItem value="all">{label}: All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const opts = (arr) => arr.map((v) => ({ value: String(v), label: String(v) }));

export default function FilterBar({ params, set, genres, years }) {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
      <Filter label="Genre" value={params.genre} options={opts(genres)} onChange={(v) => set("genre", v)} />
      <Filter label="Year" value={params.year} options={opts(years)} onChange={(v) => set("year", v)} />
      <Filter label="Rating" value={params.rating} options={[9, 8, 7, 6].map((r) => ({ value: String(r), label: `${r}+ ★` }))} onChange={(v) => set("rating", v)} />
      <Filter label="Status" value={params.status} options={opts(["Ongoing", "Completed", "Upcoming"])} onChange={(v) => set("status", v)} />
      <Filter label="Type" value={params.type} options={opts(["TV", "Movie", "OVA", "ONA", "Special"])} onChange={(v) => set("type", v)} />
      <Filter label="Language" value={params.lang} options={[{ value: "sub", label: "Sub" }, { value: "dub", label: "Dub" }]} onChange={(v) => set("lang", v)} />
      <Filter label="Sort" value={params.sort} options={[{ value: "latest", label: "Latest" }, { value: "popular", label: "Popular" }, { value: "rating", label: "Top rated" }, { value: "title", label: "A–Z" }]} onChange={(v) => set("sort", v)} />
    </div>
  );
}