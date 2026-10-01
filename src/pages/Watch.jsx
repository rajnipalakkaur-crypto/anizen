import React, { useCallback, useState } from "react";
import { useParams, useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Film, ServerOff, Users } from "lucide-react";
import VideoPlayer from "@/components/player/VideoPlayer";
import EpisodeList from "@/components/anime/EpisodeList";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useAnime, useEpisodes, useServers } from "@/lib/queries";
import { episodeUrl, isSafeUrl } from "@/lib/anime";
import { useStored, KEYS, saveProgress } from "@/lib/storage";
import usePageMeta from "@/hooks/usePageMeta";
import { useAuth } from "@/lib/AuthContext";
import useWatchParty from "@/hooks/useWatchParty";
import PartyBar from "@/components/party/PartyBar";
import PartyDialog from "@/components/party/PartyDialog";

export default function Watch() {
  const { slug, ep } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { user } = useAuth();
  const [partyOpen, setPartyOpen] = useState(false);
  const partyCode = new URLSearchParams(search).get("party");
  const num = Number(String(ep).replace("episode-", ""));
  const animeQ = useAnime(slug);
  const anime = animeQ.data;
  const epsQ = useEpisodes(anime?.id);
  const episodes = epsQ.data || [];
  const idx = episodes.findIndex((e) => e.episode_number === num);
  const episode = episodes[idx];
  const serversQ = useServers(episode?.id);
  const servers = (serversQ.data || []).filter((s) => isSafeUrl(s.video_url));
  const history = useStored(KEYS.history);
  const prev = episodes[idx - 1];
  const next = episodes[idx + 1];
  const party = useWatchParty({ user, anime, episode, serverName: servers[0]?.server_name, code: partyCode });

  usePageMeta({ title: anime && episode ? `${anime.title} Episode ${episode.episode_number}` : "Watch", description: episode?.description || anime?.description, image: episode?.thumbnail_url || anime?.banner_url });

  const onProgress = useCallback(
    (progress, duration, completed) =>
      episode && saveProgress(episode.id, { anime_id: anime.id, episode_number: episode.episode_number, thumbnail_url: episode.thumbnail_url, progress, duration, completed }),
    [episode, anime]
  );

  const loading = animeQ.isLoading || (anime && epsQ.isLoading) || (episode && serversQ.isLoading);
  const failed = animeQ.isError || epsQ.isError || serversQ.isError;
  const retry = () => { animeQ.refetch(); epsQ.refetch(); serversQ.refetch(); };

  if (failed) return <div className="pt-32"><ErrorState onRetry={retry} /></div>;
  if (!loading && !anime) return <div className="pt-32"><EmptyState icon={Film} title="Anime not found"><Link to="/browse" className="btn-primary">Browse anime</Link></EmptyState></div>;
  if (!loading && anime && episodes.length && !episode) return <Navigate to={episodeUrl(slug, episodes[0].episode_number)} replace />;
  if (!loading && anime && !episodes.length) return <div className="pt-32"><EmptyState icon={Film} title="No episodes yet"><Link to={`/anime/${slug}`} className="btn-ghost">Back to {anime.title}</Link></EmptyState></div>;

  const h = episode && history[episode.id];
  const go = (e) => e && navigate(episodeUrl(slug, e.episode_number));

  return (
    <div className="max-w-[1400px] mx-auto sm:px-4 md:px-8 pt-16 md:pt-24">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        <div className="min-w-0">
          <div className="max-w-[900px] mx-auto">
          {loading ? (
            <div className="skeleton aspect-video sm:rounded-3xl" />
          ) : servers.length ? (
            <VideoPlayer
              key={episode.id}
              servers={servers}
              episode={episode}
              title={`${anime.title} — ${episode.title}`}
              startTime={party.startTime ?? (h && !h.completed ? h.progress : 0)}
              onPlayback={party.publish}
              remoteCommand={party.remote}
              onPrev={prev ? () => go(prev) : undefined}
              onNext={next ? () => go(next) : undefined}
              nextTitle={next ? `EP ${next.episode_number} · ${next.title}` : ""}
              onProgress={onProgress}
            />
          ) : (
            <div className="aspect-video sm:rounded-3xl glass grid place-items-center">
              <EmptyState icon={ServerOff} title="No servers available" text="This episode has no active video sources yet." />
            </div>
          )}
          </div>

          {!loading && episode && (
            <div className="px-4 sm:px-0 mt-4">
              {party.active ? (
                <PartyBar party={party} />
              ) : (
                <button onClick={() => setPartyOpen(true)} className="btn-ghost h-11 text-sm">
                  <Users className="w-4 h-4" /> Watch together
                </button>
              )}
            </div>
          )}

          {!loading && episode && (
            <div className="px-4 sm:px-0 mt-6">
              <Link to={`/anime/${slug}`} className="text-sm text-primary hover:underline">{anime.title}</Link>
              <h1 className="font-display text-xl md:text-2xl font-semibold mt-1">Episode {episode.episode_number}: {episode.title}</h1>
              {episode.description && <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-3xl">{episode.description}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => go(prev)} disabled={!prev} className="btn-ghost h-11 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> Previous</button>
                <button onClick={() => go(next)} disabled={!next} className="btn-primary h-11 disabled:opacity-30">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
        <aside className="min-w-0 px-4 sm:px-0">
          <h2 className="font-display text-base font-semibold mb-4">Episodes</h2>
          {anime && episodes.length > 0 && <EpisodeList anime={anime} episodes={episodes} currentId={episode?.id} compact />}
        </aside>
      </div>

      <PartyDialog
        open={partyOpen}
        onOpenChange={setPartyOpen}
        party={party}
        target={anime && episode ? `${anime.title} · Episode ${episode.episode_number}` : ""}
      />
    </div>
  );
}