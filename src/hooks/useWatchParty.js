import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import {
  createRoom,
  dropMember,
  endParty,
  findRoom,
  joinMember,
  normalizeCode,
  partyTime,
  roomById,
  roomPath,
  savePlayback,
  updateRoomTarget,
  viewerId,
} from "@/components/party/partyClient";

const POLL_MS = 4000;

/**
 * Watch-party state for one episode. The host reports its playhead to a shared
 * room; everyone else follows it. A light poll backs up the live subscription,
 * so a missed realtime event can never desync the room for long.
 */
export default function useWatchParty({ user, anime, episode, serverName, code }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [room, setRoom] = useState(null);
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(!!code);
  const meId = viewerId(user);
  const roomRef = useRef(null);
  const lastPub = useRef(null);
  const tick = useRef(0);
  const followed = useRef("");

  roomRef.current = room;
  const role = room ? (room.host_id === meId ? "host" : "guest") : null;

  const clearPartyParam = useCallback(() => {
    roomRef.current = null;
    lastPub.current = null;
    setRoom(null);
    setRemote(null);
    if (code) navigate(pathname, { replace: true });
  }, [code, navigate, pathname]);

  const applyRoom = useCallback(
    (data) => {
      if (!data) return;
      if (data.ended) {
        toast.message("The host ended the watch party");
        clearPartyParam();
        return;
      }
      roomRef.current = data;
      setRoom(data);
      if (data.host_id !== meId) {
        tick.current += 1;
        setRemote({ nonce: tick.current, playing: !!data.is_playing, time: partyTime(data), server: data.server_name });
      }
      if (anime && episode && (data.slug !== anime.slug || Number(data.episode_number) !== Number(episode.episode_number))) {
        // Move to the host's episode — but never bounce twice to the same target.
        const target = roomPath(data);
        if (followed.current !== target) {
          followed.current = target;
          navigate(target, { replace: true });
        }
      }
    },
    [anime, episode, meId, navigate, clearPartyParam]
  );

  // Join the room named in the URL.
  useEffect(() => {
    if (!code) {
      roomRef.current = null;
      lastPub.current = null;
      setRoom(null);
      setRemote(null);
      setLoading(false);
      return undefined;
    }
    if (roomRef.current?.code === normalizeCode(code)) {
      // Already holding this room (we just created it) — no need to fetch it back.
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    findRoom(code)
      .then(async (found) => {
        if (!alive) return;
        if (!found) {
          toast.error("That party code isn't active any more");
          setLoading(false);
          navigate(pathname, { replace: true });
          return;
        }
        const joined = await joinMember(found, user).catch(() => found);
        if (!alive) return;
        setLoading(false);
        applyRoom(joined || found);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Live updates + polling fallback while a room is open.
  useEffect(() => {
    const id = room?.id;
    if (!id) return undefined;
    const unsubscribe = base44.entities.WatchRoom.subscribe((event) => {
      if (event?.data?.id === id) applyRoom(event.data);
    });
    const timer = setInterval(async () => {
      const fresh = await roomById(id).catch(() => null);
      if (fresh) applyRoom(fresh);
    }, POLL_MS);
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      clearInterval(timer);
    };
  }, [room?.id, applyRoom]);

  // Host: the party follows whatever episode the host opens next.
  useEffect(() => {
    const current = roomRef.current;
    if (!current || current.host_id !== meId || !anime || !episode) return;
    if (current.slug === anime.slug && Number(current.episode_number) === Number(episode.episode_number)) return;
    updateRoomTarget(current, {
      anime_id: anime.id,
      anime_title: anime.title,
      slug: anime.slug,
      episode_id: episode.id,
      episode_number: episode.episode_number,
      episode_title: episode.title,
      thumbnail_url: episode.thumbnail_url || "",
    })
      .then((fresh) => fresh && applyRoom(fresh))
      .catch(() => {});
  }, [anime, episode, meId, applyRoom]);

  const publish = useCallback(
    (state) => {
      const current = roomRef.current;
      if (!current || current.host_id !== meId) return;
      const now = Date.now();
      const last = lastPub.current;
      const playChanged = !last || last.playing !== !!state.playing;
      const jumped = !last || Math.abs(last.position - Number(state.time || 0)) > 3;
      if (!playChanged && !jumped && now - (last?.at || 0) < 3000) return;
      lastPub.current = { playing: !!state.playing, position: Number(state.time) || 0, at: now };
      savePlayback(current, state).catch(() => {});
    },
    [meId]
  );

  const start = useCallback(async () => {
    const created = await createRoom({ anime, episode, serverName, user });
    roomRef.current = created;
    setRoom(created);
    navigate(roomPath(created), { replace: true });
    return created;
  }, [anime, episode, serverName, user, navigate]);

  const join = useCallback(
    async (rawCode) => {
      const found = await findRoom(rawCode);
      if (!found) {
        toast.error("No active party with that code");
        return null;
      }
      navigate(roomPath(found));
      return found;
    },
    [navigate]
  );

  const leave = useCallback(
    async (endIt) => {
      const current = roomRef.current;
      if (current) {
        if (endIt) await endParty(current).catch(() => {});
        else await dropMember(current, user).catch(() => {});
      }
      clearPartyParam();
    },
    [clearPartyParam, user]
  );

  return {
    room,
    role,
    remote,
    loading,
    active: !!room,
    code: room?.code || "",
    members: room?.members || [],
    startTime: role === "guest" && room ? partyTime(room) : undefined,
    publish,
    start,
    join,
    leave,
  };
}