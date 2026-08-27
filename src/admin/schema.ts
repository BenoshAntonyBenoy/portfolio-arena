// ============================================================================
// The shape of the portfolio document, described once.
//
// This file does two jobs:
//   1. `SPEC` drives the panel at /admin - every field, list and image picker
//      is generated from it, so adding a field here makes it editable without
//      touching any component.
//   2. `validate()` is the gate before any write. The site reads the document
//      through a cast, so TypeScript cannot prove it is well formed; this is
//      what stops a broken document reaching the database.
//
// Messages are written for a person reading them in the panel - "Project 2:
// Name is empty", not "expected string at items[1].name".
//
// This supersedes the hand-written validator in admin/schema.mjs, which the
// local Node panel still uses.
//
// There is deliberately no drift check between the two. They have already
// diverged and are meant to: the old one predates the gallery and does not
// know the section exists, so it would reject a document this one requires.
// Reconciling them is not worth doing while the local panel's future is
// undecided - it writes content.json, which the live site no longer reads.
// See the note in README.md. When that is settled, one of the two files goes
// away rather than being kept in step with the other.
// ============================================================================

/** The control the panel renders for a field. */
export type FieldType = "text" | "area" | "image" | "file" | "bool" | "select" | "group";

export type Field = {
  key: string;
  label: string;
  t: FieldType;
  /** Optional fields may be blank, but must still be text when present. */
  optional?: boolean;
  hint?: string;
  /** For `select`: the allowed values. First one is the default. */
  options?: string[];
  /** For `group`: a nested object edited inline, e.g. a button's label + link. */
  fields?: Field[];
};

/** A repeating list of plain strings, e.g. the About paragraphs. */
export type StringListSpec = {
  key: string;
  label: string;
  singular: string;
  /** Render each entry as a textarea rather than a single-line input. */
  area?: boolean;
  min?: number;
};

/** A repeating list of objects, e.g. the projects. */
export type ListSpec = {
  key: string;
  label: string;
  singular: string;
  min?: number;
  max?: number;
  fields?: Field[];
  /** Plural, because a project row carries both tech tags and highlights. */
  stringLists?: StringListSpec[];
  /** Shown on the row header instead of "Project 3", when the row has a name. */
  titleKey?: string;
};

export type SectionSpec = {
  id: string;
  label: string;
  path: string[];
  hint?: string;
} & (
  | {
      /** The node at `path` is an object. */
      kind: "object";
      fields?: Field[];
      stringLists?: StringListSpec[];
      lists?: ListSpec[];
    }
  | {
      /** The node at `path` is itself an array, e.g. nav or socials. */
      kind: "list";
      row: ListSpec;
    }
);

/** field helpers */
const text = (key: string, label: string, opts: Partial<Field> = {}): Field => ({
  key, label, t: "text", ...opts,
});
const area = (key: string, label: string, opts: Partial<Field> = {}): Field => ({
  key, label, t: "area", ...opts,
});
const image = (key: string, label: string, opts: Partial<Field> = {}): Field => ({
  key, label, t: "image", ...opts,
});
const file = (key: string, label: string, opts: Partial<Field> = {}): Field => ({
  key, label, t: "file", ...opts,
});
const bool = (key: string, label: string, opts: Partial<Field> = {}): Field => ({
  key, label, t: "bool", ...opts,
});
const select = (key: string, label: string, options: string[], opts: Partial<Field> = {}): Field => ({
  key, label, t: "select", options, ...opts,
});
const group = (key: string, label: string, fields: Field[], opts: Partial<Field> = {}): Field => ({
  key, label, t: "group", fields, ...opts,
});

/** Every button on the site is a label plus a link. */
const linkFields = (): Field[] => [text("label", "Button text"), text("href", "Link")];

// ---------------------------------------------------------------------------

