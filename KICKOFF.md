# Kickoff: build the Scaling Monosemanticity explorable

Rules for every session are in `CLAUDE.md`. This file is the plan. Work through the phases in order and **stop at each checkpoint** for my review.

**Audience:** complete beginners. Someone who has used a chatbot but never studied machine learning should finish the page understanding what a feature is, how a sparse autoencoder finds one, and why it matters. Lean heavily on animation and diagrams; every step needs a visual that teaches.

---

## Phase 0: Research and design (no site code yet)

**0.1 Facts.** Read the whole paper, including Methodological Details and the safety-feature appendices. Verify every item in `research/fact-sheet-seed.md` and write `research/facts.md`: one line per claim, with the value and a link to the paper section. Mark any seed item that is wrong or that you couldn't find, and say what you found instead. Consider running verification in parallel subagents, one per paper section, then merge.

**0.2 Reference study.** Fetch the reference page's HTML, CSS and JS. Install Playwright (`npm i -D playwright && npx playwright install chromium webkit`) and screenshot the hook, several steps, a lab and the sources section at 390×844, 360×800 and 1440×900. Write `research/style-notes.md` covering:
- typography (families, sizes, weights, line-height, measure)
- palette: background, ink, coloured-word hues, and dark mode if present
- spacing scale; scene/text layout per breakpoint
- step transitions: how scene objects persist and animate
- how coloured words link to scene objects on hover and tap
- navigation: scroll, ← →, arrow buttons, step counter
- caption/provenance styling, lab layout, meta and OG tags

If the reference can't be fetched or rendered, tell me instead of working from guesses.

**0.3 Visual language.** Write `research/visual-language.md`: one fixed visual for each recurring concept, so beginners learn the picture once and recognise it everywhere. Start from these and refine:

| Concept | Visual |
|---|---|
| Token | a word tile |
| Activation vector | a short column of coloured bars (positive up, negative down) |
| Neuron | one bar in that column |
| Feature | a labelled arrow ending in a small lamp; the lamp glows with activation strength |
| Layer | a floor of an isometric tower |
| SAE | a funnel that widens into a long row of lamps, then narrows back |
| Clamping | a dial on a lamp |
| Toy vs real | a consistent badge (e.g. "TOY" tag vs "FROM THE PAPER" tag) on every number and output |

Also define the motion grammar: how things enter, how they highlight, what a "replay" looks like, and the reduced-motion equivalent of each.

**0.4 Storyboard.** Write `storyboard.md`. For each step:
- title and final body copy
- the one-sentence plain-English takeaway
- new terms introduced, and the picture that introduces each
- coloured words → scene object
- scene state, and the **animation beats** in order (what moves, roughly how long)
- interaction, if any
- caption with source link

Then draw a **low-fi SVG thumbnail of the key frame for every step** and collect them in `storyboard/contact-sheet.html`, so I can review the visual flow at a glance. Check every claim against `facts.md` and list any you changed.

**0.5 Beginner read-through.** Have a subagent read the storyboard as a curious beginner with no ML background. It should list every point where it got lost, met an undefined term, or couldn't tell what the picture was showing. Fix those and keep the list in `research/beginner-review.md`.

### ✋ Checkpoint 1
Show me: corrections to the seed fact sheet, the style-notes summary with screenshot paths, the visual language, the storyboard with its contact sheet, and the beginner-review fixes. Wait for approval.

---

## Phase 1: Engine and vertical slice

Build the isometric projection helper, scene graph and tweening (with a timeline of beats per step, replayable, and a reduced-motion cross-fade path); the scroll/step controller; coloured-word ↔ scene-object linking; the glossary notes; the "Show the maths" toggle; the bottom nav; and the npm commands from `CLAUDE.md`. Then build the **hook, the primer and Act I** end to end, with real styling and animation.

### ✋ Checkpoint 2
Show me `npm run shots` output for the slice at all sizes (Chromium and WebKit), a short screen recording or frame sequence of two animated steps, and confirm that tap-linking, glossary notes and keyboard navigation work. Wait for approval before building the rest.

