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
];
