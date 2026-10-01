import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import SearchDialog from "@/components/search/SearchDialog";

export default function SiteLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={() => setSearchOpen(true)} />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
      <MobileBottomNav onSearch={() => setSearchOpen(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}