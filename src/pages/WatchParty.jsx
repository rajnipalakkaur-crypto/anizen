import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { findRoom, normalizeCode, roomPath } from "@/components/party/partyClient";
import PartyCreator from "@/components/party/PartyCreator";
import usePageMeta from "@/hooks/usePageMeta";

export default function WatchParty() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  usePageMeta({ title: "Watch together", description: "Join a friend's watch party with a party code." });

  const submit = async (e) => {
    e.preventDefault();
    const clean = normalizeCode(code);
    if (clean.length < 4) {
      setError("Enter the code your friend shared with you.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const room = await findRoom(clean);
      if (!room) {
        setError("That code isn't active right now. Ask your friend for a new one.");
        setBusy(false);
        return;
      }
      navigate(roomPath(room));
    } catch (err) {
      setError(err?.message || "Couldn't reach that party. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-4 pt-24 md:pt-32 pb-20">
      <div className="glass rounded-3xl p-6 sm:p-10">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-accent">
          <Radio className="w-4 h-4" /> Watch party
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-semibold mt-3">Watch together</h1>
        <p className="text-white/60 mt-3 text-sm sm:text-base">
          Your friend starts a party on any episode, sends you a 6-character code, and you both watch the same episode in sync —
          play, pause and skipping stay together.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            maxLength={6}
            inputMode="text"
            autoComplete="off"
            aria-label="Party code"
            className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
          />
          <Button type="submit" className="w-full h-12" disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Join party
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <PartyCreator />
      </div>
    </div>
  );
}