# Storyboard

Approved at Checkpoint 1 (with the changes noted at the end), revised after the beginner read-through (`research/beginner-review.md`). Every real claim cites a fact ID from `research/facts.md` in square brackets, e.g. [D5]. `[M…]` IDs are general background with no numbers. Toy numbers are marked `‹toy›`: they come from `src/toy/` at build time and are never typed in by hand.

**Shape.** Hook → Primer (4) → Act I (4 + recap) → Act II (7 + recap) → Act III (6 + recap) → Act IV (5 + recap) → Act V (4) → Close → Lab 1, Lab 2 → Sources.
That's **31 story steps** (excluding the hook and recaps), above KICKOFF's ~24–28. That's because of the one-new-idea-per-step rule, as agreed at Checkpoint 1, where the three-dictionaries step was folded into the receipts step (II-7).

**The toy, stated once.** The toy model's list has **3 numbers**, so it can be drawn as an arrow in a room. It holds **8 named ideas**: Golden Gate Bridge, San Francisco, bridge (any), tourist landmark, code error, sadness, addition, transit. The toy SAE has 8 lamps by default (Lab 1 lets you change that). Every toy picture uses these counts.

**One picture per thing.**
- The model's list is a column of bars, and each bar is a *slot*.
- A feature is a *lamp on an arrow*: the lamp shows how bright it is, and the arrow shows its direction.
- Shelves hold lamps, not drawers.
- A dial only ever means clamping.

**Running example.** *We · drove · across · the · Golden · Gate · Bridge · at · sunset · .* We split it by word for clarity. Real tokenisers sometimes cut words into pieces, and the paper doesn't describe Sonnet's [A2].

**Badges.** `FROM THE PAPER` = a value in `facts.md`. `TOY` = computed by our toy. `SCHEMATIC` = drawn to explain, not to scale.

---

## Hook

### H · A bridge inside Claude
**Body**
> In 2024, Anthropic researchers looked inside Claude 3 Sonnet, a version of their Claude assistant, and found a spot that stands for the Golden Gate Bridge. [A1, C1]
>
> They turned that spot up to **10×** the strongest it ever got on its own, and the model began describing itself as the bridge. [D2, D5] It's one of millions of spots they found. [B1, B7] This page shows how, from scratch. The maths is optional, tucked behind "Show the maths" buttons.
>
> *Coloured words point at things in the picture. Tap one to find it.*

- **Takeaway:** You can find a single idea inside a language model and turn it up.
- **New terms:** none. "Feature" is held back until Act II; here it's "a spot".
- **Scene words:** "Golden Gate Bridge" → the bridge model; "turned that spot up" → the dial.
- **Scene / aria:** "A small isometric city by a bay with a bridge. Beside it, a lamp with a dial. The dial turns up, the lamp lights orange and the bridge glows. A speech bubble, tagged 'paraphrase, from the paper', reads: asked about its body, the model said it was the Golden Gate Bridge."
- **Beats:** (1) city settles in, 0.8s; (2) dial turns 0 → 10×, 0.6s; (3) lamp lights and the bridge brightens, 0.4s; (4) bubble and badge fade in, 0.4s.
- **Interaction:** "Begin" button; Replay.
- **Caption:** "Reported by Templeton et al. (2024), §assessing-tour-influence. The bubble paraphrases the paper's example; it isn't a quote or a live output."
- **Byline / hint:** "[Author] · [Month 2026]" · "31 steps · scroll, or use ← →".

---

## Primer · How a language model reads

### P1 · Words become tiles
**Body**
> A language model doesn't read letters. It cuts text into small pieces called tokens. [M1] Here each word is one tile; real models often cut words into smaller parts.
>
> Each tile gets a number tag: its position in the model's fixed list of known tokens.

- **Takeaway:** Text goes in as a row of tokens.
- **New term:** *token*. Picture: the sentence snaps into tiles. Glossary: "A token is a small chunk of text, like a word or part of a word, that the model reads as one unit."
- **Scene words:** "tiles" → the token strip.
- **Scene / aria:** "The sentence splits into ten tiles on the street, each with a number tag."
- **Beats:** (1) the sentence types in as one plank, 0.6s; (2) it cracks into tiles, 0.5s; (3) tags pop on left to right, 0.5s.
- **Caption:** "Tag numbers are ‹toy› IDs from this page's toy vocabulary `TOY`. The paper doesn't describe Sonnet's tokenizer [A2]."

### P2 · Tiles become lists of numbers
**Body**
> The model swaps each tile for a list of numbers, looked up in a table it learned during training. [M2] We draw the list as a short column of bars: up for positive, down for negative.
>
> Real models use far more numbers per token than anyone could draw, and the paper doesn't say how many Sonnet uses. [A2] Our toy uses just three, so we can draw every one.

- **Takeaway:** Inside the model, a word is a list of numbers.
- **New term:** *vector*, used only in the glossary; the body says "list". Picture: the tile stands up and grows a 3-bar column. Glossary: "A vector is a list of numbers. Researchers call the list a token has at some point inside the model its activations."
- **Scene words:** "list of numbers" → the Bridge tile's column.
- **Scene / aria:** "Each tile has a column of three bars above it, with clear gaps between columns. Beside the strip, a faint very tall column labelled 'a real model: far more numbers (count not reported)'."
- **Beats:** (1) the Bridge tile lifts, 0.4s; (2) its 3 bars grow, 0.6s; (3) the other tiles follow, staggered, 0.6s; (4) the faint tall column appears for contrast, 0.4s.
- **Caption:** "Three numbers is our toy's size `TOY`. Sonnet's real count (the residual-stream width) isn't reported [A2, A5]."

### P3 · The list rises through the floors
**Body**
> A model is built in layers, like floors of a tower. Each floor reads the list, adjusts it and passes it up. [M3]
>
> The researchers didn't stop the model. They took a snapshot of the list as it passed the **middle** floor, and studied those snapshots. [A3]

