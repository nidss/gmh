# Visual assets

## Active panorama — exact supplied composition

All five active raster assets are lossless WebP exports of the supplied files, retaining existing lettering, tape, materials and alpha. No ImageGen, replacement text, additional ground shadows or color filters were used for this revision.

- desk-panorama.webp: gmhbg2.png, 2926 × 1081.
- desk-phone.webp: clipboard 2c769d18, 2000 × 2000, Contact Us already attached.
- desk-villadd.webp: clipboard 5b94a345, 2000 × 1632, cover and VillaDD label already attached.
- desk-about.webp: clipboard 25bb3aad, 1000 × 1000, taped About Us note.
- desk-thaimove.webp: clipboard f4ecfba0, 2000 × 2075, wooden figure with ThaiMove Coming Soon label.

Geometry was measured by registering each cutout against draft-ref.png at its native 2926 × 1081 resolution. assets/scene-layout.json records the positions and dimensions. CSS uses those normalized coordinates on a fixed aspect-ratio canvas; small screens pan the same composition. Ocean displacement is recalibrated to the narrower window. Pausing motion reveals the unmodified source background. Earlier sections below describe retained historical assets.

## Active scene artwork — latest user-supplied set

- assets/phone-sunset-v2.webp: supplied b72e378f phone and shadow, preserved directly.
- assets/about-note-v2.webp: supplied 48f2a169 About Us paper, preserved directly.
- assets/contact-note-v2.webp: supplied 65efa42b Contact Us paper, preserved directly.
- assets/villadd-frame-supplied-v3.webp: latest supplied codex-clipboard-900564ff-da66-4798-880f-101111a624bc.png, 2688 × 2988, exported losslessly with original frame, Villadd artwork, transparency and painted shadow unchanged. Supersedes the generated frame derivative.
- assets/villadd-note-v2.webp: supplied ae0accba paper with only the wording changed to VillaDD, as corrected by the user, using built-in ImageGen.

All exported to WebP quality 95 with transparency. New phone and frame proportions are retained and their bases align with the desk. No CSS ground shadows are added. The supplied notes retain their baked-in lettering, texture and decoration. Exact edit prompts: assets/latest-scene-edit-prompts.md. The sections below document earlier retained assets.

## Current desk objects — supplied shadows

The page uses the exact user-supplied phone and Villadd frame composites, exported losslessly to WebP with their original transparency and painted shadows preserved:

- assets/phone-supplied-shadow.webp — codex-clipboard-5bba8f73-0455-4de9-8629-281e287d4149.png, 1193 × 1181.
- assets/frame-supplied-shadow.webp — codex-clipboard-09e3a258-0369-4b42-b805-a3567b59e1c4.png, 3058 × 3335.

No generated or CSS ground shadows are applied to these objects. Contact Us and VillaDD are transparent raster sticky-note overlays with thick handwritten marker lettering, paper grain and curled corners, generated with built-in ImageGen from the user’s close-up reference. The original phone, frame and shadow pixels remain unchanged. The image offsets preserve the previous object positions while allowing the supplied shadow canvases to extend toward the desk edge. Earlier generated derivatives below are retained as historical sources.

## Realistic paper labels

- assets/contact-paper-note.webp — Contact Us on two lines.
- assets/villadd-paper-note.webp — VillaDD on one line.

Both are generated transparent PNGs exported to WebP quality 95. Reference: codex-clipboard-02d5bc16-4c24-43ad-bf0b-a1cd7a3f7926.png. Typography is baked into the artwork, not a web font.

## Supplied source artwork

These four source images were supplied by the user and exported to WebP at original dimensions, quality 95, preserving transparency. The background and window note use these exports directly. The current telephone and frame use the edited derivatives documented below. The three scene objects remain independent clickable elements.

- assets/window-sunset.webp — gmhbg.png, 1920 × 1080, background.
- assets/picture-frame.webp — picframe.png, 1254 × 1254, original frame retained as a source reference.
- assets/rotary-phone.webp — phone.png, 1254 × 1254, left side of desk.
- assets/good-things-note.webp — postit.png, 1254 × 1254, left window edge.

Placement follows the user-provided annotated composition. The blue annotation rings are not part of the page. Highlights come from the upper right, with subtle shadows toward the lower left. Ocean motion is confined to the water in the new background.


## Current picture frame — assets/picture-frame-villadd.webp

Edited from the supplied picframe.png and Cover _ Villa DD.png with built-in ImageGen. The Villadd cover replaces the beach photograph inside the white mat. Frame orientation is baked into the transparent asset; the cover lettering reads normally. Dimensions: 1254 × 1254. WebP quality 95. Placement preserves the original visible frame bounds, with sunset shadows toward the lower left. The frame still opens the product collection.

Final edit prompt:

