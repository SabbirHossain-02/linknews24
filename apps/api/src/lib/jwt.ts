import jwt from "jsonwebtoken";
import { env } from "../env";

export interface JwtPayload {
  sub: string;
  role: string;
}

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