---

## Phase 2: Full story and labs

Build Acts II–V, the recap scenes, the toy model, the SAE and both labs. `npm test` must include a finite-difference gradient check of the SAE loss with respect to every parameter group.

## Phase 3: Verification

Run every item of the acceptance checklist below and save evidence to `evidence/`. Fix what fails. Repeat the beginner read-through on the built page. Report with evidence paths, scores, and remaining issues.

---

## What to build

### Reference features to reproduce in spirit
1. **Hook:** byline (`Author · Month Year`), short H1, one-paragraph dek, a line telling readers coloured words are tappable, a "Begin" button, and a step counter with navigation hint.
2. **One persistent isometric SVG world:** a sticky scene that rearranges per step. Objects keep identity and animate between states, never swapped out.
3. **Short steps:** punchy sentence-case titles, 2–3 short paragraphs, bold only on the key number, a provenance caption.
4. **A running example plus a hand-built toy** with named features, so the maths is visible.
5. **Interactions inside the story:** sliders, a "train" button running real gradients, a prediction question before a reveal.
6. **Labs after the story**, labelled "Lab 1 · hands on" and so on.
7. **Closing Sources and "About the figures" paragraphs.** The latter says toy numbers come from the toy, real numbers are quoted from the paper, and nothing on the page is real Claude output.
8. **Honest voice:** names who measured what, separates toy from real, spends real space on limitations.

### Running example and toy
- **Running example:** the Golden Gate Bridge feature (34M/31164353), with one sentence such as *"We drove across the Golden Gate Bridge at sunset."* as a token strip that reappears throughout.
- **Toy:** a 3-D "residual stream" holding 8 named concepts in superposition: Golden Gate Bridge, San Francisco, bridge (any), tourist landmark, code error, sadness, addition, transit. A tiny SAE trained in JS recovers them.

### Narrative (refine freely; keep ~24–28 steps in a primer, 5 acts, and recaps)
Each step lists a suggested visual. Schematic diagrams of paper results must be labelled as schematic unless drawn from numbers in `facts.md`.

**Hook: a bridge inside Claude.** The paper clamped one feature to 10× its max and the model began describing itself as the bridge (paraphrase, labelled as reported). Question: how do you find one idea among billions of numbers?
→ *Visual:* a small isometric city; one lamp's dial turns up and the bridge glows while a speech bubble shows the paraphrase with a "FROM THE PAPER" tag.

**Primer: how a language model reads**
- P1. Words become tiles: the sentence is split into tokens. → *Tiles snap apart; each tile gets a number tag.*
- P2. Tiles become numbers: each token turns into a column of bars and rises through the tower's floors. → *Columns rise floor by floor, bars shifting slightly at each floor.*

**Act I: Why neurons don't tell you much**
1. A thought is a list of numbers: freeze the column at the middle floor. → *Zoom into one column; bars wobble as different tokens pass.*
2. One neuron, many jobs: polysemanticity. → *One bar lights up for a bridge, then for code, then for sadness: three cards flipping.*
3. More ideas than room: superposition. → *3 arrows fit at right angles in a cube; then 8 squeeze in, with an angle readout showing they're almost but not quite perpendicular; overlaps spark.*
4. Concepts as directions: the linear representation hypothesis. → *Sliding along the bridge arrow raises a "bridge-ness" meter; two arrows add head-to-tail.*
- Recap I. → *Zoom out: tiles, tower, column, crowded arrows.*