export const SPEC: SectionSpec[] = [
  {
    id: "meta", label: "Profile", kind: "object", path: ["meta"],
    fields: [
      text("name", "Display name", { hint: "Short form, used across the site." }),
      text("fullName", "Full name", { hint: "Shown in the navbar beside the logo." }),
      text("role", "Role"),
      text("tagline", "Tagline"),
      text("location", "Location"),
      text("email", "Email"),
      file("resumeUrl", "Resume file", { hint: "The PDF opened by the resume buttons." }),
      image("avatar", "Photo of you"),
      text("siteUrl", "Site URL", { hint: "Used in page metadata. Change only if the domain changes." }),
    ],
  },
  {
    id: "nav", label: "Menu", kind: "list", path: ["nav"],
    hint: "The links across the top. Each one points at a section of this page.",
    row: {
      key: "nav", label: "Menu links", singular: "Link",
      fields: linkFields(),
    },
  },
  {
    id: "headerCta", label: "Header button", kind: "object", path: ["headerCta"],
    fields: linkFields(),
  },
  {
    id: "socials", label: "Social links", kind: "list", path: ["socials"],
    row: {
      key: "socials", label: "Social links", singular: "Link",
      titleKey: "label",
      fields: [text("label", "Platform"), text("handle", "Handle"), text("href", "Link")],
    },
  },
  {
    id: "hero", label: "Hero", kind: "object", path: ["hero"],
    fields: [
      text("eyebrow", "Eyebrow"),
      area("intro", "Intro paragraph"),
      text("availability", "Availability line"),
      group("primaryCta", "Primary button", linkFields()),
      group("secondaryCta", "Secondary button", linkFields()),
    ],
    stringLists: [
      { key: "nameLines", label: "Name, one line per row", singular: "Line" },
      { key: "floatingTags", label: "Floating tags around the photo", singular: "Tag" },
    ],
    lists: [
      {
        key: "stats", label: "Stats", singular: "Stat",
        fields: [text("value", "Value"), text("label", "Label")],
      },
    ],
  },
  {
    id: "about", label: "About", kind: "object", path: ["about"],
    fields: [
      text("eyebrow", "Eyebrow"),
      text("title", "Title"),
      text("signature", "Signature line"),
    ],
    stringLists: [
      { key: "paragraphs", label: "Paragraphs", singular: "Paragraph", area: true },
    ],
    lists: [
      {
        key: "facts", label: "Facts", singular: "Fact",
        fields: [text("label", "Label"), text("value", "Value")],
      },
    ],
  },
  {
    id: "skills", label: "Skills", kind: "object", path: ["skills"],
    fields: [text("eyebrow", "Eyebrow"), text("title", "Title")],
    lists: [
      {
        key: "groups", label: "Groups", singular: "Group",
        titleKey: "title",
        fields: [text("title", "Group name"), text("caption", "Caption")],
        stringLists: [{ key: "items", label: "Skills", singular: "Skill" }],
      },
    ],
  },
  {
    id: "projects", label: "Projects", kind: "object", path: ["projects"],
    fields: [text("eyebrow", "Eyebrow"), text("title", "Title")],
    lists: [
      {
        key: "items", label: "Projects", singular: "Project",
        titleKey: "name",
        fields: [
          text("index", "Number", { hint: 'The small numeral on the card, e.g. "01".' }),
          text("name", "Name"),
          text("kicker", "Kicker"),
          text("year", "Year"),
          area("summary", "Summary"),
          area("description", "Description"),
          group("image", "Image", [
            image("src", "Image file"),
            text("alt", "Alt text", { hint: "Describes the picture for screen readers." }),
            text("srcSet", "Responsive sources", {
              optional: true,
              hint: 'Advanced. Leave blank unless you have several sizes, e.g. "/a-640.webp 640w, /a-1255.webp 1255w".',
            }),
            select("fit", "Fit", ["cover", "contain"], { optional: true }),
            text("position", "Focus point", { optional: true, hint: 'e.g. "center" or "top".' }),
          ]),
          bool("featured", "Featured", { optional: true, hint: "Gives the card more room." }),
          text("liveUrl", "Live link", { optional: true }),
          text("liveLabel", "Live button text", { optional: true }),
          text("githubUrl", "GitHub link", { optional: true }),
          text("githubLabel", "GitHub button text", { optional: true }),
        ],
        stringLists: [
          { key: "tech", label: "Tech tags", singular: "Tag" },
          { key: "highlights", label: "Highlights", singular: "Highlight", min: 0 },
        ],
      },
    ],
  },
  {
    id: "achievements", label: "Highlights", kind: "object", path: ["achievements"],
    fields: [text("eyebrow", "Eyebrow"), text("title", "Title")],
    lists: [
      {
        key: "items", label: "Highlights", singular: "Highlight",
        titleKey: "title",
        fields: [
          text("metric", "Big number"),
          text("title", "Title"),
          area("description", "Description"),
        ],
      },
    ],
  },
  {
    id: "gallery", label: "Gallery", kind: "object", path: ["gallery"],
    hint: "The gallery stays hidden on the live site until you add a photo, so it never shows as an empty strip.",
    fields: [text("eyebrow", "Eyebrow"), text("title", "Title")],
    lists: [
      {
        key: "items", label: "Photos", singular: "Photo", min: 0,
        fields: [
          image("src", "Photo"),
          text("caption", "Caption", {
            optional: true,
            hint: "Shown under the photo, and read out by screen readers.",
          }),
        ],
      },
    ],
  },
  {
    id: "contact", label: "Contact", kind: "object", path: ["contact"],
    fields: [
      text("eyebrow", "Eyebrow"),
      text("title", "Title"),
      area("prompt", "Message"),
      text("emailLabel", "Email button text"),
      text("resumeLabel", "Resume button text"),
      text("footerNote", "Footer note"),
    ],
  },
];

