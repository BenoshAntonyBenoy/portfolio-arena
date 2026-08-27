// ============================================================================
// Admin panel UI.
//
// Plain JavaScript on purpose - no framework, no build step, no dependencies.
// Open it, edit, publish. Nothing here needs installing or updating.
//
// Editing model: text inputs write straight into the state object and schedule
// a debounced save, so typing never re-renders (and never steals focus).
// Only structural changes - add, delete, reorder - trigger a re-render.
// ============================================================================

// --- tiny DOM helper --------------------------------------------------------

function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in node && key !== "list") node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

const $ = (sel) => document.querySelector(sel);

// --- state ------------------------------------------------------------------

const state = {
  content: null,
  section: "projects",
  open: new Set(), // which list items are expanded
  problems: [],
  warnings: [],
  saveTimer: null,
  siteUrl: "",
};

const SECTIONS = [
  { id: "projects", label: "Projects", count: (c) => c.projects.items.length },
  { id: "skills", label: "Skills", count: (c) => c.skills.groups.length },
  { id: "highlights", label: "Highlights", count: (c) => c.achievements.items.length },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "links", label: "Menu & links", count: (c) => c.nav.length + c.socials.length },
  { id: "profile", label: "Profile" },
];

// --- server calls -----------------------------------------------------------

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });
  return res.json();
}

function setSaveState(tone, label) {
  const el = $("#save-state");
  el.dataset.tone = tone;
  el.textContent = label;
}

function touch() {
  setSaveState("saving", "Saving");
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(save, 700);
}

async function save() {
  clearTimeout(state.saveTimer);
  try {
    const result = await api("/api/content", {
      method: "POST",
      body: JSON.stringify({ content: state.content }),
    });
    if (!result.ok) {
      state.problems = result.problems || [result.error || "Could not save."];
      setSaveState("error", "Not saved");
      renderBanners();
      return false;
    }
    state.problems = [];
    state.warnings = result.warnings || [];
    setSaveState("saved", "Saved");
    renderBanners();
    return true;
  } catch {
    setSaveState("error", "Not saved");
    return false;
  }
}

// --- field builders ---------------------------------------------------------

/**
 * One labelled control.
 *
 * Required is the DEFAULT, because nearly every value on the site has to be
 * filled in - only a handful of extras are genuinely skippable. Pass
 * `{ optional: true }` for those, and they simply lose the asterisk.
 */
function field(label, control, hint, opts = {}) {
  const labelNode = h("label", {}, label);
  if (!opts.optional) {
    labelNode.append(h("span", { class: "req", text: "*", title: "Must be filled in" }));
  }
  return h(
    "div",
    { class: "field" },
    labelNode,
    control,
    hint ? h("span", { class: "hint", text: hint }) : null
  );
}

/** Text input bound to obj[key]. `onEcho` mirrors the value elsewhere live. */
function text(obj, key, { placeholder = "", type = "text", onEcho } = {}) {
  const input = h("input", {
    type,
    placeholder,
    value: obj[key] ?? "",
    oninput: () => {
      obj[key] = input.value;
      if (onEcho) onEcho(input.value);
      touch();
    },
  });
  return input;
}

function area(obj, key, { rows = 3, placeholder = "" } = {}) {
  const input = h("textarea", {
    rows,
    placeholder,
    value: obj[key] ?? "",
    oninput: () => {
      obj[key] = input.value;
      touch();
    },
  });
  return input;
}

function toggle(obj, key, label) {
  const input = h("input", {
    type: "checkbox",
    checked: Boolean(obj[key]),
    onchange: () => {
      obj[key] = input.checked;
      touch();
    },
  });
  return h(
    "label",
    { style: "display:flex;align-items:center;gap:9px;cursor:pointer;color:var(--cream)" },
    input,
    h("span", { text: label, style: "font-size:13px" })
  );
}

