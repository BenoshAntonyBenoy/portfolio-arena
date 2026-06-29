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

## Where to edit things

- **All editable content** (name, tagline, about text, skills, projects, achievements, social links, résumé, contact) lives in **`src/content/portfolioConfig.ts`** — one typed config, single source of truth. **Keep new content here; do not hard-code text across components.**
- **Section components:** `src/components/portfolio/*` (Navbar, HeroSection, AboutSection, SkillsSection, ProjectsSection, AchievementsSection, ContactSection).
- **Reusable UI:** `src/components/ui/*` (Logo, TiltCard, Cube3D, ScrollBackdrop, Reveal, SectionHeading).
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

---

## My other sites (so you point each AI at the right repo)

| Site | Repo | Stack | Content file | Deploy |
|---|---|---|---|---|
| portfolio.benosh.tech | `portfolio-arena` | React + Vite | `src/content/portfolioConfig.ts` | GitHub Pages |
| benosh.tech (main) | `portfolio` | **Next.js** | `src/lib/data.ts` | Vercel |
| B-Agency template | `b-agency-next-template` | **Next.js** | `data/siteContent.ts` | Vercel |

**Tell any AI, for any of my sites:**
- "Edit the existing project — don't rebuild it. Run the build and fix all errors before pushing."
- "DNS for benosh.tech is at **get.tech**. Don't try to change DNS — just tell me the record to add."
- "Don't overwrite my live `benosh.tech` repo (`portfolio`) — that's the source of my main site."