Use case: compositing / precise-object-edit. Asset: transparent cutout for the existing Go More Hub website.
Image 1 is the wooden tabletop photo frame to edit. Image 2 is the exact Villadd cover artwork to insert.
Replace ONLY the beach photograph inside the white mat with image 2. Fit the entire square cover into the inner photo opening with the correct perspective. Keep its pool photograph, purple and black logo, exact "VILLADD" lettering and "BY GO MORE HUB" line, colors and layout faithful to the supplied artwork. Do not invent or retype additional text. Keep all of the cover visible.
The website currently displays the wooden frame horizontally mirrored. Therefore produce the FRAME geometry horizontally mirrored relative to image 1, while keeping the inserted cover readable normally (do NOT mirror the cover or its lettering). The stand should be on the right, and the frame should lean slightly left as it descends, matching a horizontal reflection of image 1.
Preserve the wooden border, white mat, original proportions, material, overall square 1254 x 1254 composition, object size, padding and transparency. Keep a subtle warm sunset illumination from upper right, consistent with the original. No surrounding table or scenery, no extra objects, no new floor shadow, no watermark. Output the finished wooden frame with the Villadd print on a genuinely transparent background.

## Current telephone — assets/rotary-phone-contact.webp

Edited from the supplied phone.png using the built-in ImageGen tool, preserving its square composition, shape, cord and transparent background. The edit adds a yellow Contact Us post-it on the front left, with warm highlights from the upper right. Dimensions: 1254 × 1254. WebP quality 95. The original telephone export is retained separately.

CSS projects filled phone and frame outlines from their bases toward the foreground left, following the supplied long-shadow references. The filled outlines keep the floor shadow continuous below the phone cord and feet. Both use the same projected light direction, translucent warm brown to retain the wood grain, a lightly softened edge and narrow darker contact shadows. The shadows continue to the edge of the desk rather than fading away immediately below the objects.

Final edit prompt:

Use case: precise-object-edit / lighting-weather. Asset type: transparent cutout for an interactive company website.
Input image 1 is the EDIT TARGET: the supplied warm beige rotary telephone. Image 2 is ONLY a lighting reference: the actual sunset window background. Image 3 is ONLY a reference for the placement and lettering of a sticky note; do not copy its cartoon rendering.
Edit image 1 only. Keep the telephone's exact shape, viewpoint, handset, cord, rotary dial, beige material and square framing. Keep the object at its original scale and position within the square, with roughly 16% empty transparent space above and 13% below. Do not crop any cord or feet.
Add one pale butter-yellow paper post-it attached to the FRONT LEFT face of the phone, in the same arrangement as reference image 3: slightly tilted clockwise, its upper edge attached just left of the rotary dial, the lower part hanging in front of the phone body. The note must be immediately readable at website size: about 26% of the telephone's total width, realistic paper grain and a very slight lifted corner with its own fine contact shadow. Write exactly "Contact" on line 1 and "Us" on line 2, dark black, bold friendly handwritten marker lettering. No other text.
Relight the telephone and note to match the golden sunset from the UPPER RIGHT of image 2. Brighter warm highlights on right-facing edges, gently darker left-facing surfaces, no cold studio reflections. Keep realistic dimensional depth and preserve all original telephone details.
Output the phone plus its attached post-it ONLY on a genuinely transparent background. Do NOT include the wooden table, window, beach, any background color or backdrop, or a large baked floor shadow. The website will add a directional ground shadow separately so it blends with the existing table. Square composition, preserve alpha, no extra objects, no watermark.

## Supplied official logos

Copied unchanged from the user's PNG files, preserving transparency and original artwork:

- assets/gomorehub-logo.png — GomoreHubLogo .png, 2200 × 2201
- assets/villadd-logo.png — Logo_dark.png, 1543 × 447
- assets/thaimove-logo.png — tmlogo.png, 1619 × 1340

## Scene extension strips

### assets/desk-extension-top.webp, assets/desk-extension-bottom.webp

Supplied outpaint of desk-panorama.webp (2000 × 1231), continuing the scene upward (transom window, curtain rail) and downward (desk front). The original panorama sits unchanged at y = 520 of a 2926 × 1801 canvas; only the added areas are kept: top 2926 × 536 and bottom 2926 × 216, each overlapping the original by 16 px with a feathered alpha edge. They are upscaled from the supplied 2000 px width, so a full-resolution export can replace them with the same crop.

## Product concept images

Original AI-generated illustrations, not photographs of bookable properties or screenshots of a released ThaiMove app.

### assets/villadd.webp

Prompt: Premium cinematic architectural photograph of a beautiful modern tropical pool villa in Thailand, cream stone architecture, open-air terrace, generous turquoise swimming pool in foreground, palm trees, lush foliage, warm late afternoon sunshine with crisp shadows, a little vivid orange pool float. Camera eye level from across the pool, wide composition, strong horizontal lines, magazine editorial art direction, realistic water caustics, tranquil aspirational holiday atmosphere. No people, text, logos or watermark. Landscape 3:2. Original conceptual brand illustration, not a real property listing.

### assets/thaimove.webp

Prompt: Striking premium sports editorial closeup of a runner's lower legs mid-stride: ivory running shoes with vivid neon lime soles and details, white crew socks, tan skin, sharp athletic gesture. Shoes float through the center of frame, one heel lifted, dynamic side-angle crop with no face, seamless pale lavender studio background, dramatic hard sunlight from upper left and crisp lavender shadows, subtle analog grain. Fashion editorial, realistic materials, airy negative space. Landscape 3:2. No text, visible brand logos, watermarks or app UI.

Product images: 1536 × 1024 WebP, quality 87.

Fonts: DM Sans, Manrope, Noto Sans Thai and Patrick Hand, served by Google Fonts with system fallbacks. No analytics or tracking pixels. Only language and motion preferences are saved locally.
