// ============================================================================
// Local admin server for the portfolio.
//
// Deliberately dependency-free: it uses only Node built-ins, so there is no
// npm install to run, nothing to keep updated, and nothing that can rot. If
// Node runs, this runs.
//
// It binds to 127.0.0.1 only. Nothing here is reachable from the network, so
// there is no login, no token, and no exposed surface to attack.
// ============================================================================

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, writeFile, readdir, mkdir, unlink, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateContent, findMissingAssets } from "./schema.mjs";

const ADMIN_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(ADMIN_DIR, "..");
const CONTENT_FILE = join(REPO, "src", "content", "content.json");
const PUBLIC_DIR = join(REPO, "public");
const PROJECT_IMG_DIR = join(PUBLIC_DIR, "projects");

const PORT = Number(process.env.ADMIN_PORT) || 4321;
const MAX_BODY = 40 * 1024 * 1024; // generous: images arrive as base64
const IS_WIN = process.platform === "win32";

// --- small helpers ----------------------------------------------------------

/** Runs a command and resolves with its exit code and combined output. */
function run(cmd, args, { cwd = REPO, onLine } = {}) {
  return new Promise((done) => {
    const child = spawn(IS_WIN && cmd === "npm" ? "npm.cmd" : cmd, args, {
      cwd,
      shell: false,
      windowsHide: true,
    });
    let out = "";
    const take = (chunk) => {
      const text = chunk.toString();
      out += text;
      if (onLine) for (const line of text.split(/\r?\n/)) if (line.trim()) onLine(line);
    };
    child.stdout.on("data", take);
    child.stderr.on("data", take);
    child.on("error", (err) => done({ code: 1, out: `${out}\n${err.message}` }));
    child.on("close", (code) => done({ code: code ?? 1, out }));
  });
}

const json = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
};

function readBody(req) {
  return new Promise((done, fail) => {
    let size = 0;
    const parts = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        fail(new Error("That upload is too large."));
        req.destroy();
        return;
      }
      parts.push(chunk);
    });
    req.on("end", () => {
      try {
        done(parts.length ? JSON.parse(Buffer.concat(parts).toString("utf8")) : {});
      } catch {
        fail(new Error("The request body was not valid JSON."));
      }
    });
    req.on("error", fail);
  });
}

/** Strips anything that could escape the projects folder. */
function safeSlug(input) {
  const slug = String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "image";
}

/** True when a site-absolute URL like "/projects/x.webp" exists on disk. */
function publicFileExists(url) {
  const clean = decodeURIComponent(String(url).split("?")[0].split("#")[0]);
  const target = resolve(PUBLIC_DIR, "." + clean);
  if (!target.startsWith(PUBLIC_DIR + sep)) return false;
  return existsSync(target);
}

