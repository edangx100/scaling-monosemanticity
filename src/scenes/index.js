// All scenes, keyed by step id, plus the toy values the copy can quote.
import { SCENES as SLICE, TOY_VALUES as SLICE_VALUES } from './slice.js';
import { ACT2_SCENES, ACT2_TOY_VALUES } from './act2.js';
import { ACT3_SCENES, ACT3_TOY_VALUES } from './act3.js';
import { ACT4_SCENES, ACT4_TOY_VALUES } from './act4.js';
import { ACT5_SCENES, ACT5_TOY_VALUES } from './act5.js';

export const SCENES = { ...SLICE, ...ACT2_SCENES, ...ACT3_SCENES, ...ACT4_SCENES, ...ACT5_SCENES };
export const TOY_VALUES = { ...SLICE_VALUES, ...ACT2_TOY_VALUES, ...ACT3_TOY_VALUES, ...ACT4_TOY_VALUES, ...ACT5_TOY_VALUES };
export { directionsObjs } from './slice.js';
export { tugObjs, trainingObjs, TUG_DEFAULT } from './act2.js';
export { clampObjs } from './act3.js';
export { waterObjs, kobeObjs, WATER_KEYS } from './act4.js';