// ---------------------------------------------------------------------------

/** A loose stand-in for the document while it is being edited: the panel is
 *  generated from SPEC, so it reaches fields the static types cannot name. */
export type Doc = Record<string, any>;

const filled = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/**
 * Walks the document against SPEC and collects every problem as a sentence.
 * Returns [] when the document is safe to write.
 */
export function validate(doc: unknown): string[] {
  const problems: string[] = [];
  if (!doc || typeof doc !== "object") return ["The content document is not an object."];

  const checkFields = (where: string, obj: Doc | undefined, fields: Field[]) => {
    for (const f of fields) {
      const v = obj?.[f.key];

      if (f.t === "group") {
        if (v === undefined || v === null || typeof v !== "object" || Array.isArray(v)) {
          problems.push(`${where}: ${f.label} is missing.`);
          continue;
        }
        checkFields(`${where} ${f.label}`, v, f.fields ?? []);
        continue;
      }

      if (f.t === "bool") {
        if (v !== undefined && typeof v !== "boolean") {
          problems.push(`${where}: ${f.label} must be on or off.`);
        }
        continue;
      }

      if (f.optional) {
        if (v !== undefined && v !== null && typeof v !== "string") {
          problems.push(`${where}: ${f.label} must be text.`);
        }
        if (f.t === "select" && filled(v) && !f.options?.includes(v)) {
          problems.push(`${where}: ${f.label} must be one of ${f.options?.join(", ")}.`);
        }
        continue;
      }

      if (!filled(v)) problems.push(`${where}: ${f.label} is empty.`);
      if (f.t === "select" && filled(v) && !f.options?.includes(v)) {
        problems.push(`${where}: ${f.label} must be one of ${f.options?.join(", ")}.`);
      }
    }
  };

  const checkStrings = (where: string, arr: unknown, sl: StringListSpec) => {
    const min = sl.min ?? 1;
    // A list with a minimum of zero may simply be absent.
    if (arr === undefined && min === 0) return;
    if (!Array.isArray(arr)) {
      problems.push(`${where}: ${sl.label} must be a list.`);
      return;
    }
    if (arr.length < min) problems.push(`${where}: ${sl.label} needs at least ${min}.`);
    arr.forEach((s, i) => {
      if (!filled(s)) problems.push(`${where}: ${sl.singular} ${i + 1} is empty.`);
    });
  };

  const checkRows = (sectionLabel: string, arr: unknown, list: ListSpec) => {
    const min = list.min ?? 1;
    if (!Array.isArray(arr)) {
      problems.push(`${sectionLabel}: ${list.label} must be a list.`);
      return;
    }
    if (arr.length < min) problems.push(`${sectionLabel}: ${list.label} needs at least ${min}.`);
    if (list.max && arr.length > list.max) {
      problems.push(`${sectionLabel}: ${list.label} allows at most ${list.max}.`);
    }
    arr.forEach((row, i) => {
      // Name the row by its own title when it has one, so "Project (BQuick)"
      // beats counting cards to work out which one is broken.
      const named = list.titleKey && filled(row?.[list.titleKey]) ? ` (${row[list.titleKey]})` : "";
      const where = `${sectionLabel} ${list.singular} ${i + 1}${named}`;
      checkFields(where, row, list.fields ?? []);
      for (const sl of list.stringLists ?? []) checkStrings(where, row?.[sl.key], sl);
    });
  };

  for (const sec of SPEC) {
    const node = sec.path.reduce<any>((o, k) => o?.[k], doc);

    if (sec.kind === "list") {
      checkRows(sec.label, node, sec.row);
      continue;
    }

    if (!node || typeof node !== "object" || Array.isArray(node)) {
      problems.push(`${sec.label}: this whole section is missing.`);
      continue;
    }
    checkFields(sec.label, node, sec.fields ?? []);
    for (const sl of sec.stringLists ?? []) checkStrings(sec.label, node[sl.key], sl);
    for (const list of sec.lists ?? []) checkRows(sec.label, node[list.key], list);
  }

  // Not expressible in the spec: an address without an @ is a typo every time.
  const email = (doc as Doc)?.meta?.email;
  if (filled(email) && !email.includes("@")) {
    problems.push("Profile: Email does not look like an address.");
  }

  return problems;
}
