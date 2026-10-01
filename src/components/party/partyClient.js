import { base44 } from "@/api/base44Client";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const UID_KEY = "anizen.party.uid";

export const normalizeCode = (raw) =>
  String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

export function makeCode() {
  let out = "";
  for (let i = 0; i < 6; i += 1) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

// Stable per-browser identity, so friends without an account can still join.
export function viewerId(user) {
  if (user?.id) return user.id;
  let id = localStorage.getItem(UID_KEY);
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(UID_KEY, id);
  }
  return id;
}

export function viewerName(user) {
  return user?.full_name?.trim() || user?.email?.split("@")[0] || "Guest";
}

export const roomPath = (room) =>
  `/anime/${encodeURIComponent(room.slug)}/episode-${room.episode_number}?party=${room.code}`;

export const roomLink = (room) => `${window.location.origin}${roomPath(room)}`;

// Where the room's playhead is right now (position + time since it was reported).
export function partyTime(room) {
  const pos = Number(room?.position) || 0;
  if (!room?.is_playing) return pos;
  const elapsed = Math.max(0, (Date.now() - (Number(room.position_updated) || 0)) / 1000);
  return pos + elapsed;
}

export async function findRoom(rawCode) {
  const code = normalizeCode(rawCode);
  if (code.length < 4) return null;
  const list = await base44.entities.WatchRoom.filter({ code }, "-created_date", 20);
  return list.find((r) => !r.ended) || null;
}

export const roomById = (id) => base44.entities.WatchRoom.get(id);

export async function createRoom({ anime, episode, serverName, user }) {
  const id = viewerId(user);
  return base44.entities.WatchRoom.create({
    code: makeCode(),
    host_id: id,
    host_name: viewerName(user),
    anime_id: anime.id,
    anime_title: anime.title,
    slug: anime.slug,
    episode_id: episode.id,
    episode_number: episode.episode_number,
    episode_title: episode.title,
    thumbnail_url: episode.thumbnail_url || anime.banner_url || anime.poster_url || "",
    server_name: serverName || "",
    is_playing: false,
    position: 0,
    position_updated: Date.now(),
    members: [{ id, name: viewerName(user), host: true }],
    ended: false,
  });
}

export function savePlayback(room, { playing, time, server }) {
  return base44.entities.WatchRoom.update(room.id, {
    is_playing: !!playing,
    position: Math.max(0, Number(time) || 0),
    position_updated: Date.now(),
    server_name: server || room.server_name || "",
  });
}

export async function joinMember(room, user) {
  const id = viewerId(user);
  const fresh = await roomById(room.id).catch(() => room);
  const members = Array.isArray(fresh?.members) ? fresh.members : [];
  if (members.some((m) => m.id === id)) return fresh || room;
  return base44.entities.WatchRoom.update(room.id, {
    members: [...members, { id, name: viewerName(user), host: (fresh?.host_id || room.host_id) === id }],
  });
}

export async function dropMember(room, user) {
  const id = viewerId(user);
  const fresh = await roomById(room.id).catch(() => null);
  const members = Array.isArray(fresh?.members) ? fresh.members : [];
  if (!members.some((m) => m.id === id)) return;
  await base44.entities.WatchRoom.update(room.id, { members: members.filter((m) => m.id !== id) });
}

export function updateRoomTarget(room, { anime_id, anime_title, slug, episode_id, episode_number, episode_title, thumbnail_url }) {
  return base44.entities.WatchRoom.update(room.id, {
    anime_id,
    anime_title,
    slug,
    episode_id,
    episode_number,
    episode_title,
    thumbnail_url,
    position: 0,
    is_playing: false,
    position_updated: Date.now(),
  });
}

export const endParty = (room) => base44.entities.WatchRoom.update(room.id, { ended: true, is_playing: false });