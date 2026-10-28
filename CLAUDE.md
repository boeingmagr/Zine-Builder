# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Zine builder is a browser-only app for making a 24-page, half-letter (5.5 × 8.5 in) photo zine. It exports a print PDF, a single-file flip-book website, or a JSON project file. README.md is the user-facing guide (features, GitHub Pages hosting, known limits such as HEIC).

There is no build step, package manager, linter or test suite. The app consists of:
- `index.html`: the markup, CSS and all app JS, inline.
- `sw.js`: the offline cache.
- `vendor/`: jsPDF 2.5.1 and qrcode-generator 1.4.4. Their versions are also listed in README.
- `fonts/`: Inter and Bricolage Grotesque woff2 files.

Don't add a framework, a bundler or CDN dependencies. The app must keep working offline from `file://`.

## Running it

- Open `index.html` directly, or run `python3 -m http.server` and open http://localhost:8000.
- Use the server when testing autosave (`file://` can restrict IndexedDB) or the service worker (it registers only on http/https).
- The service worker is cache-first. Once registered on localhost, it serves the cached `index.html`, so edits don't appear. Use DevTools > Application > Service workers > "Bypass for network", or unregister the worker.
- There are no automated tests. Check changes in a browser, including whichever exports the change affects: booklet PDF, page-order PDF, website, project save/open.

## Architecture (all in the main `<script>` IIFE in index.html)

**Coordinate system.** Pages are drawn in page units, W=528 × H=816 (96 units per inch). Resolution comes only from the `ctx.setTransform` scale:
- editor preview: `RES=1.5`
- PDF: `S=3.125` (300 dpi)
- website: `S=2`
- thumbnails: canvas width / W

Layout rectangles and hit testing (`findSlot`) always use page units.

**One renderer for every output.** `renderPage(ctx, page, n, o)` draws the editor spread, the spread strip, the layout-picker tiles, the PDF pages and the website pages. `o.ui` is true in the editor, where it shows placeholder text at 45% alpha, empty-slot crosses and the selection outline. It is false for exports. Gate any editor-only drawing on `ui`/`g.ui`, or it will print.

**Layouts** are registered with `def(id, name, slots, texts, paint, opt)` into `L`:
- `slots`: photo rectangles in page units. Photos are cover-cropped into them. The page's photo ref holds `fx`/`fy` (0–1), the crop position.
- `texts`: editable fields `{k, label, ph, multi?, help?}`. The inspector builds its inputs from this list, and values live in `page.texts[k]`.
- `paint(g)`: draws text and decoration. `g.text(k, x, y, w, font, color, lineHeight, {align})` wraps the text, draws the placeholder in UI mode and returns the next y, so fields stack.
- `opt`: `bg` (`"paper"`, `"ink"` or `"accent"`) and `numbered` (draws the page number).
- `PICK` sets which layouts the picker shows.
- `panoL`/`panoR` are not in `PICK`. `togglePano` sets them as a pair, and the panorama photo is stored only in the left page's slot 0. To count or assign photos, use `ownerOf(n)` and `slotCount(n)` (which returns 0 for `panoR`) instead of reading `L[layout].slots` directly.

**State.**
- `state = {pages[24], photos[], accent, numbers}`. A page is `{layout, photos: [{id, fx, fy} | null], texts: {}}`.
- `photoMap` maps a photo id to `{id, name, el, thumb}`. `el` is the canvas or Image used for drawing and is never serialized.
- `ui = {unit, pg, sel}`: the current spread (an index into `UNITS`: `[1], [2,3] … [22,23], [24]`), the active page and the selected slot.
- After a structural change, call `afterChange(true)`, which repaints and re-renders the tray and inspector, then saves.
- For high-frequency edits (typing, crop drag, sliders), call `schedule()` (a rAF repaint) and `save()` instead. Rebuilding the inspector would replace the input being edited.
- `N=24` is assumed by `defaults()`, by `UNITS` and by the booklet imposition in `exportPdf`, which needs a multiple of 4.

**Persistence and file formats.**
- IndexedDB database `zine-builder`, object store `kv`:
  - key `"state"`: `{v:1, pages, accent, numbers, photoIds}`
  - key `"photo:<id>"`: `{id, name, dataUrl}`
- Imported photos are downscaled to a 2800 px max side and stored as JPEG.
- `save()` is debounced by 500 ms. Photo records are written only on import or when a project is opened.
- Project file `travel-zine-project.json`: `{app:"zine-builder", v:1, pages, accent, numbers, photos:[{id, name, dataUrl}]}`. `readProject` validates it strictly before `applyProject` replaces the state.
- `loadSaved` and `readProject` reject data if any page's layout id is missing from `L`. Renaming or removing a layout id therefore drops users' autosaved work without any warning. If you change the saved shape, bump `v` and add a migration to both functions.

**Exports.**
- `exportPdf` renders each page into one reused canvas, encodes it as JPEG and places it with jsPDF.
- `exportSite` fills `SITE_TEMPLATE`, a JS template literal that holds a complete standalone HTML page with its own viewer script. It fills `__TITLE__` and `__IMAGES__`. Inside the template, keep `<\/script>` escaped and escape any backtick or `${`.
- `getSaver()` uses `window.claude.use("downloads")` when it exists (the Claude artifact runtime). Otherwise it falls back to a blob and `<a download>`. Keep both paths.

**Fonts and offline.**
- Canvas text uses `FD` (Bricolage Grotesque) and `FB` (Inter) through the local `@font-face` rules. `init` waits on `document.fonts.load` and then repaints.
- A new font weight needs four things: the woff2 file in `fonts/`, an `@font-face` rule, a `fonts.load` call (if canvas uses it) and an entry in `sw.js`.
- `sw.js` precaches the files in `FILES` under the name `CACHE = "zine-builder-vN"`. Every file the app loads must be in `FILES`. Bump `CACHE` whenever a cached file changes, or hosted visitors keep the old version.

## Conventions

- JavaScript is ES5 style: `var`, `function`, one IIFE with `"use strict"`. `async`/`await` appears only in the import and export paths. Code is dense, with short names and one-line functions, grouped under `/* ---------- section ---------- */` comments. New code should match.
- Build DOM with `h(tag, attrs, kids)`, where `text` sets textContent and `on*` keys add listeners. Never put user text into `innerHTML`.
- UI: touch targets are at least 44 px. Generated controls carry ARIA state (`aria-pressed`, `aria-current`, and `aria-live` status regions). Colours are CSS variables on `:root`, with dark-mode overrides.
- User-facing copy is plain, sentence case and addressed to "you". Error messages say what to do next.