function select(obj, key, options, { allowEmpty = true } = {}) {
  const node = h("select", {
    onchange: () => {
      obj[key] = node.value || undefined;
      touch();
    },
  });
  if (allowEmpty) node.append(h("option", { value: "", text: "Default" }));
  for (const opt of options) {
    node.append(h("option", { value: opt, text: opt, selected: obj[key] === opt }));
  }
  node.value = obj[key] ?? "";
  return node;
}

/**
 * Chip editor for an array of plain strings (tech tags, skills, highlights).
 * Enter or comma commits; backspace on an empty box removes the last chip.
 */
function chips(list, { placeholder = "Type and press Enter" } = {}) {
  const wrap = h("div", { class: "chips" });

  const input = h("input", {
    type: "text",
    placeholder,
    onkeydown: (event) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        const value = input.value.trim();
        if (value) {
          list.push(value);
          input.value = "";
          paint();
          touch();
        }
      } else if (event.key === "Backspace" && input.value === "" && list.length) {
        list.pop();
        paint();
        touch();
      }
    },
    onblur: () => {
      const value = input.value.trim();
      if (value) {
        list.push(value);
        input.value = "";
        paint();
        touch();
      }
    },
  });

  function paint() {
    wrap.textContent = "";
    list.forEach((item, i) => {
      wrap.append(
        h(
          "span",
          { class: "chip" },
          item,
          h("button", {
            type: "button",
            text: "×",
            title: `Remove ${item}`,
            onclick: () => {
              list.splice(i, 1);
              paint();
              touch();
            },
          })
        )
      );
    });
    wrap.append(input);
  }

  paint();
  return wrap;
}

/** Textarea where each line becomes one array entry (paragraphs, name lines). */
function lines(obj, key, { rows = 4, hintPerLine = "one per line" } = {}) {
  const input = h("textarea", {
    rows,
    value: (obj[key] ?? []).join("\n"),
    placeholder: hintPerLine,
    oninput: () => {
      obj[key] = input.value.split("\n").map((s) => s.trim()).filter(Boolean);
      touch();
    },
  });
  return input;
}

// --- reorderable list -------------------------------------------------------

/**
 * Renders an array as collapsible, drag-reorderable cards.
 *
 * @param {object} config
 * @param {any[]} config.list        the array being edited (mutated in place)
 * @param {string} config.keyOf      unique-ish id for remembering open state
 * @param {(item, i) => string} config.title
 * @param {(item, i) => string} config.meta
 * @param {(item, i) => Node} config.body
 * @param {() => object} config.make new blank entry
 * @param {string} config.addLabel
 * @param {() => void} [config.afterChange] e.g. renumber projects
 */
