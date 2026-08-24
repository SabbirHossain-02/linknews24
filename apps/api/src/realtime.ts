import type { Server, Socket } from "socket.io";

let io: Server | null = null;

/** Live browsers on the public site, by IP so two tabs are still one reader. */
const visitors = new Map<string, number>();

export function setIo(server: Server) {
  io = server;
  server.on("connection", trackVisitor);
}

/**
 * Who is on the site right now.
 *
 * This used to be counted from page views in the last five minutes, which is
 * not the same question: someone reading one article for six minutes had
 * vanished from the count while still sitting there, and the number dropped to
 * zero whenever nobody happened to be clicking. Every open page already holds a
 * socket to this server for live updates, so the truthful answer is simply how
 * many of those are connected.
 */
function trackVisitor(socket: Socket) {
  // The admin panel is not a visitor to the news site.
  if (socket.handshake.query.panel === "admin") return;

  const key =
    (socket.handshake.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim() ||
    socket.handshake.address ||
    socket.id;

  visitors.set(key, (visitors.get(key) ?? 0) + 1);
  announce();

  socket.on("disconnect", () => {
    const left = (visitors.get(key) ?? 1) - 1;
    if (left > 0) visitors.set(key, left);
    else visitors.delete(key);
    announce();
  });
}

export function onlineCount(): number {
  return visitors.size;
}

/**
 * Tell the dashboard the figure moved — but at most once a second, so a page
 * that opens twenty sockets at once does not send twenty messages.
 */
let announceTimer: NodeJS.Timeout | null = null;
function announce() {
  if (announceTimer) return;
  announceTimer = setTimeout(() => {
    announceTimer = null;
    emitAnalytics({ type: "online", online: visitors.size });
  }, 1000);
}

// Broadcast a content change to all connected browsers.
export function emitChange(payload: Record<string, unknown> = {}) {
  io?.emit("content:changed", { ...payload, at: Date.now() });
}

// Analytics pings (visits, ad events). Separate channel so the public site's
// content refresh is NOT triggered on every visitor — only the admin dashboard
// listens to this event.
export function emitAnalytics(payload: Record<string, unknown> = {}) {
  io?.emit("analytics:changed", { ...payload, at: Date.now() });
}
