import { createClient } from "@supabase/supabase-js";
import {
  CONTENT_TABLE, MEDIA_BUCKET, SITE_KEY, SUPABASE_ANON_KEY, SUPABASE_URL,
} from "../lib/supabase-config";
import { validate } from "./schema";
import type { Doc } from "./schema";

/* ---------------------------------------------------------------------------
   Everything the panel does to the outside world. The public site talks to
   PostgREST with a bare fetch; the panel needs sign-in, token refresh and file
   uploads, so here the real client earns its bytes. This module is only ever
   reached through the lazily loaded admin chunk.
   ------------------------------------------------------------------------- */

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // The panel is not an OAuth client and never receives a redirect carrying
    // a token; parsing the URL for one would only be a way to be surprised.
    detectSessionInUrl: false,
  },
});

/**
 * The account behind the password.
 *
 * Sign-in is a password alone. Supabase wants an email too, so the form
 * quietly supplies this one. It is not a real inbox and no mail will ever
 * reach it: the user is created by hand in the Supabase dashboard with
 * "Auto Confirm User" turned on. Change this string and sign-in stops matching
 * the account, with no error that says so.
 *
 * This is a different Supabase project from Sherry's portfolio, so her
 * password cannot work here even in principle - her account is in another
 * database entirely.
 */
export const ADMIN_EMAIL = "benosh@portfolio.local";

// --------------------------------------------------------------------- auth

export async function signIn(password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
  if (!error) return null;

  if (/invalid login credentials/i.test(error.message)) {
    return "That password is not right. Try again.";
  }
  if (/email not confirmed/i.test(error.message)) {
    return 'This account is not confirmed. Turn on "Auto Confirm User" for it in Supabase.';
  }
  if (/rate|too many/i.test(error.message)) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return error.message;
}

export const signOut = () => supabase.auth.signOut();

// ------------------------------------------------------------------ content

/** Read the document the panel is about to edit. Straight from the database,
 *  never from the bundled snapshot, so you are always editing what is live. */
export async function loadDoc(): Promise<Doc> {
  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .select("content")
    .eq("site", SITE_KEY)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.content) throw new Error("The content row is empty or missing.");
  return data.content as Doc;
}

export type SaveResult = { ok: true } | { ok: false; problems: string[] };

/**
 * Validate, then write the row.
 *
 * `.select()` on the end is load-bearing. PostgREST answers an UPDATE that
 * row-level security filtered down to nothing with a perfectly happy 204, so
 * the status code cannot tell you whether anything was written. Asking for the
 * changed rows back can: an empty array means the write was refused, which in
 * practice means the session expired while the tab sat open.
 */
export async function saveDoc(doc: Doc): Promise<SaveResult> {
  const problems = validate(doc);
  if (problems.length) return { ok: false, problems };

  const { data, error } = await supabase
    .from(CONTENT_TABLE)
    .update({ content: doc })
    .eq("site", SITE_KEY)
    .select("site");

  if (error) return { ok: false, problems: [error.message] };
  if (!data || data.length === 0) {
    return {
      ok: false,
      problems: ["Nothing was saved - your sign-in has expired. Sign out, sign back in, then save again."],
    };
  }
  return { ok: true };
}

// -------------------------------------------------------------------- media

const IMAGE_RE = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
export const isImagePath = (v: string) => IMAGE_RE.test(v.split("?")[0]);

const ALLOWED = ["png", "jpg", "jpeg", "webp", "gif", "avif", "svg", "pdf"];
const MAX_BYTES = 8 * 1024 * 1024;

/** Uploads land in a subfolder chosen by the field that asked for them, so the
 *  bucket keeps the same shape as public/ and stays readable months later. */
export function folderForField(key: string): string {
  if (key === "src") return "gallery";
  if (key === "avatar") return "profile";
  if (key === "resumeUrl") return "documents";
  return "";
}

/** Strip a filename down to something safe in a URL, and stamp it so two
 *  photos off a phone camera cannot overwrite each other. */
function storageName(name: string, stamp: number): string {
  const dot = name.lastIndexOf(".");
  const ext = (dot === -1 ? "" : name.slice(dot + 1)).toLowerCase();
  const stem =
    (dot === -1 ? name : name.slice(0, dot))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "file";
  return `${stem}-${stamp}.${ext}`;
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadMedia(file: File, folder: string): Promise<UploadResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.includes(ext)) {
    return { ok: false, error: `Only ${ALLOWED.join(", ")} files can be uploaded.` };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "That file is bigger than 8 MB. Try a smaller one." };
  }

  // Date.now() rather than a random id: the number doubles as a rough upload
  // date, which makes the bucket legible later.
  const prefix = folder ? `${SITE_KEY}/${folder}/` : `${SITE_KEY}/`;
  const path = prefix + storageName(file.name, Date.now());

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    if (/row-level security|unauthor|jwt/i.test(error.message)) {
      return { ok: false, error: "Your sign-in has expired. Sign out, sign back in, then upload again." };
    }
    return { ok: false, error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** What the picker offers. Only the bucket can be listed at runtime - the
 *  files under public/ live in the repository and no browser can enumerate
 *  them - so anything already in use is folded in. That is what keeps the
 *  existing project shots and the resume reusable here. */
export async function listMedia(doc: Doc): Promise<string[]> {
  const uploaded: string[] = [];

  const listFolder = async (prefix: string) => {
    const { data } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(prefix, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    for (const entry of data ?? []) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders come back as rows with no id.
      if (entry.id === null) {
        await listFolder(full);
      } else {
        uploaded.push(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(full).data.publicUrl);
      }
    }
  };
  // Only this site's prefix, so the other portfolio's uploads stay out of the way.
  await listFolder(SITE_KEY);

  return [...new Set([...uploaded, ...pathsInUse(doc)])];
}

/** Every media path the document points at, in either form: the root-relative
 *  paths served from the repository, and the bucket URLs. */
function pathsInUse(doc: Doc): string[] {
  const out = new Set<string>();
  const MEDIA_RE = /\.(png|jpe?g|webp|gif|avif|svg|pdf)$/i;

  const walk = (v: unknown) => {
    if (typeof v === "string") {
      const first = v.split(/[\s,]+/)[0];
      // srcSet holds several URLs with width descriptors; take each in turn.
      if (v.includes(",") && MEDIA_RE.test(first)) {
        for (const part of v.split(",")) {
          const url = part.trim().split(/\s+/)[0];
          if (url && MEDIA_RE.test(url)) out.add(url);
        }
        return;
      }
      if (MEDIA_RE.test(v) && (v.startsWith("/") || v.includes(`/${MEDIA_BUCKET}/`))) out.add(v);
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(doc);
  return [...out];
}

/** A short, readable name for a path, whichever form it takes. */
export function displayName(path: string): string {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  return parts.slice(-2).join("/") || path;
}
