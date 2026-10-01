import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, Bookmark, Shield } from "lucide-react";
import Logo from "@/components/common/Logo";
import MobileMenu from "./MobileMenu";
import AccountMenu from "./AccountMenu";
import { NAV_LINKS, isActiveLink } from "./navLinks";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar({ onSearch }) {
  const location = useLocation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "glass !border-x-0 !border-t-0" : "bg-gradient-to-b from-black/70 to-transparent"}`}>
      <nav className="max-w-[1400px] mx-auto h-16 md:h-20 px-4 md:px-8 flex items-center gap-6">
        <button onClick={() => setMenuOpen(true)} className="lg:hidden w-10 h-10 -ml-2 grid place-items-center rounded-full hover:bg-white/10" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <Logo />
        <ul className="hidden lg:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link to={l.to} className={`px-4 py-2 rounded-full text-sm transition-colors ${isActiveLink(l, location) ? "text-white bg-white/10" : "text-white/60 hover:text-white"}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onSearch} className="h-10 md:w-56 w-10 flex items-center gap-3 md:px-4 justify-center md:justify-start rounded-full glass text-white/60 hover:text-white transition-colors" aria-label="Search">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline text-sm">Search anime…</span>
            <kbd className="hidden md:inline ml-auto text-[10px] text-white/40 border border-white/10 rounded px-1.5">/</kbd>
          </button>
          <Link to="/my-list" className="hidden md:flex h-10 px-4 items-center gap-2 rounded-full bg-primary/15 text-sm text-white hover:bg-primary/25 transition-colors">
            <Bookmark className="w-4 h-4" /> My List
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="hidden md:flex h-10 px-4 items-center gap-2 rounded-full bg-white/5 text-sm text-white hover:bg-white/10 transition-colors">
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
          <AccountMenu />
        </div>
      </nav>
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}