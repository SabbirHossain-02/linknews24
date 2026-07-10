import type { Server } from "socket.io";

let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
}

// Broadcast a content change to all connected browsers.
export function emitChange(payload: Record<string, unknown> = {}) {
  io?.emit("content:changed", { ...payload, at: Date.now() });
}
