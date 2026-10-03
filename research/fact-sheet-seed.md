# Fact sheet seed (UNVERIFIED)

Starting point only. Verify each item against the paper and record the result, with a section link, in `research/facts.md`. Do not cite this file.

## Model and setup
- Claude 3 Sonnet (production 3.0 model). SAEs trained on residual-stream activations at the middle layer. Model size not disclosed.
- Encoder: f_i(x) = ReLU(W_enc·x + b_enc)
- Decoder: x̂ = b_dec + Σ f_i · W_dec,i
- Loss: ‖x − x̂‖² + λ Σ f_i ‖W_dec,i‖, with λ = 5
- Activations normalised so mean squared L2 norm equals D (residual stream dimension).

## Sizes and training
- 1,048,576 (1M); 4,194,304 (4M); 33,554,432 (34M) features.
- 34M training steps chosen by scaling-laws analysis.
- Fewer than 300 features active per token on average; ≥ 65% of variance explained.
- Dead features ≈ 2% (1M), 35% (4M), 65% (34M); 34M has ≈ 12M alive.
- Loss falls roughly as a power law in compute; optimal feature count grows a bit faster than optimal training steps.

## Example features
- Golden Gate Bridge 34M/31164353; brain sciences 34M/9493533; tourist attractions 1M/887839; transit infrastructure 1M/3.
- Specificity scored by Claude 3 Opus on a 0–3 rubric.
- Steering: Golden Gate clamped to 10× (model self-identifies as the bridge); transit clamped to 5×.
- Code error 1M/1013764: fires on bugs in Python, C, Scheme, not English typos. Positive clamp → hallucinated error; negative → bug-free prediction.
- Addition 1M/697189.
- Features vs neurons: for 82% of features, max correlation with any neuron ≤ 0.3.

## Map of features
- San Francisco feature splits 1 → 2 (4M) → 11 (34M).
- Earthquake features appear in 4M and 34M with no 1M analog.
- Features for ≈ 60% of London boroughs in the 34M SAE.
- Frequency threshold for a concept to get a feature ≈ slightly below 1 / (number of alive features).

## Kobe Bryant prompt
- Kobe 1M/391411; California 1M/81163; capital 1M/201767; Los Angeles 1M/980087; Lakers 1M/447200.
- By raw activation: Lakers 70th, California 97th, LA area code 162nd.
- Of top-10 features by ablation effect: 3 in top-10 by activation vs 8 in top-10 by attribution.
- Attribution vs ablation correlation ≈ 0.8.

## Emotional inference
- "John says 'I want to be alone right now.' John feels…" activates "desire to be alone" 1M/22623 and "sadness" 1M/781220.

## Safety-relevant
- Unsafe code 1M/570621 (5× → writes a buffer overflow); backdoor 34M/1385669.
- Sycophantic praise 1M/847723 (5×); secrecy 1M/268551 (5×).
- Internal conflict 1M/284095 (2× in "forget" case study); honesty 1M/560566.
- Assistant/dialogue 1M/80091 (−2× sheds the persona).

## Limitations
- No ground-truth objective; shrinkage; cross-layer superposition; likely orders of magnitude short of all features; full coverage could cost more compute than training the model; attention superposition and interference weights unsolved.