function sortableList(config) {
  const container = h("div", { class: "items" });
  let dragFrom = null;

  const rerender = () => {
    const fresh = sortableList(config);
    container.replaceWith(fresh);
  };

  const commit = () => {
    if (config.afterChange) config.afterChange();
    touch();
    render();
  };

  if (config.list.length === 0) {
    container.append(h("div", { class: "empty", text: "Nothing here yet." }));
  }

  config.list.forEach((item, i) => {
    const openKey = `${config.keyOf}:${i}`;
    const isOpen = state.open.has(openKey);

    const titleNode = h("span", { class: "item-name", text: config.title(item, i) });

    const head = h(
      "div",
      {
        class: "item-head",
        onclick: (event) => {
          if (event.target.closest(".grip")) return;
          if (isOpen) state.open.delete(openKey);
          else state.open.add(openKey);
          render();
        },
      },
      h("span", { class: "grip", text: "⫶", title: "Drag to reorder" }),
      config.index ? h("span", { class: "item-index", text: config.index(item, i) }) : null,
      titleNode,
      config.meta ? h("span", { class: "item-meta", text: config.meta(item, i) }) : null,
      h("span", { class: "caret", text: "▶" })
    );

    const card = h("div", { class: "item", "data-open": String(isOpen) }, head);

    if (isOpen) {
      card.append(
        h(
          "div",
          { class: "item-body" },
          config.body(item, i, (label) => {
            titleNode.textContent = label;
          }),
          h(
            "div",
            { class: "item-actions" },
            h("button", {
              class: "btn btn-sm btn-ghost",
              type: "button",
              text: "Duplicate",
              onclick: () => {
                config.list.splice(i + 1, 0, structuredClone(item));
                commit();
              },
            }),
            h("button", {
              class: "btn btn-sm btn-ghost btn-danger",
              type: "button",
              text: "Delete",
              onclick: () => {
                if (!confirm(`Delete "${config.title(item, i)}"? This cannot be undone from here.`)) return;
                config.list.splice(i, 1);
                state.open.delete(openKey);
                commit();
              },
            })
          )
        )
      );
    }

    // Drag to reorder: only the grip starts a drag, so clicking the row still
    // expands it rather than picking the card up.
    const grip = head.querySelector(".grip");
    grip.addEventListener("mousedown", () => {
      card.draggable = true;
    });
    card.addEventListener("dragstart", (event) => {
      dragFrom = i;
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(i));
    });
    card.addEventListener("dragend", () => {
      card.draggable = false;
      card.classList.remove("dragging");
      container.querySelectorAll(".item").forEach((n) => n.classList.remove("drop-target"));
    });
    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      card.classList.add("drop-target");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drop-target"));
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const from = dragFrom ?? Number(event.dataTransfer.getData("text/plain"));
      if (Number.isNaN(from) || from === i) return;
      const [moved] = config.list.splice(from, 1);
      config.list.splice(i, 0, moved);
      state.open.clear();
      commit();
    });

    container.append(card);
  });

  container.append(
    h("button", {
      class: "btn",
      type: "button",
      style: "align-self:flex-start;margin-top:2px",
      text: config.addLabel,
      onclick: () => {
        config.list.push(config.make());
        state.open.clear();
        state.open.add(`${config.keyOf}:${config.list.length - 1}`);
        commit();
      },
    })
  );

  void rerender;
  return container;
}

// --- images -----------------------------------------------------------------

const IMAGE_QUALITY = 0.82;

/** Resizes in the browser and encodes WebP, so no image library is needed. */
async function makeWebpVariants(file) {
  const bitmap = await createImageBitmap(file);
  const natural = bitmap.width;

  let widths = [640, 1280].filter((w) => w < natural);
  widths.push(Math.min(natural, 1280));
  widths = [...new Set(widths)].sort((a, b) => a - b);

  const variants = [];
  for (const width of widths) {
    const height = Math.round((bitmap.height / bitmap.width) * width);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((done) => canvas.toBlob(done, "image/webp", IMAGE_QUALITY));
    if (!blob || blob.type !== "image/webp") {
      throw new Error("This browser cannot make WebP images. Try Chrome or Edge.");
    }
    const data = await new Promise((done) => {
      const reader = new FileReader();
      reader.onload = () => done(reader.result);
      reader.readAsDataURL(blob);
    });
    variants.push({ width, data });
  }

  bitmap.close?.();
  return variants;
}

