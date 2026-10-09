# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Go More Hub company landing page (https://nidss.github.io/gmh/). It is a static site with no build step and no runtime dependencies: `index.html`, `styles.css`, `script.js` and `assets/`. The whole page is one interactive painted scene: a seaside desk with clickable objects that open information dialogs. It is bilingual Thai/English, and Thai is the default.

## Commands

- `npm run dev` — local preview at http://127.0.0.1:4173 (`tools/serve.mjs`, no caching).
- `npm run check` — the only automated check: `node --check script.js` plus `tools/check.mjs`. `check.mjs` asserts unique IDs, valid `#` anchors, a `<template id="panel-X">` for every `data-open="X"`, that every referenced asset exists, and that required company content strings are present (contact details, product links). There is no test suite, linter or bundler.

## Deploying

Pushing to `main` deploys. `.github/workflows/deploy.yml` runs `npm run check`, pushes the verified commit to `gh-pages`, and requests a Pages build. Never push to `gh-pages` directly.

When `styles.css` or `script.js` changes, bump the `?v=N` query on both references in `index.html` so returning visitors don't get stale cached files.

## Architecture

### Scene coordinates

- **One coordinate system:** everything is laid out on the native 2926 × 1081 panorama (`assets/desk-panorama.webp`). `.world` keeps that aspect ratio.
- **Clickable objects:** the four objects (`.supplied-phone`, `.supplied-frame`, `.supplied-note`, `.supplied-figure`) are positioned with percentages at the end of `styles.css`, measured against the placement reference. They are pre-cut images with their sticky-note labels baked in.
- **Extension strips:** `desk-extension-top.webp` and `desk-extension-bottom.webp` continue the room above and below the panorama. They are cut from the outpaint `assets/gmhbg3.png` (2926 × 1801), where the original sits unchanged at y = 520, and each overlaps the panorama by 64 px with a feathered edge (hence the `5.9204%` offsets in CSS). If the panorama changes, re-cut the strips the same way.

### Camera (`fitScene` in `script.js`)

- **Mode choice:** the camera picks a mode from object bounds, not from a width breakpoint. `SAFE` is the box containing all four objects. `NOTE_H` is the smallest object's height, used to check it stays tappable.
- **`scene-fit`:** used when all objects fit with tappable sizes and the scene fills at least 55% of the screen height. Wide screens show the panorama exactly as designed.
- **`scene-pan`:** used otherwise, typically phones and iPad portrait. The viewport scrolls horizontally.
- **CSS output:** `fitScene` writes `--world-w`, `--world-x`, `--world-y` and `--cue-y` on `<html>`, and toggles the `camera-ready`, `scene-fit` and `scene-pan` classes. `place()` keeps objects clear of the header controls, and lets the extension strips cover any space the panorama cannot.
- **Pan helpers:** `STOPS` drives the CSS snap markers, the edge cue buttons, the once-per-session sweep (`sessionStorage` key `gmh-tour`), and the menu "glide to object, then open dialog" behaviour.
- **Fallbacks:** an inline head script adds the `js` class. Without `camera-ready`, the original static layout still renders, so the page works without JavaScript (the `<noscript>` note lists contacts).

### Effects

- **Ocean:** a WebGL shader animates only the water, inside a mask written in normalized panorama coordinates in the fragment shader source. A Canvas 2D fallback clips to the same polygon. Moving or replacing the panorama means updating both masks.
- **Dust:** golden motes on `#dust-canvas`, drawn at about 30 fps.
- **Shared pausing:** `syncEffects()` runs both. Both pause for motion pause (`gmh-motion`), `prefers-reduced-motion`, a hidden tab, or an open dialog.
- **Sound:** the ambient sound (`assets/windy-beach.mp3`, a pre-crossfaded seamless loop) plays through Web Audio. It is off by default and fetched only when first turned on. The `gmh-sound` preference resumes it on the first user gesture.

### Dialogs and text

- **Dialogs:** each panel is a `<template id="panel-NAME">` cloned into the single `<dialog id="hub-dialog">`. Any element with `data-open="NAME"` opens it, including scene objects and Menu items. Below 700 px the dialog is a bottom sheet that can be pulled down to close.
- **Bilingual text:** elements carry `data-th` and `data-en`, and `translate()` swaps their text content (`\n` becomes a line break). `aria-label`s that change with language are set in `setLanguage()`. New UI text needs both attributes, plus an entry there if it has a language-dependent label.
- **Preferences:** saved in `localStorage` (`gmh-language`, `gmh-motion`, `gmh-sound`), always wrapped in try/catch.

### CSS conventions

`styles.css` is mostly dense one-line rule blocks, with later, commented blocks appended that override earlier rules (camera layout, header actions, extension strips, sound toggle, dust). Edit the existing rule when changing behaviour rather than stacking another override. The phone breakpoint is `max-width:700px`, and it applies to chrome only (header, dialog sheet), not to the scene mode.

## Content and asset rules

- **Asset provenance:** `ASSETS.md` records the source or prompt and the processing for every image and sound. Update it whenever assets change.
- **Logos:** official supplied logos are used unchanged.
- **ThaiMove:** it is "Coming Soon". Do not add a launch date, integration partners, or a preview link.
- **Villadd imagery:** concept imagery that is labelled as not an actual listing.
