# Project Handoff — Benosh Benoy Portfolio

> Paste the relevant parts of this file to any AI (or developer) before they edit this site.
> The goal: they edit the **existing** project correctly instead of rebuilding it or guessing wrong.

---

## This repo at a glance

| | |
|---|---|
| **What** | My personal portfolio. **Edit the existing code — do not rebuild from scratch.** |
| **Repo** | https://github.com/BenoshAntonyBenoy/portfolio-arena |
| **Stack** | React 19 + Vite 7 + TypeScript + Tailwind CSS **v4** (`@tailwindcss/vite` plugin — **not** PostCSS) + framer-motion |
| **Live URL** | https://portfolio.benosh.tech (custom domain, Vite `base` = `/`) |
| **Deploy** | Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → GitHub Pages |
| **DNS** | Managed at **get.tech**. CNAME `portfolio` → `benoshantonybenoy.github.io`. **Do not touch DNS.** |

---

## Editing the content

**Go to https://portfolio.benosh.tech/admin and enter the password.** Every
word, list, image and link on the site is editable there, from any browser or
phone. Press **Save** and it is live - there is no build and no deploy, because
the site reads its content from Supabase when it loads.

Setting up the password, once: Supabase dashboard for the **benosh-sites**
project, Authentication, Users, **Add user**. Email `benosh@portfolio.local`
(must match `ADMIN_EMAIL` in `src/admin/client.ts` exactly - it is not a real
inbox), a password you choose, and **Auto Confirm User: on**.

---

## Where the content lives

Row `arena` of `site_content` in the **benosh-sites** Supabase project
(`schfjvkppaihiwwddrql`, ap-south-1). One row per site, so benosh.tech can join
it later without a migration.

`src/content/content.json` is a snapshot of that row compiled into the bundle.
It renders until the fetch lands, and keeps rendering if the fetch never does,
so the public site cannot go down because the database is asleep. Refresh it
with `npm run pull:content` now and then.

**This is a different Supabase project from Sherry's portfolio, deliberately.**
Separate projects mean separate databases and separate accounts, so her password
does not merely fail here - her account does not exist in this database at all.
The anon key in `src/lib/supabase-config.ts` is meant to ship: RLS lets anyone
read and nobody write without signing in.

---

## Where to edit things

- **Content:** at `/admin`, not in the repo. `src/content/portfolioConfig.ts` now holds only the **types** plus the bundled fallback; `src/admin/schema.ts` holds the spec that generates the panel and validates every save. Add a field to both.
- **Section components:** `src/components/portfolio/*` (Navbar, HeroSection, AboutSection, SkillsSection, ProjectsSection, AchievementsSection, ContactSection).
- **Reusable UI:** `src/components/ui/*` (Logo, TiltCard, Cube3D, ScrollBackdrop, Reveal, SectionHeading).
- **The panel itself:** `src/admin/*`. It is generated from `SPEC` in `schema.ts`, so adding a field there makes it editable without touching any component.
- **Design tokens** (colors `ink` / `cream` / `accent`, fonts) are defined in **`src/index.css`** under the Tailwind v4 `@theme` block.
- **Static assets** (`me.jpg`, `resume.pdf`, `og-image.png`, `favicon.svg`, project images, `CNAME`, `robots.txt`, `sitemap.xml`) live in **`public/`**.

---

## How to run / build / deploy

```bash
npm install        # install deps
npm run dev         # local dev server
npm run build       # production build — MUST pass before pushing
```

- `npx tsc --noEmit` should be clean (no TypeScript errors).
- Deployment is automatic: **commit and push to `main`**, and the GitHub Actions workflow builds and publishes to GitHub Pages. Don't edit the workflow or `public/CNAME` unless you mean to change the domain.

---

## Naming rules (intentional — don't "fix" them)

- **"Benosh Antony Benoy"** appears in exactly two places: the **navbar** (beside the logo) and the **first About sentence**.
- The **large hero heading** stays **"Benosh Benoy"**, and "Benosh Benoy" is used everywhere else (photo label, footer, contact, etc.).

---

## Gotchas (read before changing layout/CSS)

- **Tailwind v4, not PostCSS.** Styling runs through the `@tailwindcss/vite` plugin. `vite.config.ts` sets `css: { postcss: {} }` on purpose, so Vite doesn't pick up a stray PostCSS config from a parent folder.
- **Dark background lives on `<html>` only.** `body` and `#root` are intentionally transparent. This keeps the `-z-10` background canvas and 3D cube visible *and* prevents a white flash while scrolling. Don't move the background color onto `body`/`#root`.
- **`ScrollBackdrop` canvas sizing:** it sizes from `window.innerWidth/innerHeight` with explicit `style.width/height`, and its `ResizeObserver` watches `document.documentElement` — **never the canvas itself** (that caused a runaway feedback loop that exploded the buffer). Keep it that way.
- **Animations respect `prefers-reduced-motion`** via `MotionConfig` in `App.tsx` and a reduced-motion branch in `ScrollBackdrop`.
- **GitHub Pages has no rewrites.** `/admin` is a client-side route, so the build copies `dist/index.html` to `dist/404.html` (see `copy404` in `vite.config.ts`). Pages serves 404.html for unknown paths, which boots the app and lets it route. Remove that and `/admin` 404s on a direct visit or refresh.
- **A `204` from PostgREST on an UPDATE does not mean it wrote anything.** With RLS filtering every row you get `204` and zero rows changed, so `saveDoc` asks for the changed rows back and checks those instead of the status.
- **Never `showModal()` in the same tick as `setState`** - the dialog opens before React renders into it and comes up empty. The gallery lightbox and the media picker both drive open/close from an effect for this reason.
- **The gallery hides itself while empty**, and `App.tsx` drops the `#gallery` menu link on the same condition, so the menu never points at nothing. The lightbox's `close` listener is keyed on whether there are photos: the dialog does not exist in the DOM while the gallery is empty, so a mount-only effect would silently never attach.

---

## The local panel is now superseded

`Edit Portfolio.bat` and `admin/` still run, but they write `src/content/content.json`,
which is only the fallback. **An edit made there will not appear on the live
site** even after Publish, because the site reads Supabase. Use `/admin`.

There is deliberately no drift check between `admin/schema.mjs` and
`src/admin/schema.ts`: the old one predates the gallery and does not know the
section exists. Either `admin/server.mjs` gets repointed at Supabase, or the
local panel is retired and `Edit Portfolio.bat` and `admin/` are deleted with
it. Undecided on purpose.

---

## My other sites (so you point each AI at the right repo)

| Site | Repo | Stack | Content file | Deploy |
|---|---|---|---|---|
| portfolio.benosh.tech | `portfolio-arena` | React + Vite | `src/content/portfolioConfig.ts` | GitHub Pages |
| benosh.tech (main) | `portfolio` | **Next.js** | `src/content/content.json` | Vercel |
| Sherry's portfolio | `portfolio-sherry` | React + Vite | Supabase, own project | Vercel |
| B-Agency template | `b-agency-next-template` | **Next.js** | `data/siteContent.ts` | Vercel |

**Tell any AI, for any of my sites:**
- "Edit the existing project — don't rebuild it. Run the build and fix all errors before pushing."
- "DNS for benosh.tech is at **get.tech**. Don't try to change DNS — just tell me the record to add."
- "Don't overwrite my live `benosh.tech` repo (`portfolio`) — that's the source of my main site."