**Act II: The tool, a sparse autoencoder**
5. Explain a vector as a few ingredients: dictionary learning. → *A chord on piano keys; the column splits into three coloured parts that stack back into it.*
6. Widen, then switch off: encoder = linear map + ReLU. → *The funnel widens 3 → many lamps; bars below zero hit a gate and flatten.*
7. Rebuild the original: decoder = weighted sum of feature directions. → *Lit arrows slide head-to-tail toward a ghost of the original; the leftover gap is shaded.* (Formula behind "Show the maths".)
8. Two forces: reconstruction vs sparsity. → *Tug-of-war rope driven by a λ slider: lamp count vs rebuild-gap meter.*
9. Three dictionaries: 1M, 4M, 34M. → *Three shelves of drawers growing in size, with a scale note.*
10. Read the receipts: active features per token, variance explained, dead features. → *A huge grid of lamps where only a few light per token; dead drawers greyed out.*
- Recap II. → *The full funnel pipeline, end to end.*

**Act III: Are the features real?**
11. What lights it up: top activations. → *Token strip glowing white-to-orange.*
12. Grading specificity: Claude 3 Opus's 0–3 rubric. → *Bins of activation strength filling with score colours.*
13. Any language, even pictures. → *The bridge lamp lights for tiles in several scripts and for an image icon.*
14. Turn the dial: clamping as the causal test. → *Toy dial; the toy's next-word bars shift, tagged "TOY".*
15. It understands bugs: the code-error and addition features. → *Code tiles with a bug glow; an English typo stays dark; dial flips positive/negative.*
16. Features beat neurons. → *Schematic scatter with most points below the correlation line.*
- Recap III.

**Act IV: A map of a mind**
17. Neighbourhoods. → *Lamps drift into islands on a map: bridge near SF landmarks, then wider tourist regions.*
18. Features split. → *One San Francisco bubble divides into 2, then 11, as the shelf grows.*
19. What's missing. → *A water-level slider over bars of concept frequency; the line drops as the dictionary grows.*
20. Watching a chain of thought: Kobe Bryant → Sacramento. → *A domino chain of lamps; a toggle reorders the list "by activation" vs "by attribution".*
- Recap IV.

**Act V: Safety, carefully**
21. Features with sharp edges. → *A locked cabinet with drawer labels only; a note that knowing about lies isn't lying.*
22. Catching a fib: the "forget this word" case study. → *Two lanes side by side, unclamped vs clamped, paraphrased and tagged.*
23. Who the assistant thinks it is. → *A mask-on, mask-off metaphor as the dialogue lamp's dial goes negative.*
24. Where it breaks: every limitation the paper states. → *Cracks appear in the world, one per limitation, each labelled.*
25. Close. → *Back to the bridge, surrounded by word tiles (a vocabulary) with no connectors between them (not yet a grammar).*

**Lab 1 · Train a sparse autoencoder.** Hidden sparse concepts packed into 3-D; press train and watch decoder arrows rotate onto them. Expose λ, dictionary width, dead-feature count. Include a "what to try" card for beginners (e.g. "set λ to zero and watch what happens").

**Lab 2 · Steer a toy model.** Pick a feature, clamp from −5× to +10×, watch the toy's next-word distribution and a templated completion shift. Clearly tagged as a toy, with a "what to try" card.

### Other deliverables
- Sources section citing the paper, "Towards Monosemanticity" (2023), "Toy Models of Superposition" (2022), and anything else referenced, with links.
- OG and Twitter meta tags; `og.png` (1200×630) of a representative scene.

---

## Acceptance checklist (attach evidence for each)
- [ ] Every claim in `storyboard.md` traces to `facts.md`, which links into the paper.
- [ ] Every step changes the scene, and every technical term has a picture and glossary note on first use.
- [ ] Beginner read-through repeated on the built page; remaining confusions listed.
- [ ] Screenshots at all six sizes in Chromium and WebKit: no overflow, no clipped labels, sticky scene behaves.
- [ ] Animations hold ~60fps at 4× CPU throttle (performance trace) and replay correctly.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.
- [ ] Every coloured word works by tap (mobile emulation) and by hover (desktop).
- [ ] SAE gradient check passes; Lab 1 visibly recovers the hidden features (before/after screenshot).
- [ ] Dark-mode and reduced-motion screenshots; every animation has a reduced-motion equivalent.
- [ ] Sources and "About the figures" present.
- [ ] Open issues listed, including anything only testable on a real device.
