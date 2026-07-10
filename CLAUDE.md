# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LinkNews24 — a clean, bilingual (Bengali/English) Bangla online news portal. The Next.js frontend is currently driven by static mock data (`apps/web/src/lib/mock-data.ts`), but the **backend build has started** (self-hosted on the owner's VPS: Node + Express, PostgreSQL + Prisma, Redis, PM2). The frontend is deployed and live on the VPS via PM2. As modules move to the API, the mock-data accessors are the seam being replaced. Until a given feature is API-backed, assume it is still mock/localStorage-based.

## Working agreement (read first)

Two standing rules from the project owner — follow them every session:

1. **Backend build is APPROVED and in progress (as of 2026-07-10).** The site is now **fully self-hosted on the owner's VPS** (not Vercel). Proceed **phase by phase**, verifying each phase before the next. The VPS also hosts another site, **pkgit.net** (nginx `pkgit-portfolio`) — **never touch its config/files**; keep this project isolated (own ports, own DB, own nginx block). Server/deploy specifics (IP, ports, PM2 process names, DB/secret locations) live in the private session memory, never in this repo. Admin panel spec: `docs/ADMIN_PANEL_SPEC.md`.
2. **Push to GitHub after every change.** As soon as a new section/feature is finished or anything is updated, `git add` + `git commit` + `git push` to `origin` (`main`). Don't batch many changes into one unpushed pile — commit and push as you go so the remote stays current. Remote: `https://github.com/SabbirHossain-02/linknews24.git`.

## Commands

This is an npm workspaces monorepo. **All app commands run from `apps/web/`**, not the repo root.

```bash
cd apps/web
npm install
npm run dev      # dev server at http://localhost:3000
npm run build    # production build (also the fastest full type-check)
npm run start    # serve the production build
npm run lint     # eslint (flat config, eslint-config-next)
```

There is no test runner configured. `npm run build` is the primary correctness gate — it runs the TypeScript check across the whole app.

## Architecture

Next.js 15 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4. Import alias: `@/*` → `apps/web/src/*`.

### Data layer — everything flows from one file

`src/lib/mock-data.ts` is the single source of truth for all content. It exports per-category `Article[]` arrays, a `categories` list, `navItems` (the nav menu tree), and the accessor functions pages use: `getArticlesByCategory`, `getArticleBySlug`, `searchArticles`, `getLatestHeadlines`, `getArticleBody`, `getRelatedArticles`, and `paginate` (`ARTICLES_PER_PAGE = 6`). The `Article`/`Category` shapes live in `src/types/content.ts`. When the real API arrives, these accessor functions are the seam to replace — keep pages calling them rather than importing raw arrays where practical.

### Routing

- `src/app/page.tsx` — homepage, composes hand-picked sections from mock arrays.
- `src/app/[slug]/page.tsx` — a **single catch-all** that serves both category listings and individual articles. It first checks if `slug` matches a category, else an article, else `notFound()`. `generateStaticParams` pre-renders every category and article slug, so the whole site is static. Category vs. article is disambiguated by slug lookup, not by route structure — keep category slugs and article slugs from colliding.
- `src/app/search/`, `src/app/epaper/`, `src/app/dashboard/` — dedicated routes. E-Paper and dashboard are placeholder/localStorage-backed.

### Bilingual (bn/en) — a core cross-cutting concern

Every user-facing string is bilingual. Two mechanisms, don't mix them up:

1. **UI chrome strings** live in the `translations` object in `src/lib/i18n.ts`. Access via `const { t } = useLocale(); t("someKey")`. Adding UI text means adding a key with `{ bn, en }` there.
2. **Content strings** (article title/excerpt, category name, author, dates) are stored as paired fields on the data (`title`/`titleEn`, `name`/`nameEn`, etc.) and resolved with the `localized*` helpers in `i18n.ts` (`localizedName`, `localizedField`, `localizedAuthor`, `localizedDuration`, `localizedPublishedAt` — the last two also convert Bengali digits ০-৯ to Arabic).

Locale is client state in `LocaleProvider` (`src/components/providers/LocaleProvider.tsx`), persisted to `localStorage` (`linknews24-locale`), default `bn`. Anything calling `useLocale()`/`t()` must be a `"use client"` component.

### Providers & client-side state

