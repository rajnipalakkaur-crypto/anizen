import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const useAnimeList = () =>
  useQuery({
    queryKey: ["anime"],
    queryFn: () => base44.entities.Anime.filter({ published: true }, "-created_date", 300),
    staleTime: 60_000,
  });

export const useAnime = (slug) =>
  useQuery({
    queryKey: ["anime", slug],
    queryFn: async () => (await base44.entities.Anime.filter({ slug, published: true }, "-created_date", 1))[0] || null,
    enabled: !!slug,
  });

export const useEpisodes = (animeId) =>
  useQuery({
    queryKey: ["episodes", animeId],
    queryFn: () => base44.entities.Episode.filter({ anime_id: animeId, published: true }, "episode_number", 1000),
    enabled: !!animeId,
  });

export const useLatestEpisodes = () =>
  useQuery({
    queryKey: ["latest-episodes"],
    queryFn: () => base44.entities.Episode.filter({ published: true }, "-created_date", 12),
    staleTime: 60_000,
  });

export const useServers = (episodeId) =>
  useQuery({
    queryKey: ["servers", episodeId],
    queryFn: () => base44.entities.EpisodeServer.filter({ episode_id: episodeId, is_active: true }, "priority", 50),
    enabled: !!episodeId,
  });