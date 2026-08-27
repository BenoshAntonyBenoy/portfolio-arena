// ============================================================================
// Runtime validation for content.json.
//
// The site imports content.json through a cast, so TypeScript alone cannot
// prove the file is well formed. This validator is the real gate: the admin
// server runs it before every write, so a malformed document never reaches
// disk and therefore never reaches the repository.
//
// Errors are phrased for a human reading them in the panel, not for a
// stack trace: "Project 3: name is empty", not "expected string at [2].name".
// ============================================================================

/** Fields that must be a non-empty string. */
const str = (v) => typeof v === "string" && v.trim().length > 0;
/** Fields that may be absent, but must be a non-empty string when present. */
const optStr = (v) => v === undefined || v === null || str(v);
const arr = (v) => Array.isArray(v);

/** Collects problems as plain sentences instead of throwing on the first one. */
class Problems {
  constructor() {
    this.found = [];
  }
  add(where, what) {
    this.found.push(`${where}: ${what}`);
  }
  /** Asserts a non-empty string and reports it if missing. */
  str(where, label, value) {
    if (!str(value)) this.add(where, `${label} is empty`);
  }
  optStr(where, label, value) {
    if (!optStr(value)) this.add(where, `${label} must be text if it is set`);
  }
  /** Asserts an array of non-empty strings with at least `min` entries. */
  strList(where, label, value, min = 1) {
    if (!arr(value)) return this.add(where, `${label} must be a list`);
    if (value.length < min) this.add(where, `${label} needs at least ${min} entry`);
    if (value.some((s) => !str(s))) this.add(where, `${label} has a blank entry`);
  }
  list(where, label, value, min = 1) {
    if (!arr(value)) {
      this.add(where, `${label} must be a list`);
      return false;
    }
    if (value.length < min) this.add(where, `${label} needs at least ${min} entry`);
    return true;
  }
}

function checkNavItem(p, where, item) {
  if (!item || typeof item !== "object") return p.add(where, "is missing");
  p.str(where, "label", item.label);
  p.str(where, "link", item.href);
}

function checkImage(p, where, image) {
  if (!image || typeof image !== "object") return p.add(where, "image is missing");
  p.str(where, "image file", image.src);
  p.str(where, "image alt text", image.alt);
  p.optStr(where, "image srcSet", image.srcSet);
  p.optStr(where, "image position", image.position);
  if (image.fit !== undefined && image.fit !== "cover" && image.fit !== "contain") {
    p.add(where, 'image fit must be either "cover" or "contain"');
  }
}

/**
 * Validates a whole content document.
 * @returns {string[]} human-readable problems; empty means the document is safe to write.
 */