`src/app/layout.tsx` wraps the app in `LocaleProvider` → `AuthProvider`, with `ConditionalAdBanner`, `SiteHeader`, and `SiteFooter` around every page. All persistent user state is browser `localStorage` — there is no server:

- `AuthProvider` (`providers/AuthProvider.tsx`) — mock auth; `login`/`register` just store `{name, email}`. Use `useAuth()`.
- `src/lib/auth-storage.ts` — localStorage helpers for the user, bookmarks (`toggleBookmark`, `isBookmarked`), and reading history (`recordHistory`, capped at 20). Keys are prefixed `linknews24-`.

`ready` on `AuthProvider` guards against hydration mismatch — localStorage is only read in `useEffect`, so gate auth-dependent UI on `ready` rather than rendering user state on first paint.

### Styling

Tailwind v4 configured entirely in CSS — `src/app/globals.css` defines design tokens (`--brand-navy`, `--brand-crimson`, `--surface`, `--border`, etc.) and maps them to Tailwind color utilities via `@theme inline`. Use the semantic classes (`bg-surface`, `border-border`, `text-foreground-muted`, `bg-brand-crimson`) rather than raw hex. Two fonts: Hind Siliguri (`--font-sans`, Bengali body) and Inter (`--font-ui`, Latin). Global font scale is driven by `--font-scale` on `html` (see `FontSizeControl`). Article card "images" are CSS gradients keyed by `Article.imageTone` via `toneGradientClass` in `src/lib/tone.ts` — there are no real image assets for articles.

### Components

Grouped by domain under `src/components/`: `home/`, `article/`, `category/`, `dashboard/`, `layout/` (header, footer, nav, ticker, ad banner, auth modal), `providers/`, `icons/`. Server components by default; add `"use client"` only when a component uses hooks, context (`useLocale`/`useAuth`), or browser APIs.

## Conventions

- Content additions go in `mock-data.ts` with **both** `bn` and `en` fields filled — a missing `*En` field breaks the English view.
- Reach content through the `getArticle*`/`search`/`paginate` accessors so the eventual API swap stays localized to `mock-data.ts`.
- Keep the app static-export-friendly: the catch-all route relies on `generateStaticParams` enumerating all slugs.

## Roadmap status (from docs/ PRD + Roadmap)

`docs/` holds the Bengali PRD and a phased Roadmap (originally written for the "Provath" placeholder name; the project is now LinkNews24). The plan: Phase 0 server → Phase 1 DB + JWT auth → Phase 2 CMS → **Phase 3 public frontend** → Phase 4 real-time → Phase 5 search/E-Paper/media. **What exists today is the Phase 3 frontend shell running entirely on mock data** — Phases 0–2 (backend/CMS) are not started (and blocked on rule #1 above).

Frontend already built: homepage (hero + thematic rows), category pages with pagination, article pages with SEO meta + Schema.org NewsArticle, responsive/mobile nav, breaking-news ticker (static), trending sidebar, social share, font-size control, newsletter form (UI), keyword search, photo gallery + video sections, localStorage dashboard (bookmarks/history), and a **bn/en toggle** (the PRD deferred this to a later phase — it's already done).

Frontend still remaining vs. the PRD/roadmap:
- **Search filters** — only keyword search exists; category + date filters (PRD 6.1) are missing.
- **Tag-based browsing** — no tag routes/pages (categories only).
- **E-Paper PDF viewer** — placeholder "coming soon" only (`epaper/EpaperView.tsx`); needs a real viewer + PDF upload from CMS.
- **Live Update page** and **real-time breaking ticker** — need Socket.io (roadmap Phase 4); the ticker is currently static mock data.
- **Push notifications** — not built.
- **Backend integration** — all content is hardcoded in `mock-data.ts`; the Phase 3 checkpoint "articles published from the CMS appear on the frontend" is impossible until the backend exists.
- **Real images** — article "images" are CSS gradients (`tone.ts`); no real media, Next.js Image, or WebP optimization yet.
- Lighthouse 90+ (mobile) is unverified.

Note: **dark/light mode toggle is intentionally NOT present.** The PRD lists it, but it was deliberately removed (commit "Remove dark mode…") — treat light-only as a decision, not an oversight; don't re-add it unless the owner asks.
