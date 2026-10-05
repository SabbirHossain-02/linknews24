import { prisma } from "../prisma";

/** Whether readers see the breaking-news bar. On unless switched off. */
export async function breakingEnabled(): Promise<boolean> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "breaking" } });
  const value = row?.value as { enabled?: unknown } | null | undefined;
  return value?.enabled !== false;
}
