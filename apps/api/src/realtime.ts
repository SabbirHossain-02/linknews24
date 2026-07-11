import type { Server } from "socket.io";

let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
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
