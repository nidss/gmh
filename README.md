# Go More Hub

Public company landing page: **https://nidss.github.io/gmh/**

The page is one interactive painted scene: a warm seaside desk at sunset. Clicking an object on the desk opens information about Go More Hub and its products. The site is built with semantic HTML, CSS and JavaScript, with no build step and no runtime dependencies. Text is in Thai and English, and Thai is the default.

## The scene

| Object | Opens |
| --- | --- |
| About Us post-it on the window frame | About Go More Hub, with links to both products |
| Rotary phone with a Contact Us post-it | Contact: company name, address with a Google Maps search, and email with a copy button |
| Villadd picture frame | Villadd, the pool villa booking platform, linking to villadd.com |
| Wooden figure with a ThaiMove post-it | ThaiMove (Coming Soon) |

The **Menu** at the top right opens every section directly, including **Find Us On**, which links to the Facebook page.

All four objects follow measured coordinates on the 2926 × 1081 panorama. The supplied cutouts already include their labels, and the official logos are used unchanged.

## Every screen, one world

The page doesn't switch to a separate mobile layout. It keeps the same scene and changes how a camera frames it.

- **Wide screens** (desktop, ultrawide, iPad landscape, phone landscape) fit all four objects and fill the screen. Ultrawide screens show the original panorama exactly as designed.
- **Tall screens** (phones and iPad portrait) pan along the desk.
  - The camera snaps to each object.
  - Paper tags at the screen edges point to objects that are out of view.
  - The first visit in a session sweeps once along the desk.
  - Choosing a Menu item glides the camera to its object before opening it.
- **Extension strips:** where the screen is taller than the panorama, strips cut from a supplied outpaint continue the room above (transom window, curtain rail) and below (desk front).
- **Dialogs:** on phones they rise as a paper sheet that can be pulled down to close.

The camera decides between fit and pan from the measured object bounds and the size of the smallest object, not from a width breakpoint.

## Atmosphere

- **Ocean:** only the water moves. Texture displacement and sunlight reflections run at up to 25 fps with WebGL, with a Canvas 2D fallback.
- **Sunlit dust:** 12 to 28 fine golden motes, depending on screen size, settle slowly under gravity and sway in a gentle air current. They glow brighter near the painted sun and glint as they turn.
- **Sound:** a windy beach ambience loops without gaps through Web Audio. It is off by default, downloads only when first turned on, and fades in and out. The page remembers the choice and resumes on the first tap or key press of the next visit.

## Controls and accessibility

- The Menu, motion pause, sound and TH / EN controls sit together at the top right, so nothing covers the desk.
- Motion pauses automatically for the system reduced-motion setting, a hidden tab or an open dialog. The pause button stops it by hand.
- Dialogs are native and accessible: Escape closes them and keyboard focus is restored. There is also a skip link to the Menu.
- Language, motion and sound choices are stored locally only. There is no analytics or tracking.
- Without JavaScript, the static scene still shows and a note lists the contact details.

## Local preview

```sh
npm run dev     # http://127.0.0.1:4173
npm run check   # syntax check plus content, link and asset checks
```

## Publishing

All source code lives on **main**. Pushing to main runs the workflow, which:

1. Checks the website.
2. Fast-forwards **gh-pages** to the verified main commit.
3. Requests a GitHub Pages build.

Pages publishes from gh-pages / (root), using its protected publishing environment. No personal access token is required.

When `styles.css` or `script.js` changes, bump the `?v=` number on their links in `index.html` so returning visitors get the new files.

## Content notes

- ThaiMove is in development. No launch date or integration partners are claimed.
- The Villadd dialog image is AI-generated concept imagery, not an actual property listing.
- Contact details and the Facebook link are provided by the company.
- Image and sound provenance, prompts and processing are in [ASSETS.md](ASSETS.md).
- Notes for working on the code are in [CLAUDE.md](CLAUDE.md).
