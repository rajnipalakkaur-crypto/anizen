import React from "react";
import { Link } from "react-router-dom";
import usePageMeta from "@/hooks/usePageMeta";

export default function NotFound() {
  usePageMeta({ title: "Page not found" });
  return (
    <div className="min-h-[70vh] grid place-items-center px-6 pt-24 text-center">
      <div>
        <p className="font-display text-7xl md:text-8xl font-semibold text-gradient">404</p>
        <p className="font-display text-xl mt-4">Lost in another dimension</p>
        <p className="text-white/50 text-sm mt-2 max-w-sm mx-auto">The page you're looking for doesn't exist or has moved.</p>
        <div className="flex gap-3 justify-center mt-8">
          <Link to="/" className="btn-primary">Go home</Link>
          <Link to="/browse" className="btn-ghost">Browse anime</Link>
        </div>
      </div>
    </div>
  );
}