import { PrismaClient } from "@prisma/client";
import { env } from "./env";

// Importing env first ensures dotenv is loaded before the client reads the URL.
export const prisma = new PrismaClient({
  datasources: { db: { url: env.databaseUrl } },
});
