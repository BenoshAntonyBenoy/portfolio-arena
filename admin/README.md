# Editing your portfolio

This folder holds the admin panel for **portfolio.benosh.tech**. You do not need
to understand GitHub, or write any code, to use it.

## Opening it

Double-click **`Edit Portfolio.bat`** in the main project folder.

Two things start up:

- the **admin panel**, which opens in your browser automatically
- a **live preview** of your site at <http://127.0.0.1:5173>

Put them side by side. Anything you change in the panel shows up in the preview
within a second or two.

When you are finished, close the black command window. That stops both.

## Making changes

Pick a section on the left, then edit.

| You want to… | Do this |
| --- | --- |
| Add a project | Projects → **+ Add project** at the bottom |
| Remove a project | Open it → **Delete** |
| Reorder projects | Drag the `⫶` handle on the left of a row up or down |
| Change a picture | Open the project → drop an image onto the picture box |
| Add a skill | Skills → open a group → type in the Skills box → press Enter |
| Change your intro | Hero → Intro |
| Fix a typo anywhere | Find the section on the left, edit the box |

The project numbers (01, 02, 03…) look after themselves. Reorder the list and
they renumber automatically.

**Your work saves as you type.** The word at the top right tells you where things
stand — *Saving*, then *Saved*. You never need to press a save button, though
Ctrl+S works if you want to be sure.

Saving only updates the preview on your own computer. Nothing is public until
you publish.

## Pictures

Drop any image onto the picture box — PNG, JPG, whatever you have. The panel
shrinks it, converts it to the format the site uses, and makes both a large and
a small version so phones load a smaller file. You do not need to resize
anything first.

Always fill in **Image description**. It is what screen readers announce, and
what shows if the picture fails to load.

**Fit** decides how the picture sits in its frame:

- **contain** — the whole image is visible, with space around it. Best for
  screenshots, where cropping would cut off part of the interface.
- **cover** — the image fills the frame and the edges get cropped. Best for
  photos and artwork.

## Publishing

Press **Publish**, optionally write a short note about what you changed, and
press **Publish now**.

Four things happen, and you can watch each one:

1. **Checking your content** — looks for blank fields and missing pictures
2. **Building the site** — the exact build GitHub runs, so if it works here it works there
3. **Saving a version** — records a restore point
4. **Publishing to the web** — sends it live

Your site is updated about a minute later.

**If any step fails, nothing is published and your live site is untouched.** The
panel tells you exactly what is wrong, in plain words — for example
*"Project 3: name is empty"*. Fix it and publish again.

## Undoing

**Undo all changes** at the top throws away everything you have done since your
last publish and goes back to what is currently live. It cannot be undone
itself, so it asks first.

If you need to go back further than that, ask — every publish saves a restore
point, so any previous version can be recovered.

## If something goes wrong

**The panel will not open, or the window closes instantly.**
Node.js is probably missing. Install it from <https://nodejs.org>, then
double-click `Edit Portfolio.bat` again.

**"Port 4321 is already in use."**
The panel is already open in another window. Close the other black command
window and try again.

**The preview at 5173 does not load.**
Give it about ten seconds after starting; it is slower the first time.

**Publishing fails at "Publishing to the web".**
That step needs internet and your GitHub sign-in. Check your connection first.
If it keeps failing, the sign-in may have expired — that needs a one-off fix.

**You changed something and the site looks wrong.**
Press **Undo all changes** to get back to what is live.

## For anyone reading the code

- Content lives in `src/content/content.json`. `portfolioConfig.ts` beside it
  holds only the types and imports that JSON.
- `schema.mjs` validates the document before any write. It is the real gate —
  the site imports the JSON through a cast, so TypeScript alone cannot prove the
  file is well formed.
- `server.mjs` uses only Node built-ins, binds to `127.0.0.1`, and has no auth
  because it is not reachable off the machine.
- The publish route runs `npm run build` and refuses to commit if it fails.
