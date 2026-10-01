import { useEffect, useRef } from "react";

export default function usePlayerKeys(actions) {
  const ref = useRef(actions);
  ref.current = actions;
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" && e.target.type !== "range") return;
      if (tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      const a = ref.current;
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") a.toggle();
      else if (k === "f") a.fullscreen();
      else if (k === "m") a.toggleMute();
      else if (k === "c") a.toggleSubtitle();
      else if (k === "d") a.download();
      else if (e.key === "ArrowRight") a.skip(10);
      else if (e.key === "ArrowLeft") a.skip(-10);
      else if (e.key === "ArrowUp") a.volumeBy(0.1);
      else if (e.key === "ArrowDown") a.volumeBy(-0.1);
      else if (e.shiftKey && k === "n") a.next?.();
      else if (e.shiftKey && k === "p") a.prev?.();
      else {
        // Any other key (remote OK, Tab, Escape…) still brings the controls back.
        a.bump();
        return;
      }
      e.preventDefault();
      a.bump();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}