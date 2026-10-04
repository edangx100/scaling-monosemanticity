# Phase 3 acceptance (2026-10-04)

Every item in the KICKOFF acceptance checklist, with the command that checks it and where the evidence is saved. All runs used the current working tree. e2e, words, shots, Lighthouse and perf ran one after another, never in parallel, so the timings aren't distorted.

| # | Checklist item | Result | Evidence |
|---|---|---|---|
| 1 | Every claim in `storyboard.md` traces to `facts.md`, which links into the paper | **Pass.** `tests/claims.test.mjs`: every number with a unit in the copy appears in `facts.md`, every fact ID cited in the storyboard exists, and every step (recaps excepted) has a caption naming its paper section. | `npm test`: 64/64 |
| 2 | Every step changes the scene; every technical term has a picture and a glossary note on first use | **Pass.** `tests/content.test.mjs`: each step's final picture differs from the one before, and every term is a glossary link where it first appears. Glossary entries carry a small picture (`pic`). | `npm test` |
| 3 | Beginner read-through repeated on the built page; remaining confusions listed | **Done.** It found 6 blockers, all fixed, along with the main confusing points. What was left is listed. | `research/beginner-review.md` § "Second read-through"; copy changes in `storyboard.md` note 15 |
| 4 | Screenshots at all six sizes in Chromium and WebKit: no overflow, no clipped labels, sticky scene behaves | **Pass.** 800 shots (37 steps plus 2 labs, at every size), **0 problems**: no horizontal overflow, no clipped scene labels, the right step active, no page errors. | `evidence/shots/{chromium,webkit}/<size>/`, `evidence/shots/report.json` |
| 5 | Animations hold ~60 fps at 4× CPU throttle and replay correctly | **Pass.** 37 step transitions (5,404 frames): mean **60 fps**, 2 frames over 20 ms (worst: `close`, 59.2 fps, one 50 ms frame). Lab 1 training: 60 fps, 0% slow frames. Replay is checked in e2e ("Replay plays the step again and finishes"; II-5 live retraining reaches round 1500). Frame strips of 10 animations are also saved. | `evidence/perf/summary.json`, `evidence/perf/trace-steps-1-4.json.gz`, `evidence/e2e/results.json`, `evidence/frames/*-strip.png` |
| 6 | Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95 | **Pass.** Performance **97**, Accessibility **100** (TBT 60 ms). | `evidence/lighthouse/report.html`, `summary.json` |
| 7 | Every coloured word works by tap (mobile emulation) and by hover (desktop) | **Pass.** **101/101** words by tap and by hover, in both Chromium and WebKit. | `evidence/e2e/words.json` |
| 8 | SAE gradient check passes; Lab 1 visibly recovers the hidden features | **Pass.** The finite-difference gradient check is in `tests/sae.test.mjs`. In Lab 1, ideas found go from 3 of 8 to **8 of 8**, and loss goes from 0.532 to 0.119 after 4,000 rounds. The panel now has a key: dashed = hidden idea, solid with lamp = learned arrow. | `evidence/labs/lab1-before.png`, `lab1-after.png`, `lab1.json` |
| 9 | Dark-mode and reduced-motion screenshots; every animation has a reduced-motion equivalent | **Pass.** Dark and reduced variants are saved at 390×844 and 1440×900 in both browsers. Every scene change goes through one engine call (`stage.play`), which cross-fades under reduced motion; e2e checks the cross-fade. | `evidence/shots/*/390x844-dark`, `*-reduced`, `1440x900-dark`, `1440x900-reduced` |
| 10 | Sources and "About the figures" present | **Pass.** Both are rendered from `content/sources.js` at the end of the page (after the labs). `tests/content.test.mjs` renders the page with no unresolved marks. The section isn't in the screenshot set. | `dist/index.html` ("Sources", "About the figures"), `content/sources.js` |
| 11 | Open issues listed, including anything only testable on a real device | See below. | this file |

Also passing: `npm run e2e` **74/74** (Chromium + WebKit). This adds a new check that scrolling to any step's Replay button at 320×568 keeps that step active. Bundle: JS ≈34 KB gzipped, CSS 4.9 KB gzipped (budget 150 KB).

## Fixed during Phase 3
- **Accuracy:** II-7 said "up to a third goes unexplained" after "at least 65%". It now says "up to 35%" [B4].
- **Step activation bug:** on a phone, scrolling to the Replay button of a long card (II-5) could activate the next step, which stopped the live training. Each step now has a bottom gap on phones, and e2e checks every step.
- **Read-through fixes:**
  - Ideas and learned features are drawn differently.
  - I-3 holds one idea, with a labelled shadow.
  - IV-4 states its result.
  - V-2 has a new title.
  - III-1 uses an orange brightness tint.
  - III-4 has a "toy's guesses" label.
  - The IV-1 rings are spread out.
  - The language and code tags overlapped other labels at 390px; they no longer do.
  - Several wording fixes.

## Open issues
1. **Real devices not tested.** Every check ran in emulation (Playwright Chromium and WebKit on WSL). Still to try on an actual iPhone (Safari) and Android phone (Chrome):
   - Touch scrolling feel.
   - The address bar changing the `svh` height.
   - Safe-area insets on a notched phone.
   - Slider dragging without page scroll.
   - The real frame rate.
2. **The perf figures are from headless Chromium** with 4× CPU throttling via DevTools. That is a good stand-in, but GPU work on a real low-end phone may differ.
3. **No WebKit performance trace.** The DevTools throttling only works in Chromium.
4. ~~Act V has no recap scene.~~ Fixed: Recap V was added.
5. ~~The updated GitHub Actions versions haven't run yet.~~ Fixed: the deploy with them succeeded on the Phase 3 push.
6. ~~Pace: Act IV is dense.~~ Partly fixed: IV-5 carried two ideas (the chain and attribution) and is now two steps. The other Act IV steps each carry one idea, so they are unchanged.
