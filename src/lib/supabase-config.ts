/* ---------------------------------------------------------------------------
   Where the live content lives.

   Both values below are meant to ship in the bundle. The anon key is a public
   identifier, not a secret: row-level security on `site_content` lets anyone
   read and nobody write without a signed-in session, so publishing the key
   grants a visitor exactly what the site already shows them.

   This is a different Supabase project from the one behind Sherry's
   portfolio, deliberately. Separate projects mean separate databases and
   separate accounts, so her password does not merely fail here - her account
   does not exist here at all.

   This file imports nothing. The public site reads its content with a plain
   fetch(), so @supabase/supabase-js never enters the main bundle; only the
   admin chunk, which needs auth and uploads, loads the real client. Keep it
   import-free.
   ------------------------------------------------------------------------- */

export const SUPABASE_URL = "https://schfjvkppaihiwwddrql.supabase.co";

export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaGZqdmtwcGFpaGl3d2RkcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzE1MTIsImV4cCI6MjEwMzQwNzUxMn0.RJJAxVG9B3vrX7AAdXpbwBdYMECA4621-D-SLQSAz7Y";

/** One row per site, so benosh.tech can join later without a migration. */
export const CONTENT_TABLE = "site_content";
export const SITE_KEY = "arena";

/** Public-read bucket. Uploads from the panel land here; writing needs a
 *  session. Shared with the other site, hence the generic name. */
export const MEDIA_BUCKET = "site-media";