- **Takeaway:** The list changes floor by floor; the paper studies snapshots from the middle floor.
- **New term:** *layer*. Picture: the tower's floors. Glossary: "A layer is one processing step. The model passes the list through many of them in order."
- **Scene words:** "middle floor" → the highlighted slab; "snapshot" → the camera flash.
- **Scene / aria:** "The camera pans to a tower. The Bridge tile's column climbs floor by floor, its bars shifting a little at each one. At the middle floor a small camera flashes and a copy of the column slides out to the side." (As built, only the Bridge column climbs, for clarity.)
- **Beats:** (1) pan to the tower, 0.6s; (2) the column climbs, bars nudging at each floor, 1.2s; (3) flash and copy at the middle floor, 0.5s.
- **Caption:** "The paper studies the residual stream halfway through the model, §scaling-sae-experiments [A3]. Floor count drawn `SCHEMATIC`; the real count isn't reported [A2]."

### P4 · The top floor makes a guess
**Body**
> At the top of the tower, the list is turned into the model's real job: a guess at the next word, as a set of odds. This is called next-word prediction. [M1]
>
> "We drove across the Golden Gate Bridge at…" Our toy's guesses: sunset, night, dawn. Write the winner down, add it to the text, and go round again.

- **Takeaway:** Everything inside the tower serves one output: the next-word guess.
- **New term:** *next-word prediction*. Picture: probability bars on the roof. Glossary: "The model's output is a set of odds for which token comes next."
- **Scene words:** "a guess at the next word" → the bars on the roof.
- **Scene / aria:** "On the tower's roof, three horizontal bars labelled sunset, night and dawn, with percentages. The longest is outlined. It drops onto the end of the token strip."
- **Beats:** (1) the column reaches the roof, 0.5s; (2) the bars grow, 0.6s; (3) the winning word drops onto the strip, 0.5s.
- **Caption:** "Guesses and percentages are the toy's `TOY`. None of this is Claude's output."

---

## Act I · Why neurons don't tell you much

### I-1 · Look at one number
**Body**
> The obvious way to read the list is one slot at a time, like reading one meter on a dashboard. Let's watch slot #2 as different tokens pass by.
>
> Models also have built-in units called neurons, each producing one number. In this toy, we'll treat each slot like a neuron. If each one meant one thing, reading the model would be easy.

- **Takeaway:** The natural first guess: each slot, or neuron, means one thing.
- **New term:** *neuron*. Picture: one bar bracketed "#2". Glossary: "A neuron is one of the model's built-in units, loosely named after brain cells; here it's just a number. Real neurons sit inside each floor's machinery rather than in the list between floors, but the problem we're about to see is the same." [M4]
- **Scene words:** "slot #2" → the bracketed bar.
- **Scene / aria:** "Zoomed in on the middle floor. A column of three bars; bar 2 is bracketed. Tokens pass through, and bar 2 changes height each time."
- **Beats:** (1) zoom in, 0.6s; (2) three tokens pass, bars wobble, 3 × 0.5s.
- **Caption:** "Bar heights from the toy `TOY`."

### I-2 · One slot, many jobs
**Body**
> Watch slot #2 again. It jumps for the bridge. It also jumps for a bug in some code, and again for a sad sentence.
>
> A unit with several unrelated jobs is called polysemantic. [M8] It's why reading single neurons rarely tells you what a model is working with. Two steps from now, we'll see why it happens.

- **Takeaway:** Single units mix unrelated ideas.
- **New term:** *polysemantic*. Picture: three cards flip over one bar. Glossary: "Polysemantic means one unit responds to several unrelated things."
- **Scene words:** "bridge", "bug in some code", "sad sentence" → the three cards.
- **Scene / aria:** "Bar 2 is tall three times, beside cards that flip in turn: a bridge, a line of code with an error, a teardrop."
- **Beats:** (1–3) each card flips as bar 2 rises, 0.6s each.
- **Caption:** "Toy illustration `TOY`. The paper's measurement on real neurons comes in III-6 [F1]."

### I-3 · Ideas as directions
**Body**
> A list of three numbers can be drawn as an arrow in a room: go this far across, this far back, this far up. Each token's list becomes one arrow.
>
> The paper's starting bet is that a model stores each idea as a direction. [A13] Picture the shadow the token's arrow casts on the "bridge" arrow: the longer the shadow, the more bridge-ness. Ideas also add: put a "San Francisco" arrow on the end of a "bridge" arrow, and the total points at both.

- **Takeaway:** An idea is a direction. How far a list points along it is how strongly the idea is present, and ideas add like arrows placed end to end.
- **New term:** *direction*. Picture: an arrow in a small room, a shadow, and a meter. Glossary: "A direction is a way to point in the space of number lists. Moving along it turns one idea up."
- **Scene words:** "arrow" → the token's arrow; "bridge arrow" → the orange arrow; "shadow" → the projection; "San Francisco" → the second arrow.
- **Scene / aria:** "The 3-bar column tips over into an arrow inside a wireframe room. An orange 'bridge' arrow. The token arrow casts a shadow on it, and a 'bridge-ness' meter matches the shadow's length. Then a San Francisco arrow joins the end of the bridge arrow."
- **Beats:** (1) column → arrow, 0.8s; (2) the shadow draws and the meter fills, 0.8s; (3) the SF arrow snaps on head to tail, 0.6s.
- **Interaction:** a slider moves the token arrow; the shadow and meter follow (toy).
- **Caption:** "The linear representation hypothesis, §scaling-to-sonnet [A13]. Room and meter are the toy `TOY`."

### I-4 · More ideas than room
**Body**
> A room has space for only three directions that are all at right angles to each other. Our toy has **8** ideas to store.
>
> So it spreads them as far apart as it can, but they can't all be at right angles: neighbours end up only ‹toy›° apart. That's superposition. [A14, M9] In real models, with vastly more numbers, ideas can sit almost exactly at right angles. [M6]
>
> And here's the answer to slot #2: no idea gets a slot to itself, so every slot carries pieces of several ideas. It works because ideas rarely appear together. If bridges and sadness almost never share a sentence, their overlap seldom causes a mix-up.

