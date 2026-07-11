import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 4100),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  cookieName: "ln24_token",
  // Separate cookie for public advertiser accounts (keeps them isolated from admin).
  accountCookieName: "ln24_acc",
  // No HTTPS yet (IP:port) — cookie cannot be Secure or it won't be set.
  cookieSecure: process.env.COOKIE_SECURE === "true",
};
