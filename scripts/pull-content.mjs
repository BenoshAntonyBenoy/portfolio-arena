/* ===========================================================================
   Refresh src/content/content.json from the live row.

   That file is the fallback the site renders when Supabase cannot be reached,
   so the further it drifts from the real content, the more out of date the
   page looks on the day it is actually needed. Run this now and then, and
   before a deploy that matters.

   Nothing is written unless the document passes the same validate() the panel
   saves through, so a bad row cannot be baked into the bundle.

   Run with `npm run pull:content`.
   =========================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "src/content/content.json");

const { SUPABASE_URL, SUPABASE_ANON_KEY, CONTENT_TABLE, SITE_KEY } =
  await import(`file://${resolve(root, "src/lib/supabase-config.ts")}`);
const { validate } = await import(`file://${resolve(root, "src/admin/schema.ts")}`);

const res = await fetch(
  `${SUPABASE_URL}/rest/v1/${CONTENT_TABLE}?site=eq.${SITE_KEY}&select=content`,
  { headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
);
if (!res.ok) {
  console.error(`Could not read the content row: HTTP ${res.status} ${res.statusText}`);
  process.exit(1);
}

const rows = await res.json();
const live = rows?.[0]?.content;
if (!live) {
  console.error(`No row for site "${SITE_KEY}".`);
  process.exit(1);
}

const problems = validate(live);
if (problems.length) {
  console.error("The live content does not validate, so nothing was written:\n");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}

/* Postgres stores jsonb with its own key order and hands it back that way, so
   a straight write would reshuffle the whole file and produce a diff with no
   change in it. Reuse the order already on disk and append anything new in
   alphabetical order; pulling content that has not changed then writes a file
   identical to the one already there. */
function orderLike(template, value) {
  if (Array.isArray(value)) {
    return value.map((v, i) =>
      orderLike(Array.isArray(template) ? (template[i] ?? template[0]) : undefined, v),
    );
  }
  if (!value || typeof value !== "object") return value;

  const known =
    template && typeof template === "object" && !Array.isArray(template)
      ? Object.keys(template).filter((k) => k in value)
      : [];
  const rest = Object.keys(value).filter((k) => !known.includes(k)).sort();

  const out = {};
  for (const k of [...known, ...rest]) out[k] = orderLike(template?.[k], value[k]);
  return out;
}

const previous = readFileSync(target, "utf8");

/* Match whatever line ending the file already has. This repository is worked
   on from Windows, so the checked-out file is CRLF; writing LF would rewrite
   every line and show up as a whole-file change containing nothing. */
const eol = previous.includes("\r\n") ? "\r\n" : "\n";
const next = (JSON.stringify(orderLike(JSON.parse(previous), live), null, 2) + "\n")
  .replace(/\r?\n/g, eol);

/* Neither branch calls process.exit. Node on Windows can trip a libuv
   assertion when the process is torn down while undici still holds the fetch
   socket open, which turns a successful run into exit code 127. Falling off
   the end of the module lets the socket close on its own. The failure paths
   above still exit, because they have to set a non-zero code. */
if (next === previous) {
  console.log("Already up to date. The bundled snapshot matches the live content.");
} else {
  writeFileSync(target, next);
  console.log(
    "Updated src/content/content.json from the live row.\n" +
    "Commit and deploy when you want the new fallback in the bundle.",
  );
}
