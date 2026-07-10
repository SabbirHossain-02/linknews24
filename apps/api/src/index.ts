import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { authRouter } from "./routes/auth";
import { publicRouter } from "./routes/public";
import { adminRouter } from "./routes/admin";
import { authenticate } from "./middleware/auth";
import { notFound, errorHandler } from "./middleware/error";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "ln24-api", time: new Date().toISOString() }),
);

app.use("/api/auth", authRouter);
app.use("/api", publicRouter);
app.use("/api/admin", authenticate, adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`ln24-api listening on :${env.port} (${env.nodeEnv})`);
});
