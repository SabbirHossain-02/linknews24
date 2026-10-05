import { z } from "zod";
import type { Article, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { slugify } from "./roles";

/** What the article form sends. */
export const articleSchema = z.object({
  title: z.string().min(1),
  titleEn: z.string().default(""),
  slug: z.string().optional(),
  excerpt: z.string().default(""),
  excerptEn: z.string().default(""),
  body: z.string().default(""),
  bodyEn: z.string().default(""),
  categoryId: z.string().min(1),
  authorName: z.string().optional(),
  imageTone: z.string().default("navy"),
  featuredImage: z.string().nullable().optional(),
  isBreaking: z.boolean().default(false),
  featured: z.boolean().default(false),
  isHero: z.boolean().default(false),
  // PENDING is what the form sends for "submit for approval".
  status: z.enum(["DRAFT", "SCHEDULED", "PENDING", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export type ArticleInput = z.infer<typeof articleSchema>;

/**
 * The status a save actually gets.
 *
 * Only the Super Admin publishes. Anyone else asking to publish — or to
 * schedule, which is publishing later — is asking for approval instead; a
 * draft stays a draft.
 */
export function resolveStatus(
  requested: ArticleInput["status"],
  isSuper: boolean,
): "DRAFT" | "SCHEDULED" | "PENDING" | "PUBLISHED" {
  if (isSuper) return requested === "PENDING" ? "DRAFT" : requested;
  return requested === "DRAFT" ? "DRAFT" : "PENDING";
}

// Turn free-typed tag names into connectOrCreate ops (dedup by slug).
export function tagConnectOrCreate(names?: string[]) {
  const unique = [
    ...new Map(
      (names ?? [])
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => [slugify(n), n]),
    ),
  ];
  return unique.map(([slug, name]) => ({
    where: { slug },
    create: { name, nameEn: name, slug },
  }));
}

// Only one article can be the hero — unset it on all others.
export async function clearOtherHeroes(keepId: string) {
  await prisma.article.updateMany({
    where: { isHero: true, id: { not: keepId } },
    data: { isHero: false },
  });
}

export async function uniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired);
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

/**
 * The fields of an article that the form controls, ready for prisma.update.
 * Used both for an ordinary save and for applying an approved revision, so the
 * two cannot drift apart.
 */
export async function contentFields(
  data: ArticleInput,
  existing: Pick<Article, "id" | "slug">,
): Promise<Prisma.ArticleUpdateInput> {
  return {
    title: data.title,
    titleEn: data.titleEn,
    slug: data.slug ? await uniqueSlug(data.slug, existing.id) : existing.slug,
    excerpt: data.excerpt,
    excerptEn: data.excerptEn,
    body: data.body,
    bodyEn: data.bodyEn,
    category: { connect: { id: data.categoryId } },
    imageTone: data.imageTone,
    featuredImage: data.featuredImage ?? null,
    isBreaking: data.isBreaking,
    featured: data.featured,
    isHero: data.isHero,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    authorName: data.authorName?.trim() || null,
    tags: { set: [], connectOrCreate: tagConnectOrCreate(data.tags) },
  };
}

/** Whether a category id points at a real category — a bad one used to crash the save. */
export async function categoryExists(id: string) {
  return !!(await prisma.category.findUnique({ where: { id }, select: { id: true } }));
}
