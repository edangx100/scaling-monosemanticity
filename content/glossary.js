// Glossary notes: one plain-English line each, plus where the picture stops
// being literal when that matters. `pic` names the scene picture (see
// research/visual-language.md) shown as a tiny icon in the note.

export const GLOSSARY = {
  token: { term: 'Token', pic: 'tile', def: 'A small chunk of text, like a word or part of a word, that the model reads as one unit.' },
  vector: { term: 'Vector (a list of numbers)', pic: 'bars', def: 'A list of numbers. Researchers call the list a token has at some point inside the model its activations.' },
  layer: { term: 'Layer', pic: 'floor', def: 'One processing step. The model passes the list through many of them in order.' },
  next: { term: 'Next-word prediction', pic: 'odds', def: 'The model’s output: a set of odds for which token comes next.' },
  neuron: { term: 'Neuron', pic: 'bar', def: 'One of the model’s built-in units, loosely named after brain cells; here it’s just a number.', more: 'Real neurons sit inside each floor’s machinery rather than in the list between floors, but the problem we’re about to see is the same.' },
  polysemantic: { term: 'Polysemantic', pic: 'cards', def: 'One unit responds to several unrelated things.', more: 'Defined this way in Towards Monosemanticity (2023).' },
  direction: { term: 'Direction', pic: 'arrow', def: 'A way to point in the space of number lists. Moving along it turns one idea up.' },
  superposition: { term: 'Superposition', pic: 'arrows', def: 'Storing more ideas than there are numbers, by giving each idea its own direction even though the directions overlap.', more: 'In high dimensions, very many directions can be almost perpendicular (Toy Models of Superposition, 2022).' },
};
