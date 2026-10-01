import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnimeList, useEpisodes } from "@/lib/queries";
import { useAuth } from "@/lib/AuthContext";
import { createRoom, roomPath } from "@/components/party/partyClient";

export default function PartyCreator() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: animeList = [] } = useAnimeList();
  const [animeId, setAnimeId] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const anime = animeList.find((a) => a.id === animeId) || null;
  const { data: episodes = [] } = useEpisodes(animeId);
  const episode = episodes.find((e) => e.id === episodeId) || null;

  // Default to the first episode of whichever title is selected.
  useEffect(() => {
    setEpisodeId((prev) => (episodes.some((e) => e.id === prev) ? prev : episodes[0]?.id || ""));
  }, [episodes]);

  const generate = async () => {
    if (!anime || !episode) return;
    setBusy(true);
    setError("");
    try {
      const room = await createRoom({ anime, episode, serverName: "", user });
      navigate(roomPath(room));
    } catch (err) {
      setError(err?.message || "Couldn't create a code right now. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl bg-white/5 p-5">
      <p className="text-sm font-semibold flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-primary" /> Create a party code
      </p>
      <p className="text-white/60 text-sm mt-2">
        Pick a title and episode — you'll get a 6-character code to share with your friends.
      </p>

      <div className="mt-4 space-y-3">
        <Select value={animeId} onValueChange={setAnimeId}>
          <SelectTrigger className="h-11 bg-black/30" aria-label="Choose anime">
            <SelectValue placeholder={animeList.length ? "Choose anime" : "No anime published yet"} />
          </SelectTrigger>
          <SelectContent>
            {animeList.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={episodeId} onValueChange={setEpisodeId} disabled={!animeId}>
          <SelectTrigger className="h-11 bg-black/30" aria-label="Choose episode">
            <SelectValue placeholder={animeId ? "Choose episode" : "Pick an anime first"} />
          </SelectTrigger>
          <SelectContent>
            {episodes.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                Episode {e.episode_number}{e.title ? ` · ${e.title}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="button" onClick={generate} disabled={busy || !anime || !episode} className="w-full h-12">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Generate code
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}