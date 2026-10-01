import React from "react";
import { Link } from "react-router-dom";
import { Play, X } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function EpisodeTile({ to, image, title, subtitle, progress, onRemove, className = "" }) {
  return (
    <div className={`group relative ${className}`}>
      <Link to={to} className="block">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary transition-all duration-500 group-hover:glow">
          <Image src={image} alt={title} className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
          <span className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/15 backdrop-blur-md grid place-items-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
            <Play className="w-5 h-5 fill-white" />
          </span>
          {progress != null && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/15">
              <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(100, progress * 100)}%` }} />
            </div>
          )}
        </div>
        <p className="mt-3 font-medium text-sm truncate">{title}</p>
        <p className="text-xs text-white/45 mt-0.5 truncate">{subtitle}</p>
      </Link>
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove" className="absolute top-2 right-2 w-8 h-8 rounded-full glass grid place-items-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}