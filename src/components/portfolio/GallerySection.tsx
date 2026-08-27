import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioConfig } from "../../content/portfolioConfig";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { SectionParallax } from "../ui/SectionParallax";

type GallerySectionProps = {
  gallery: PortfolioConfig["gallery"];
};

/**
 * Photos, added from the panel at /admin.
 *
 * The section renders nothing at all while it is empty. A grid of placeholder
 * squares looks broken; a missing section does not. App.tsx drops the matching
 * nav link on the same condition, so the menu never points at nothing.
 *
 * Clicking a photo opens it full size in a native <dialog>, which brings focus
 * trapping, Escape-to-close and the backdrop with it rather than having them
 * reimplemented here, badly.
 */
export function GallerySection({ gallery }: GallerySectionProps) {
  const items = gallery.items;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const hide = useCallback(() => setOpen(null), []);

  /* Open and close from an effect rather than inside the click handler.
     showModal() in the same tick as setOpen() opens the dialog before React
     has rendered the photo into it, so it comes up empty; and calling it on an
     already-open dialog throws InvalidStateError. Driving it from state avoids
     both. */
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open !== null && !dlg.open) dlg.showModal();
    if (open === null && dlg.open) dlg.close();
  }, [open]);

  /* The dialog's own close event (Escape, or dlg.close()) has to reset state.
     React's onClose cannot be relied on - 'close' does not bubble, so event
     delegation can miss it, and then `open` still points at the last photo:
     clicking that same photo sets identical state, React skips the re-render,
     and the lightbox never reopens.

     The dependency is load-bearing and easy to mistake for noise. The page
     first renders from the bundled snapshot, where the gallery is usually
     empty, so this component returns null and there is no dialog in the DOM
     yet - a mount-only effect would find nothing and silently never attach.
     The live content then arrives with photos and the dialog appears. Keying
     on whether it exists is what gets the listener onto it. */
  const hasItems = items.length > 0;
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClose = () => setOpen(null);
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, [hasItems]);

  const step = useCallback(
    (delta: number) =>
      setOpen((i) => (i === null ? null : (i + delta + items.length) % items.length)),
    [items.length],
  );

  // Arrow keys move between photos. Escape is handled by <dialog> itself.
  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  if (items.length === 0) return null;
  const active = open === null ? null : items[open];

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="mx-auto w-full max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32"
    >
      <SectionParallax>
        <SectionHeading id="gallery-title" eyebrow={gallery.eyebrow} title={gallery.title} />

        {/* Columns rather than a grid, so portrait and landscape photos can sit
            together without being cropped to a common aspect ratio. */}
        <ul className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((item, index) => (
            <li key={item.src} className="mb-5 break-inside-avoid">
              <Reveal delay={0.03 * (index % 3)}>
                <button
                  type="button"
                  onClick={() => setOpen(index)}
                  aria-label={item.caption ? `Enlarge: ${item.caption}` : "Enlarge photo"}
                  className="group block w-full overflow-hidden rounded-[10px] border border-line bg-surface text-left transition-colors hover:border-accent/45"
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {item.caption ? (
                    <span className="block px-4 py-3 text-sm leading-relaxed text-muted">
                      {item.caption}
                    </span>
                  ) : null}
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionParallax>

      <dialog
        ref={dialogRef}
        /* The dialog fills the screen, so a click landing on the element
           itself rather than the figure inside it is a backdrop click. */
        onClick={(event) => {
          if (event.target === dialogRef.current) hide();
        }}
        className="lightbox"
        aria-label="Photo viewer"
      >
        {active ? (
          <figure className="relative m-0 flex max-h-[92vh] max-w-[94vw] flex-col items-center gap-4">
            <img
              src={active.src}
              alt={active.caption}
              className="max-h-[80vh] w-auto max-w-full rounded-[10px] object-contain"
            />
            {active.caption ? (
              <figcaption className="rounded-full border border-line bg-surface px-5 py-2 text-sm text-cream">
                {active.caption}
              </figcaption>
            ) : null}

            <button
              type="button"
              onClick={hide}
              aria-label="Close"
              className="absolute -top-3 right-0 grid h-10 w-10 -translate-y-full place-items-center rounded-full border border-line bg-surface text-cream transition-colors hover:border-accent/45 sm:-right-2"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-0 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-cream transition-colors hover:border-accent/45"
                >
                  <Chevron className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-0 top-1/2 grid h-11 w-11 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-cream transition-colors hover:border-accent/45"
                >
                  <Chevron />
                </button>
              </>
            ) : null}
          </figure>
        ) : null}
      </dialog>
    </section>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={`h-4 w-4 ${className}`} fill="none">
      <path
        d="M6 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
