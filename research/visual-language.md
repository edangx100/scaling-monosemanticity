# Visual language

One fixed picture per concept. A beginner learns each picture once and sees it the same way everywhere. If a step needs a new concept, it gets a new picture here first.

## World and camera
- **One isometric world**, drawn in SVG with a true 30° isometric projection. Objects have stable ids, so they move between steps instead of being swapped.
- The world has three zones that the camera pans between, so the reader always knows "where" they are:
  1. **The street** (front left): where text arrives as word tiles.
  2. **The tower** (centre): the model, drawn as floors.
  3. **The workshop** (right): the SAE funnel, the lamp row and the shelves.
- Floor grid: a faint diamond grid, used as context only.
- Light comes from the upper left. Box faces are shaded as top 100%, left 76%, right 54% of base lightness. That is computed in code, not drawn with filters.

## Concept → picture

| Concept | Picture | Colour token | Shape cue (so colour isn't the only signal) | First introduced |
|---|---|---|---|---|
| **Token** | A flat word tile on the floor, with the word printed on top. Once numbered, a small number tag sits on its front edge. | `--paper` tile, `--ink` text | Flat rectangle with text | P1 |
| **Activation vector** ("the list") | A short column of **3 bars** (the toy's size) standing on its tile, with clear gaps between tiles' columns. Bars above the baseline are positive, bars below are negative. A real model's list appears only once, as a faint very tall column marked "far more numbers (count not reported)". In Act I the 3-bar column tips over into an arrow in a room: same object, same colour. | `--raw` (slate blue) | Bars on a shared baseline, with a thin baseline rule | P2 |
| **Slot / neuron** | **One bar** in that column, bracketed when singled out, with its index under it ("#2"). In the toy a slot stands in for a neuron; the glossary says where that stops being true. | `--raw`, outline `--ink` | A single bar with a bracket | I-1 |
| **Layer** | One **floor** of the isometric tower (a thin slab). The middle floor is marked "middle layer"; a camera flash there means "snapshot taken". | `--frame` (neutral) | A stacked slab; no real floor count shown (the paper doesn't report one) | P3 |
| **Direction** (concept as direction) | An **arrow** from the corner of a wireframe room. Strength = the length of the token arrow's **shadow** on it, mirrored by a meter. | Feature colour (below) | Arrowhead plus shadow | I-3 |
| **Feature** | **Always a lamp on an arrow**: one object everywhere. The arrow is the feature's direction; the lamp's fill brightness and a halo ring show how brightly it's lit; off means a dark lamp with no ring. When space is tight (shelves, maps, chains), only the lamp is drawn, but it's the same lamp. Never a drawer, bubble, domino or slice. | `--lamp` (warm yellow); the **Golden Gate Bridge** feature uses `--bridge` (international orange) | A round lamp bulb on a stem, plus a label | II-1 (unlabelled idea-arrows from I-3) |
| **Superposition** | Eight arrows spread evenly in the 3-D room (more than its three right angles allow), with an **angle readout** from the toy between neighbours. Then slot #2 splits into coloured segments showing which ideas share it. | Arrows in `--lamp` | Segmented bar | I-4 |
| **Dictionary learning** | **Smoothie / recipe**: three lamps light and the column splits into three parts, each tinted like its lamp, which stack back into it | Parts take their lamps' colours | Stacked parts with gaps | II-1 |
| **SAE** | A **funnel**: a narrow mouth (the column) widens into a **row of lamps** (8 in the toy), then narrows back to an output arrow | Funnel body `--machine` (teal); lamps `--lamp` | Trapezoid in, row, trapezoid out | II-2 |
| **ReLU** | A **gate** on each lamp's input. Values below zero hit it and flatten to zero. | Gate `--machine` | A short horizontal bar labelled "0" | II-3 |
| **Training** | Faint dashed arrows mark the toy's hidden ideas; the SAE's lamp-arrows start scattered and **rotate into line** round by round, with a round counter | Hidden `--ink-3` dashed; learned `--lamp` | Dashed vs solid arrows | II-5 |
| **Reconstruction** | Lit lamp-arrows join end to end. The **original arrow becomes a dashed outline**, and the rebuilt arrow lands beside it. | Outline `--ink-3` dashed; rebuild `--raw` | Dashed outline vs solid | II-4 |
| **Error / leftover** | The gap between outline and rebuild, **hatched**. The same hatching marks the "missed" share in II-8. | `--gap` (rose) | Diagonal hatching | II-4 |
| **Sparsity vs accuracy (λ)** | **Tug-of-war rope** between two meters: "lamps lit" (count) and "rebuild gap" (hatched bar). The λ slider moves the knot. | Meters `--lamp` and `--gap` | Rope with a knot marker | II-6 |
| **Dictionary size** | **Shelves of small lamps**: 1M, 4M and 34M shelves growing in length, with a scale note ("each drawn lamp stands for many features") | `--frame` shelf, `--lamp` lamps | Lamp grid on a shelf | II-7 |
| **Dead feature** | A lamp **greyed with a small ×** | `--dead` (grey) | × glyph | II-7 |
| **Top activations** ("brightness") | The token strip, each tile tinted from **white to orange** by brightness (as the paper does), with a legend | `--heat` ramp | Legend strip | III-1 |
| **Specificity score** | Four **bins** labelled 0–3. Dots drop in by brightness, coloured by score. | Ramp `--score-0`…`--score-3` | Bin labels and patterns (empty, dot, half, full) | III-2 |
| **Clamping** | A **dial** fixed to a lamp, with a needle and tick labels (−5×, 0, 5×, 10×). Turning it sets the lamp's brightness, even with no input; then the **edited list slides back into the tower**. The dial is never used for anything else (no "dials" as read-outs). | Dial `--machine`; needle `--ink` | Dial face with ticks | Hook, III-4 |
| **Next-word prediction** | Horizontal **probability bars on the tower's roof**; the winner drops onto the end of the token strip | Bars `--raw`; winner outlined | Labels and % numbers | P4 |
| **Neighbourhood** | Lamps drift into **islands** on a floor map; distance means similarity | Lamp colours; islands `--frame` | Island outlines | IV-1 |
| **Feature splitting** | One lamp **divides** into 2, then 11, as the shelf beside it grows | `--lamp` | Count label "1 → 2 → 11" | IV-2 |
| **Missing concepts** | A **water line** over bars of concept frequency. Bars above the line carry a lamp; the line drops as the dictionary grows. | Water `--machine` at 25% | Line plus a lamp on bars above it | IV-3 |
| **Ablation** | A lamp **switched off with a slash**; the roof's answer bar shrinks | `--lamp`; slash `--ink` | Slash glyph | IV-4 |
| **Attribution / chain of ideas** | A **chain of linked lamps** leading to an answer tile, plus a sort toggle (brightness vs attribution) that reorders a ranked list | `--lamp`; links `--ink-3` | Link lines; ranked list | IV-5 |
| **Safety-relevant feature** | A **locked cabinet** with drawer labels only (category names), never contents. This is the only drawer on the page; it's a cabinet of categories, not a feature. | `--frame` | Padlock glyph | V-1 |
| **Limitation** | A **crack** in the floor, each one with a label (four in the scene; the rest in a collapsed list) | `--ink-3` | Jagged line | V-4 |
| **Toy vs real** | A **badge** on every number and every output: `TOY` (violet, square corners) or `FROM THE PAPER · §section` (green, rounded), plus `SCHEMATIC` (grey, dashed border) for drawn-to-explain diagrams | `--toy`, `--paper-cite`, `--schematic` | Different border styles and always a text label | Hook |

### The toy, fixed everywhere
The toy list has **3 numbers** and holds **8 ideas**; the toy SAE has **8 lamps** by default. Any picture that shows a different count is a bug.

### The toy model's eight concepts
The toy's concepts get **names and small glyphs**, not eight separate colours. Every feature is a `--lamp`, and only the running example gets `--bridge`.

| Concept | Glyph |
|---|---|
| Golden Gate Bridge | ⌒ suspension-bridge outline (`--bridge`) |
| San Francisco | small skyline |
| bridge (any) | single arch |
| tourist landmark | pin |
| code error | `{!}` |
| sadness | teardrop |
| addition | + |
| transit | rail line |

## Colour tokens

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--bg` | `#f7f5f0` | `#0b0d12` | Page |
| `--panel` | `#ffffff` | `#13171f` | Cards |
| `--ink` / `--ink-2` / `--ink-3` | `#1b1d22` / `#45484f` / `#6b6f78` | `#ece7dc` / `#b9b4a9` / `#8a8f9c` | Text |
| `--paper` | `#ece6d8` | `#2a2e38` | Token tiles |
| `--raw` | `#5677a8` | `#7aa2dd` | The model's raw numbers (vectors, neurons) |
| `--lamp` | `#d9a400` | `#ffcc4d` | Features |
| `--bridge` | `#c0362c` | `#ff6a4d` | The Golden Gate Bridge feature only |
| `--machine` | `#1f8a85` | `#3cc7bf` | SAE parts: funnel, gate, dial |
| `--gap` | `#c2456b` | `#f07a9a` | Reconstruction error (always hatched) |
| `--dead` | `#a7a9ad` | `#4a4f5a` | Dead features |
| `--frame` | `#d6d1c4` | `#272c37` | Floors, shelves, islands |
| `--toy` | `#6b4bd6` | `#b495ff` | TOY badge |
| `--paper-cite` | `#1f7a4d` | `#3fd08a` | FROM THE PAPER badge |
| `--schematic` | `#6b6f78` | `#8a8f9c` | SCHEMATIC badge |

Text tokens must reach 4.5:1 contrast on `--bg` and `--panel`, and graphics 3:1, in both themes. Phase 1 adds a contrast check to `npm test`. Key pairs are also checked against deuteranopia and protanopia, which is why each concept has a shape cue.

## Words, fixed everywhere
- *slot*: one number in the model's list. *lamp*: a feature. *brightness*: a feature's activation (the glossary says so once).
- *dictionary*: one trained SAE's full set of features.
- *dial*: clamping only.

## Text marks
- **Scene words** (link to a scene object): bold, in the object's colour, with a **solid** 2px underline at 40% alpha. Tap, click, Enter or focus pulses the object.
- **Glossary terms**: ink colour with a **dotted** underline. Tap or Enter opens a short note with a one-line definition and a tiny thumbnail of the term's picture.
- A word is never both. On first use, the glossary mark wins; later mentions can be scene words.
- **Key number**: bold ink. One per step.
- **Badges**: inline after the number, and in the scene's top-right HUD.

## Motion grammar

Animations only show cause → effect, before → after, or a build-up in order. Each step plays a **timeline of beats**: 1–4 beats of 0.4–1.2s, run in order, then a short hold. Only transform and opacity are animated, with no filters.

| Verb | Normal motion | Duration | Reduced motion |
|---|---|---|---|
| **Persist** | An object present in two steps tweens position, size and opacity with one ease-in-out | 0.6–0.9s | 200ms cross-fade between end states |
| **Enter** | Rises 12px (≈ 0.3 world units) and fades in; groups stagger by 40ms | 0.4s | Fade in, 150ms |
| **Exit** | Sinks 8px and fades out | 0.3s | Fade out, 150ms |
| **Flow** | Something travels along a path (a column rising floor by floor, a token entering the funnel) | 0.6–1.2s | Shown at its destination with a dashed path behind it |
| **Light** | Lamp brightness and halo opacity change; the activation number counts up | 0.4s | Jump to the final value |
| **Highlight** (from a scene word) | The object pulses (scale 1 → 1.08 → 1) and gets a 2px ink outline; everything else dims to 35% | 0.35s, then held while the word is focused | Outline and dim only, no pulse |
| **Split** | One object becomes several that slide apart | 0.8s | Cross-fade from one to several |
| **Turn (dial)** | The needle rotates, then the lamp lights | 0.5s + 0.4s | Needle and lamp jump |
| **Camera** | Pan or zoom, eased with the first beat | Same as beat 1 | Cut |

- **Replay.** Each step's card has a small "↻ Replay" button (≥ 44×44) that resets the scene to the start of the step and replays its beats. Under reduced motion it shows the before state for 600ms, then cross-fades to the after state.
- **Interruptions.** Scrolling to a new step mid-timeline jumps the old step to its end state, then plays the new one. There is never a half-built scene.
- **Loops.** At most one ambient loop per scene (e.g. marching dashes on a flow line), paused when the scene is off-screen and under reduced motion.
- **Budget.** Under ~150 animated SVG nodes per frame. The 34M shelf and the lamp grid are drawn as a few patterned rectangles, not one node per item.

## Labels and small screens
- Scene labels are ≥ 11px at 360px. Labels have a priority: priority 2 is hidden below 400px and priority 3 below 600px.
- No label sits on top of a moving object. Leader lines are used when objects crowd.
- Every scene state has an aria description, written in the storyboard, saying what the picture shows.
