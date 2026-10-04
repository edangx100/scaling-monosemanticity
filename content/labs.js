// Copy for the two labs (after the story). Every "what to try" was checked
// against the toy before it went in (see tests/labs.test.mjs).

export const LABS = [
  {
    id: 'lab-train', tag: 'Lab 1 · hands on', title: 'Train a sparse autoencoder',
    dek: 'The toy’s 8 hidden ideas, packed into 3 numbers. Press Train: a real training loop runs in your browser, and the SAE’s arrows swing onto the hidden ideas.',
    tryList: [
      'Set λ to 0 and train: about four lamps light for every input, and almost none of the arrows line up with the ideas.',
      'Use only 4 lamps: there aren’t enough to go round, so most arrows settle between ideas and the rebuild gets worse.',
      'Use 16 lamps: there are only 8 ideas, so some lamps may never switch on. Those are dead.',
      'Push λ to 1.2 or more: hardly any lamps light, and most of each list goes unexplained.',
    ],
    note: 'A tiny toy (3 numbers, 8 ideas), trained in your browser. The paper’s SAEs had up to 34 million features.',
  },
  {
    id: 'lab-steer', tag: 'Lab 2 · hands on', title: 'Steer a toy model',
    dek: 'Pick one of the toy’s features and clamp it, the paper’s way: swap in the SAE’s rebuild with that feature fixed, keep the leftover error, and let the toy guess the next word.',
    tryList: [
      'Pick Golden Gate Bridge on the lunch sentence and turn it up: “bridge” takes over.',
      'Try code error or sadness: each pushes its own word to the top.',
      'Go below zero: in a 3-number toy, pushing one idea down pushes others up, because the ideas overlap (superposition, from Act I).',
      'The paper notes that far more extreme clamps (around ±100×) made the real model produce nonsense; this toy stops at 10×.',
    ],
    note: 'A tiny hand-built model, not Claude. Nothing here is Claude’s output.',
  },
];
