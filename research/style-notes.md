# Style notes: the reference explorable

Reference: *Decisions, not sentences* (Jawad, October 2026), https://mdjawad.com/explorables/clm/
Studied 2026-10-03 from its HTML, CSS and JS (kept in the session scratchpad, not committed) and from Playwright screenshots.

**We borrow patterns, not code, SVG or text.** Each section ends with what we'll do, which is sometimes different.

## Screenshots

`node scripts/ref-shots.mjs --browser chromium` writes to `research/reference-shots/chromium/<size>/` (gitignored). There are 16 frames at each of 390×844, 360×800 and 1440×900:

| File | What it shows |
|---|---|
| `00-hero.png` | Hook: byline, H1, dek, the coloured-word hint, the Begin button, the step count |
| `01-step-hook.png` … `05-step-spectrum.png` | Five story steps: opener, coloured words, a machine diagram, a "receipts" step, the closing map |
| `10-transition-0000ms.png` … `-1200ms.png` | One step change, frame by frame (0, 150, 300, 500, 800, 1200 ms after pressing →) |
| `20-coloured-word.png` | A coloured word tapped (phones) or hovered (desktop) |
| `30-lab-1.png`, `31-lab-2.png` | The two labs |
| `40-sources.png` | Sources and "About the figures" |

WebKit screenshots were not taken: WebKit needs system libraries on this machine (see the checkpoint report). Chromium is enough for studying the reference.

## Typography

| Element | Reference (desktop → 390px phone, measured) |
|---|---|
| Families | **Inter Tight** for everything (a late override replaced an Instrument Serif display face). **JetBrains Mono** for readouts and equations. Loaded from Google Fonts. |
| H1 | 650 weight, letter-spacing −0.04em, line-height 1.02; `clamp(2.8rem, 5.6vw, 5rem)` → **41px** on a phone |
| Dek | 1.22rem / 1.6 → **16.6px / 26.6px** on a phone; colour `--ink-2` |
| Step title (h3) | 650, −0.03em, 1.7rem → **22.7px** on a phone |
| Step body | 1rem / 1.62 → **15.5px / 24.5px** on a phone; colour `--ink-2` |
| Bold | Only on key numbers or the coloured term; 600 weight in full `--ink` |
| Caption (`.note`) | 0.8rem → **12.8px** / 1.5, `--ink-3`, dashed rule above |
| Measure | Prose column 680px max. Step card 320–400px wide on desktop and full width minus 24px on phones (≈ 45–60 characters). |
| Scene labels | SVG text **6.9–10.5px** at 390px. Too small. |

**We'll do:** Inter Tight (or a similar grotesque) for text plus a mono for readouts. Both are **self-hosted** woff2 with `font-display: swap`, subset to Latin to keep the size down. Same scale and weights. Scene labels **≥ 11px** at 360px; minor labels are hidden on small screens rather than shrunk. Inputs ≥ 16px.

## Palette

The reference is **dark only** (`color-scheme: dark`; no `prefers-color-scheme` rule).

| Token | Value | Use |
|---|---|---|
| `--bg` / `--bg-2` | `#0a0c11` / `#0f1219` | Page and stage floor |
| `--panel` / `--panel-2` | `#12161f` / `#181d28` | Cards, buttons |
| `--line` / `--line-2` | `#232a38` / `#2f384a` | Borders, rail ticks |
| `--ink` / `--ink-2` / `--ink-3` | `#ece7dc` / `#b9b4a9` / `#7d8191` | Warm off-white text in three steps |
| Coloured-word hues | blue `#5ab0ff`, amber `#ffb547`, grey `#8a92a3`/`#a8afbd`, violet `#b495ff`, pink `#f07ab4`, cream `#e9e4d8` | Each one names a kind of scene object |
| Good / bad | `#3fd08a` / `#ff6b5b` | Always with a label |
| Badges | toy violet, cited green, self-reported amber, schematic grey, conjectured red | Provenance chips |

It has a written colour grammar ("blue = state side, amber = action side…, never broken"), and the scene engine shades box faces from one light at the upper left.

**We'll do:** a fixed colour grammar per concept (see `visual-language.md`). Both a light and a dark theme, via `prefers-color-scheme`. The provenance badges carry a text label as well as a colour.

## Spacing and layout

- No formal spacing scale. Common values: 6 / 10 / 12 / 14 / 16 / 18 / 22 / 28px; card padding 22px (16px on phones); radius 14–16px.
- **≥ 900px:** a two-column grid. The step cards sit on the left (`minmax(320px, 400px)`) and the scene on the right is `position: sticky; top: 0; height: 100svh`. Steps are `min-height: 92svh`; only the active card is fully opaque (others 0.42).
- **< 900px:** the scene is sticky at the top, **52svh** tall, opaque, with a bottom rule and shadow. Cards scroll underneath at full width with 12px gutters; steps are `min-height: 64svh`. On the hook, the scene sits above the copy at 44svh.
- The scene's HUD (title plus provenance badges) is at top right. Big mono readouts sit at bottom left. The stepper bar sits under the scene.
- No horizontal scroll at 390 (`scrollWidth` = 390).