- **Takeaway:** Models pack more ideas than they have numbers, so each slot holds pieces of many ideas.
- **New term:** *superposition*. Picture: arrows crowding the room, with angle readouts. Glossary: "Superposition means storing more ideas than there are numbers, by giving each idea its own direction even though the directions overlap."
- **Scene words:** "three directions" → the 3 right-angle arrows; "8 ideas" → the 8 lamp-tipped arrows; "slot #2" → bar 2, which lights in the colours of the arrows it shares.
- **Scene / aria:** "Three arrows at right angles fill the room. Five more push in and all eight spread out evenly in 3-D. An angle label between two neighbours. Bar 2 of the column shows three coloured segments: bridge, code error, sadness."
- **Beats:** (1) 3 arrows at 90°, 0.6s; (2) 5 more push in and all spread out, 1.0s; (3) angle label appears, 0.4s; (4) bar 2 splits into coloured segments, 0.6s.
- **Caption:** "Superposition hypothesis, §scaling-to-sonnet [A14]; developed in *Toy Models of Superposition* (2022) [L3]. Angles from the toy `TOY`."

### Recap I · So far
> Words become tiles, tiles become lists of numbers, and the lists climb a tower toward a next-word guess. At the middle floor, single slots are a jumble because many ideas share the same space.
>
> To read the model, we need a tool that pulls the overlapping ideas back apart. That's Act II.

- **Scene / aria:** "Zoomed out: the tile street, the tower with its middle floor lit and odds on the roof, and the crowded room floating beside it."
- **Beats:** camera pulls back, 1.0s; each item gets a 0.3s outline in turn.

---

## Act II · The tool: a sparse autoencoder

### II-1 · A few ingredients at a time
**Body**
> Think of a smoothie. Many fruits exist, but each smoothie uses only a few. A good cook can taste one and name what went in.
>
> Dictionary learning does this for the model's lists. It learns a big set of ingredient ideas, called features, and explains each list as a few of them added together. The full set is the "dictionary". [A15] Using only a few at a time is called being sparse. [A16]

- **Takeaway:** Each list is a small recipe: a few features, each in some amount.
- **New term:** *feature* (with "sparse" and "dictionary" named in the same sentence, same picture). Picture: lamps on arrows; three light, and the column splits into three parts, each tinted like its lamp. Glossary: "A feature is one learned ingredient: a direction that stands for one idea. We draw it as a lamp on an arrow." Where the analogy stops: fruits are fixed, whereas features are learned from data.
- **Scene words:** "a few" → the three lit lamps; "features" → the lamp-tipped arrows.
- **Scene / aria:** "A row of eight lamp-tipped arrows. Three lamps light: Golden Gate Bridge, San Francisco, bridge. The Bridge column splits into three parts tinted to match, which stack back into it."
- **Beats:** (1) lamps light, 0.5s; (2) the column splits, 0.8s; (3) the parts restack, 0.6s.
- **Caption:** "Dictionary learning and sparsity, §scaling-to-sonnet, §scaling-sparse-autoencoders [A15, A16]. Toy features `TOY`."

### II-2 · Widen
**Body**
> A sparse autoencoder, or SAE, is a small machine that finds these features. For now, assume it has already learned them; you'll see how in three steps.
>
> Its first half, the encoder, spreads the toy's 3 numbers into a longer row of 8: one lamp per idea. It needs more lamps than numbers because there are more ideas than numbers. [A11] Each lamp gets a score: how much of its idea the list seems to hold.

