import React from "react";
import { Link } from "react-router-dom";

const TINTS = [
  "from-violet-500/30 to-fuchsia-500/10",
  "from-cyan-400/30 to-blue-500/10",
  "from-rose-500/30 to-orange-400/10",
  "from-emerald-400/25 to-teal-500/10",
  "from-amber-400/25 to-rose-500/10",
  "from-indigo-500/30 to-violet-400/10",
];

export default function GenreGrid({ genres }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {genres.map((g, i) => (
        <Link key={g.name} to={`/browse?genre=${encodeURIComponent(g.name)}`} className={`group relative overflow-hidden rounded-2xl p-5 h-28 glass bg-gradient-to-br ${TINTS[i % TINTS.length]} hover:-translate-y-0.5 transition-all duration-300`}>
          <p className="font-display text-base font-semibold">{g.name}</p>
          <p className="text-xs text-white/50 mt-1">{g.count} {g.count === 1 ? "title" : "titles"}</p>
          <span className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />
        </Link>
      ))}
    </div>
  );
}