function slugify(value) {
  return String(value || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}

/** Drop zone + alt text + fit controls for one project image. */
function imageEditor(project) {
  const zone = h("div", { class: "dropzone" });
  const fileInput = h("input", {
    type: "file",
    accept: "image/*",
    class: "sr-only",
    onchange: () => fileInput.files[0] && accept(fileInput.files[0]),
  });

  function paint() {
    zone.textContent = "";
    const src = project.image?.src;
    if (src) {
      zone.append(
        h("img", { src: `/asset${src}`, alt: "" }),
        h("span", { class: "badge", text: src.split("/").pop() })
      );
    } else {
      zone.append(
        h("span", {
          class: "placeholder",
          text: "Drop an image here, or click to choose one",
        })
      );
    }
  }

  async function accept(file) {
    if (!file.type.startsWith("image/")) {
      toast("That file is not an image.");
      return;
    }
    zone.textContent = "";
    zone.append(h("span", { class: "placeholder", text: "Processing…" }));
    try {
      const variants = await makeWebpVariants(file);
      const result = await api("/api/image", {
        method: "POST",
        body: JSON.stringify({ slug: slugify(project.name), variants }),
      });
      if (!result.ok) throw new Error(result.error || "Upload failed.");

      project.image = {
        ...project.image,
        src: result.src,
        srcSet: result.srcSet,
        alt: project.image?.alt || "",
      };
      if (!result.srcSet) delete project.image.srcSet;
      paint();
      touch();
      toast("Image added.");
    } catch (err) {
      paint();
      toast(err.message || "Could not process that image.");
    }
  }

  zone.addEventListener("click", () => fileInput.click());
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("over");
    const file = event.dataTransfer.files[0];
    if (file) accept(file);
  });

  paint();

  if (!project.image) project.image = { src: "", alt: "" };

  return h(
    "div",
    { class: "image-row" },
    h(
      "div",
      { class: "field" },
      h("label", {}, "Picture", h("span", { class: "req", text: "*", title: "Must be filled in" })),
      zone,
      fileInput
    ),
    h(
      "div",
      {},
      field(
        "Image description",
        text(project.image, "alt", { placeholder: "What the screenshot shows" }),
        "Read aloud by screen readers, and shown if the image fails to load."
      ),
      h(
        "div",
        { class: "row row-2" },
        field("Fit", select(project.image, "fit", ["cover", "contain"]), null, { optional: true }),
        field(
          "Position",
          text(project.image, "position", { placeholder: "center" }),
          "e.g. center 30%",
          { optional: true }
        )
      )
    )
  );
}

// --- section renderers ------------------------------------------------------

function renumberProjects() {
  state.content.projects.items.forEach((item, i) => {
    item.index = String(i + 1).padStart(2, "0");
  });
}

function sectionHeadingFields(obj) {
  return h(
    "div",
    { class: "card" },
    h("p", { class: "card-title", text: "Section heading" }),
    h(
      "div",
      { class: "row row-2" },
      field("Eyebrow", text(obj, "eyebrow"), "The small line above the heading."),
      field("Heading", text(obj, "title"))
    )
  );
}

