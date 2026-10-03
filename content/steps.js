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
];
