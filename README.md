# Go More Hub

Public company landing page: **https://nidss.github.io/gmh/**

An interactive seaside desk with an open window, warm original artwork, animated ocean reflections, official brand logos and clickable paper notes. Built with semantic HTML, CSS and JavaScript. No build step or runtime dependencies.

## Local preview

```sh
npm run dev
npm run check
```

Visit http://127.0.0.1:4173.

## Publishing

All source code lives on **main**. The workflow checks the website, fast-forwards **gh-pages** to the verified main commit, and requests a GitHub Pages build. Pages publishes from gh-pages / (root), using its protected publishing environment. Push changes to main to update the public website automatically. No personal access token is required.

## Features

- Click the window notes for About Us, Contact Us and Find Us On.
- Explore Villadd on the smartphone at the left of the desk.
- Discover ThaiMove on the notebook, clearly marked Coming Soon.
- Ocean texture displacement and sunlight reflections run at up to 25 frames per second, using WebGL with a Canvas 2D fallback.
- Motion pause, system reduced motion, and automatic suspension while hidden or reading a dialog.
- Thai / English switch with optional local preference storage.
- Native accessible dialogs, Escape to close and restored keyboard focus.
- On narrow screens, swipe across the scene or use the Explore menu.
- Official supplied logos are preserved unchanged. Contact details and Facebook link are provided by the company.

ThaiMove is in development. No launch date or integration partners are claimed. Image provenance and prompts are in [ASSETS.md](ASSETS.md).