const renderers = {
  projects() {
    const projects = state.content.projects;
    return [
      sectionHeadingFields(projects),
      sortableList({
        list: projects.items,
        keyOf: "project",
        index: (item) => item.index,
        title: (item) => item.name || "Untitled project",
        meta: (item) => item.year || "",
        addLabel: "+ Add project",
        afterChange: renumberProjects,
        make: () => ({
          index: String(projects.items.length + 1).padStart(2, "0"),
          name: "New project",
          kicker: "Category",
          year: String(new Date().getFullYear()),
          summary: "",
          description: "",
          tech: [],
          image: { src: "", alt: "" },
        }),
        body: (project, _i, setTitle) =>
          h(
            "div",
            {},
            h(
              "div",
              { class: "row row-2" },
              field("Name", text(project, "name", { onEcho: (v) => setTitle(v || "Untitled project") })),
              field("Category", text(project, "kicker"), "e.g. Adaptive Web App")
            ),
            h(
              "div",
              { class: "row row-2" },
              field("Year", text(project, "year")),
              field("Summary", text(project, "summary"), "One line, shown on the card.")
            ),
            field("Description", area(project, "description", { rows: 4 })),
            field("Tech tags", chips(project.tech), "Press Enter after each one."),
            field(
              "Highlights",
              lines(project, "highlights", { hintPerLine: "One bullet point per line" }),
              "Bullet points shown on the card. Leave empty to hide them.",
              { optional: true }
            ),
            imageEditor(project),
            h(
              "div",
              { class: "row row-2", style: "margin-top:14px" },
              field("Live link", text(project, "liveUrl", { type: "url", placeholder: "https://" }), null, { optional: true }),
              field("Live button text", text(project, "liveLabel", { placeholder: "View live" }), null, { optional: true })
            ),
            h(
              "div",
              { class: "row row-2" },
              field("GitHub link", text(project, "githubUrl", { type: "url", placeholder: "https://" }), null, { optional: true }),
              field("GitHub button text", text(project, "githubLabel", { placeholder: "Source" }), null, { optional: true })
            ),
            toggle(project, "featured", "Feature this project (larger card)")
          ),
      }),
    ];
  },

  skills() {
    const skills = state.content.skills;
    return [
      sectionHeadingFields(skills),
      sortableList({
        list: skills.groups,
        keyOf: "skillgroup",
        title: (group) => group.title || "Untitled group",
        meta: (group) => `${group.items?.length ?? 0} skills`,
        addLabel: "+ Add skill group",
        make: () => ({ title: "New group", caption: "", items: [] }),
        body: (group, _i, setTitle) =>
          h(
            "div",
            {},
            field("Group name", text(group, "title", { onEcho: (v) => setTitle(v || "Untitled group") })),
            field("Caption", text(group, "caption"), "One line describing this group."),
            field("Skills", chips(group.items), "Press Enter after each one.")
          ),
      }),
    ];
  },

  highlights() {
    const achievements = state.content.achievements;
    return [
      sectionHeadingFields(achievements),
      sortableList({
        list: achievements.items,
        keyOf: "achievement",
        title: (item) => item.title || "Untitled highlight",
        meta: (item) => item.metric || "",
        addLabel: "+ Add highlight",
        make: () => ({ metric: "", title: "New highlight", description: "" }),
        body: (item, _i, setTitle) =>
          h(
            "div",
            {},
            h(
              "div",
              { class: "row row-2" },
              field("Metric", text(item, "metric"), 'The big number, e.g. "5+" or "1st".'),
              field("Title", text(item, "title", { onEcho: (v) => setTitle(v || "Untitled highlight") }))
            ),
            field("Description", area(item, "description", { rows: 3 }))
          ),
      }),
    ];
  },

  hero() {
    const hero = state.content.hero;
    return [
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Opening" }),
        field("Eyebrow", text(hero, "eyebrow")),
        field("Name lines", lines(hero, "nameLines", { rows: 2 }), "One line per row of the big name."),
        field("Intro", area(hero, "intro", { rows: 4 })),
        field("Availability", text(hero, "availability"), 'e.g. "Kerala - Remote"')
      ),
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Buttons" }),
        h(
          "div",
          { class: "row row-2" },
          field("Main button text", text(hero.primaryCta, "label")),
          field("Main button link", text(hero.primaryCta, "href"))
        ),
        h(
          "div",
          { class: "row row-2" },
          field("Second button text", text(hero.secondaryCta, "label")),
          field("Second button link", text(hero.secondaryCta, "href"))
        )
      ),
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Floating tags" }),
        field("Tags", chips(hero.floatingTags), "The small chips around your photo.")
      ),
      h("p", { class: "card-title", text: "Statistics" }),
      sortableList({
        list: hero.stats,
        keyOf: "stat",
        title: (stat) => stat.label || "Untitled stat",
        meta: (stat) => stat.value || "",
        addLabel: "+ Add statistic",
        make: () => ({ value: "", label: "" }),
        body: (stat, _i, setTitle) =>
          h(
            "div",
            { class: "row row-2" },
            field("Value", text(stat, "value"), 'e.g. "100+"'),
            field("Label", text(stat, "label", { onEcho: (v) => setTitle(v || "Untitled stat") }))
          ),
      }),
    ];
  },

  about() {
    const about = state.content.about;
    return [
      sectionHeadingFields(about),
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Story" }),
        field("Paragraphs", lines(about, "paragraphs", { rows: 8 }), "One paragraph per line."),
        field("Signature line", text(about, "signature"))
      ),
      h("p", { class: "card-title", text: "Facts" }),
      sortableList({
        list: about.facts,
        keyOf: "fact",
        title: (fact) => fact.label || "Untitled fact",
        meta: (fact) => "",
        addLabel: "+ Add fact",
        make: () => ({ label: "", value: "" }),
        body: (fact, _i, setTitle) =>
          h(
            "div",
            { class: "row row-2" },
            field("Label", text(fact, "label", { onEcho: (v) => setTitle(v || "Untitled fact") })),
            field("Value", text(fact, "value"))
          ),
      }),
    ];
  },

  contact() {
    const contact = state.content.contact;
    return [
      sectionHeadingFields(contact),
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Message" }),
        field("Prompt", area(contact, "prompt", { rows: 4 })),
        h(
          "div",
          { class: "row row-2" },
          field("Email button text", text(contact, "emailLabel")),
          field("Résumé button text", text(contact, "resumeLabel"))
        ),
        field("Footer note", text(contact, "footerNote"))
      ),
    ];
  },

  links() {
    const content = state.content;
    return [
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Header button" }),
        h(
          "div",
          { class: "row row-2" },
          field("Text", text(content.headerCta, "label")),
          field("Link", text(content.headerCta, "href"))
        )
      ),
      h("p", { class: "card-title", text: "Menu" }),
      sortableList({
        list: content.nav,
        keyOf: "nav",
        title: (item) => item.label || "Untitled item",
        meta: (item) => item.href || "",
        addLabel: "+ Add menu item",
        make: () => ({ label: "", href: "#" }),
        body: (item, _i, setTitle) =>
          h(
            "div",
            { class: "row row-2" },
            field("Text", text(item, "label", { onEcho: (v) => setTitle(v || "Untitled item") })),
            field("Link", text(item, "href"), "Use #about, #skills, #projects, #beyond or #contact.")
          ),
      }),
      h("p", { class: "card-title", style: "margin-top:22px", text: "Social links" }),
      sortableList({
        list: content.socials,
        keyOf: "social",
        title: (item) => item.label || "Untitled link",
        meta: (item) => item.handle || "",
        addLabel: "+ Add social link",
        make: () => ({ label: "", handle: "", href: "" }),
        body: (item, _i, setTitle) =>
          h(
            "div",
            {},
            h(
              "div",
              { class: "row row-2" },
              field("Name", text(item, "label", { onEcho: (v) => setTitle(v || "Untitled link") })),
              field("Handle", text(item, "handle"), "Shown next to the name.")
            ),
            field("Link", text(item, "href", { type: "url" }))
          ),
      }),
    ];
  },

  profile() {
    const meta = state.content.meta;
    return [
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Who you are" }),
        h(
          "div",
          { class: "row row-2" },
          field("Display name", text(meta, "name"), "Used in headings."),
          field("Full name", text(meta, "fullName"), "Shown in the navbar.")
        ),
        field("Role", text(meta, "role")),
        field("Tagline", text(meta, "tagline")),
        h(
          "div",
          { class: "row row-2" },
          field("Location", text(meta, "location")),
          field("Email", text(meta, "email", { type: "email" }))
        )
      ),
      h(
        "div",
        { class: "card" },
        h("p", { class: "card-title", text: "Files & addresses" }),
        h(
          "div",
          { class: "row row-2" },
          field("Photo", text(meta, "avatar"), "A file in the public folder, e.g. /me.jpg"),
          field("Résumé", text(meta, "resumeUrl"), "e.g. /resume.pdf")
        ),
        field("Site address", text(meta, "siteUrl"), "Used for link previews. Change only if the domain changes.")
      ),
    ];
  },
};

