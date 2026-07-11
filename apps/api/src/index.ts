import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./env";
import { UPLOAD_DIR } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { authenticate } from "./middleware/auth";
import { setIo } from "./realtime";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

// Trust the first proxy (e.g. nginx, when added) so client IPs resolve correctly.
app.set("trust proxy", true);

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
