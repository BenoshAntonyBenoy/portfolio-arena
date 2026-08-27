import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { displayName, isImagePath, listMedia, uploadMedia } from "./client";
import type { Doc } from "./schema";

export type PickRequest = { label: string; folder: string } | null;

/* ---------------------------------------------------------------------------
   Choose a photo or a document, or upload a new one.

   The grid mixes two kinds of path and both keep working in an <img src>: the
   files that ship in the repository under public/, and the full URLs of
   anything uploaded here into the site-media bucket. Nothing rewrites the old
   paths, because there is nothing wrong with them.
   ------------------------------------------------------------------------- */

export function MediaPicker({
  request, doc, onChoose, onClose,
}: {
  request: PickRequest;
  doc: Doc;
  onChoose: (url: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [files, setFiles] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /* Open and close from an effect, never inside the click handler that set the
     state. showModal() in the same tick as a setState opens the dialog before
     React has rendered anything into it, and it comes up empty. */
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (request && !dlg.open) dlg.showModal();
    if (!request && dlg.open) dlg.close();
  }, [request]);

  /* Escape closes a <dialog> on its own, and the parent has to hear about it
     or `request` stays set and the picker will not reopen. 'close' does not
     bubble, so React's onClose cannot be relied on to catch it. */
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, [onClose]);

  /* The document is read through a ref rather than a dependency. It is needed
     only for the paths already in use, and it changes on every keystroke in
     the panel behind this dialog - as a dependency it would re-list the whole
     bucket each time. */
  const docRef = useRef(doc);
  docRef.current = doc;

  // Re-list on every open: something may have been uploaded from another device.
  useEffect(() => {
    if (!request) return;
    let live = true;
    setError("");
    setFiles(null);
    void listMedia(docRef.current).then((found) => {
      if (live) setFiles(found);
    });
    return () => { live = false; };
  }, [request]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !request) return;
    setBusy(true);
    setError("");
    const out = await uploadMedia(file, request.folder);
    setBusy(false);
    // Clear the input either way, so picking the same file again still fires.
    event.target.value = "";
    if (!out.ok) {
      setError(out.error);
      return;
    }
    onChoose(out.url);
  }

  return (
    <dialog
      ref={dialogRef}
      className="picker"
      aria-label="Choose a file"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="picker-head">
        <strong>{request?.label ?? "Choose a file"}</strong>
        <button type="button" className="ghost" onClick={onClose}>Close</button>
      </div>

      <div className="picker-body">
        <label className="upload">
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif,.avif,.svg,.pdf"
            hidden
            disabled={busy}
            onChange={onUpload}
          />
          <span>{busy ? "Uploading..." : "Upload a new file"}</span>
        </label>

        {error ? <p className="error">{error}</p> : null}

        <div className="grid">
          {files === null ? (
            <p className="nm">Loading...</p>
          ) : files.length === 0 ? (
            <p className="nm">No files yet. Upload one above.</p>
          ) : (
            files.map((f) => (
              <button key={f} type="button" onClick={() => onChoose(f)}>
                <span className="ph" style={isImagePath(f) ? { backgroundImage: `url("${f}")` } : undefined}>
                  {isImagePath(f) ? "" : "FILE"}
                </span>
                <span className="nm">{displayName(f)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </dialog>
  );
}
