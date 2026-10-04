// Glossary notes: one plain-English line each, plus where the picture stops
// being literal when that matters. `pic` names the scene picture (see
// research/visual-language.md) shown as a tiny icon in the note.

export const GLOSSARY = {
  token: { term: 'Token', pic: 'tile', def: 'A small chunk of text, like a word or part of a word, that the model reads as one unit.' },
  vector: { term: 'Vector (a list of numbers)', pic: 'bars', def: 'A list of numbers. Here, the list the model keeps for each token as it moves up the floors.' },
  layer: { term: 'Layer', pic: 'floor', def: 'One processing step. The model passes the list through many of them in order.' },
  next: { term: 'Next-word prediction', pic: 'odds', def: 'The model’s output: a set of odds for which token comes next.' },
  neuron: { term: 'Neuron', pic: 'bar', def: 'One of the model’s built-in units, loosely named after brain cells; here it’s just a number.', more: 'Real neurons sit inside each floor’s machinery rather than in the list between floors, but the problem we’re about to see is the same.' },
  polysemantic: { term: 'Polysemantic', pic: 'cards', def: 'One unit responds to several unrelated things.', more: 'Defined this way in Towards Monosemanticity (2023).' },
  direction: { term: 'Direction', pic: 'arrow', def: 'A way to point in the space of number lists. Moving along it turns one idea up.' },
  superposition: { term: 'Superposition', pic: 'arrows', def: 'Storing more ideas than there are numbers, by giving each idea its own direction even though the directions overlap.', more: 'In high dimensions, very many directions can be almost perpendicular (Toy Models of Superposition, 2022).' },
  feature: { term: 'Feature', pic: 'lamp', def: 'One learned ingredient: a direction that stands for one idea. We draw it as a lamp on an arrow.' },
  sae: { term: 'Sparse autoencoder (SAE)', pic: 'funnel', def: 'A small machine trained to rebuild the model’s lists from a few features at a time. Its two halves are the encoder and the decoder.' },
  encoder: { term: 'Encoder', pic: 'funnel', def: 'The half of the SAE that turns the model’s list into one score per feature.' },
  relu: { term: 'ReLU', pic: 'gate', def: 'A rule that keeps positive numbers and turns negative ones into zero.' },
  decoder: { term: 'Decoder', pic: 'funnel', def: 'The half of the SAE that adds the lit features back up to rebuild the list.' },
  training: { term: 'Training', pic: 'arrows', def: 'Repeating a small adjustment many times, each one making the machine a little better at its task.' },
  loss: { term: 'Loss', pic: 'rope', def: 'A score for how badly the SAE is doing; training makes it smaller.', more: 'λ (lambda) is the knob that sets how much using many lamps counts against it.' },
  dead: { term: 'Dead feature', pic: 'shelf', def: 'A feature that never switches on, so it’s wasted space. The authors expect better training to reduce this.' },
  brightness: { term: 'Brightness (activation)', pic: 'lamp', def: 'How strongly a feature lights for a token. Researchers call it the feature’s activation.' },
  clamping: { term: 'Clamping', pic: 'dial', def: 'Fixing a feature at a chosen brightness and letting the model carry on. “10×” means ten times the brightest it got on its own in the researchers’ data.' },
  correlation: { term: 'Correlation', pic: 'strip', def: 'How closely two quantities rise and fall together, from −1 to 1: near 1 means in lockstep, near 0 means unrelated.' },
  similar: { term: 'Similar directions', pic: 'arrows', def: 'Two arrows that point roughly the same way. Researchers measure this with cosine similarity: 1 for the same direction, 0 for perpendicular.' },
  splitting: { term: 'Feature splitting', pic: 'lamps', def: 'When a bigger dictionary replaces one broad feature with several narrower ones nearby.' },
  ablation: { term: 'Ablation', pic: 'slash', def: 'Switching one feature off and rerunning the model to see what changes.' },
  attribution: { term: 'Attribution', pic: 'tenrow', def: 'A fast estimate of how much switching a feature off would change the answer, without rerunning the model for each one.' },
  sycophancy: { term: 'Sycophancy', pic: 'drawer', def: 'Telling people what they want to hear, such as excessive flattery.' },
  persona: { term: 'Persona', pic: 'mask', def: 'The character the model plays, here the helpful assistant.' },
};
