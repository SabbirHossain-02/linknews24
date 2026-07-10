// One-off: import the frontend mock articles into the database so the
// public site (once wired to the API) has real content. Idempotent by slug.
// mock-data only uses type-only imports for "@/..." so tsx runs it fine.
import { prisma } from "../src/prisma";
import { allArticles, getArticleBody } from "../../web/src/lib/mock-data";

function bodyHtml(article: (typeof allArticles)[number], locale: "bn" | "en") {
  return getArticleBody(article, locale)
    .map((p) => `<p>${p}</p>`)
    .join("");
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (!admin) throw new Error("No super admin found — run the main seed first.");

  const cats = await prisma.category.findMany();
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < allArticles.length; i++) {
    const a = allArticles[i];
    const categoryId = catBySlug.get(a.category.slug);
    if (!categoryId) {
      skipped++;
      continue;
    }
    const exists = await prisma.article.findUnique({ where: { slug: a.slug } });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.article.create({
      data: {
        title: a.title,
        titleEn: a.titleEn,
        slug: a.slug,
        excerpt: a.excerpt,
        excerptEn: a.excerptEn,
        body: bodyHtml(a, "bn"),
        bodyEn: bodyHtml(a, "en"),
        categoryId,
        authorId: admin.id,
        authorName: a.author,
        imageTone: a.imageTone,
        isBreaking: Boolean(a.isBreaking),
        status: "PUBLISHED",
        viewCount: a.viewCount ?? 0,
        // spread publish times over the last two weeks, newest first
        publishedAt: new Date(Date.now() - i * 3 * 60 * 60 * 1000),
      },
    });
    created++;
  }

  console.log(`Seeded articles — created: ${created}, skipped: ${skipped}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
