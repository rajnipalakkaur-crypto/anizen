import React from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function AccountMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link to="/login" className="h-10 px-3 md:px-4 flex items-center gap-2 rounded-full glass text-sm text-white/80 hover:text-white transition-colors">
        <LogIn className="w-4 h-4" />
        <span className="hidden md:inline">Log in</span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account menu" className="w-10 h-10 shrink-0 grid place-items-center rounded-full bg-primary/20 text-sm font-semibold text-white hover:bg-primary/30 transition-colors">
        {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass !bg-card/95 !border-white/10">
        <DropdownMenuLabel className="truncate text-xs font-normal text-white/60">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <Shield /> Admin panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}