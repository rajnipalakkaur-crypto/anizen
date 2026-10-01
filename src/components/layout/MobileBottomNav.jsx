import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Search, CalendarDays, Bookmark } from "lucide-react";

const ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Browse", to: "/browse", icon: Compass },
  { label: "Search", icon: Search, search: true },
  { label: "Schedule", to: "/schedule", icon: CalendarDays },
  { label: "My List", to: "/my-list", icon: Bookmark },
];

export default function MobileBottomNav({ onSearch }) {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass !border-x-0 !border-b-0 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5 h-16">
        {ITEMS.map(({ label, to, icon: Icon, search }) => {
          const active = !search && pathname === to;
          const cls = `h-full w-full flex flex-col items-center justify-center gap-1 text-[10px] transition-colors ${active ? "text-white" : "text-white/50"}`;
          const inner = (
            <>
              <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
              {label}
            </>
          );
          return (
            <li key={label}>
              {search ? (
                <button onClick={onSearch} className={cls}>{inner}</button>
              ) : (
                <Link to={to} className={cls}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}