// --- chrome -----------------------------------------------------------------

function renderRail() {
  const nav = $("#rail-nav");
  nav.textContent = "";
  for (const section of SECTIONS) {
    const count = section.count ? section.count(state.content) : null;
    nav.append(
      h(
        "button",
        {
          type: "button",
          "aria-current": String(state.section === section.id),
          onclick: () => {
            state.section = section.id;
            state.open.clear();
            render();
          },
        },
        h("span", { text: section.label }),
        count !== null ? h("span", { class: "count", text: String(count) }) : null
      )
    );
  }
}

function renderBanners() {
  const holder = $("#banners");
  if (!holder) return;
  holder.textContent = "";

  if (state.problems.length) {
    holder.append(
      h(
        "div",
        { class: "banner banner-error" },
        h("strong", { text: "Not saved - please fix these:" }),
        h("ul", {}, state.problems.map((p) => h("li", { text: p })))
      )
    );
  }
  if (state.warnings.length) {
    holder.append(
      h(
        "div",
        { class: "banner banner-warn" },
        h("strong", { text: "Saved, but check these:" }),
        h("ul", {}, state.warnings.map((w) => h("li", { text: w })))
      )
    );
  }
}

const PAGE_COPY = {
  projects: ["Projects", "Add, reorder, and edit the work shown on your site. Drag the handle on the left of a row to change the order - numbering updates itself."],
  skills: ["Skills", "The grouped toolkit shown in the skills section."],
  highlights: ["Highlights", "Achievements and milestones shown beyond the project grid."],
  hero: ["Hero", "The first thing anyone sees: your name, intro, buttons, and statistics."],
  about: ["About", "Your story, plus the fact list beside it."],
  contact: ["Contact", "The closing section and footer."],
  links: ["Menu & links", "Your navigation menu, header button, and social links."],
  profile: ["Profile", "Your name, role, and the files the site points at."],
};

