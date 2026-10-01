import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Film, Clapperboard, Server, ArrowLeft, LogOut } from "lucide-react";
import Logo from "@/components/common/Logo";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/anime", label: "Anime", icon: Film },
  { to: "/admin/episodes", label: "Episodes", icon: Clapperboard },
  { to: "/admin/servers", label: "Video Servers", icon: Server },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/5 glass md:bg-card/40 flex flex-col">
        <div className="p-5"><Logo /></div>
        <nav className="px-3 flex-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-1 transition-colors ${active ? "bg-primary/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white"><ArrowLeft className="w-4 h-4" /> Back to site</Link>
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white"><LogOut className="w-4 h-4" /> Logout</button>
          <p className="px-4 pt-2 text-[11px] text-white/30 truncate">{user?.email}</p>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}