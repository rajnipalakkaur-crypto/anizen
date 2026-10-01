import React from "react";
import { Link } from "react-router-dom";
import { Film, Clapperboard, Server } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import usePageMeta from "@/hooks/usePageMeta";

export default function AdminHome() {
  usePageMeta({ title: "Admin Dashboard" });
  const anime = useQuery({ queryKey: ["admin-anime"], queryFn: () => base44.entities.Anime.list("-created_date", 500) });
  const eps = useQuery({ queryKey: ["admin-eps"], queryFn: () => base44.entities.Episode.list("-created_date", 500) });
  const servers = useQuery({ queryKey: ["admin-servers"], queryFn: () => base44.entities.EpisodeServer.list("-created_date", 500) });
  const cards = [
    { label: "Anime", count: anime.data?.length, to: "/admin/anime", icon: Film },
    { label: "Episodes", count: eps.data?.length, to: "/admin/episodes", icon: Clapperboard },
    { label: "Video Servers", count: servers.data?.length, to: "/admin/servers", icon: Server },
  ];
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-semibold">Dashboard</h1>
      <p className="text-white/45 text-sm mt-1">Manage your anime catalog.</p>
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="glass rounded-2xl p-6 hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-primary/15 grid place-items-center"><c.icon className="w-5 h-5 text-primary" /></div>
              <span className="font-display text-3xl">{c.count ?? "—"}</span>
            </div>
            <p className="mt-4 font-medium">{c.label}</p>
            <p className="text-xs text-white/40 mt-1">Manage →</p>
          </Link>
        ))}
      </div>
      <div className="glass rounded-2xl p-6 mt-6">
        <h2 className="font-display text-lg">Quick start</h2>
        <ol className="mt-4 space-y-3 text-sm text-white/70 list-decimal list-inside">
          <li>Add an anime under <Link to="/admin/anime" className="text-primary">Anime</Link> — upload a poster and banner.</li>
          <li>Add episodes under <Link to="/admin/episodes" className="text-primary">Episodes</Link> — upload a thumbnail.</li>
          <li>Add video sources under <Link to="/admin/servers" className="text-primary">Video Servers</Link> — upload or paste the video URL.</li>
        </ol>
      </div>
    </div>
  );
}