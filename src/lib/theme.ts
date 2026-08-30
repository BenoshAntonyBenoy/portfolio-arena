import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "portfolio-theme";

/** Kept in sync with the ground colour each palette paints on <html>. */
export const PAGE_GROUND: Record<Theme, string> = { dark: "#0a0a0c", light: "#f7f4ee" };

/* The source of truth is the `data-theme` attribute on <html>, not React state.
   index.html sets it in a blocking script before first paint — the only way to
   avoid a flash of the wrong palette — so by the time any component renders the
   answer already exists in the DOM. Reading it back rather than re-deriving it
   keeps the two from ever disagreeing.

   Dark is the default and the site's identity: an unset visitor gets the dark
   design, not their OS preference. Only an explicit choice, stored here, moves
   anyone to light.

   Components subscribe through useSyncExternalStore, so the nav toggle and the
   canvas backdrop react to the same change without either one owning it or
   having to be threaded through a provider. */
const listeners = new Set<() => void>();

function snapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** No SSR here (Vite SPA), but useSyncExternalStore wants the hook regardless. */
function serverSnapshot(): Theme {
  return "dark";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;

  /* Order here is load-bearing. `.theme-switching` kills every transition on
     the page, the forced style read commits that before the palette moves, and
     the flip then lands with nothing to animate — otherwise every bordered,
     tinted or coloured element cross-fades independently and the whole page
     smears for 300ms. Restoring transitions a frame later, rather than
     immediately, stops the browser folding both changes into one recalculation
     and reintroducing the very transitions this is avoiding. */
  root.classList.add("theme-switching");
  void root.offsetHeight;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", PAGE_GROUND[theme]);

  void root.offsetHeight;
  requestAnimationFrame(() => root.classList.remove("theme-switching"));

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* Private mode, or storage disabled. The flip still works for this visit. */
  }

  listeners.forEach((notify) => notify());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return {
    theme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