async function gitInfo() {
  const [branch, status, upstream] = await Promise.all([
    run("git", ["rev-parse", "--abbrev-ref", "HEAD"]),
    run("git", ["status", "--porcelain"]),
    run("git", ["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]),
  ]);
  const counts = upstream.code === 0 ? upstream.out.trim().split(/\s+/) : ["0", "0"];
  return {
    branch: branch.out.trim() || "unknown",
    dirty: status.out.trim().length > 0,
    changedFiles: status.out.trim().split(/\r?\n/).filter(Boolean).length,
    ahead: Number(counts[0]) || 0,
    behind: Number(counts[1]) || 0,
  };
}

async function loadContent() {
  return JSON.parse(await readFile(CONTENT_FILE, "utf8"));
}

// --- request handlers -------------------------------------------------------

const STATIC = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
};

async function serveStatic(res, path) {
  const [file, type] = STATIC[path];
  const body = await readFile(join(ADMIN_DIR, file));
  res.writeHead(200, { "content-type": type, "cache-control": "no-store" });
  res.end(body);
}

/** Serves files out of the site's public/ folder so the panel can show previews. */
async function serveAsset(res, path) {
  const rel = decodeURIComponent(path.slice("/asset".length));
  const target = resolve(PUBLIC_DIR, "." + rel);
  if (!target.startsWith(PUBLIC_DIR + sep) || !existsSync(target)) {
    res.writeHead(404).end("Not found");
    return;
  }
  const types = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
  };
  res.writeHead(200, {
    "content-type": types[extname(target).toLowerCase()] || "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(await readFile(target));
}

async function handleSaveContent(req, res) {
  const body = await readBody(req);
  const content = body?.content;

  const problems = validateContent(content);
  if (problems.length) return json(res, 400, { ok: false, problems });

  // Written with a trailing newline and stable 2-space indent so git diffs
  // stay small and readable rather than one giant reflowed line.
  await writeFile(CONTENT_FILE, JSON.stringify(content, null, 2) + "\n", "utf8");

  const warnings = findMissingAssets(content, publicFileExists);
  return json(res, 200, { ok: true, warnings, git: await gitInfo() });
}

async function handleUploadImage(req, res) {
  const { slug, variants, folder } = await readBody(req);
  if (!Array.isArray(variants) || variants.length === 0) {
    return json(res, 400, { ok: false, error: "No image data was received." });
  }

  const dir = folder === "root" ? PUBLIC_DIR : PROJECT_IMG_DIR;
  await mkdir(dir, { recursive: true });

  const base = safeSlug(slug);
  const written = [];

  for (const variant of variants) {
    const width = Number(variant?.width);
    const data = String(variant?.data || "");
    if (!Number.isFinite(width) || width <= 0 || !data) continue;

    const b64 = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
    const name = `${base}-${Math.round(width)}.webp`;
    await writeFile(join(dir, name), Buffer.from(b64, "base64"));
    written.push({
      width: Math.round(width),
      url: `${folder === "root" ? "" : "/projects"}/${name}`,
    });
  }

  if (!written.length) return json(res, 400, { ok: false, error: "No usable image sizes." });

  written.sort((a, b) => a.width - b.width);
  const largest = written[written.length - 1];
  const srcSet =
    written.length > 1 ? written.map((v) => `${v.url} ${v.width}w`).join(", ") : undefined;

  return json(res, 200, { ok: true, src: largest.url, srcSet, written });
}

async function handleListAssets(res) {
  const collect = async (dir, prefix) => {
    if (!existsSync(dir)) return [];
    const names = await readdir(dir);
    const out = [];
    for (const name of names) {
      const full = join(dir, name);
      const info = await stat(full);
      if (!info.isFile()) continue;
      if (!/\.(webp|png|jpe?g|svg|gif)$/i.test(name)) continue;
      out.push({ url: `${prefix}/${name}`, bytes: info.size });
    }
    return out.sort((a, b) => a.url.localeCompare(b.url));
  };
  const [projects, root] = await Promise.all([
    collect(PROJECT_IMG_DIR, "/projects"),
    collect(PUBLIC_DIR, ""),
  ]);
  return json(res, 200, { ok: true, images: [...projects, ...root] });
}

async function handleDeleteAsset(req, res) {
  const { url } = await readBody(req);
  const clean = decodeURIComponent(String(url || ""));
  const target = resolve(PUBLIC_DIR, "." + clean);
  if (!target.startsWith(PUBLIC_DIR + sep) || !existsSync(target)) {
    return json(res, 400, { ok: false, error: "That file is not in the public folder." });
  }

  // Refuse to delete anything the content still points at, in src or srcSet.
  const content = await loadContent();
  if (JSON.stringify(content).includes(clean)) {
    return json(res, 409, { ok: false, error: "That image is still being used - remove it from the project first." });
  }

  await unlink(target);
  return json(res, 200, { ok: true });
}

/**
 * Publishes: runs the exact command CI runs, and only pushes if it passes.
 * Streams newline-delimited JSON so the panel can show progress live.
 */
async function handlePublish(req, res) {
  const { message } = await readBody(req);
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-store",
  });
  const send = (event) => res.write(JSON.stringify(event) + "\n");

  const fail = (step, detail) => {
    send({ type: "failed", step, detail });
    res.end();
  };

  try {
    // 1. Re-validate what is actually on disk.
    send({ type: "step", step: "check", label: "Checking your content" });
    const content = await loadContent();
    const problems = validateContent(content);
    if (problems.length) return fail("check", problems.join("\n"));

    const missing = findMissingAssets(content, publicFileExists);
    if (missing.length) return fail("check", missing.join("\n"));

    // 2. Build exactly as GitHub Actions will, so a green build here means a
    //    green build there. This is what stops a broken site going live.
    send({ type: "step", step: "build", label: "Building the site" });
    const build = await run("npm", ["run", "build"], {
      onLine: (line) => send({ type: "log", line }),
    });
    if (build.code !== 0) return fail("build", build.out.slice(-4000));

    // 3. Commit.
    send({ type: "step", step: "commit", label: "Saving a version" });
    const add = await run("git", ["add", "-A"]);
    if (add.code !== 0) return fail("commit", add.out);

    const staged = await run("git", ["diff", "--cached", "--name-only"]);
    if (!staged.out.trim()) {
      send({ type: "done", nothingToDo: true, git: await gitInfo() });
      res.end();
      return;
    }
    send({ type: "log", line: `Changed: ${staged.out.trim().split(/\r?\n/).join(", ")}` });

    const subject = String(message || "").trim() || "Update portfolio content";
    const commit = await run("git", ["commit", "-m", subject]);
    if (commit.code !== 0) return fail("commit", commit.out);

    // 4. Push - this is what triggers the GitHub Pages deploy.
    send({ type: "step", step: "push", label: "Publishing to the web" });
    const info = await gitInfo();
    const push = await run("git", ["push", "origin", info.branch], {
      onLine: (line) => send({ type: "log", line }),
    });
    if (push.code !== 0) return fail("push", push.out.slice(-4000));

    send({ type: "done", git: await gitInfo() });
    res.end();
  } catch (err) {
    fail("unexpected", err?.message || String(err));
  }
}