export function validateContent(c) {
  const p = new Problems();

  if (!c || typeof c !== "object") return ["The content document is not an object."];

  // --- meta -----------------------------------------------------------------
  const m = c.meta;
  if (!m || typeof m !== "object") {
    p.add("Profile", "section is missing");
  } else {
    for (const [key, label] of [
      ["name", "display name"],
      ["fullName", "full name"],
      ["role", "role"],
      ["tagline", "tagline"],
      ["location", "location"],
      ["email", "email"],
      ["resumeUrl", "résumé link"],
      ["avatar", "avatar image"],
      ["siteUrl", "site URL"],
    ]) {
      p.str("Profile", label, m[key]);
    }
    if (str(m.email) && !m.email.includes("@")) p.add("Profile", "email does not look like an address");
  }

  // --- nav, header CTA, socials --------------------------------------------
  if (p.list("Navigation", "menu", c.nav)) {
    c.nav.forEach((item, i) => checkNavItem(p, `Navigation item ${i + 1}`, item));
  }
  checkNavItem(p, "Header button", c.headerCta);
  if (p.list("Social links", "list", c.socials)) {
    c.socials.forEach((s, i) => {
      const where = `Social link ${i + 1}`;
      p.str(where, "label", s?.label);
      p.str(where, "handle", s?.handle);
      p.str(where, "link", s?.href);
    });
  }

  // --- hero -----------------------------------------------------------------
  const h = c.hero;
  if (!h || typeof h !== "object") {
    p.add("Hero", "section is missing");
  } else {
    p.str("Hero", "eyebrow", h.eyebrow);
    p.strList("Hero", "name lines", h.nameLines);
    p.str("Hero", "intro", h.intro);
    p.str("Hero", "availability", h.availability);
    checkNavItem(p, "Hero primary button", h.primaryCta);
    checkNavItem(p, "Hero secondary button", h.secondaryCta);
    if (p.list("Hero", "stats", h.stats)) {
      h.stats.forEach((s, i) => {
        p.str(`Hero stat ${i + 1}`, "value", s?.value);
        p.str(`Hero stat ${i + 1}`, "label", s?.label);
      });
    }
    p.strList("Hero", "floating tags", h.floatingTags);
  }

  // --- about ----------------------------------------------------------------
  const a = c.about;
  if (!a || typeof a !== "object") {
    p.add("About", "section is missing");
  } else {
    p.str("About", "eyebrow", a.eyebrow);
    p.str("About", "title", a.title);
    p.strList("About", "paragraphs", a.paragraphs);
    p.str("About", "signature", a.signature);
    if (p.list("About", "facts", a.facts)) {
      a.facts.forEach((f, i) => {
        p.str(`About fact ${i + 1}`, "label", f?.label);
        p.str(`About fact ${i + 1}`, "value", f?.value);
      });
    }
  }

  // --- skills ---------------------------------------------------------------
  const s = c.skills;
  if (!s || typeof s !== "object") {
    p.add("Skills", "section is missing");
  } else {
    p.str("Skills", "eyebrow", s.eyebrow);
    p.str("Skills", "title", s.title);
    if (p.list("Skills", "groups", s.groups)) {
      s.groups.forEach((g, i) => {
        const where = `Skill group ${i + 1}`;
        p.str(where, "title", g?.title);
        p.str(where, "caption", g?.caption);
        p.strList(where, "skills", g?.items);
      });
    }
  }

  // --- projects -------------------------------------------------------------
  const pr = c.projects;
  if (!pr || typeof pr !== "object") {
    p.add("Projects", "section is missing");
  } else {
    p.str("Projects", "eyebrow", pr.eyebrow);
    p.str("Projects", "title", pr.title);
    if (p.list("Projects", "list", pr.items)) {
      pr.items.forEach((item, i) => {
        const where = `Project ${i + 1}${str(item?.name) ? ` (${item.name})` : ""}`;
        p.str(where, "number", item?.index);
        p.str(where, "name", item?.name);
        p.str(where, "kicker", item?.kicker);
        p.str(where, "year", item?.year);
        p.str(where, "summary", item?.summary);
        p.str(where, "description", item?.description);
        p.strList(where, "tech tags", item?.tech);
        checkImage(p, where, item?.image);
        if (item?.highlights !== undefined) p.strList(where, "highlights", item.highlights, 0);
        p.optStr(where, "live link", item?.liveUrl);
        p.optStr(where, "live button label", item?.liveLabel);
        p.optStr(where, "GitHub link", item?.githubUrl);
        p.optStr(where, "GitHub button label", item?.githubLabel);
        if (item?.featured !== undefined && typeof item.featured !== "boolean") {
          p.add(where, "featured must be on or off");
        }
      });
    }
  }

  // --- achievements ---------------------------------------------------------
  const ach = c.achievements;
  if (!ach || typeof ach !== "object") {
    p.add("Highlights", "section is missing");
  } else {
    p.str("Highlights", "eyebrow", ach.eyebrow);
    p.str("Highlights", "title", ach.title);
    if (p.list("Highlights", "list", ach.items)) {
      ach.items.forEach((it, i) => {
        const where = `Highlight ${i + 1}`;
        p.str(where, "metric", it?.metric);
        p.str(where, "title", it?.title);
        p.str(where, "description", it?.description);
      });
    }
  }

  // --- contact --------------------------------------------------------------
  const ct = c.contact;
  if (!ct || typeof ct !== "object") {
    p.add("Contact", "section is missing");
  } else {
    for (const [key, label] of [
      ["eyebrow", "eyebrow"],
      ["title", "title"],
      ["prompt", "message"],
      ["emailLabel", "email button label"],
      ["resumeLabel", "résumé button label"],
      ["footerNote", "footer note"],
    ]) {
      p.str("Contact", label, ct[key]);
    }
  }

  return p.found;
}

/**
 * Second-pass check that every image referenced by the document actually
 * exists in public/. Kept separate from validateContent so the pure shape
 * check stays filesystem-free and easy to reason about.
 *
 * @returns {string[]} warnings about missing files.
 */
export function findMissingAssets(c, fileExists) {
  const missing = [];
  const seen = new Set();

  const check = (where, url) => {
    if (!str(url) || !url.startsWith("/")) return;
    if (url.startsWith("//") || url.includes("://")) return; // external, not ours
    const key = `${where}|${url}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!fileExists(url)) missing.push(`${where}: ${url} is not in the public folder`);
  };

  check("Profile avatar", c?.meta?.avatar);
  check("Profile résumé", c?.meta?.resumeUrl);

  for (const [i, item] of (c?.projects?.items ?? []).entries()) {
    const where = `Project ${i + 1}${str(item?.name) ? ` (${item.name})` : ""}`;
    check(where, item?.image?.src);
    // srcSet is "url 640w, url 1255w" - pull the URLs back out and check each.
    for (const part of String(item?.image?.srcSet ?? "").split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) check(where, url);
    }
  }

  return missing;
}
