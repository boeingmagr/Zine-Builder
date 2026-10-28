# Zine builder

A single-page app for making a 24-page, half-letter (5.5 × 8.5 in) photo zine. Upload photos, pick a layout for each page, edit captions, and export a print-ready PDF.

Everything runs in your browser. Photos are never uploaded anywhere.

## Use it

**Offline, from your computer:** download or clone this repo and open `index.html` in Chrome, Edge or Firefox. No install or internet needed.

**Hosted (works on any computer and offline after the first visit):** turn on GitHub Pages for this repo (Settings > Pages > Deploy from a branch > `main` / root). Open the Pages address once while online; after that it also works offline.

## Features

- Add photos by button or drag and drop
- 15 page layouts, including a panorama that spans a two-page spread
- Drag a placed photo to change the crop, or use the crop sliders
- Auto-fill empty photo spots in page order
- Export a booklet PDF (print double-sided, flip on the short edge, fold, staple) or a page-order PDF at 300 dpi
- Add a QR code to the back cover: paste your website address into the back cover's text fields
- Export a website: one self-contained page with your zine as a flip-through book (arrow keys, swipe, or buttons; shows spreads on wide screens and single pages on phones)
- Save and open a project file to move your work between computers

## Publishing your zine as a website

1. In the builder, click Export PDF, then Download website. You get `travel-zine-website.html`.
2. Put that file in a new GitHub repo and name it `index.html`, then turn on GitHub Pages for it. Any other web host works too: upload the file and open its address.

The builder itself and your zine website are separate. Keep the builder repo for editing, and publish the website file wherever you like.

## Notes

- Work saves automatically in the browser you use, in that browser only. Clearing site data erases it, so save a project file as a backup.
- iPhone HEIC photos may not open in some browsers. Export them as JPEG first.
- When opened from a file (`file://`), some browsers limit automatic saving. If your work doesn't survive a reload, use Save project file, or host it with GitHub Pages or a local server (`python3 -m http.server`).

## Bundled third-party files

- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) 1.4.4 (MIT) in `vendor/`
- [jsPDF](https://github.com/parallax/jsPDF) 2.5.1 (MIT) in `vendor/`
- [Inter](https://rsms.me/inter/) and [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) fonts (SIL Open Font License) in `fonts/`, via Fontsource
