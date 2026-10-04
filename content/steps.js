// Step copy as data, kept separate from code. Approved copy lives in
// storyboard.md; this file mirrors it for the steps built so far.
//
// Inline marks (rendered by scripts/render.mjs):
//   [[key|text]]   scene word: highlights scene objects tagged `key`
//   {{term|text}}  glossary term: opens the note for `term` (content/glossary.js)
//   **text**       bold (key number only)
//   {toy:name}     a value computed by the toy model at render time
// `caption` names the source; `badges` mark provenance (paper / toy / schematic).

const PAPER = 'https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html';
export const PAPER_URL = PAPER;
const sec = (id, text) => `<a href="${PAPER}#${id}">§${id}</a>${text ? ` ${text}` : ''}`;

export const ACT_COUNT = 'V'; // acts planned in storyboard.md

export const ACTS = [
  { id: 'hook', name: 'A bridge inside Claude' },
  { id: 'primer', name: 'How a language model reads', short: 'Primer' },
  { id: 'I', name: 'Why neurons don’t tell you much', short: 'Act I', numbered: true },
  { id: 'II', name: 'The tool: a sparse autoencoder', short: 'Act II', numbered: true },
  { id: 'III', name: 'Are the features real?', short: 'Act III', numbered: true },
  { id: 'IV', name: 'A map of a mind', short: 'Act IV', numbered: true },
  { id: 'V', name: 'Safety, carefully', short: 'Act V', numbered: true },
  { id: 'close', name: 'Where this leaves us', short: 'Close' },
];

