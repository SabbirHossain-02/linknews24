import { io, type Socket } from "socket.io-client";
import { API_BASE } from "./admin-api";

let socket: Socket | null = null;

// Shared client socket to the LinkNews24 API for realtime updates.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ["websocket", "polling"],
      reconnection: true,
      // Sends the admin cookie along, so the server knows which staff member
      // this is — for their notifications, permission changes and presence.
      withCredentials: true,
      // The server counts these connections as "readers online now", so a tab
      // sitting in the admin panel says so and is left out of that figure.
      query: {
        panel:
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin")
            ? "admin"
            : "public",
      },
    });
  }
  return socket;
}

/**
 * Opens the connection again, so the server reads the cookie afresh — after
 * signing in or out, the socket must stop speaking for the previous session.
 */
export function reconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket.connect();
}
