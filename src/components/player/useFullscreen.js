import { useEffect, useState, useCallback } from "react";

export default function useFullscreen(wrapRef, videoRef) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const on = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  const toggle = useCallback(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (v?.webkitEnterFullscreen) v.webkitEnterFullscreen();
  }, [wrapRef, videoRef]);
  return [fullscreen, toggle];
}