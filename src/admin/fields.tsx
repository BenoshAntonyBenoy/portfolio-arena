import { createContext, useContext } from "react";
import type { Doc, Field, ListSpec, StringListSpec } from "./schema";
import { displayName, isImagePath } from "./client";

/* ---------------------------------------------------------------------------
   Every control on screen is generated from SPEC, so adding a field to
   schema.ts makes it editable with no change to this file.

   Edits are addressed by path rather than by mutating a shared object, which
   is what lets a change three levels down inside a project row re-render
   without any component knowing where it sits.
   ------------------------------------------------------------------------- */

export type Path = (string | number)[];

export type Editor = {
  /** Replace whatever is at `path` with `value`. */
  set: (path: Path, value: unknown) => void;
  /** Open the media picker; whatever is chosen is written to `path`. */
  pick: (label: string, fieldKey: string, path: Path) => void;
};

const EditorContext = createContext<Editor | null>(null);
export const EditorProvider = EditorContext.Provider;

function useEditor(): Editor {
  const editor = useContext(EditorContext);
  if (!editor) throw new Error("An admin control was rendered outside the EditorProvider.");
  return editor;
}

// ------------------------------------------------------------------ helpers

/** Read a list defensively. A section that has never held one has no key at
 *  all, and rendering must not depend on the write having happened first. */
const listAt = (node: Doc, key: string): any[] =>
  Array.isArray(node?.[key]) ? node[key] : [];

function swapped<T>(arr: T[], i: number, j: number): T[] {
  const next = arr.slice();
  const t = next[i];
  next[i] = next[j];
  next[j] = t;
  return next;
}

/** Up, down and remove, in the corner of every repeatable row. */
function RowTools({
  index, length, onMove, onRemove,
}: {
  index: number;
  length: number;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="row-tools">
      <button type="button" title="Move up" aria-label="Move up"
        disabled={index === 0} onClick={() => onMove(-1)}>↑</button>
      <button type="button" title="Move down" aria-label="Move down"
        disabled={index === length - 1} onClick={() => onMove(1)}>↓</button>
      <button type="button" className="danger" title="Remove" aria-label="Remove"
        onClick={onRemove}>✕</button>
    </div>
  );
}

// ----------------------------------------------------------------- controls

