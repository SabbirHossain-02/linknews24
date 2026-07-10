import { io, type Socket } from "socket.io-client";
import { API_BASE } from "./admin-api";

let socket: Socket | null = null;

// Shared client socket to the LinkNews24 API for realtime updates.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
  }
  return socket;
}
