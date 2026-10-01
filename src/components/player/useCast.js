import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Google Cast Framework hook.
 * Loads the sender SDK (script tag lives in index.html) and exposes
 * cast state plus cast/stop actions for the current media.
 */
const SDK_SRC = "https://www.gstatic.com/cv/js/sender/1.0/cast_sender.js?loadCastFramework=1";

// The receiver needs the right MIME type — HLS streams are not mp4.
const contentTypeFor = (url = "") => {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".m3u8")) return "application/x-mpegURL";
  if (clean.endsWith(".webm")) return "video/webm";
  return "video/mp4";
};

// If the tag in index.html was blocked or stripped, inject the sender SDK once.
function ensureSdk() {
  if (window.cast?.framework || document.querySelector("script[data-cast-sdk]")) return;
  const s = document.createElement("script");
  s.src = SDK_SRC;
  s.async = true;
  s.dataset.castSdk = "1";
  document.head.appendChild(s);
}

export default function useCast() {
  const [available, setAvailable] = useState(false);
  const [casting, setCasting] = useState(false);
  const [castState, setCastState] = useState("NO_DEVICES_AVAILABLE");
  const initialized = useRef(false);

  useEffect(() => {
    const init = () => {
      if (initialized.current) return;
      const framework = window.cast?.framework;
      const chromeCast = window.chrome?.cast;
      if (!framework || !chromeCast) return;
      initialized.current = true;
      setAvailable(true);

      const context = framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: chromeCast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chromeCast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      const update = () => {
        const s = context.getCastState();
        setCastState(s);
        setCasting(s === framework.CastState.CONNECTED);
      };
      update();
      context.addEventListener(framework.CastContextEventType.CAST_STATE_CHANGED, update);
    };

    ensureSdk();
    // SDK calls this global when ready (set in index.html)
    window.__castReady = init;
    // Already loaded? init now.
    if (window.cast?.framework && window.chrome?.cast) init();

    return () => { delete window.__castReady; };
  }, []);

  const castMedia = useCallback(async ({ url, title, poster }) => {
    const framework = window.cast?.framework;
    const chromeCast = window.chrome?.cast;
    if (!framework || !chromeCast) return false;
    const context = framework.CastContext.getInstance();
    try {
      await context.requestSession();
    } catch {
      return false;
    }
    const session = context.getCurrentSession();
    if (!session) return false;
    const mediaInfo = new chromeCast.media.MediaInfo(url, contentTypeFor(url));
    mediaInfo.metadata = new chromeCast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title || "";
    if (poster) mediaInfo.metadata.images = [{ url: poster }];
    const request = new chromeCast.media.LoadRequest(mediaInfo);
    try {
      await session.loadMedia(request);
      return true;
    } catch {
      return false;
    }
  }, []);

  const stopCast = useCallback(() => {
    const framework = window.cast?.framework;
    if (!framework) return;
    framework.CastContext.getInstance().endCurrentSession(true);
  }, []);

  return { available, casting, castState, castMedia, stopCast };
}