// --- router -----------------------------------------------------------------

const server = createServer(async (req, res) => {
  const path = (req.url || "/").split("?")[0];

  try {
    if (req.method === "GET" && STATIC[path]) return await serveStatic(res, path);
    if (req.method === "GET" && path.startsWith("/asset/")) return await serveAsset(res, path);

    if (req.method === "GET" && path === "/api/state") {
      const content = await loadContent();
      return json(res, 200, {
        ok: true,
        content,
        git: await gitInfo(),
        warnings: findMissingAssets(content, publicFileExists),
        siteUrl: content?.meta?.siteUrl || "",
      });
    }

    if (req.method === "POST" && path === "/api/content") return await handleSaveContent(req, res);
    if (req.method === "POST" && path === "/api/image") return await handleUploadImage(req, res);
    if (req.method === "GET" && path === "/api/assets") return await handleListAssets(res);
    if (req.method === "POST" && path === "/api/asset/delete") return await handleDeleteAsset(req, res);
    if (req.method === "POST" && path === "/api/publish") return await handlePublish(req, res);

    if (req.method === "POST" && path === "/api/revert") {
      // Throws away uncommitted edits - the "undo everything since last publish".
      // Only possible once the file has been published at least once; before
      // that git has no previous version to restore, so say so plainly rather
      // than surfacing git's "pathspec did not match" error.
      const rel = "src/content/content.json";
      const tracked = await run("git", ["ls-files", "--error-unmatch", rel]);
      if (tracked.code !== 0) {
        return json(res, 400, {
          ok: false,
          error: "There is nothing to undo yet - this content has never been published.",
        });
      }
      const result = await run("git", ["checkout", "--", rel]);
      if (result.code !== 0) return json(res, 500, { ok: false, error: result.out });
      const content = await loadContent();
      return json(res, 200, { ok: true, content, git: await gitInfo() });
    }

    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
  } catch (err) {
    json(res, 500, { ok: false, error: err?.message || String(err) });
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} is already in use.`);
    console.error("  The panel may already be open in another window.\n");
  } else {
    console.error(`\n  ${err.message}\n`);
  }
  process.exit(1);
});

// 127.0.0.1 rather than 0.0.0.0: this must never be reachable off this machine.
server.listen(PORT, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`\n  Portfolio admin running at  ${url}`);
  console.log(`  Editing: ${CONTENT_FILE}`);
  console.log(`\n  Close this window when you are finished.\n`);

  // Opened here rather than from the launcher script so it can only happen
  // once the server is genuinely accepting connections.
  if (process.env.ADMIN_NO_OPEN) return;
  const [cmd, args] =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  spawn(cmd, args, { stdio: "ignore", detached: true, windowsHide: true }).unref();
});
