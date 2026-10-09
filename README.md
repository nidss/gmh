# Go More Hub

Public company landing page: **https://nidss.github.io/gmh/**

An interactive panoramic seaside desk using the supplied background, Villadd frame, rotary telephone, About Us note and ThaiMove wooden figure, positioned against draft-ref.png. The ocean stays animated, with official brand logos in the information panels. Built with semantic HTML, CSS and JavaScript. No build step or runtime dependencies.

## Local preview

```sh
npm run dev
npm run check
```

Visit http://127.0.0.1:4173.

## Publishing

All source code lives on **main**. The workflow checks the website, fast-forwards **gh-pages** to the verified main commit, and requests a GitHub Pages build. Pages publishes from gh-pages / (root), using its protected publishing environment. Push changes to main to update the public website automatically. No personal access token is required.

## Features

- The supplied post-it at the left window frame opens About Us.
- The rotary phone on the left has a yellow Contact Us post-it and opens the contact panel. Its image is edited from the supplied phone with sunset lighting.
- The supplied picture frame on the right opens Villadd. The wooden figure opens ThaiMove (Coming Soon).
- Menu, motion pause, sound and language switch sit together at the top right, so nothing covers the desk. The Menu gives direct access to every section and Find Us On.
- Ambient windy beach sound is off by default. The sound button (Lucide volume icons) downloads it on first use, loops it without gaps through Web Audio, fades in and out, pauses while the tab is hidden, and remembers the choice for the next visit, starting again on the first tap or key press.
- All four objects follow measured coordinates from the 2926 × 1081 placement reference. The supplied cutouts include their labels; no separate sticky notes or synthetic ground shadows are added.
- One world on every screen: a camera fits all four objects on wide screens (desktop, iPad landscape, phone landscape) and pans along the desk on tall screens (phone and iPad portrait). The choice follows the measured object bounds and tap size, not a width breakpoint. On screens taller than the panorama, the supplied outpaint strips continue the scene above and below; on wide screens the original panorama is shown exactly as before.
- Ocean texture displacement and sunlight reflections run at up to 25 frames per second, using WebGL with a Canvas 2D fallback.
- Motion pause, system reduced motion, and automatic suspension while hidden or reading a dialog.
- Thai / English switch with optional local preference storage.
- Native accessible dialogs, Escape to close and restored keyboard focus.
- When panning, the camera snaps to each object, paper tags at the screen edges point to objects out of view, the first visit of a session sweeps once along the desk, and the Menu glides to the object before opening it. On phones, dialogs open as a paper sheet that can be pulled down to close.
- Official supplied logos are preserved unchanged. Contact details and Facebook link are provided by the company.

ThaiMove is in development. No launch date or integration partners are claimed. Image provenance and prompts are in [ASSETS.md](ASSETS.md).
