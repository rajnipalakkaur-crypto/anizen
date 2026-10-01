import React from "react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="AniZen home">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center font-display text-sm font-bold text-white shadow-[0_0_24px_hsl(var(--primary)/0.55)]">
        A
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Ani<span className="text-gradient">Zen</span>
      </span>
    </Link>
  );
}