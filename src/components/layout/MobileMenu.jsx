import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Logo from "@/components/common/Logo";
import { NAV_LINKS, isActiveLink } from "./navLinks";
import { useAuth } from "@/lib/AuthContext";
import { Shield, LogIn, LogOut } from "lucide-react";

export default function MobileMenu({ open, onOpenChange }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const links = [...NAV_LINKS, { label: "My List", to: "/my-list" }, ...(user?.role === "admin" ? [{ label: "Admin", to: "/admin", icon: Shield }] : [])];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-background/95 backdrop-blur-xl border-white/10 w-[280px]">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="mb-10" onClick={() => onOpenChange(false)}>
          <Logo />
        </div>
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                onClick={() => onOpenChange(false)}
                className={`block px-4 py-3 rounded-xl text-base transition-colors ${isActiveLink(l, location) ? "bg-primary/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-white/10">
          {user ? (
            <button onClick={() => { onOpenChange(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          ) : (
            <Link to="/login" onClick={() => onOpenChange(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors">
              <LogIn className="w-4 h-4" /> Log in
            </Link>
          )}
        </div>
        <p className="absolute bottom-6 left-6 right-6 text-xs text-white/40">Developed by Balvir Coder ❤️👑</p>
      </SheetContent>
    </Sheet>
  );
}