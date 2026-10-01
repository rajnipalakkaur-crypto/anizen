import React from "react";
import { Server } from "lucide-react";

export default function ServerBar({ servers, current, onSelect }) {
  const names = [...new Set(servers.map((s) => s.server_name))];
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 p-4 rounded-2xl glass">
      <div className="flex items-center gap-2 text-sm text-white/60 shrink-0">
        <Server className="w-4 h-4 text-primary" /> Servers
      </div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => {
          const s = servers.find((x) => x.server_name === name);
          const active = name === current;
          return (
            <button key={name} onClick={() => onSelect(name)} className={`h-9 px-4 rounded-full text-xs transition-all ${active ? "bg-primary text-white glow" : "bg-white/5 hover:bg-white/10 text-white/75"}`}>
              {name} <span className="opacity-60 ml-1">{s.language}</span>
            </button>
          );
        })}
      </div>
      <p className="sm:ml-auto text-[11px] text-white/35">If playback fails, switch servers.</p>
    </div>
  );
}