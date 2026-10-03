# Phase 0 plan (approved)

This is the approved plan for Phase 0 of `KICKOFF.md`, written down so a new session can pick it up. Phase 0 has not started yet. When it's done, stop at Checkpoint 1.

## Decisions already made
- **Files moved to the root.** `CLAUDE.md` and `KICKOFF.md` sit at the project root (commit `d079c00`).
- **Reference screenshots are gitignored.** `research/reference-shots/` is in `.gitignore`; the user views them from the folder.
- **The project lives in WSL Ubuntu** at `/home/ed/explainers/Anthropic`, out of OneDrive (done).
- **Node.js is installed** through nvm 0.40.3: Node v22.20.0, npm 11.6.3. Stay on v22 (user's choice, 2026-10-03).
- **Git identity is set globally** to `edang100x <edang100x@gmail.com>`. The first two commits were authored as `edang`; leave them as they are.
- **No sudo from the session.** If Playwright needs system libraries, the user runs this in their own terminal from the project folder:
  `sudo env "PATH=$PATH" npx playwright install-deps chromium webkit`

## Files to create
- `package.json`: only Playwright as a dev dependency for now. Run `npm i -D playwright && npx playwright install chromium webkit`.
- `scripts/ref-shots.mjs`: a script that takes the reference-site screenshots. It's a research tool, not site code.
- `research/facts.md`: one line per claim, with the value, a status (confirmed, corrected, or not found) and a link to the paper section. Put the corrections to the seed list in a section at the top.
- `research/style-notes.md`: what the reference explorable does, with screenshots in `research/reference-shots/` (gitignored).
- `research/visual-language.md`: one fixed picture per concept, plus the rules for how things move and their reduced-motion versions.
- `storyboard.md`: every step, as KICKOFF 0.4 specifies.
- `storyboard/contact-sheet.html`: a hand-drawn low-fi SVG thumbnail of the key frame for every step.
- `research/beginner-review.md`: the beginner read-through and the fixes.
- Commit at the end of Phase 0.

## How to check the fact sheet
1. Download the paper's HTML once into the session scratchpad and convert it to plain text, keeping the section links. Don't commit this copy.
2. **Run 5 subagents in parallel.** Each reads one part of the local copy instead of fetching the paper again:
   1. setup, the SAE, scaling laws and training (Methodological Details)
   2. example features, multilingual and image features, and steering
   3. feature neighbourhoods, splitting, completeness and the London boroughs
   4. the Kobe Bryant and emotional-inference examples, and features vs neurons
   5. safety features, the appendices and limitations

   Each subagent sends back every seed item in its part with a status (confirmed, wrong, or not found), the paper's value and a section link.
3. **Merge rule:** the main session searches the paper text itself for every number before it goes into `facts.md`. A subagent's report alone never puts a number in `facts.md`. Mark any seed item that is wrong or missing, and say what the paper says instead.
4. **The beginner read-through (0.5) is a separate subagent.** It reads the storyboard as a curious reader with no ML background.

## Blockers to watch for
- **Playwright.** If browsers need system libraries, stop and give the user the sudo command above. If WebKit still won't run after that, take the Chromium screenshots and list WebKit as an open item.
- **Reference site.** It responded with HTTP 200 on 2026-10-03, but its HTML is only about 27 KB, so the scenes are built by JavaScript. If its JavaScript-driven scenes don't render headless, stop and tell the user rather than guessing.
- **Paper fetch.** The paper is very large (about 16 MB of HTML). Download the raw HTML with `curl` instead of a summarising fetch tool, so no section is cut off.
- **Copyright.** The paper copy stays in the scratchpad and the reference screenshots stay gitignored. Borrow the reference site's patterns, not its code or text.
