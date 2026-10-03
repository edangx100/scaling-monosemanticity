# Beginner read-through (KICKOFF 0.5)

**Who read it:** a subagent role-playing a curious adult with no ML background (school maths only), on 2026-10-03. It read the first `storyboard.md` draft and the contact sheet (`evidence/phase0/contact-sheet-1440-light.png`).

**Found:** 11 blockers, 41 confusing points, 39 nits, and 6 positive notes.

**Its verdict on the first draft:** a beginner would finish knowing what a feature is, but not how a sparse autoencoder finds one. Two things broke the explanation: the toy's size contradicted itself, and the page never said why the SAE rebuilds the list or showed it learning.

All 11 blockers are fixed in the current `storyboard.md`, along with most of the confusing points. Below, each finding is paraphrased with what changed. Step IDs refer to the **revised** storyboard; old IDs are in brackets where they differ.

## Blockers (all fixed)

| # | Finding | Fix |
|---|---|---|
| 1 | The toy's size contradicts itself: P2 says 8 numbers, Act I says 3-D, and II-2 feeds in "the 8 numbers". With 8 numbers and 8 ideas, superposition wouldn't be needed. | The toy is fixed at **3 numbers, 8 ideas, 8 lamps**, stated once at the top of the storyboard and in `visual-language.md` ("any other count is a bug"). P2 now draws 3 bars plus a faint tall "real model" column. II-2 says "3 numbers into 8". Lab 1 matches. |
| 3 | The page never says what the model outputs. | New step **P4 · The top floor makes a guess** (next-word odds on the tower's roof) [M1]. |
| 16 | Slot vs neuron is muddled. | I-1 now says "In this toy, we'll treat each slot like a neuron". The glossary note says where that stops being true [M4]. III-6 says "any floor below". |
| 25 | I-4's picture ("≈25°", arrows fanned in a half-circle) contradicts "close to perpendicular". | The text no longer claims "nearly perpendicular" for the 3-D toy. It says the arrows spread as far apart as they can but can't all be at right angles, while real models with far more numbers can get close [M6]. The frame now shows 8 arrows spread in 3-D, with the angle as a toy readout. |
| 40 | "Why rebuild something we already have?" is never answered. | II-4 now answers it: rebuilding from only a few lamps forces the lamps to capture what's really in the list. |
| 56 | III-2 refers to "these four features" without introducing them. | III-2 names them (bridge, brain sciences, tourist attractions, transit) [C1–C4] and shows them as four lamps. |
| 61 | Clamping an SAE lamp seems unable to reach the model. | III-4 now says the edited list is **put back into the tower in place of the original**, and a beat shows it sliding back in [D1]. |
| 62 | "Next-word guesses" appears with no setup. | Set up in P4; III-4's bars sit on the same roof. |
| 66 | A −5× clamp contradicts ReLU's "never below zero". | III-5 now explains that clamps can go below zero, which ReLU never produces on its own: a negative setting subtracts the feature's arrow [D11]. |
| 81 | "8 were in attribution's top 10 but only 3 in brightness's" took four reads. | Split into two short sentences, with the bold on 8 (IV-5). |
| 91 | V-4 is a wall of jargon (8 limitations; "attention" never introduced). | V-4 now gives **four limits in plain words** (no answer key, most ideas missing, costly, one floor only). The other five go in a collapsed "More limitations" list, which says what attention is [M4]. |

## Confusing points: main fixes

| Area | Finding | Fix |
|---|---|---|
| Whole page | A feature is drawn as a slice, lamp, arrow, drawer, bubble, dot or domino. | One object: **a lamp on an arrow** (only the lamp when space is tight). Shelves hold lamps, splitting divides lamps, and the chain is linked lamps. The only drawer is the safety cabinet, which holds categories, not features. |
| Whole page | "Dial" means a read-out in I-1 but a control elsewhere. | I-1 uses "a meter on a dashboard"; a dial means clamping only. |
| Whole page | "Activation" is used bare. | The body says **brightness** throughout. The glossary says once that researchers call it activation. |
| Whole page | "Dictionary" is never explained. | II-1: "The full set is the 'dictionary'." II-7: "three SAEs, three dictionaries". |
| Hook | "No maths needed" clashes with λ and ReLU later. | Now "The maths is optional, tucked behind 'Show the maths' buttons." |
| Hook | What is Claude 3 Sonnet? What does "10× its natural level" mean? | "a version of their Claude assistant" [A1]; "10× the strongest it ever got on its own" [D2]. |
| P2 | Where do the numbers come from? | "Looked up in a table it learned during training" [M2]. |
| P3 | "Stopped the list" sounds like halting the model. | "Took a snapshot", with a camera-flash beat. |
| I-2 | Why does one slot do three jobs? | "Two steps from now, we'll see why it happens." I-4 now gives the answer explicitly, and slot #2 splits into coloured segments. |
| I-3 | "How far it points along" is fuzzy; arrow-adding is unexplained. | Uses the **shadow** on the bridge arrow, and adds a sentence plus a beat on adding arrows end to end. |
| I-4 | Why can rarely co-occurring ideas share space? | One sentence: if bridges and sadness rarely share a sentence, their overlap seldom causes a mix-up. |
| II-1 | "Hear the chord and name the keys" makes non-musicians feel excluded. | Swapped for a smoothie / recipe analogy, with where the analogy stops working. |
| II-2 | How does it know which lamp is "bridge"? Why widen? | "For now, assume it has already learned them; II-5 shows how." "More lamps than numbers because there are more ideas than numbers." |
| II-3 | "Negative or tiny" wrongly implies ReLU clears tiny positives. | Now "below zero" only; faint lamps stay faintly lit. |
| II-5 (old) | Training, loss and λ are crammed into one step, and learning is never shown. | New **II-5 · Learning by rebuilding**: random arrows rotate onto the hidden ideas (the toy's real training run) [M7]. Loss and λ get their own step (II-6). |
| II-6 | The bold "λ = 5" is meaningless without context. | Moved to the caption with its caveat [A9]; the body has no bold. |
| II-7 | Two different 65% figures side by side; "variation" undefined; drawers. | The body gives the dead shares in words ("a third", "nearly two-thirds") and keeps 65% only for the rebuild, phrased as "of the ways the lists differ from one another… up to a third unexplained" [B4]. Exact dead percentages are in the caption. Lamps, not drawers. (After Checkpoint 1, dictionaries, dead features and receipts are one step.) |
| III-1 | Who named the feature? | "Features come out unnamed… researchers read the text that lights it most, then give it a name." |
| III-2 | Is Claude grading itself? | "A larger Claude model, Claude 3 Opus, acted as the grader." |
| III-3 | How does a text model see photos? | "Show the model photos of the bridge…"; "multimodal" dropped. |
| III-4 | Results too compressed; "proves" overclaims. | One line per result, each with the question asked in plain words. The takeaway is now "can steer". |
| III-5 | "It knows about bugs" invites over-reading; three results crammed in; "Scheme". | Retitled "A feature for code mistakes". It now says what the task was ("what some code would print"), "three programming languages", and the addition result moved to the caption. |
| III-6 | Correlation and 0.3 unexplained; axes unlabelled. | Correlation is defined in the body (1 = lockstep, 0 = unrelated) [M5]. The frame has a labelled 0–1 axis. "Significantly" is now "by margins the paper calls significant". |
| IV-3 | The rule is hidden behind the double "12 million". | The rule comes first ("N working features → ideas seen about once every N tokens"), then N for the 34M SAE. Whose training text is now stated. |
| IV-4 (old) | Two new terms in one step. | Split. **IV-4 · Switch one off** introduces ablation with the John example [I4, I5]. **IV-5 · A chain of ideas** introduces attribution with Kobe. |
| IV-5 | "Three hops" with four arrows; "chain of thought" clashes with chatbot usage. | The three hops are written out as three clauses; retitled "A chain of ideas". |
| V-2 | "Catching a fib" pulls against V-1's caution. | Retitled "A feature that flags a false claim". The honesty result now says what it achieved ("produced an accurate answer"). |
| V-3 | AI and consciousness features appear from nowhere; awkward word order. | Now opens with the paper's self-questions finding (robots, AI, consciousness, ghosts) [J16]. "The paper stresses that this… is speculation." |
| Close | Contradicts IV's chain. | "We've glimpsed one chain of them from Kobe to Sacramento, but we can't yet read, in general…" |
| Labs | "Gradient-descent" is jargon; Lab 2 output could be screenshotted as Claude's. | "A real training loop". The "not Claude" tag sits on the completion box itself. |

## Nits
- **Fixed:**
  - P2 no longer bolds a drawing choice.
  - The "neuron" glossary mentions brain cells.
  - I-2 avoids "thinking".
  - The I-4 "perpendicular" wording is pedantically correct.
  - λ is spelled "lambda" once.
  - "Read the receipts" is kept but explained by its first sentence.
  - "Backdoors" is glossed.
  - "Steerable" is replaced by "can be turned up".
- **Fixed in the contact sheet:**
  - Script tiles showed empty boxes (missing CJK glyphs in headless Chromium); they now use Greek, Cyrillic, Vietnamese and French.
  - The P2 columns are separated per tile.
  - The I-4 angle label is a toy readout.
- **Left for Phase 1 (by design):**
  - P1's token IDs will come from the toy vocabulary, not the evenly spaced placeholders in the sketch.
  - The crack labels' meaning depends on the text; each crack gets a glossary note.

## Open items from this review
1. **Step count:** resolved at Checkpoint 1. The three-dictionaries step was folded into the receipts step, giving **31** steps; III-3 was kept.
2. **CJK fonts:** resolved at Checkpoint 1. A short Chinese tile uses the system font stack (no self-hosted CJK font), labelled illustrative, alongside the Greek, Cyrillic and Vietnamese tiles.
3. **Repeat the read-through** on the built page in Phase 3, as KICKOFF requires.