**We'll do:** the same split, using **45–50svh** for the scene on phones as `CLAUDE.md` asks, plus `env(safe-area-inset-*)` padding, which the reference doesn't have.

## Step transitions (how scene objects persist and animate)

- One SVG scene for the whole story. Each step's `build()` returns a flat list of objects with **stable ids**, plus a camera.
- `stage.go(objects, cam, 0.9–1.0s)` tweens every shared id from its old state to its new one: position, size, colour (hex mix) and opacity. New ids **rise in** from 1.2 units up while fading in; removed ids **sink** 0.8 units while fading out. The camera auto-fits the new scene in the same tween.
- Easing is cubic ease-in-out. A per-frame `tick` drives looping motion (marching dashes, pulses).
- In the frame sequence, the card text switches immediately and the scene catches up over about 1s. Persistent objects stay recognisable throughout.
- Reduced motion sets the duration to 1ms, which gives an instant cut rather than a cross-fade.

**We'll do:** the same identity-keyed tween, but as a **timeline of beats** per step (0.4–1.2s each), replayable from a button. Under reduced motion, a ~200ms opacity cross-fade between the before and after states.

## Coloured words ↔ scene objects

- Markup: `<span class="t" data-k="action">option vectors</span>`. The word is bold, coloured and dotted-underlined, with `tabIndex=0`.
- Desktop: `mouseenter` / `focus` calls `stage.setFocus(kind)`; `mouseleave` / `blur` clears it.
- Touch: `touchstart` with `preventDefault()` toggles focus.
- The effect eases in over ~150ms. Matching objects get a glow, and everything else fades to 20–40% opacity. It only applies while that word's step is active.
- In the tap screenshot, a large grey disc is left behind in the scene, which looks like an artefact.

**We'll do:** Pointer Events (`pointerup`) rather than touch events. A tap pulses the object and scrolls the scene into view if needed. Keyboard focus does the same, and hover is only an enhancement under `@media (hover:hover)`. We won't use glow filters (no SVG filters): emphasis will be a stroke, a scale pulse and dimming of the rest.

## Navigation

- **Scroll is the source of truth.** On every rAF-throttled scroll event, the step under a trigger line becomes active. The line sits at 50% of the viewport on desktop and 72% on phones. It also re-checks every 300ms in case a fling skips steps. It deliberately uses geometry rather than IntersectionObserver.
- **← / →** (and j / k) and the arrow buttons scroll smoothly to the neighbouring step (instantly under reduced motion). The Begin button jumps to step 1.
- **Stepper bar:** ← button, a rail of ticks (gaps between acts; done ticks tinted, the current tick taller), "07 / 23 · Act name" (hidden on phones), a key hint, → button.
- Each card's meta line ("Act II of VII · Name — Step 4 of 23") is generated from the DOM order so it can't drift.
- The URL hash updates with `replaceState`; a polite `aria-live` region announces the step title.
- The stepper buttons measure **36×29px** at 390px, below 44×44.

**We'll do:** keep scroll as the source of truth, but use **IntersectionObserver** as `CLAUDE.md` requires. We'll handle the fling problem by also picking the nearest step when the observer fires. Stepper buttons will be ≥ 44×44, and Tab order will run through the coloured words.

## Captions, provenance, labs, meta

- **Caption:** `.note` at the bottom of the card: small, muted, dashed rule above. It names *who measured what*, e.g. "From the authors' results files".
- **Provenance badges** in the scene HUD: toy · cited · self-reported · schematic · conjectured.
- **Act openers:** a transparent card with a bigger title.
- **Labs:** full-width sections after the story, with a tag ("Lab 1 · hands on"), a 2–3rem H2, a one-line dek, then a panel with title, badges, scene and controls. At 390px one sphere label is clipped ("Accoun"), which we'll avoid.
- **Footer:** "**Sources.**" and "**About the figures.**" paragraphs. The second says the toy numbers come from the toy and the real numbers are quoted, and that nothing on the page is model output.
- **Meta:** `title`, `description`, `author`, `canonical`; Open Graph (`og:type` article, title, description, url, image 1200×630, width/height, `og:image:alt`); Twitter `summary_large_image` with title, description and image.
- **Viewport meta:** `width=device-width, initial-scale=1`, with no `viewport-fit=cover`.

## Where we deliberately differ

| Reference | Ours, per `CLAUDE.md` |
|---|---|
| Dark only | Light and dark |
| Google Fonts | Self-hosted, `font-display: swap` |
| `100vh` in base CSS | `svh` / `dvh` only |
| `touchstart` + `preventDefault` | Pointer Events; no hover dependence |
| Glow highlight; `backdrop-filter: blur` on cards | No filters or blur; stroke, pulse and dim instead |
| Scene labels below 11px on phones | ≥ 11px; hide minor labels instead |
| 36×29px stepper buttons | ≥ 44×44px |
| Geometry polling every 300ms | IntersectionObserver |
| Reduced motion = instant cut | Reduced motion = short cross-fade |
| No glossary | Dotted-underline glossary notes, "Show the maths" toggles |
| No safe-area handling | `viewport-fit=cover` + `env(safe-area-inset-*)` |
