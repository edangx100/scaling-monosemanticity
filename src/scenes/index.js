// All scenes, keyed by step id, plus the toy values the copy can quote.
import { SCENES as SLICE, TOY_VALUES as SLICE_VALUES } from './slice.js';
import { ACT2_SCENES, ACT2_TOY_VALUES } from './act2.js';

export const SCENES = { ...SLICE, ...ACT2_SCENES };
export const TOY_VALUES = { ...SLICE_VALUES, ...ACT2_TOY_VALUES };
export { directionsObjs } from './slice.js';
export { tugObjs, trainingObjs, TUG_DEFAULT } from './act2.js';
