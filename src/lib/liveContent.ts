import type { PortfolioConfig } from "../content/portfolioConfig";
import { CONTENT_TABLE, SITE_KEY, SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";

/* ---------------------------------------------------------------------------
   Reading the published document.

   Nothing here is allowed to throw or to delay the first paint. Every failure
   - offline, project paused, a 500, junk in the row - resolves to null,
   because they all mean the same thing to the caller: keep showing what you
   already have.
   ------------------------------------------------------------------------- */

/** Every section the components expect, and every array they call .map() on.
 *  A missing string renders blank and nobody dies; a missing array throws and
 *  takes the page with it. */
const SECTIONS = [
  "meta", "nav", "headerCta", "socials", "hero",
  "about", "skills", "projects", "achievements", "gallery", "contact",
] as const;

const TOP_LEVEL_LISTS = ["nav", "socials"] as const;

const NESTED_LISTS: [string, string][] = [
  ["hero", "nameLines"],
  ["hero", "stats"],
  ["hero", "floatingTags"],
  ["about", "paragraphs"],
  ["about", "facts"],
  ["skills", "groups"],
  ["projects", "items"],
  ["achievements", "items"],
  ["gallery", "items"],
];

/**
 * A deliberately shallow check, not the full validate() in src/admin/schema.
 * Its only job is to stop a malformed row replacing a page that already works,
 * so it looks for structure the components would crash on rather than for
 * content anyone would call correct. Thorough validation belongs on the write
 * side, where a person is standing there to read the complaints.
 */
export function isContent(v: unknown): v is PortfolioConfig {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const doc = v as Record<string, unknown>;

  for (const key of SECTIONS) {
    if (doc[key] === undefined || doc[key] === null) return false;
  }
  for (const key of TOP_LEVEL_LISTS) {
    if (!Array.isArray(doc[key])) return false;
  }
  for (const [key, list] of NESTED_LISTS) {
    const section = doc[key];
    if (!section || typeof section !== "object") return false;
    if (!Array.isArray((section as Record<string, unknown>)[list])) return false;
  }
  return typeof (doc.meta as Record<string, unknown>).name === "string";
}

/**
 * Read the published row straight from PostgREST.
 *
 * Deliberately a plain fetch rather than the Supabase client: reading needs no
 * session, no token refresh and no library, and keeping it that way holds tens
 * of kilobytes of JavaScript out of every visitor's download.
 */
export async function fetchPublishedContent(signal?: AbortSignal): Promise<PortfolioConfig | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${CONTENT_TABLE}?site=eq.${SITE_KEY}&select=content`,
      {
        signal,
        headers: {
          apikey: SUPABASE_ANON_KEY,
          authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { content?: unknown }[] | null;
    const doc = rows?.[0]?.content;
    return isContent(doc) ? doc : null;
  } catch {
    return null;
  }
}