function render() {
  renderRail();

  const [title, blurb] = PAGE_COPY[state.section];
  $("#page-title").textContent = title;

  const page = $("#page");
  page.textContent = "";
  page.append(
    h(
      "div",
      { class: "page-head" },
      h("h2", { text: title }),
      h("p", { text: blurb }),
      h(
        "p",
        { class: "legend" },
        h("span", { class: "req", text: "*" }),
        " must be filled in before you can publish. Everything else is optional."
      )
    ),
    h("div", { id: "banners" }),
    ...[renderers[state.section]()].flat()
  );

  renderBanners();
}

function toast(message) {
  const node = h("div", { class: "toast", text: message });
  document.body.append(node);
  setTimeout(() => node.remove(), 2600);
}

// --- publish ----------------------------------------------------------------

const PUBLISH_STEPS = [
  ["check", "Checking your content"],
  ["build", "Building the site"],
  ["commit", "Saving a version"],
  ["push", "Publishing to the web"],
];

async function runPublish() {
  const dialog = $("#publish-dialog");
  const body = $("#publish-body");
  const foot = $("#publish-foot");
  const message = $("#publish-message").value;

  body.textContent = "";
  const stepList = h("ul", { class: "steps" });
  const nodes = {};
  for (const [id, label] of PUBLISH_STEPS) {
    const node = h("li", { "data-state": "waiting" }, h("span", { class: "dot" }), h("span", { text: label }));
    nodes[id] = node;
    stepList.append(node);
  }
  const consoleBox = h("div", { class: "console", text: "" });
  body.append(stepList, consoleBox);
  foot.textContent = "";

  const log = (line) => {
    consoleBox.textContent += line + "\n";
    consoleBox.scrollTop = consoleBox.scrollHeight;
  };

  const finish = (ok, headline, detail) => {
    $("#publish-title").textContent = headline;
    $("#publish-sub").textContent = detail;
    foot.textContent = "";
    foot.append(
      h("button", {
        class: ok ? "btn btn-primary" : "btn",
        text: "Close",
        onclick: () => dialog.close(),
      })
    );
    if (ok) refreshGit();
  };

  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let current = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        if (!part.trim()) continue;
        const event = JSON.parse(part);

        if (event.type === "step") {
          if (current) nodes[current].dataset.state = "done";
          current = event.step;
          nodes[current].dataset.state = "active";
        } else if (event.type === "log") {
          log(event.line);
        } else if (event.type === "failed") {
          if (event.step && nodes[event.step]) nodes[event.step].dataset.state = "failed";
          log(event.detail || "");
          finish(
            false,
            "Nothing was published",
            "Your site is untouched and still live. Fix what is listed below, then try again."
          );
          return;
        } else if (event.type === "done") {
          if (current) nodes[current].dataset.state = "done";
          for (const [id] of PUBLISH_STEPS) {
            if (nodes[id].dataset.state === "waiting") nodes[id].dataset.state = "done";
          }
          finish(
            true,
            event.nothingToDo ? "Nothing to publish" : "Published",
            event.nothingToDo
              ? "Your live site already matches what is here."
              : "Your site is rebuilding now and will be live in about a minute."
          );
          return;
        }
      }
    }

    finish(false, "Publishing stopped", "The connection ended unexpectedly. Nothing was lost - try again.");
  } catch (err) {
    log(err?.message || String(err));
    finish(false, "Publishing failed", "Nothing was published. Your site is untouched.");
  }
}

