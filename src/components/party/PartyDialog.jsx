import React, { useState } from "react";
import { Check, Copy, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roomLink } from "./partyClient";

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
    } catch {
      toast.message(value);
    }
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 min-w-0 truncate rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80">{value}</code>
      <Button size="sm" variant="secondary" onClick={copy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy
      </Button>
    </div>
  );
}

export default function PartyDialog({ open, onOpenChange, party, target }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      await party.start();
    } catch (e) {
      setError(e?.message || "Couldn't start the party. Try again.");
    }
    setBusy(false);
  };

  const join = async () => {
    setBusy(true);
    setError("");
    try {
      const found = await party.join(code);
      if (found) onOpenChange(false);
    } catch (e) {
      setError(e?.message || "Couldn't join that party. Try again.");
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Watch together</DialogTitle>
          <DialogDescription>{target || "Watch the same episode in sync with friends."}</DialogDescription>
        </DialogHeader>

        {party.active ? (
          <div className="space-y-4">
            <p className="text-sm text-white/70 flex items-start gap-2">
              <Users className="w-4 h-4 mt-0.5 text-accent shrink-0" />
              Send this code to your friends — they open the Party page on this site and enter it.
            </p>
            <div className="rounded-xl bg-primary/15 px-4 py-4 text-center">
              <p className="font-mono text-3xl font-semibold tracking-[0.4em] text-white">{party.code}</p>
            </div>
            <CopyRow label="Invite link" value={roomLink(party.room)} />
            <p className="text-xs text-white/50">
              {party.members.length} watching · play, pause and seeking stay in sync for everyone.
            </p>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Start watching
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="start">
            <TabsList className="w-full">
              <TabsTrigger value="start" className="flex-1">
                Start a party
              </TabsTrigger>
              <TabsTrigger value="join" className="flex-1">
                Join with code
              </TabsTrigger>
            </TabsList>
            <TabsContent value="start" className="space-y-3 pt-4">
              <p className="text-sm text-white/70">
                You'll get a code for this episode. Share it and you all watch together, perfectly in sync.
              </p>
              <Button className="w-full" onClick={create} disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Create party code
              </Button>
            </TabsContent>
            <TabsContent value="join" className="space-y-3 pt-4">
              <div className="space-y-2">
                <Label htmlFor="party-code">Party code</Label>
                <Input
                  id="party-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-[0.35em]"
                />
              </div>
              <Button className="w-full" onClick={join} disabled={busy || code.trim().length < 4}>
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Join party
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}