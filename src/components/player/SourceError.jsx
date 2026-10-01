import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function SourceError({ others, onSwitch, onRetry }) {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/85 p-6 text-center" onClick={(e) => e.stopPropagation()}>
      <div className="max-w-sm">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <p className="font-display mt-4">This source couldn't be played</p>
        <p className="text-sm text-white/60 mt-2">{others.length ? "Try another server below." : "Please try again in a moment."}</p>
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {others.map((name) => (
            <button key={name} onClick={() => onSwitch(name)} className="btn-primary h-10 text-xs">{name}</button>
          ))}
          <button onClick={onRetry} className="btn-ghost h-10 text-xs"><RotateCw className="w-3.5 h-3.5" /> Retry</button>
        </div>
      </div>
    </div>
  );
}