function openPublishDialog() {
  const dialog = $("#publish-dialog");
  $("#publish-title").textContent = "Publish to the web";
  $("#publish-sub").textContent = "Your site will be rebuilt and checked before anything goes live.";

  const body = $("#publish-body");
  body.textContent = "";
  const input = h("input", { type: "text", id: "publish-message", placeholder: "Added my new project", maxLength: 72 });
  body.append(field("What did you change?", input, "Just a note for your own history.", { optional: true }));

  const foot = $("#publish-foot");
  foot.textContent = "";
  foot.append(
    h("button", { class: "btn", text: "Cancel", onclick: () => dialog.close() }),
    h("button", { class: "btn btn-primary", text: "Publish now", onclick: runPublish })
  );

  dialog.showModal();
  input.focus();
}

async function refreshGit() {
  const result = await api("/api/state");
  if (result.ok) {
    state.warnings = result.warnings || [];
    renderBanners();
  }
}

// --- boot -------------------------------------------------------------------

async function boot() {
  const result = await api("/api/state");
  if (!result.ok) {
    $("#page").textContent = "";
    $("#page").append(h("div", { class: "banner banner-error", text: result.error || "Could not load your content." }));
    return;
  }

  state.content = result.content;
  state.warnings = result.warnings || [];
  state.siteUrl = result.siteUrl;

  const link = $("#live-link");
  link.href = result.siteUrl || "#";
  $("#brand-site").textContent = (result.siteUrl || "").replace(/^https?:\/\//, "") || "portfolio";

  setSaveState("saved", "Saved");
  render();
}

$("#btn-publish").addEventListener("click", openPublishDialog);

$("#btn-revert").addEventListener("click", async () => {
  if (!confirm("Throw away every change you have made since your last publish?\n\nThis cannot be undone.")) return;
  const result = await api("/api/revert", { method: "POST" });
  if (!result.ok) {
    toast(result.error || "Could not undo.");
    return;
  }
  state.content = result.content;
  state.open.clear();
  state.problems = [];
  setSaveState("saved", "Saved");
  render();
  toast("Changes undone.");
});

// Ctrl/Cmd+S saves immediately rather than waiting for the debounce.
window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    save().then((ok) => ok && toast("Saved."));
  }
});

// Never let the window close with an edit still sitting in the debounce.
window.addEventListener("beforeunload", (event) => {
  if ($("#save-state").dataset.tone === "saving") {
    event.preventDefault();
    event.returnValue = "";
  }
});

boot();
