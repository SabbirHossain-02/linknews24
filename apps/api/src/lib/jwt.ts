import jwt from "jsonwebtoken";
import { env } from "../env";

export interface JwtPayload {
  sub: string;
  role: string;
}

export const signToken = (payload: JwtPayload) =>
  // Matches the cookie's lifetime; see the note there.
  jwt.sign(payload, env.jwtSecret, { expiresIn: "24h" });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
