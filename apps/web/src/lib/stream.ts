/**
 * Turns whatever the admin pastes into the Live TV box into an embeddable URL.
 *
 * People paste a watch link, a share link, a Shorts link or a live link — all
 * of which refuse to load in an iframe. Only the /embed/ form works, so the
 * video id is pulled out of any of them.
 */
export function youtubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com|youtube-nocookie\.com)\/embed\/([\w-]{11})/,
    /(?:youtube\.com|youtube-nocookie\.com)\/live\/([\w-]{11})/,
    /(?:youtube\.com|youtube-nocookie\.com)\/shorts\/([\w-]{11})/,
    /(?:youtube\.com|youtube-nocookie\.com)\/.*[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  // A bare id, pasted on its own.
  return /^[\w-]{11}$/.test(trimmed) ? trimmed : null;
}

/**
 * The player URL for the sidebar screen: starts on its own, silent, and starts
 * over when it ends. YouTube only loops a single video when it is handed a
 * playlist of that one video, hence `playlist` repeating the id.
 */
export function liveEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  if (!id) return url.trim() || null;

  const params = new URLSearchParams({
    autoplay: "1",
    // Browsers only allow autoplay without a click when the video is muted.
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    // Lets the sound button unmute without reloading (and restarting) the video.
    enablejsapi: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

/** Sends a player command to a YouTube iframe (needs `enablejsapi=1`). */
export function youtubeCommand(frame: HTMLIFrameElement | null, func: string) {
  frame?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*",
  );
}
