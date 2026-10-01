import React from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
            Your Anime Universe. AniZen only streams titles the site owner has the rights to distribute or that are legally available.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">Explore</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/browse" className="hover:text-white">Browse</Link></li>
            <li><Link to="/genres" className="hover:text-white">Genres</Link></li>
            <li><Link to="/schedule" className="hover:text-white">Schedule</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">You</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/my-list" className="hover:text-white">My List</Link></li>
            <li><Link to="/browse?sort=latest" className="hover:text-white">Latest</Link></li>
            <li><Link to="/browse?sort=popular" className="hover:text-white">Popular</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-2 justify-between text-xs text-white/40">
          <span>AniZen — Anime Universe</span>
          <span>Developed by Balvir Coder ❤️👑</span>
        </div>
      </div>
    </footer>
  );
}