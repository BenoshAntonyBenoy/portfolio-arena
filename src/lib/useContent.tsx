import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fallbackContent } from "../content/portfolioConfig";
import type { PortfolioConfig } from "../content/portfolioConfig";
import { fetchPublishedContent } from "./liveContent";

/* ---------------------------------------------------------------------------
   Content is handed down through context rather than imported directly, so a
   save in the panel reaches the live site on the next page load with no
   rebuild and no deploy.

   The context starts at the bundled snapshot, which means the page renders
   fully on the first paint and never shows a spinner or an empty shell. The
   fetch is a refinement, not a dependency: if it fails, if the project is
   asleep, or if it returns something malformed, the visitor sees the snapshot
   and nothing reports an error, because from their side nothing went wrong.
   ------------------------------------------------------------------------- */

const ContentContext = createContext<PortfolioConfig>(fallbackContent);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioConfig>(fallbackContent);

  useEffect(() => {
    const ac = new AbortController();
    // fetchPublishedContent resolves to null instead of rejecting, so there is
    // deliberately no catch here - there is nothing left that can throw.
    void fetchPublishedContent(ac.signal).then((live) => {
      if (live) setContent(live);
    });
    return () => ac.abort();
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/** Everything on the page reads its copy through this. */
export function useContent(): PortfolioConfig {
  return useContext(ContentContext);
}
