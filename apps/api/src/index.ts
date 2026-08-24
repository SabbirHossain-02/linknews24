import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./env";
import { UPLOAD_DIR } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { accountRouter } from "./routes/account";
import { publicRouter } from "./routes/public";
import { servicesRouter } from "./routes/services";
import { adminRouter } from "./routes/admin";
import { authenticate } from "./middleware/auth";
import { setIo } from "./realtime";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

// Trust the first proxy (e.g. nginx, when added) so client IPs resolve correctly.
app.set("trust proxy", true);

/**
 * Baseline security headers.
 *
 * Written out rather than pulled from a package: there are only a handful that
 * matter for a JSON API plus a static uploads folder, and each one here is a
 * decision rather than a default. A Content-Security-Policy is deliberately
 * left to the web app, which knows what it loads.
 */
app.use((_req, res, next) => {
  // Never let a browser guess that an upload is something other than it says.
  res.setHeader("X-Content-Type-Options", "nosniff");
  // The API is not a page; nothing should be framing it.
  res.setHeader("X-Frame-Options", "DENY");
  // Don't leak the full admin URL to whatever a link points at.
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  // Express advertises itself by default; there is nothing to gain from that.
  res.removeHeader("X-Powered-By");
  next();
});
app.disable("x-powered-by");

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Uploaded media (images) — served with permissive CORS for <img> use.
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(UPLOAD_DIR),
);

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "ln24-api", time: new Date().toISOString() }),
);

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/services", servicesRouter);
app.use("/api", publicRouter);
app.use("/api/admin", authenticate, adminRouter);

app.use(notFound);
app.use(errorHandler);

const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: env.corsOrigin, credentials: true },
});
setIo(io);

server.listen(env.port, () => {
  console.log(`ln24-api listening on :${env.port} (${env.nodeEnv})`);
});
