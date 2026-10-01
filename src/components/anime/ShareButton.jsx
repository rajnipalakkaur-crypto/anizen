import React from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareButton({ title }) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} · AniZen`, url });
      } catch {
        /* user cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    } catch {
      toast("Couldn't copy the link");
    }
  };
  return (
    <button onClick={share} className="btn-ghost w-12 !px-0" aria-label="Share">
      <Share2 className="w-4 h-4" />
    </button>
  );
}