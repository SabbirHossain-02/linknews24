import type { Server, Socket } from "socket.io";
import { verifyToken } from "./lib/jwt";
import { staffUser, type AuthUser } from "./middleware/auth";
import { prisma } from "./prisma";
import { env } from "./env";

let io: Server | null = null;

/** Live browsers on the public site, by IP so two tabs are still one reader. */
const visitors = new Map<string, number>();

export function setIo(server: Server) {
  io = server;
  server.on("connection", (socket) => {
    trackVisitor(socket);
    attachStaff(socket).catch(() => {});
  });
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

// ===================== STAFF: rooms and presence =====================

/**
 * Staff sockets are identified from the same httpOnly cookie the API uses, and
 * put in rooms so the server can talk to one person (`user:<id>`), the Super
 * Admins (`super`), or every staff member (`staff`).
 */

interface PageVisit {
  path: string;
  /** The story being edited, when the page is an article editor. */
  articleId?: string;
  articleTitle?: string;
  since: number;
}

interface Presence {
  user: AuthUser;
  sockets: Map<string, PageVisit | null>;
  since: number;
}

const presence = new Map<string, Presence>();

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name)
      return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

async function attachStaff(socket: Socket) {
  const token = readCookie(socket.handshake.headers.cookie, env.cookieName);
  if (!token) return;
  let payload: ReturnType<typeof verifyToken> & { kind?: string };
  try {
    payload = verifyToken(token);
  } catch {
    return;
  }
  if (payload.kind || !payload.role) return;
  const user = await staffUser(payload.sub);
  if (!user || socket.disconnected) return;

  socket.data.user = user;
  socket.join(["staff", `user:${user.id}`]);
  if (user.role === "SUPER_ADMIN") socket.join("super");

  socket.on("presence:page", (msg: unknown) => {
    const path =
      msg && typeof msg === "object" && typeof (msg as { path?: unknown }).path === "string"
        ? (msg as { path: string }).path.slice(0, 200)
        : "";
    if (!path.startsWith("/admin")) return;
    notePage(user, socket.id, path).catch(() => {});
  });

  socket.on("disconnect", () => leave(user.id, socket.id));

  // Anything the panel sent before the user was looked up was dropped; this
  // tells it to say which page it is on again.
  socket.emit("staff:ready");
}

async function notePage(user: AuthUser, socketId: string, path: string) {
  const entry =
    presence.get(user.id) ??
    ({ user, sockets: new Map(), since: Date.now() } satisfies Presence);
  presence.set(user.id, entry);

  const visit: PageVisit = { path, since: Date.now() };
  const editing = path.match(/^\/admin\/articles\/([^/]+)\/edit/);
  if (editing) {
    visit.articleId = editing[1];
    const a = await prisma.article
      .findUnique({ where: { id: editing[1] }, select: { title: true } })
      .catch(() => null);
    if (a) visit.articleTitle = a.title;
  }
  // The socket may have closed while the title was being looked up.
  if (!presence.get(user.id)) return;
  entry.sockets.set(socketId, visit);
  emitPresence();
}

function leave(userId: string, socketId: string) {
  const entry = presence.get(userId);
  if (!entry || !entry.sockets.delete(socketId)) return;
  if (entry.sockets.size === 0) {
    presence.delete(userId);
    prisma.user
      .update({ where: { id: userId }, data: { lastSeenAt: new Date() } })
      .catch(() => null);
  }
  emitPresence();
}

/** Who has the admin panel open, and on which page(s). */
export function presenceSnapshot() {
  return [...presence.values()].map((p) => ({
    userId: p.user.id,
    name: p.user.name,
    role: p.user.role,
    since: new Date(p.since).toISOString(),
    pages: [...p.sockets.values()]
      .filter((v): v is PageVisit => !!v)
      .sort((a, b) => b.since - a.since)
      .map((v) => ({ ...v, since: new Date(v.since).toISOString() })),
  }));
}

let presenceTimer: NodeJS.Timeout | null = null;
function emitPresence() {
  if (presenceTimer) return;
  presenceTimer = setTimeout(() => {
    presenceTimer = null;
    io?.to("super").emit("presence:update", { online: presenceSnapshot() });
  }, 300);
}

export function emitToUser(userId: string, event: string, payload: unknown = {}) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToSupers(event: string, payload: unknown = {}) {
  io?.to("super").emit(event, payload);
}

export function emitToStaff(event: string, payload: unknown = {}) {
  io?.to("staff").emit(event, payload);
}

/**
 * Someone was switched off or deleted: tell their open panels to sign out, and
 * stop counting them as online.
 */
export function revokeUser(userId: string) {
  emitToUser(userId, "session:revoked");
  io?.in(`user:${userId}`).disconnectSockets(true);
  presence.delete(userId);
  emitPresence();
}

/**
 * A role change: their sockets must leave the Super Admin room if they were
 * demoted, and their open panels must re-read what they may do.
 */
export function refreshUserRooms(userId: string, role: string) {
  const room = io?.in(`user:${userId}`);
  if (!room) return;
  if (role === "SUPER_ADMIN") room.socketsJoin("super");
  else room.socketsLeave("super");
  const entry = presence.get(userId);
  if (entry) entry.user = { ...entry.user, role };
  for (const s of io?.sockets.sockets.values() ?? [])
    if (s.data.user?.id === userId) s.data.user = { ...s.data.user, role };
  emitToUser(userId, "permissions:changed");
  emitPresence();
}
