import React, { useState } from "react";
import { Check, Copy, LogOut, Radio, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { roomLink } from "./partyClient";

export default function PartyBar({ party }) {
  const [copied, setCopied] = useState("");
  const { room, role, members } = party;
  if (!room) return null;

  const copy = async (value, tag) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(tag);
      toast.success(tag === "code" ? "Party code copied" : "Invite link copied");
    } catch {
      toast.message(`Copy the code manually: ${room.code}`);
    }
    setTimeout(() => setCopied(""), 1600);
  };

  return (
    <div className="glass rounded-2xl p-3 sm:p-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-accent">
        <Radio className="w-4 h-4" /> Watch party
      </span>
      <span className="font-mono text-lg sm:text-xl font-semibold tracking-[0.35em] text-white">{room.code}</span>
      <Button size="sm" variant="secondary" onClick={() => copy(room.code, "code")}>
        {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy code
      </Button>
      <Button size="sm" variant="secondary" onClick={() => copy(roomLink(room), "link")}>
        {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Invite link
      </Button>
      <span className="text-xs text-white/60 flex items-center gap-1.5 min-w-0">
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">
          {members.length} watching · {members.map((m) => m.name).join(", ")}
        </span>
      </span>
      <Button size="sm" variant="ghost" className="ml-auto" onClick={() => party.leave(role === "host")}>
        <LogOut className="w-4 h-4" /> {role === "host" ? "End party" : "Leave"}
      </Button>
      <p className="basis-full text-xs text-white/50">
        {role === "host"
          ? "You're the host — your play, pause and seek keep everyone together."
          : `Following ${room.host_name || "the host"}. Playback stays in sync automatically.`}
      </p>
    </div>
  );
}