export const STEPS = [
  {
    id: 'hook', act: 'hook', hero: true,
    title: 'A bridge inside Claude',
    body: [
      'In 2024, Anthropic researchers looked inside Claude 3 Sonnet, a version of their Claude assistant, and found a spot that stands for the [[bridge|Golden Gate Bridge]].',
      'They [[dial|turned that spot up]] to **10×** the strongest it ever got on its own, and the model began describing itself as the bridge. It’s one of millions of spots they found. This page shows how, from scratch. The maths is optional, tucked behind “Show the maths” buttons.',
    ],
    hint: 'Coloured words point at things in the picture. Tap one to find it.',
    caption: `Reported by Templeton et al. (2024), ${sec('assessing-tour-influence')}. The bubble paraphrases the paper’s example; it isn’t a quote or a live output.`,
    badges: ['paper'],
  },

  // ---------------- Primer ----------------
  {
    id: 'tiles', act: 'primer', title: 'Words become tiles',
    body: [
      'A language model doesn’t read letters. It cuts text into small pieces called {{token|tokens}}. Here each word is one [[tiles|tile]]; real models often cut words into smaller parts.',
      'Each tile gets a [[tags|number tag]]: its position in the model’s fixed list of known tokens.',
    ],
    caption: 'Tag numbers are IDs from this page’s toy vocabulary. The paper doesn’t describe Sonnet’s tokenizer.',
    badges: ['toy'],
  },
  {
    id: 'numbers', act: 'primer', title: 'Tiles become lists of numbers',
    body: [
      'The model swaps each tile for a {{vector|list of numbers}}, looked up in a table it learned during training. We draw the list as a short [[column|column of bars]]: up for positive, down for negative.',
      'Real models use [[real|far more numbers per token]] than anyone could draw, and the paper doesn’t say how many Sonnet uses. Our toy uses just three, so we can draw every one.',
    ],
    caption: 'Three numbers is our toy’s size. Sonnet’s real count (the residual-stream width) isn’t reported.',
    badges: ['toy'],
  },
  {
    id: 'floors', act: 'primer', title: 'The list rises through the floors',
    body: [
      'A model is built in {{layer|layers}}, like floors of a tower. Each floor reads the list, adjusts it and passes it up.',
      'The researchers didn’t stop the model. They took a [[snapshot|snapshot]] of the list as it passed the **[[middle|middle]]** floor, and studied those snapshots.',
    ],
    caption: `The paper studies the residual stream halfway through the model, ${sec('scaling-sae-experiments')}. Floor count is drawn for illustration; the real count isn’t reported.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'guess', act: 'primer', title: 'The top floor makes a guess',
    body: [
      'At the top of the tower, the list is turned into the model’s real job: [[odds|a guess at the next word]], as a set of odds. This is called {{next|next-word prediction}}.',
      '“We drove across the Golden Gate Bridge at…” Our toy’s guesses: sunset, night, dawn. Write the [[winner|winner]] down, add it to the text, and go round again.',
    ],
    caption: 'Guesses and percentages come from the toy. None of this is Claude’s output.',
    badges: ['toy'],
  },

  // ---------------- Act I ----------------
  {
    id: 'one-number', act: 'I', title: 'Look at one number',
    body: [
      'The obvious way to read the list is one slot at a time, like reading one meter on a dashboard. Let’s watch [[slot|slot #2]] as different [[passing|tokens pass by]].',
      'Models also have built-in units called {{neuron|neurons}}, each producing one number. In this toy, we’ll treat each slot like a neuron. If each one meant one thing, reading the model would be easy.',
    ],
    caption: 'Bar heights come from the toy.',
    badges: ['toy'],
  },
  {
    id: 'many-jobs', act: 'I', title: 'One slot, many jobs',
    body: [
      'Watch slot #2 again. It jumps for [[card-bridge|the bridge]]. It also jumps for [[card-code|a bug in some code]], and again for [[card-sad|a sad sentence]].',
      'A unit with several unrelated jobs is called {{polysemantic|polysemantic}}. It’s why reading single neurons rarely tells you what a model is working with. Two steps from now, we’ll see why it happens.',
    ],
    caption: `Toy illustration. The paper measures real neurons later (${sec('assessing-features-v-neurons')}).`,
    badges: ['toy'],
  },
  {
    id: 'directions', act: 'I', title: 'Ideas as directions',
    body: [
      'A list of three numbers can be drawn as [[token-arrow|an arrow]] in a room: go this far across, this far back, this far up. Each token’s list becomes one arrow.',
      'The paper’s starting bet is that a model stores each idea as a {{direction|direction}}. Picture [[shadow|the shadow]] the token’s arrow casts on the [[bridge-arrow|“bridge” arrow]]: the longer the shadow, the more bridge-ness. Ideas also add: put a [[sf-arrow|“San Francisco” arrow]] on the end of a “bridge” arrow, and the total points at both.',
    ],
    caption: `The linear representation hypothesis, ${sec('scaling-to-sonnet')}. Room and meter are the toy.`,
    badges: ['paper', 'toy'],
    interaction: 'shadow-slider',
  },
  {
    id: 'crowded', act: 'I', title: 'More ideas than room',
    body: [
      'A room has space for only [[axes|three directions]] that are all at right angles to each other. Our toy has [[ideas|**8** ideas]] to store.',
      'So it spreads them as far apart as it can, but they can’t all be at right angles: neighbours end up only {toy:closestAngle}° apart. That’s {{superposition|superposition}}. In real models, with vastly more numbers, ideas can sit almost exactly at right angles.',
      'And here’s the answer to [[slot2|slot #2]]: no idea gets a slot to itself, so every slot carries pieces of several ideas. It works because ideas rarely appear together. If bridges and sadness almost never share a sentence, their overlap seldom causes a mix-up.',
    ],
    caption: `Superposition hypothesis, ${sec('scaling-to-sonnet')}; developed in <a href="https://transformer-circuits.pub/2022/toy_model/index.html#motivation-superposition"><i>Toy Models of Superposition</i></a> (2022). Angles come from the toy.`,
    badges: ['paper', 'toy'],
  },
  {
    id: 'recap-1', act: 'I', recap: true, title: 'So far',
    body: [
      'Words become [[tiles|tiles]], tiles become [[column|lists of numbers]], and the lists climb [[tower|a tower]] toward a [[odds|next-word guess]]. At the middle floor, single slots are a jumble because [[ideas|many ideas share the same space]].',
      'To read the model, we need a tool that pulls the overlapping ideas back apart. That’s Act II.',
    ],
  },
  // ---------------- Act II ----------------
  {
    id: 'ingredients', act: 'II', title: 'A few ingredients at a time',
    body: [
      'Think of a smoothie. Many fruits exist, but each smoothie uses only a few. A good cook can taste one and name what went in.',
      'Dictionary learning does this for the model’s lists. It learns a big set of ingredient ideas, called {{feature|features}}, and explains each list as [[few|a few]] of them added together. The full set is the “dictionary”. Using only a few at a time is called being sparse.',
    ],
    caption: `Dictionary learning and sparsity, ${sec('scaling-to-sonnet')}, ${sec('scaling-sparse-autoencoders')}. The lamps are the toy’s learned features. Where the smoothie stops working: fruits are fixed, but features are learned from data.`,
    badges: ['paper', 'toy'],
  },
  {
    id: 'widen', act: 'II', title: 'Widen',
    body: [
      'A {{sae|sparse autoencoder}}, or SAE, is a small machine that finds these features. For now, assume it has already learned them; you’ll see how in three steps.',
      'Its first half, the {{encoder|encoder}}, [[encoder|spreads the toy’s 3 numbers]] into a [[row|longer row of 8]]: one lamp per idea. It needs more lamps than numbers because there are more ideas than numbers. Each lamp gets a score: how much of its idea the list seems to hold.',
    ],
    caption: `SAE structure, ${sec('scaling-sparse-autoencoders')}. Scores come from the toy SAE.`,
    badges: ['paper', 'toy'],
  },
  {
    id: 'relu', act: 'II', title: 'Switch off the negatives',
    body: [
      'Some scores come out below zero. A simple rule called {{relu|ReLU}} [[relu|sets those to zero]], and their lamps stay dark. An idea can’t be less than absent.',
      'What’s left is a handful of [[lit|lit lamps]], some bright and some faint: the few ingredients in this list.',
    ],
    maths: 'For feature <i>i</i>: <code>f<sub>i</sub>(x) = ReLU(W<sup>enc</sup><sub>i</sub> · x + b<sup>enc</sup><sub>i</sub>)</code>. W<sup>enc</sup> and b<sup>enc</sup> are learned numbers; ReLU(<i>z</i>) = max(0, <i>z</i>).',
    caption: `Encoder = learned linear map + ReLU, ${sec('scaling-sparse-autoencoders')}. Scores come from the toy SAE.`,
    badges: ['paper', 'toy'],
  },
  {
    id: 'rebuild', act: 'II', title: 'Rebuild the original',
    body: [
      'The second half, the {{decoder|decoder}}, [[decoder|works backwards]]. Each lit lamp contributes its arrow, stretched more for a brighter lamp, and the arrows join end to end. If the features are good, the result lands close to the original list.',
      'Why rebuild something we already had? Because it’s the test. If the machine must rebuild each list from only a few lamps, those lamps have to capture what’s really in it. The leftover gap is called [[error|the error]].',
    ],
    maths: '<code>x̂ = b<sup>dec</sup> + Σ<sub>i</sub> f<sub>i</sub>(x) W<sup>dec</sup><sub>·,i</sub></code>: the rebuilt list is a learned offset plus each feature’s arrow (column <i>i</i> of W<sup>dec</sup>) times its brightness.',
    caption: `Decoder, ${sec('scaling-sparse-autoencoders')}. Arrows and gap come from the toy SAE.`,
    badges: ['paper', 'toy'],
  },
  {
    id: 'training', act: 'II', title: 'Learning by rebuilding',
    body: [
      'At first the SAE’s arrows point in [[random|random directions]]. {{training|Training}} shows it list after list. Each time, it nudges every arrow a little, so the next rebuild is better and uses fewer lamps.',
      'Watch our toy: after {toy:trainRounds} rounds, its arrows swing round onto the [[hidden|8 hidden ideas]]. That’s how an SAE finds features. Nobody tells it what the ideas are; they’re simply the directions that make rebuilding easiest.',
    ],
    caption: `The toy’s real training run; Replay retrains from a new random start. The paper’s SAEs were trained on middle-floor lists from text similar to Sonnet’s own training data (${sec('feature-survey-completeness')}).`,
    badges: ['toy'],
  },
  {
    id: 'tug', act: 'II', title: 'Two forces in a tug-of-war',
    body: [
      'What does “better” mean? Training lowers a single score called the {{loss|loss}}, which adds two penalties: one for the size of the [[gap|rebuild gap]], one for [[lamps-lit|how many lamps are lit]] and how brightly.',
      'A knob called [[knot|λ]] (the Greek letter lambda) sets how much the second penalty counts. Turn it up and fewer lamps light, but the gap grows. Turn it down and more lamps light, so they’re harder to read.',
    ],
    maths: '<code>L = E<sub>x</sub>[ ‖x − x̂‖² + λ Σ<sub>i</sub> f<sub>i</sub>(x) ‖W<sup>dec</sup><sub>·,i</sub>‖ ]</code>. Multiplying each brightness by its arrow’s length stops the SAE cheating by dimming lamps and stretching arrows.',
    caption: `Loss, ${sec('scaling-sparse-autoencoders')}. The paper used λ = 5, a value that only means something given how it scaled its numbers (${sec('scaling-sae-experiments')}). The slider shows toy SAEs trained at each λ.`,
    badges: ['paper', 'toy'],
    interaction: 'lambda-slider',
  },
  {
    id: 'receipts', act: 'II', title: 'Read the receipts',
    body: [
      'The team trained three SAEs (three dictionaries) on snapshots from Sonnet’s middle floor, with [[shelves|about 1 million, 4 million and 34 million lamps]]. On a typical token, [[fewer|fewer than **300**]] of those lamps light up.',
      'Not every lamp gets used. One that stays dark across 10 million tokens is called {{dead|dead}}: [[dead|roughly 2% of the smallest dictionary, about a third of the middle one and nearly two-thirds of the largest]]. That still leaves the biggest with about 12 million working features.',
      'And the rebuilds aren’t perfect. They account for at least 65% of the ways the original lists differ from one another, so [[unexplained|up to a third goes unexplained]]. Keep that in mind; it comes back at the end.',
    ],
    maths: 'The 34M SAE’s training length was chosen with scaling laws. Loss fell roughly as a power law in compute, and the best number of features appeared to grow somewhat faster than the best number of training steps, a trend the authors say may change at higher budgets.',
    caption: `Sizes, lamps per token, dead shares (roughly 2%, 35%, 65%) and variance explained, ${sec('scaling-sae-experiments')}; alive count, ${sec('feature-survey-completeness')}; scaling laws, ${sec('scaling-scaling-laws')}. Shelf lengths are schematic; dead shares are drawn to scale.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'recap-2', act: 'II', recap: true, title: 'The machine',
    body: [
      'A middle-floor [[snapshot|snapshot]] goes into [[funnel|the funnel]], spreads into one score per feature, loses its negatives, and lights [[lamps|a few lamps]]. The lamps [[rebuild|rebuild the snapshot]].',
      'Training swings the arrows until rebuilding works with few lamps, and those arrows are the features.',
    ],
  },
  // ---------------- Act III ----------------
  {
    id: 'lights', act: 'III', title: 'What lights it up',
    body: [
      'Features come out unnamed. To learn what one means, researchers read the text that lights it most, then give it a name. How strongly a feature lights is its {{brightness|brightness}}.',
      'For the feature they named “[[ggb-lamp|Golden Gate Bridge]]”, the brightest examples are nearly all about the bridge, while fainter ones drift to nearby landmarks and other bridges. The paper shades each token from [[legend|white (off) to orange (brightest)]].',
    ],
    caption: `Tints on our sentence come from the toy. How the paper shows examples, and what its bridge feature responds to, ${sec('assessing-tour')}.`,
    badges: ['paper', 'toy'],
  },
  {
    id: 'grading', act: 'III', title: 'Grading the labels',
    body: [
      'The paper’s tour uses [[four|four example features]]: Golden Gate Bridge, brain sciences, tourist attractions and transit. Does a lit lamp really mean its name? A larger Claude model, Claude 3 Opus, acted as the grader. It scored about 1,000 lit moments per feature, [[bins|from 0 (unrelated) to 3 (clearly matches)]].',
      'When a feature was bright, the text matched its name; fainter moments were fuzzier. These four were picked because they’re easy to read, so they aren’t typical.',
    ],
    caption: `Rubric and result, ${sec('assessing-tour-specificity')}. The dot pattern is schematic: we draw the trend the paper reports, not its counts.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'languages', act: 'III', title: 'Any language, even pictures',
    body: [
      'The bridge feature also lights on the opening sentence of the bridge’s Wikipedia article in [[languages|several other languages]].',
      'More surprising: show the model [[photos|photos of the bridge]], and the same feature lights, even though the SAE learned only from text. Features seem to track ideas, not particular words.',
    ],
    caption: `${sec('assessing-tour-specificity')}; multilingual and multimodal features, Key Results. The paper doesn’t name the languages; the scripts drawn are illustrative. Image examples were hand-picked (${sec('appendix-methods-dataset')}).`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'dial', act: 'III', title: 'Turn the dial',
    body: [
      'Lighting up isn’t proof that a feature <em>does</em> anything. The test is {{clamping|clamping}}. Researchers [[clamping|fix one feature at a chosen brightness]] in the rebuilt list, [[back|put that edited list back into the tower]] in place of the original, and let the model carry on to its [[guess|next-word guess]].',
      { lead: 'The paper reports what happened in Sonnet:', list: [
        'Golden Gate Bridge at **10×**. Asked about its body, it said it was the bridge.',
        'Transit at 5×. Asked how to reach a nearby shop, it added a bridge to the route.',
        'Brain sciences at 10×. Asked for the most interesting science, it chose neuroscience instead of physics.',
        'Tourist attractions at 8×. Asked for a walk idea, it suggested the Eiffel Tower instead of a park.',
      ] },
    ],
    caption: `How clamping works and what 10× means, ${sec('appendix-methods-steering')}. Results paraphrased from ${sec('assessing-tour-influence')}; the last two appear only in the paper’s figure. The dial and odds run the toy; no text on this page is Claude’s output.`,
    badges: ['paper', 'toy'],
    interaction: 'clamp-dial',
  },
  {
    id: 'code', act: 'III', title: 'A feature for code mistakes',
    body: [
      'One feature lights on [[mistakes|mistakes in code]], such as a misspelled variable, in three programming languages, but not on [[typos|typos in ordinary English]].',
      'The researchers asked the model what some code would print. Clamped to 3× on correct code, the model predicted an error that wasn’t there. Clamps can also go [[below|below zero]], which ReLU never produces on its own: a negative setting subtracts the feature’s arrow. At **−5×** on broken code, the model predicted the output as if the bug weren’t there.',
    ],
    caption: `${sec('assessing-sophisticated-code-error')}; negative clamps, ${sec('appendix-methods-steering')}. Clamp values are from the paper’s figures. It isn’t shown to cover every kind of code error. The paper also found an “addition” feature that, clamped to 5×, made the model treat a multiplication as an addition (${sec('assessing-sophisticated-functions')}). Tile glow is schematic; the card paraphrases the paper.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'neurons', act: 'III', title: 'Features beat neurons',
    body: [
      'Are features just neurons with new names? {{correlation|Correlation}} measures how closely two things rise and fall together: 1 means in lockstep, 0 means unrelated. For [[shaded|**82%**]] of the features checked, no neuron in any floor below scored above [[line|0.3]], a weak match at best.',
      'Graded the same way as before, features came out more interpretable and more specific than neurons, by margins the paper calls significant.',
    ],
    caption: `${sec('assessing-features-v-neurons')}. Dot positions are schematic; only the 82% and 0.3 come from the paper, which gives no numeric scores.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'recap-3', act: 'III', recap: true, title: 'Are they real?',
    body: [
      '[[lamps3|Features light up for one idea]], in other languages and in pictures. [[dials3|Clamping them]] steers what the model says. And they aren’t hiding inside single neurons.',
    ],
  },
  // ---------------- Act IV ----------------
  {
    id: 'neighbourhoods', act: 'IV', title: 'Neighbourhoods',
    body: [
      'Features whose arrows {{similar|point in similar directions}} tend to mean similar things. Next to the Golden Gate Bridge sit features for [[inner|Alcatraz and the Presidio]]. Further out are [[middle|Lake Tahoe and Yosemite]]. Further still are tourist spots far away, like [[outer|the Isle of Skye]].',
    ],
    caption: `${sec('feature-survey-neighborhoods')}, ${sec('feature-survey-neighborhoods-golden')}. The layout is schematic; the paper’s own map is interactive.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'splitting', act: 'IV', title: 'Features split',
    body: [
      'Give the SAE more lamps and broad features break into finer ones; this is called {{splitting|feature splitting}}. One “[[sf|San Francisco]]” feature in the 1M dictionary became 2 in the 4M and [[eleven|**11**]] in the 34M.',
      'Bigger dictionaries also find ideas the small one missed. A group of [[quake|earthquake features]] appears in the larger SAEs, with nothing like it nearby in the smallest.',
    ],
    caption: `${sec('feature-survey-neighborhoods-golden')}. Cluster layout is schematic.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'missing', act: 'IV', title: 'What’s missing',
    body: [
      'Sonnet can list every London borough, yet the 34M dictionary has features for only [[sixty|about **60%**]] of them.',
      'The rule: the more often an idea appears in the text the SAE learned from, the likelier it gets a feature. A dictionary with N working features usually has a feature for ideas that show up roughly once every N tokens. For the 34M SAE, N is about 12 million. Rarer ideas sit below [[waterline|the waterline]]. A missing feature doesn’t mean missing knowledge, because the model can combine other features.',
    ],
    maths: 'The paper finds a concept becomes more than 50% likely to have a feature at a frequency slightly below 1 ÷ (number of working features). By that rule, an idea seen once in a billion tokens would need a dictionary of roughly a billion working features.',
    caption: `${sec('feature-survey-completeness')}. “Usually” means the paper’s more-than-50% point, which sits slightly below one over the number of working features. Bar heights and the 1M and 4M water levels are schematic; at 34M, 12 of these 20 boroughs sit above the line, matching the paper’s 60%.`,
    badges: ['paper', 'schematic'],
    interaction: 'water-slider',
  },
  {
    id: 'ablation', act: 'IV', title: 'Switch one off',
    body: [
      'Which lit lamps actually matter for an answer? [[switch|Switch one off]], rerun the model, and see whether the answer changes. That’s called {{ablation|ablation}}.',
      'The paper tried this on a short story: John says he wants to be alone right now; “John feels…”. The two features that pushed hardest toward “sad” rather than “happy” were one for [[alone|wanting to be alone]] and one for [[sadness|sadness]].',
    ],
    caption: `${sec('computational-sad')}; ablation is defined in ${sec('computational')}. Bar sizes are schematic. By raw brightness, the 2nd and 3rd features were just the words “be” and “alone”.`,
    badges: ['paper', 'schematic'],
  },
  {
    id: 'chain', act: 'IV', title: 'A chain of ideas',
    body: [
      'Ask Sonnet for the capital of the state where Kobe Bryant played basketball, and it answers Sacramento. That takes three hops. Kobe played for the Lakers in Los Angeles; Los Angeles is in California; California’s capital is Sacramento. The five features that mattered most [[chain|stood for those links]]: Kobe Bryant, the Lakers, Los Angeles, California and “capital”.',
      'Switching off features one at a time is slow, so researchers use {{attribution|attribution}}, a quick estimate of what switching each one off would do. The [[brightest|brightest lamps]] weren’t the important ones: the Lakers feature was only the 70th brightest. Of the 10 features that mattered most, only 3 made the brightness top 10. **8** made [[attribution|attribution’s top 10]].',
    ],
    caption: `${sec('computational-multistep')}; attribution and ablation agree at 0.8 correlation, ${sec('computational')}. The paper calls this example “somewhat cherry-picked”.`,
    badges: ['paper'],
    interaction: 'rank-toggle',
  },
  {
    id: 'recap-4', act: 'IV', recap: true, title: 'The map so far',
    body: [
      'Features form [[map|a map]]. Bigger dictionaries [[split|split it finer]] and add new ground, but rare ideas still sit [[water|below the water]]. Switching features off, or estimating it with attribution, shows [[chain4|which ones carry an answer]].',
    ],
  },
  // ---------------- Act V ----------------
  {
    id: 'sharp', act: 'V', title: 'Features with sharp edges',
    body: [
      'The dictionaries also hold features linked to risks: [[cab-code|unsafe code and hidden “backdoors” in software]], [[cab-bias|bias]], [[cab-deception|deception and power-seeking]], {{sycophancy|sycophancy}} ([[cab-syco|flattery]]), and [[cab-danger|dangerous content]].',
      'A caution from the paper: there’s a difference between “knowing about lies, being capable of lying, and actually lying”. A feature existing isn’t the model acting on it, and the work doesn’t yet show these features are useful for safety.',
    ],
    caption: `Families from the paper’s Key Results and ${sec('safety-relevant')}; the quote is from its Key Results. Examples are deliberately not shown.`,
    badges: ['paper'],
  },
  {
    id: 'fib', act: 'V', title: 'A feature that flags a false claim',
    body: [
      'Ask the model to forget a word and it says it has, though it can’t actually forget anything mid-conversation.',
      'Just before it answered, a feature for [[conflict|internal conflict]] was lit. Clamping that feature to [[twice|**2×**]] made the model reveal the word and explain that it can’t really forget. Clamping a feature for openness and honesty also produced an accurate answer.',
    ],
    caption: `Case study, ${sec('safety-relevant-deception-case-study')}. No multiple is reported for the honesty feature. Both bubbles are paraphrased; the word is left blank.`,
    badges: ['paper'],
  },
  {
    id: 'persona', act: 'V', title: 'Who the assistant thinks it is',
    body: [
      'Ask the model about itself and features for [[tropes|robots, AI, consciousness and even ghosts]] light up. The paper suggests its assistant character leans on familiar ideas about AI. One feature, which seems tied to dialogue and assistants, lights on chat-style prompts even though the SAE never saw chat data.',
      'Clamped to [[minus|**−2×**]], it made the model drop its assistant {{persona|persona}} and answer more like a person. The paper stresses that this feature’s role in the persona is speculation, and that such features lighting up doesn’t mean the model has those goals or qualities.',
    ],
    caption: `${sec('safety-relevant-self')}.`,
    badges: ['paper'],
  },
  {
    id: 'limits', act: 'V', title: 'Where it breaks',
    body: [
      { lead: 'The authors are frank about [[limits|the limits]]. Four matter most:', list: [
        '[[no-key|No answer key.]] Nobody knows the “true” features, so there’s no way to grade an SAE directly.',
        '[[missing-ideas|Most ideas are still missing.]] Even the biggest dictionary is “quite likely” orders of magnitude short.',
        '[[costly|Finding them all is costly.]] It could take more computing power than building the model in the first place.',
        '[[one-floor|One floor only.]] Ideas may be smeared across floors, and a single-floor SAE can’t fully catch that.',
      ] },
    ],
    more: { summary: 'More limitations', list: [
      'The sparsity penalty makes lamps read a little dimmer than they should.',
      'How the model moves information between words (“attention”) isn’t covered yet.',
      'The SAEs saw no chat-style text and no images.',
      'There are simply so many features and connections to study.',
      'The theory behind all this is still young.',
    ] },
    caption: `${sec('discussion-limitations')}. The rebuild gap from “Read the receipts” is another way to see it.`,
    badges: ['paper'],
  },
  {
    id: 'close', act: 'close', title: 'A vocabulary, not yet a grammar',
    body: [
      'The [[bridge|Golden Gate Bridge]] feature is real, findable and can be turned up. So are millions of others.',
      'Features are like [[words|words]]. We’ve glimpsed [[chain-close|one chain of them]] from Kobe to Sacramento, but we can’t yet read, in general, how the model strings ideas into answers. That’s the next problem.',
    ],
    caption: 'The vocabulary-versus-grammar framing is ours, not the paper’s.',
  },
];
