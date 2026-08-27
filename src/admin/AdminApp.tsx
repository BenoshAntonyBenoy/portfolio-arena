import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import "./admin.css";
import { SPEC } from "./schema";
import type { Doc } from "./schema";
import { folderForField, loadDoc, saveDoc, signIn, signOut, supabase } from "./client";
import { EditorProvider, FieldControl, ListEditor, ListRows, StringList } from "./fields";
import type { Path } from "./fields";
import { MediaPicker } from "./MediaPicker";

/* ===========================================================================
   The panel at /admin.

   Reached by a password alone. Supabase needs an email too, which the sign-in
   form supplies from a constant - see ADMIN_EMAIL in client.ts.

   There is no Publish button. This writes to the database the live site reads
   from, so a save is already published.
   =========================================================================== */

export default function AdminApp() {
  // undefined while the stored session is being read off disk, which is a
  // different thing from "signed out" and must not flash the login form.
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  // index.html carries the portfolio's own title, wrong for a tab likely to be
  // open beside the site itself.
  useEffect(() => {
    document.title = "Portfolio Admin - Benosh Benoy";
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="admin-root">
      {session === undefined ? (
        <div className="signin"><p className="loading">Checking your sign-in...</p></div>
      ) : session ? (
        <Panel />
      ) : (
        <SignIn />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ sign in

function SignIn() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError("");
    const problem = await signIn(password);
    setBusy(false);
    if (problem) {
      setError(problem);
      setPassword("");
      return;
    }
    // On success the auth listener in AdminApp swaps this form for the panel.
  }

  return (
    <div className="signin">
      <form className="signin-card" onSubmit={submit}>
        <h1>Portfolio Admin</h1>
        <p className="sub">portfolio.benosh.tech</p>

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="primary" type="submit" disabled={busy || !password}>
          {busy ? "Signing in..." : "Sign in"}
        </button>

        {error ? <p className="error">{error}</p> : null}
      </form>
    </div>
  );
}

// -------------------------------------------------------------------- panel

type Banner = { kind: "ok" | "bad"; text: string; problems?: string[] } | null;

/** Replace the value at `path` without mutating anything on the way down. */
function setIn(root: any, path: Path, value: unknown): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const base = root ?? (typeof head === "number" ? [] : {});
  const child = setIn(base[head], rest, value);
  if (Array.isArray(base)) {
    const copy = base.slice();
    copy[head as number] = child;
    return copy;
  }
  return { ...base, [head]: child };
}

type PickTarget = { label: string; folder: string; path: Path };

function Panel() {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loadError, setLoadError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [current, setCurrent] = useState(SPEC[0].id);
  const [pickTarget, setPickTarget] = useState<PickTarget | null>(null);

  // Always the live document, never the snapshot compiled into the bundle -
  // otherwise a save from a phone would be silently undone from a laptop.
  useEffect(() => {
    let live = true;
    loadDoc().then(
      (d) => { if (live) setDoc(d); },
      (err: Error) => { if (live) setLoadError(err.message); },
    );
    return () => { live = false; };
  }, []);

  // The browser's own "leave this page?" prompt. Nothing here autosaves.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = useCallback((path: Path, value: unknown) => {
    setDoc((d) => (d ? setIn(d, path, value) : d));
    setDirty(true);
  }, []);

  const pick = useCallback((label: string, fieldKey: string, path: Path) => {
    setPickTarget({ label, folder: folderForField(fieldKey), path });
  }, []);

  // Stable, so a keystroke does not hand every control a new editor.
  const editor = useMemo(() => ({ set, pick }), [set, pick]);

  async function save() {
    if (!doc || saving) return;
    setSaving(true);
    setBanner(null);
    const result = await saveDoc(doc);
    setSaving(false);

    if (!result.ok) {
      setBanner({ kind: "bad", text: "Not saved. Fix these first:", problems: result.problems });
      return;
    }
    setDirty(false);
    setBanner({ kind: "ok", text: "Saved. It is on the live site now - refresh the site to see it." });
  }

  async function leave() {
    if (dirty && !confirm("You have unsaved changes. Sign out and lose them?")) return;
    setDirty(false);
    await signOut();
  }

  // The OK banner clears itself; the bad one stays until it is dealt with.
  useEffect(() => {
    if (banner?.kind !== "ok") return;
    const id = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(id);
  }, [banner]);

  if (loadError) {
    return (
      <div className="shell">
        <p className="error">
          Could not load your content. {loadError} Check your connection and reload the page.
        </p>
      </div>
    );
  }
  if (!doc) return <div className="shell"><p className="loading">Loading your content...</p></div>;

  const section = SPEC.find((s) => s.id === current) ?? SPEC[0];
  const node = section.path.reduce<any>((o, k) => o?.[k], doc);

  return (
    <EditorProvider value={editor}>
      <header className="topbar">
        <div className="brand">
          <span className="dot" />
          <strong>Portfolio Admin</strong>
          <span className="sub">portfolio.benosh.tech</span>
        </div>
        <div className="actions">
          <a className="ghost" href="/" target="_blank" rel="noreferrer">Open the site</a>
          {dirty ? <span className="dirty">Unsaved changes</span> : null}
          <button className="ghost" type="button" onClick={leave}>Sign out</button>
          <button className="primary" type="button" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {banner ? (
        <div className={`banner ${banner.kind}`} role="status">
          <strong>{banner.text}</strong>
          {banner.problems?.length ? (
            <ul>{banner.problems.map((p: string) => <li key={p}>{p}</li>)}</ul>
          ) : null}
        </div>
      ) : null}

      <main className="shell">
        <nav className="nav" aria-label="Sections">
          {SPEC.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={s.id === current}
              onClick={() => setCurrent(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <section className="panel">
          <h2 className="section-title">{section.label}</h2>
          {section.hint ? <p className="section-hint">{section.hint}</p> : null}

          {section.kind === "list" ? (
            <ListRows
              arr={Array.isArray(node) ? node : []}
              spec={section.row}
              at={section.path}
            />
          ) : (
            <>
              {(section.fields ?? []).map((f) => (
                <FieldControl key={f.key} node={node ?? {}} field={f} path={section.path} />
              ))}
              {(section.stringLists ?? []).map((sl) => (
                <StringList key={sl.key} node={node ?? {}} spec={sl} path={section.path} />
              ))}
              {(section.lists ?? []).map((l) => (
                <ListEditor key={l.key} node={node ?? {}} spec={l} path={section.path} />
              ))}
            </>
          )}
        </section>
      </main>

      <p className="publish-note">
        There is no Publish button. Saving is publishing: the site reads this content
        when it loads, so a save is live straight away.
      </p>

      <MediaPicker
        request={pickTarget}
        doc={doc}
        onClose={() => setPickTarget(null)}
        onChoose={(url) => {
          if (pickTarget) set(pickTarget.path, url);
          setPickTarget(null);
        }}
      />
    </EditorProvider>
  );
}
