# Portfolio Arena

React, TypeScript and Vite portfolio published with GitHub Pages at
https://portfolio.benosh.tech.

Run `npm ci` and `npm run build`. The existing Pages workflow publishes `dist/`.
The editor is https://portfolio.benosh.tech/admin/ and requires its existing
owner sign-in. The build emits a real `admin/index.html` so direct visits and
refreshes work without a 404 response. The editor is excluded from indexing.

`src/main.tsx` recognizes `/admin`, `/admin/` and `/admin/index.html`.
The editor remains lazy-loaded. `404.html` supports other existing fallback
paths. Keep passwords, private configuration and unfinished media out of Git.