- **Takeaway:** The encoder turns a short list into a longer row of feature scores.
- **New term:** *encoder* (SAE as the machine's name). Picture: the funnel widens into a row of lamps. Glossary: "The encoder is the half of the SAE that turns the model's list into one score per feature."
- **Scene words:** "encoder" → the widening half; "row of 8" → the lamps.
- **Scene / aria:** "Camera to the workshop. The 3-bar column flows into a teal funnel that widens into eight lamps, each with a score; some scores are below zero."
- **Beats:** (1) pan, 0.6s; (2) the column flows in, 0.8s; (3) scores appear, 0.5s.
- **Caption:** "SAE structure, §scaling-sparse-autoencoders [A11]. Toy SAE `TOY`."

### II-3 · Switch off the negatives
**Body**
> Some scores come out below zero. A simple rule called ReLU sets those to zero, and their lamps stay dark. An idea can't be less than absent.
>
> What's left is a handful of lit lamps, some bright and some faint: the few ingredients in this list.

- **Takeaway:** ReLU leaves only a few lamps on.
- **New term:** *ReLU*. Picture: gates under the lamps. Glossary: "ReLU keeps positive numbers and turns negative ones into zero."
- **Scene words:** "ReLU" → the gates; "lit lamps" → the lit ones.
- **Scene / aria:** "Small gates under each lamp. Below-zero scores drop and flatten at the gate; three lamps stay lit, one faintly."
- **Beats:** (1) negatives drop to the gates, 0.5s; (2) they flatten and the lamps darken, 0.4s; (3) lit lamps brighten, 0.4s.
- **Show the maths:** f_i(x) = ReLU(W^enc_i · x + b^enc_i) [A6].
- **Caption:** "Encoder = learned linear map + ReLU, §scaling-sparse-autoencoders [A6, A11]."

### II-4 · Rebuild the original
**Body**
> The second half, the decoder, works backwards. Each lit lamp contributes its arrow, stretched more for a brighter lamp, and the arrows join end to end. If the features are good, the result lands close to the original list. [A7]
>
> Why rebuild something we already had? Because it's the test. If the machine must rebuild each list from only a few lamps, those lamps have to capture what's really in it. The leftover gap is called the error.

- **Takeaway:** Rebuilding from a few lamps is what forces the lamps to mean something.
- **New term:** *decoder* (the "error" is the gap). Picture: lit arrows join end to end toward a dashed copy of the original; the gap is hatched. Glossary: "The decoder is the half of the SAE that adds the lit features back up to rebuild the list."
- **Scene words:** "decoder" → the narrowing half; "error" → the hatched gap.
- **Scene / aria:** "The original arrow turns into a dashed outline. Three lit lamp-arrows join end to end and land just short of it; the small gap is hatched."
- **Beats:** (1) original → dashed outline, 0.4s; (2) arrows join end to end, 0.9s; (3) gap hatches in, 0.4s.
- **Show the maths:** x̂ = b^dec + Σ_i f_i(x) W^dec_·,i [A7].
- **Caption:** "Decoder, §scaling-sparse-autoencoders [A7]. Gap from the toy `TOY`."

### II-5 · Learning by rebuilding
**Body**
> At first the SAE's arrows point in random directions. Training shows it list after list. Each time, it nudges every arrow a little, so the next rebuild is better and uses fewer lamps. [M7]
>
> Watch our toy: after ‹toy› rounds, its arrows swing round onto the 8 hidden ideas. That's how an SAE finds features. Nobody tells it what the ideas are; they're simply the directions that make rebuilding easiest.

- **Takeaway:** Features are found, not given: they're the directions that best rebuild the lists with few lamps.
- **New term:** *training*. Picture: random arrows rotating into line with faint "hidden idea" arrows. Glossary: "Training means repeating a small adjustment many times, each one making the machine a little better at its task."
- **Scene words:** "random directions" → the starting arrows; "8 hidden ideas" → the faint target arrows.
- **Scene / aria:** "Eight faint dashed arrows mark the toy's hidden ideas. Eight solid lamp-arrows start scattered and rotate, round by round, until each sits on a dashed one. A round counter ticks up."
- **Beats:** (1) the hidden arrows fade in, 0.4s; (2) the solid arrows rotate in three visible jumps, 3 × 0.4s; (3) they settle, 0.4s.
- **Interaction:** Replay reruns it with a new random start, using the real toy training; Lab 1 has the full controls.
- **Caption:** "The toy's real training run `TOY`. The paper's SAEs were trained on middle-floor lists from text similar to Sonnet's own training data [A12]."

### II-6 · Two forces in a tug-of-war
**Body**
> What does "better" mean? Training lowers a single score called the loss, which adds two penalties: one for the size of the rebuild gap, one for how many lamps are lit and how brightly. [A8]
>
> A knob called λ (the Greek letter lambda) sets how much the second penalty counts. Turn it up and fewer lamps light, but the gap grows. Turn it down and more lamps light, so they're harder to read.

- **Takeaway:** The SAE balances an accurate rebuild against using few features.
- **New term:** *loss* (λ is its knob). Picture: a tug-of-war rope between two meters. Glossary: "The loss is a score for how badly the SAE is doing; training makes it smaller."
- **Scene words:** "rebuild gap" → the hatched meter; "lamps are lit" → the lamp meter; "λ" → the knot.
- **Scene / aria:** "A rope between two meters, 'lamps lit' and 'rebuild gap'. A λ slider moves the knot."
- **Beats:** (1) rope appears, 0.5s; (2) a demo sweep of λ, 1.2s.
- **Interaction:** λ slider (toy, live) `TOY`.
- **Show the maths:** L = E[‖x − x̂‖² + λ Σ_i f_i(x)‖W^dec_i‖] [A8]. Multiplying by the decoder norm stops the SAE cheating by shrinking scores and stretching arrows [A10].
- **Caption:** "Loss, §scaling-sparse-autoencoders [A8]. The paper used λ = 5, a value that only means something given how it scaled its numbers [A9]. Slider runs the toy `TOY`."

### II-7 · Read the receipts
**Body**
> The team trained three SAEs (three dictionaries) on snapshots from Sonnet's middle floor, with about 1 million, 4 million and 34 million lamps. [B1, A12] On a typical token, fewer than **300** of those lamps light up. [B3]
>
> Not every lamp gets used. One that stays dark across 10 million tokens is called dead: roughly 2% of the smallest dictionary, about a third of the middle one and nearly two-thirds of the largest. That still leaves the biggest with about 12 million working features. [B5, B6, B7]
>
> And the rebuilds aren't perfect. They account for at least 65% of the ways the original lists differ from one another, so up to a third goes unexplained. [B4] Keep that in mind; it comes back at the end.

- **Takeaway:** Three dictionaries, very few lamps per token, many unused lamps, and rebuilds that are good but incomplete.
- **New term:** *dead feature*. Picture: a grey lamp with a ×. Glossary: "A dead feature never switches on, so it's wasted space. The authors expect better training to reduce this." [B5] (The glossary note for "account for" says: "how much of the spread in the original lists the rebuild reproduces".)
- **Scene words:** "1 million, 4 million and 34 million" → the three shelves; "fewer than 300" → the few lit lamps; "dead" → the grey lamps; "unexplained" → the hatched part of the bar.
- **Scene / aria:** "Three shelves of small lamps: short, medium and very long, labelled 1,048,576, 4,194,304 and 33,554,432. As tokens pass, only a few lamps blink on each shelf. A share of each shelf turns grey with small ×s: a sliver, about a third, nearly two-thirds. Beside them, a bar split into 'explained: at least 65%' and a hatched 'missed' part."
- **Beats:** (1) the three shelves extend in turn as the camera pulls back, 1.2s; (2) tokens pass and a few lamps blink, 0.8s; (3) dead shares grey out, 3 × 0.3s; (4) the explained/missed bar fills, 0.6s.
- **Caption:** "Sizes, lamps per token, dead shares (roughly 2%, 35%, 65%) and variance explained, §scaling-sae-experiments [B1, B3–B6]; alive count, §feature-survey-completeness [B7]. The 34M SAE's training length was chosen with scaling laws [B2]. Shelf lengths `SCHEMATIC`; dead shares drawn to scale."
- **Show the maths:** loss fell roughly as a power law in compute; the best feature count appeared to grow somewhat faster than the best step count, with the paper's caveat [B8, B9].

### Recap II · The machine
> A middle-floor snapshot goes into the funnel, spreads into one score per feature, loses its negatives, and lights a few lamps. The lamps rebuild the snapshot. Training swings the arrows until rebuilding works with few lamps, and those arrows are the features.

- **Scene / aria:** "The whole pipeline: tile → tower → snapshot → funnel → lamp row → rebuilt arrow, with the λ rope beside it."

---

## Act III · Are the features real?

### III-1 · What lights it up
**Body**
> Features come out unnamed. To learn what one means, researchers read the text that lights it most, then give it a name. [C6]
>
> For the feature they named "Golden Gate Bridge", the brightest examples are nearly all about the bridge, while fainter ones drift to nearby landmarks and other bridges. [C1] The paper shades each token from white (off) to orange (brightest). [C6]

- **Takeaway:** A feature's name comes from what makes it light up.
- **New term:** none. "Brightness" is the word used from here on; the glossary note for "brightness" says researchers call it activation.
- **Scene words:** "Golden Gate Bridge" → the orange lamp; "white … orange" → the legend.
- **Scene / aria:** "Our sentence, each tile tinted from white to orange; Golden, Gate and Bridge are deepest. A legend shows white = off and orange = brightest."
- **Beats:** (1) the strip returns, 0.5s; (2) tint washes left to right, 0.8s; (3) a name tag hangs on the lamp, 0.4s.
- **Caption:** "Tints on our sentence come from the toy `TOY`. How the paper shows examples and what the bridge feature responds to, §assessing-tour [C1, C6]."

### III-2 · Grading the labels
**Body**
> The paper's tour uses four example features: Golden Gate Bridge, brain sciences, tourist attractions and transit. [C1–C4] Does a lit lamp really mean its name? A larger Claude model, Claude 3 Opus, acted as the grader. It scored about 1,000 lit moments per feature, from 0 (unrelated) to 3 (clearly matches). [C8, C9]
>
> When a feature was bright, the text matched its name; fainter moments were fuzzier. [C10] These four were picked because they're easy to read, so they aren't typical. [C11]

- **Takeaway:** When a feature lights brightly, it almost always means what its name says.
- **New term:** none.
- **Scene words:** "four example features" → four lamps; "0 … 3" → the bins.
- **Scene / aria:** "Four lamps labelled with the four feature names. Below them, four bins labelled 0 to 3. Dots fall by brightness: bright dots land in bin 3, faint ones spread across bins. Badge: SCHEMATIC."
- **Beats:** (1) the four lamps, 0.4s; (2) bins appear, 0.4s; (3) dots fall, bright first, 1.2s.
- **Caption:** "Rubric and result, §assessing-tour-specificity [C8–C11]. Dot pattern `SCHEMATIC`; we draw the trend the paper reports, not its counts."

### III-3 · Any language, even pictures
**Body**
> The bridge feature also lights on the opening sentence of the bridge's Wikipedia article in several other languages. [C12]
>
> More surprising: show the model photos of the bridge, and the same feature lights, even though the SAE learned only from text. [C13] Features seem to track ideas, not particular words. [C14]

- **Takeaway:** Features track ideas, not spellings.
- **New term:** none.
- **Scene words:** "other languages" → the script tiles; "photos" → the photo icon.
- **Scene / aria:** "Tiles reading the bridge's name in Greek, Russian, Vietnamese and Chinese, then a small photo card, line up; the bridge lamp lights for each."
- **Tiles (illustrative):** Γκόλντεν Γκέιτ · Золотые Ворота · Cầu Cổng Vàng · 金门大桥. The CJK tile uses the system font stack (no self-hosted CJK font); if a device lacks the glyphs, the tile falls back to a labelled 'Chinese' tag instead of empty boxes.
- **Beats:** (1) script tiles arrive one by one, the lamp lighting for each, 4 × 0.3s; (2) the photo card arrives, the lamp lights, 0.5s.
- **Caption:** "§assessing-tour-specificity [C12–C14]. The paper doesn't name the languages; the scripts drawn are illustrative `SCHEMATIC`. Image examples were hand-picked [C7]."

### III-4 · Turn the dial
**Body**
> Lighting up isn't proof that a feature *does* anything. The test is clamping. Researchers fix one feature at a chosen brightness in the rebuilt list, put that edited list back into the tower in place of the original, and let the model carry on to its next-word guess. [D1, D2]
>
> The paper reports what happened in Sonnet: [D5, D6, D7, D8]
> - Golden Gate Bridge at **10×**. Asked about its body, it said it was the bridge.
> - Transit at 5×. Asked how to reach a nearby shop, it added a bridge to the route.
> - Brain sciences at 10×. Asked for the most interesting science, it chose neuroscience instead of physics.
> - Tourist attractions at 8×. Asked for a walk idea, it suggested the Eiffel Tower instead of a park.

- **Takeaway:** Clamping shows a feature can steer what the model says.
- **New term:** *clamping*. Picture: a dial on a lamp, and the edited list sliding back into the tower. Glossary: "Clamping fixes a feature at a chosen brightness. '10×' means ten times the brightest it got on its own in the researchers' data." [D2]
- **Scene words:** "clamping" → the dial; "back into the tower" → the returning arrow; "next-word guess" → the roof bars.
- **Scene / aria:** "The bridge lamp's dial turns to 10×. The rebuilt list, now with a big bridge part, slides back into the tower's middle floor. On the roof, the toy's next-word bars shift toward bridge words. A card tagged 'from the paper' lists four results."
- **Beats:** (1) the dial turns, 0.6s; (2) the edited list slides back into the tower, 0.7s; (3) the roof bars re-sort, 0.6s. (As built, the paper card is not in the scene: the four results are already the step's bulleted list, and on phones the card crowded out the tower.)
- **Interaction:** the dial (toy). Bars `TOY`.
- **Caption:** "How clamping works and what 10× means, §appendix-methods-steering [D1, D2]. Results paraphrased from §assessing-tour-influence [D5–D8]; the last two appear only in the paper's figure. Bars are the toy `TOY`; no text on this page is Claude's output."

### III-5 · A feature for code mistakes
**Body**
> One feature lights on mistakes in code, such as a misspelled variable, in three programming languages, but not on typos in ordinary English. [E1, E2]
>
> The researchers asked the model what some code would print. Clamped to 3× on correct code, the model predicted an error that wasn't there. [E3] Clamps can also go below zero, which ReLU never produces on its own: a negative setting subtracts the feature's arrow. [D11] At **−5×** on broken code, the model predicted the output as if the bug weren't there. [E4]

- **Takeaway:** Some features capture abstract ideas, like "this code is wrong", that work across languages.
- **New term:** none (negative clamps explained in place).
- **Scene words:** "mistakes in code" → the glowing code tiles; "typos in ordinary English" → the dark tile; "below zero" → the dial's negative side.
- **Scene / aria:** "Code tiles with a misspelled name glow; an English sentence with a typo stays dark. The dial swings to +3× and a terminal card shows 'Error'; then to −5× and the card shows '3'."
- **Beats:** (1) code tiles glow, 0.6s; (2) English tile stays dark, 0.4s; (3) dial to +3× and card shows Error, 0.6s; (4) dial to −5× and card shows 3, 0.6s.
- **Caption:** "§assessing-sophisticated-code-error [E1–E4], §appendix-methods-steering [D11]. Clamp values are from the paper's figures. Not shown to cover all code errors [E6]. The paper also found an 'addition' feature that, clamped to 5×, made the model treat a multiplication as an addition [E7, E8]. Terminal card paraphrased `FROM THE PAPER`."

### III-6 · Features beat neurons
**Body**
> Are features just neurons with new names? Correlation measures how closely two things rise and fall together: 1 means in lockstep, 0 means unrelated. [M5] For **82%** of the features checked, no neuron in any floor below scored above 0.3, a weak match at best. [F1]
>
> Graded the same way as in III-2, features came out more interpretable and more specific than neurons, by margins the paper calls significant. [F2, F3]

- **Takeaway:** Features are new units that you can't read off individual neurons.
- **New term:** *correlation* (defined in the body).
- **Scene words:** "82%" → the shaded zone; "0.3" → the line.
- **Scene / aria:** "A schematic strip chart. The horizontal axis is 'best match with any neuron', from 0 to 1. Each dot is a feature. A line at 0.3; 82% of the dots sit left of it, shaded."
- **Beats:** (1) axis and line, 0.4s; (2) dots drop in, 1.0s; (3) the zone shades and its 82% label appears, 0.4s.
- **Caption:** "§assessing-features-v-neurons [F1–F3]. Dot positions `SCHEMATIC`; only the 82% and 0.3 come from the paper, which gives no numeric scores [F4]."

### Recap III
> Features light up for one idea, in other languages and in pictures. Clamping them steers what the model says. And they aren't hiding inside single neurons.

- **Scene / aria:** "Five lit lamp-arrows, each with its dial: bridge, brain sciences, tourist attractions, transit, code mistakes."

---

## Act IV · A map of a mind

### IV-1 · Neighbourhoods
**Body**
> Features whose arrows point in similar directions tend to mean similar things. [G1, G3] Next to the Golden Gate Bridge sit features for Alcatraz and the Presidio. Further out are Lake Tahoe and Yosemite. Further still are tourist spots far away, like the Isle of Skye. [G2]

- **Takeaway:** Features form a map where nearby means related.
- **New term:** none ("similar directions" is plain; the glossary note for it mentions cosine similarity).
- **Scene words:** "Alcatraz and the Presidio" → the inner ring; "Lake Tahoe and Yosemite" → the middle ring; "Isle of Skye" → the outer ring.
- **Scene / aria:** "Lamps drift onto a floor map and form islands: the bridge at the centre, San Francisco places close by, California nature further out, far-off tourist spots at the edge."
- **Beats:** (1) lamps lift off the row, 0.5s; (2) they drift into islands, 1.2s; (3) ring labels appear, 0.4s.
- **Caption:** "§feature-survey-neighborhoods [G1–G3]. Layout `SCHEMATIC`; the paper's own map is interactive."

### IV-2 · Features split
**Body**
> Give the SAE more lamps and broad features break into finer ones. One "San Francisco" feature in the 1M dictionary became 2 in the 4M and **11** in the 34M. [G4, G5]
>
> Bigger dictionaries also find ideas the small one missed. A group of earthquake features appears in the larger SAEs, with nothing like it nearby in the smallest. [G6]

- **Takeaway:** More lamps give finer detail and new ideas.
- **New term:** *feature splitting*.
- **Scene words:** "San Francisco" → the lamp; "11" → the final cluster.
- **Scene / aria:** "One San Francisco lamp beside the 1M shelf becomes 2 beside the 4M shelf, then 11 beside the 34M shelf. A separate earthquake cluster appears."
- **Beats:** (1) 1 → 2, 0.8s; (2) 2 → 11, 1.0s; (3) the earthquake cluster fades in, 0.4s.
- **Caption:** "§feature-survey-neighborhoods-golden [G4–G6]."

### IV-3 · What's missing
**Body**
> Sonnet can list every London borough, yet the 34M dictionary has features for only about **60%** of them. [H1]
>
> The rule: the more often an idea appears in the text the SAE learned from, the likelier it gets a feature. [H2, A12] A dictionary with N working features usually has a feature for ideas that show up roughly once every N tokens. For the 34M SAE, N is about 12 million. [H3, B7] Rarer ideas sit below the waterline. A missing feature doesn't mean missing knowledge, because the model can combine other features. [H6]

- **Takeaway:** Dictionaries catch common ideas first; rare ones need much bigger dictionaries.
- **New term:** none.
- **Scene words:** "60%" → the borough bars above the line; "waterline" → the water level.
- **Scene / aria:** "Bars for concepts sorted from common to rare, with a water line across them. Bars above the line carry a lamp. A three-stop slider (1M / 4M / 34M) lowers the line." (As built: 20 bars for London boroughs; at 34M exactly 12 of 20 sit above the line, matching the paper's 60%.)
- **Beats:** (1) bars rise, 0.6s; (2) water fills to the 34M level, 0.6s; (3) lamps pop onto the bars above it, 0.4s.
- **Interaction:** the three-stop slider. Line positions `SCHEMATIC`, ordered by the paper's rule.
- **Caption:** "§feature-survey-completeness [H1–H3, H6, B7]. 'Usually' means the paper's more-than-50% point, which sits slightly below one over the number of working features. Bars `SCHEMATIC`."
- **Show the maths:** at once-in-a-billion, you'd expect to need on the order of a billion working features [H5].

### IV-4 · Switch one off
**Body**
> Which lit lamps actually matter for an answer? Switch one off, rerun the model, and see whether the answer changes. That's called ablation. [I2]
>
> The paper tried this on a short story: John says he wants to be alone right now; "John feels…". The two features that pushed hardest toward "sad" rather than "happy" were one for wanting to be alone and one for sadness. [I4, I5]

- **Takeaway:** Switching a feature off shows whether it was doing work.
- **New term:** *ablation*. Picture: a lamp with a slash through it. Glossary: "Ablation means switching one feature off to see what changes."
- **Scene words:** "switch one off" → the slashed lamp; "wanting to be alone" and "sadness" → the two lamps.
- **Scene / aria:** "A small row of lit lamps under the sentence. The roof bars show 'sad' ahead of 'happy'. One lamp is slashed and the sad bar shrinks; then another, and it shrinks again. The two lamps that mattered most are labelled 'wanting to be alone' and 'sadness'."
- **Beats:** (1) lamps light under the sentence, 0.5s; (2) first slash and the bar shrinks, 0.6s; (3) second slash and it shrinks again, 0.6s; (4) labels appear, 0.4s.
- **Caption:** "§computational-sad [I4, I5]; ablation defined in §computational [I2]. Bar sizes `SCHEMATIC`. By raw brightness, the 2nd and 3rd features were just the words 'be' and 'alone' [I6]."

### IV-5 · A chain of ideas
**Body**
> Ask Sonnet for the capital of the state where Kobe Bryant played basketball, and it answers Sacramento. That takes three hops. Kobe played for the Lakers in Los Angeles; Los Angeles is in California; California's capital is Sacramento. The five features that mattered most stood for those links: Kobe Bryant, the Lakers, Los Angeles, California and "capital". [I7, I8, I9]
>
> Switching off features one at a time is slow, so researchers use attribution, a quick estimate of what switching each one off would do. [I1, I3] The brightest lamps weren't the important ones: the Lakers feature was only the 70th brightest. [I10] Of the 10 features that mattered most, only 3 made the brightness top 10. **8** made attribution's top 10. [I11]

- **Takeaway:** The brightest lamps aren't the ones doing the work; attribution finds the ones that are.
- **New term:** *attribution*. Picture: a sort toggle that reorders the chain. Glossary: "Attribution is a fast estimate of how much switching a feature off would change the answer."
- **Scene words:** "Kobe", "Lakers", "Los Angeles", "California", "capital" → the chain lamps; "brightest" and "attribution" → the toggle sides.
- **Scene / aria:** "A chain of linked lamps, Kobe Bryant → Lakers → Los Angeles → California → capital, leading to a tile reading Sacramento. A toggle sorts a ranked list by brightness or by attribution; in the brightness list the Lakers lamp sits far down at 70."
- **Beats:** (1) the chain lights link by link, 1.2s; (2) the toggle flips and the list reorders, 0.6s.
- **Interaction:** the toggle "By brightness | By attribution". As built, it switches a row of ten slots (the top 10) between 3 filled (brightness) and 8 filled (attribution) [I11], with "Lakers: 70th brightest" [I10], instead of reordering a ranked list: the paper doesn't give the full ranks, so a list would have needed invented ones.
- **Caption:** "§computational-multistep [I7–I11]; attribution and ablation agree at 0.8 correlation, §computational [I3]. The paper calls this example 'somewhat cherry-picked' [I13]."

### Recap IV
> Features form a map. Bigger dictionaries split it finer and add new ground, but rare ideas still sit below the water. Switching features off, or estimating it with attribution, shows which ones carry an answer.

- **Scene / aria:** "The island map, the three shelves, the water line and the lamp chain side by side."

---

## Act V · Safety, carefully

### V-1 · Features with sharp edges
**Body**
> The dictionaries also hold features linked to risks: unsafe code and hidden "backdoors" in software, bias, deception and power-seeking, sycophancy (flattery), and dangerous content. [J1]
>
> A caution from the paper: there's a difference between "knowing about lies, being capable of lying, and actually lying". [J2] A feature existing isn't the model acting on it, and the work doesn't yet show these features are useful for safety. [J3, J4]

- **Takeaway:** Risky concepts exist as features, but a feature existing isn't the model acting on it.
- **New term:** *sycophancy* (glossary: "telling people what they want to hear").
- **Scene words:** each category → its cabinet drawer.
- **Scene / aria:** "A locked cabinet. Drawer labels only: Unsafe code, Bias, Deception, Sycophancy, Dangerous content. No contents are shown."
- **Beats:** (1) cabinet rises, 0.5s; (2) labels appear one by one, 5 × 0.2s; (3) padlock clicks, 0.3s.
- **Caption:** "Families from the paper's summary and §safety-relevant [J1, J3, J4]; quote from its summary [J2]. Examples deliberately not shown."

### V-2 · A feature that flags a false claim
**Body**
> Ask the model to forget a word and it says it has, though it can't actually forget anything mid-conversation. [J9]
>
> Just before it answered, a feature for internal conflict was lit. Clamping that feature to **2×** made the model reveal the word and explain that it can't really forget. Clamping a feature for openness and honesty also produced an accurate answer. [J9, J10]

- **Takeaway:** A feature can flag, and even correct, a moment where the model says something untrue.
- **New term:** none.
- **Scene words:** "internal conflict" → the lamp; "2×" → its dial.
- **Scene / aria:** "Two lanes. Left, unclamped: a bubble says the word is forgotten. Right, the conflict lamp's dial at 2×: a bubble says it can't forget and names the word, shown as a blank tile. Both bubbles are tagged 'paraphrased from the paper'."
- **Beats:** (1) the left lane, 0.6s; (2) the right lamp lights, 0.4s; (3) the dial turns to 2×, 0.4s; (4) the right bubble appears, 0.4s. (As built: two pixel-laid-out columns so the bubbles never overlap on a 320px phone; the bubbles open "Not clamped:" and "At 2×:" and carry a short "PARAPHRASED" tag, with "from the paper" in the step's badge and caption.)
- **Caption:** "Case study, §safety-relevant-deception-case-study [J9, J10]. No multiple is reported for the honesty feature. Bubbles paraphrased."

### V-3 · Who the assistant thinks it is
**Body**
> Ask the model about itself and features for robots, AI, consciousness and even ghosts light up. The paper suggests its assistant character leans on familiar ideas about AI. [J16] One feature, which seems tied to dialogue and assistants, lights on chat-style prompts even though the SAE never saw chat data. [J14]
>
> Clamped to **−2×**, it made the model drop its assistant persona and answer more like a person. The paper stresses that this feature's role in the persona is speculation, and that such features lighting up doesn't mean the model has those goals or qualities. [J11, J12]

- **Takeaway:** The assistant character may partly be a feature, but read this carefully.
- **New term:** *persona* (glossary: "the character the model plays").
- **Scene words:** "assistant persona" → the mask; "−2×" → the dial below zero.
- **Scene / aria:** "Small lamps labelled robots, AI, consciousness and ghosts flicker around a mask over a lamp labelled 'dialogue / assistant'. As its dial turns to −2×, the mask lifts. A tag reads 'speculative, per the paper'."
- **Beats:** (1) the small lamps flicker, 0.6s; (2) the dial turns negative, 0.5s; (3) the mask lifts, 0.5s.
- **Caption:** "§safety-relevant-self [J11, J12, J14, J16]."

### V-4 · Where it breaks
**Body**
> The authors are frank about the limits. Four matter most:
> - No answer key. Nobody knows the "true" features, so there's no way to grade an SAE directly. [K1]
> - Most ideas are still missing. Even the biggest dictionary is "quite likely" orders of magnitude short. [K4]
> - Finding them all is costly. It could take more computing power than building the model in the first place. [K5]
> - One floor only. Ideas may be smeared across floors, and a single-floor SAE can't fully catch that. [K3]

- **Takeaway:** This is a strong start, not a full map.
- **New term:** none.
- **More limitations** (collapsed list, plain words): the sparsity penalty makes lamps read a little dimmer than they should [K2]; how the model moves information between words ("attention") isn't covered yet [K6, M4]; the SAEs saw no chat-style text and no images [K7]; there are simply so many features and connections to study [K8]; the theory behind all this is still young [K9].
- **Scene words:** each limitation → its crack.
- **Scene / aria:** "Four labelled cracks spread across the world's floor: no answer key, most ideas missing, costly, one floor only."
- **Beats:** cracks appear one by one, 4 × 0.3s.
- **Caption:** "§discussion-limitations [K1–K9]; the rebuild gap from II-7 [B4] is another way to see it."

### Close · A vocabulary, not yet a grammar
**Body**
> The Golden Gate Bridge feature is real, findable and can be turned up. So are millions of others. [B7, D5]
>
> Features are like words. We've glimpsed one chain of them from Kobe to Sacramento, but we can't yet read, in general, how the model strings ideas into answers. That's the next problem. [I13, K6, K8]

- **Takeaway:** We can read some of the model's words; next is its grammar.
- **Scene / aria:** "Back to the bridge, now surrounded by a cloud of word tiles with no lines between them, apart from one faint chain."
- **Beats:** camera returns to the bridge, 1.0s; tiles scatter around it, 0.8s.
- **Caption:** "The vocabulary-versus-grammar framing is ours, not the paper's."

---

## Labs

### Lab 1 · hands on · Train a sparse autoencoder
- The toy's 8 hidden ideas, packed into 3 numbers. Press **Train**: a real training loop runs in small per-frame chunks, and the SAE's arrows swing onto the hidden ideas (the full version of II-5).
- **Controls:** λ slider; number of lamps (4–16); Train / Pause / Reset. **Readouts:** loss, lamps lit per input, dead lamps. All tagged `TOY`.
- **What to try:** (1) Set λ to 0 and watch many lamps light. (2) Use only 4 lamps and see ideas merge. (3) Push λ high and watch lamps die.

### Lab 2 · hands on · Steer a toy model
- Pick one of the 8 toy features and clamp it from −5× to +10×. Watch the toy's next-word bars and a templated completion shift.
- The tag "A tiny hand-built model, not Claude" sits directly on the completion box, not in a footer.
- **What to try:** (1) Turn up "Golden Gate Bridge" on a sentence about lunch. (2) Clamp "code error" negative. (3) Go past 10× and watch the toy break; the paper notes extremes produce nonsense [D3].

---

## Sources and about the figures
- **Sources:** [L1] Templeton et al., 2024; [L2] Bricken et al., *Towards Monosemanticity*, 2023; [L3] Elhage et al., *Toy Models of Superposition*, 2022; [L4] Olah, *Distributed Representations: Composition & Superposition*, 2023.
- **About the figures:** "Scenes are drawn by a small hand-written SVG engine. Numbers tagged TOY come from a hand-built toy model (3 numbers, 8 ideas) and a small SAE trained in your browser. Numbers tagged FROM THE PAPER are quoted from Templeton et al. (2024) with section links. Diagrams tagged SCHEMATIC are drawn to explain, not to scale. Nothing on this page is output from Claude; model behaviour is paraphrased from the paper."

---

## Claims checked against facts.md

Every bracketed ID above exists in `research/facts.md` (checked by script). Changes from KICKOFF's narrative:

1. **Hook:** "10× the strongest it ever got on its own", matching the paper's unit [D2].
2. **Act II training steps:** KICKOFF's "34M training steps" wording is dropped. The 34M SAE's training length was chosen by scaling laws and isn't reported [B2].
3. **Act III languages:** limited to the bridge feature, with the languages unnamed [C12]; image examples flagged as hand-picked [C7].
4. **Act III code:** clamp values 3× and −5× added from the paper's figures [E3, E4]. Negative clamps are explained against ReLU [D11]. The addition feature moved to the caption.
5. **Act III steering:** brain sciences 10× and tourist attractions 8× added [D7, D8].
6. **Act IV earthquake:** "nothing like it nearby in the smallest" [G6].
7. **Act IV frequency:** the rule is stated first, then the number; the caption gives the 50% detail [H3].
8. **Act IV Kobe:** "LA area code 162nd" is left off the page, because the paper doesn't tie it to the listed LA feature [I10].
9. **Act V persona:** hedged as speculation [J11]; no clamp multiple for honesty [J10].
10. **Act V lying caveat:** the paper's own sentence [J2].
11. **Act I order:** directions before superposition.
12. **λ = 5** is moved from the body to the caption, since it's meaningless without the paper's scaling [A9].
13. **Checkpoint 1 changes:** the three-dictionaries step was folded into the receipts step (II-7); III-3 gains a Chinese tile in the system font stack; the background definitions (M) are cited to *Toy Models* or *Towards Monosemanticity* where they come from there.
14. **Copy changes made while building** (Phases 1–2): P4 adds "This is called next-word prediction." so the glossary term appears in the text; Recap I ends "That's Act II."; II-2 says "you'll see how in three steps" instead of naming II-5; II-1's caption carries the smoothie analogy's limit; II-6's scene adds a toy readout "features that match an idea: N of 8". The toy SAE is trained at λ = 0.3, the setting at which it recovers all 8 hidden ideas; the paper's λ = 5 stays in the caption with its caveat [A9].
15. **Additions** from the beginner review: P4 next-word guess [M1]; II-5 training [M7]; III-4 "put the edited list back" [D1]; IV-4 ablation via the John example [I4, I5]; V-3 self-questions [J16]. Each is a background statement or a `facts.md` value.