export function FieldControl({ node, field, path }: { node: Doc; field: Field; path: Path }) {
  const { set } = useEditor();
  const at = [...path, field.key];
  const raw = node?.[field.key];

  // A group is a nested object, e.g. a button's label and link. It gets its
  // own bordered block rather than being flattened, so it stays obvious that
  // the two fields belong together.
  if (field.t === "group") {
    const inner = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    return (
      <div className="group-block">
        <p className="group-label">{field.label}</p>
        {(field.fields ?? []).map((f) => (
          <FieldControl key={f.key} node={inner} field={f} path={at} />
        ))}
        {field.hint ? <p className="hint">{field.hint}</p> : null}
      </div>
    );
  }

  const value = typeof raw === "string" ? raw : "";
  let control;

  if (field.t === "bool") {
    return (
      <div className="field">
        <label className="check">
          <input type="checkbox" checked={raw === true} onChange={(e) => set(at, e.target.checked)} />
          <span>{field.label}</span>
        </label>
        {field.hint ? <p className="hint">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.t === "select") {
    const options = field.options ?? [];
    control = (
      <select value={options.includes(value) ? value : ""} onChange={(e) => set(at, e.target.value)}>
        {field.optional ? <option value="">Not set</option> : null}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  } else if (field.t === "area") {
    control = <textarea value={value} onChange={(e) => set(at, e.target.value)} />;
  } else if (field.t === "image" || field.t === "file") {
    control = <MediaControl value={value} field={field} path={at} />;
  } else {
    control = <input type="text" value={value} onChange={(e) => set(at, e.target.value)} />;
  }

  return (
    <div className="field">
      <label>{field.label}{field.optional ? " (optional)" : ""}</label>
      {control}
      {field.hint ? <p className="hint">{field.hint}</p> : null}
    </div>
  );
}

function MediaControl({ value, field, path }: { value: string; field: Field; path: Path }) {
  const { pick } = useEditor();
  const isImage = isImagePath(value);

  return (
    <div className="media">
      <div className="thumb" style={isImage ? { backgroundImage: `url("${value}")` } : undefined}>
        {isImage ? "" : value ? "FILE" : "-"}
      </div>
      <div className="path">{value ? displayName(value) : "Nothing chosen yet"}</div>
      <button type="button" className="ghost" onClick={() => pick(field.label, field.key, path)}>
        Choose
      </button>
    </div>
  );
}

export function StringList({ node, spec, path }: { node: Doc; spec: StringListSpec; path: Path }) {
  const { set } = useEditor();
  const at = [...path, spec.key];
  const arr = listAt(node, spec.key) as string[];

  return (
    <div className="sublist">
      <p className="list-label">{spec.label}</p>
      {arr.map((val, i) => (
        // Index as key: these rows have no identity of their own, and two
        // blank entries would otherwise collide.
        <div className="srow" key={i}>
          {spec.area ? (
            <textarea
              value={val ?? ""}
              aria-label={`${spec.singular} ${i + 1}`}
              onChange={(e) => set([...at, i], e.target.value)}
            />
          ) : (
            <input
              type="text"
              value={val ?? ""}
              aria-label={`${spec.singular} ${i + 1}`}
              onChange={(e) => set([...at, i], e.target.value)}
            />
          )}
          <RowTools
            index={i} length={arr.length}
            onMove={(d) => set(at, swapped(arr, i, i + d))}
            onRemove={() => set(at, arr.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <button type="button" className="add" onClick={() => set(at, [...arr, ""])}>
        + Add {spec.singular.toLowerCase()}
      </button>
    </div>
  );
}

/** A new row with every field present and blank, so the controls have
 *  something to bind to and validate() has something to complain about. */
function blankRow(spec: ListSpec): Doc {
  const blankFields = (fields: Field[]): Doc => {
    const out: Doc = {};
    for (const f of fields) {
      if (f.t === "group") out[f.key] = blankFields(f.fields ?? []);
      else if (f.t === "bool") out[f.key] = false;
      else out[f.key] = "";
    }
    return out;
  };
  const row = blankFields(spec.fields ?? []);
  for (const sl of spec.stringLists ?? []) row[sl.key] = [];
  return row;
}

/** The rows of a list, shared by an object section's `lists` and by a
 *  top-level list section like the menu. */
export function ListRows({ arr, spec, at }: { arr: any[]; spec: ListSpec; at: Path }) {
  const { set } = useEditor();

  return (
    <>
      {arr.map((row, i) => {
        const named =
          spec.titleKey && typeof row?.[spec.titleKey] === "string" && row[spec.titleKey].trim()
            ? row[spec.titleKey]
            : `${spec.singular} ${i + 1}`;

        return (
          <div className="card" key={i}>
            <div className="card-head">
              <strong>{named}</strong>
              <RowTools
                index={i} length={arr.length}
                onMove={(d) => set(at, swapped(arr, i, i + d))}
                onRemove={() => {
                  if (!confirm(`Remove ${spec.singular.toLowerCase()} ${i + 1}?`)) return;
                  set(at, arr.filter((_, j) => j !== i));
                }}
              />
            </div>

            {(spec.fields ?? []).map((f) => (
              <FieldControl key={f.key} node={row} field={f} path={[...at, i]} />
            ))}
            {(spec.stringLists ?? []).map((sl) => (
              <StringList key={sl.key} node={row} spec={sl} path={[...at, i]} />
            ))}
          </div>
        );
      })}

      <button type="button" className="add" onClick={() => set(at, [...arr, blankRow(spec)])}>
        + Add {spec.singular.toLowerCase()}
      </button>
    </>
  );
}

export function ListEditor({ node, spec, path }: { node: Doc; spec: ListSpec; path: Path }) {
  return (
    <div className="sublist">
      <p className="list-label">{spec.label}</p>
      <ListRows arr={listAt(node, spec.key)} spec={spec} at={[...path, spec.key]} />
    </div>
  );
}
