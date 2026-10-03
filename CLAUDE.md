# Project: "Scaling Monosemanticity" explorable

A mobile-first, scroll-driven interactive explainer of Anthropic's paper
*Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet* (May 2024).

- Paper: https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html
- Format reference: https://mdjawad.com/explorables/clm/#hook

The task plan lives in `KICKOFF.md`. This file holds the rules that apply in every session.

## Sources of truth
- `research/facts.md`: every real number or claim, each with a link to a paper section. Read it before writing or editing any copy. If a number isn't in it, it doesn't go on the page.
- `research/fact-sheet-seed.md`: an unverified starting list. Never cite it directly.
- `research/style-notes.md`: what you learned from the reference explorable.
- `storyboard.md`: approved step copy and scene plan. Do not change approved copy without saying so.
- `content/`: step copy as data, kept separate from code.

## Content rules
- Accuracy first. Every real number carries a caption naming its paper section. If the paper doesn't report something (e.g. Claude 3 Sonnet's size), say so; never guess.
- Toy vs real. Toy numbers come only from the hand-built toy in `src/toy/`. Never present toy output, or any invented completion, as Claude's. Paraphrase the paper's steering results and label them as reported by the paper.
- Copyright. Write all copy in your own words. At most a handful of quotes from the paper, each under 15 words and attributed. Redraw figures from scratch; don't embed the paper's images or reproduce dataset examples at length. Borrow the reference explorable's patterns, not its code, SVGs, or text.
- Sensitive features. Name bias and dangerous-content features at a high level only. No slurs, harmful instructions, or scam text. Keep the paper's caveats (e.g. a feature about lying is not the model lying).
- Voice. Plain, sentence-case titles. 2–3 short paragraphs per step. Bold only the key number. Name who measured what.

## Beginner-first (the reader has no ML background)
- Show, then tell. Every step changes the scene; the picture should carry the idea even if the reader skims the text.
- Every technical term (vector, neuron, feature, superposition, ReLU, loss, λ…) is introduced with a picture or animation on first use, plus a one-line plain-English definition. Tapping a dotted-underlined term opens a short glossary note.
- One idea per step. If a step needs two new terms, split it.
- Use a consistent visual vocabulary (see `research/visual-language.md`): the same concept always looks the same everywhere on the page.
- Maths is optional. Formulas sit behind a collapsed "Show the maths" toggle; the main text never depends on them.
- Prefer everyday analogies (chords, recipes, maps, tug-of-war), but say where the analogy stops working.
- Each act ends with a short recap scene that zooms out to show everything learned so far.
- Animations explain, they don't decorate: each one shows a cause and effect, a before/after, or a build-up in order. Keep them short (≈0.4–1.2s per beat), replayable, and within the performance rules below.

## Tech
- Static site, no backend. Vanilla JS as ES modules. A hand-written isometric SVG engine; no WebGL, no 3D library. esbuild may be used for the production bundle only.
- Layout: `index.html`, `src/engine/` (projection, scene graph, tweening), `src/scenes/`, `src/toy/` (toy model + SAE), `src/labs/`, `content/`, `research/`, `scripts/`, `tests/`.
- Self-hosted fonts with `font-display: swap`. JS under ~150 KB gzipped.

## Mobile, performance, accessibility (non-negotiable)
- Mobile-first. Portrait: sticky scene at ~45–50svh on top, steps scroll beneath. ≥900px: scene and text side by side.
- Use `svh`/`dvh`, never bare `100vh`. No horizontal scroll at 320px.
- Viewport meta with `viewport-fit=cover`; honour `env(safe-area-inset-*)` on the sticky scene and bottom nav. Never disable pinch-zoom.
- SVG uses `viewBox` + `preserveAspectRatio`. Labels ≥ ~11px on a 360px screen; hide minor labels on small screens instead of shrinking them.
- Nothing depends on hover. Coloured words highlight their scene object on tap (pulse it, bring the scene into view). Hover is an enhancement behind `@media (hover:hover)`.
- Touch targets ≥ 44×44px. Pointer Events only. Large slider thumbs; `touch-action` set so dragging a slider doesn't scroll the page. Inputs ≥ 16px font.
- Passive scroll listeners, IntersectionObserver for step activation, requestAnimationFrame for animation. Animate transform and opacity only. No SVG filters or blur. Keep node counts small.
- SAE training runs in small per-frame chunks or a Web Worker; scrolling must never stutter. Target 60fps at 4× CPU throttle.
- `prefers-reduced-motion`: cross-fade instead of animating. `prefers-color-scheme`: dark mode.
- An aria description per scene state. Full keyboard support (← →, Tab) with visible focus rings. Colour is never the only carrier of meaning.

## Deployment
- The site is published to GitHub Pages at https://edangx100.github.io/scaling-monosemanticity/, which is a subfolder, not the domain root.
- All asset and link paths are **relative** (`./src/…`, `assets/…`, never `/src/…`), so the site works from a subfolder and from `npm run dev`.
- OG and Twitter image tags (and `og:url` / canonical) use the full URL: `https://edangx100.github.io/scaling-monosemanticity/…`.
- Deployment is a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes to Pages on every push to `main`.

## Commands (create these in Phase 1, keep them working)
- `npm run dev`: local static server
- `npm test`: unit tests, including the SAE finite-difference gradient check
- `npm run shots`: Playwright screenshots (Chromium + WebKit) at 320×568, 360×800, 390×844, 430×932, 844×390, 1440×900, plus dark-mode and reduced-motion variants, into `evidence/shots/`
- `npm run lh`: Lighthouse mobile (performance, accessibility) into `evidence/lighthouse/`

## Working style
- Stop at each checkpoint in `KICKOFF.md` and wait for my review.
- Commit at the end of each phase with a descriptive message.
- Never claim something works without evidence: test output, a screenshot path, or a score. If a check can't be run (e.g. WebKit won't install), say so and list it as open.
