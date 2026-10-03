# Facts

Every real number or claim the page may use. One line per claim: **ID · claim · value · status · source**.
If a number isn't here, it doesn't go on the page.

- Paper: Templeton, Conerly, et al., *Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet*, Transformer Circuits Thread, 21 May 2024.
- Section links are `§id`, short for `https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html#id`.
- **How this was checked (2026-10-03).** One local copy of the paper's HTML was converted to text. Five subagents each checked one part of it. Then the main session searched the paper text for every value below before adding it. Values shown only inside a figure image are marked *(figure)*; the main session viewed each of those figures itself.
- **Status:** `confirmed` (as the seed says) · `corrected` (seed was wrong or too loose; the paper's version is given) · `added` (not in the seed) · `not reported` (the paper deliberately doesn't say).
- Quotes are under 15 words. Everything else is paraphrase.

---

## Corrections to `research/fact-sheet-seed.md`

| Seed item | Problem | What the paper says | Source |
|---|---|---|---|
| "34M training steps chosen by scaling-laws analysis" | **Wrong.** "34M" is the feature count, not a step count. | The *number of training steps for the 34M-feature SAE* was chosen by a scaling-laws analysis to minimise loss at a fixed compute budget. The step count itself is never reported. | §scaling-sae-experiments |
| Loss "‖x − x̂‖² + λ Σ f_i ‖W_dec,i‖" | Loose. | It is an *average over the data* (an expectation) of that quantity. λ = 5 is confirmed, and the paper notes λ only means something given its activation normalisation. | §scaling-sparse-autoencoders, §scaling-sae-experiments |
| Dead features "≈ 2%, 35%, 65%" | Hedge missing. | "Roughly" 2% / 35% / 65%. Dead means never active over a sample of 10⁷ tokens at the end of training. | §scaling-sae-experiments |
| "Optimal feature count grows a bit faster than optimal training steps" | Hedge missing. | Features "appear" to scale somewhat faster than steps at the budgets tested, and this "may change at higher compute budgets". The exponents are only in figures; don't quote them. | §scaling-scaling-laws |
| "Golden Gate clamped to 10× (self-identifies as the bridge); transit 5×" | Incomplete. | Confirmed. The same figure also shows brain sciences at 10× and tourist attractions at **8×** *(figure)*. | §assessing-tour-influence |
| Code error: "positive clamp → hallucinated error; negative → bug-free prediction" | Values missing. | Positive is **3×** *(figure)*; negative is **−5×** *(figure)*. A third result, −5× plus an extra `>>>` that makes the model rewrite the code, is called "somewhat delicate". | §assessing-sophisticated-code-error |
| "Features respond across languages and images" (implied by the narrative) | Too broad. | Only the Golden Gate Bridge feature is shown across languages: the bridge's Wikipedia opening sentence in several languages, which the paper doesn't name. The four tour features fire on images even though the SAE was trained on text only. The image examples were hand-picked, not random. | §assessing-tour-specificity, §appendix-methods-dataset |
| Earthquake features "with no 1M analog" | Over-stated. | The paper says no analog *in this neighbourhood* of the 1M SAE, and none of the nearest 1M features seem related. It doesn't say the 1M SAE has no earthquake feature anywhere. | §feature-survey-neighborhoods-golden |
| "Frequency threshold ≈ slightly below 1 / (number of alive features)" | Needs precise wording. | The frequency at which a dictionary becomes **more than 50% likely** to include a concept is consistently slightly lower than 1 / (alive features). It's a 50% point, not a hard cut-off. | §feature-survey-completeness |
| Kobe features "LA area code" | Naming ambiguity. | The list calls 1M/980087 "A Los Angeles feature". The ranking sentence speaks of "the Los Angeles area code feature" (162nd). The paper never says outright that these are the same feature. Use the paper's wording in each place. | §computational-multistep |
| "John feels…" "activates" 1M/22623 and 1M/781220 | Imprecise. | These are the **top two features by attribution and by ablation** for "sad" versus "happy". By raw activation, the 2nd and 3rd features are less abstract ones: the word "be" and the word "alone". | §computational-sad |
| Assistant/dialogue 1M/80091 "−2× sheds the persona" | Hedge missing. | The paper *speculates* this feature plays an important role in the assistant persona. Clamping it to −2× makes the model drop the persona and answer more like a human. The ID is the first feature shown in that block; the sentence itself doesn't repeat it. | §safety-relevant-self |
| Honesty 1M/560566 (implied same clamp) | Value missing. | Clamping it was "also sufficient" for a truthful answer, but **no multiple is given**. Don't state one. | §safety-relevant-deception-case-study |
| Limitations list | Incomplete. | All six seed items are confirmed; the two compute claims are hedged "quite likely". The section also lists: text-only, non-chat training data with no images; the sheer scale of features and circuits; limited scientific understanding of superposition, e.g. feature manifolds. | §discussion-limitations |
| "Specificity scored by Claude 3 Opus on a 0–3 rubric" | Confirmed; detail added. | About 1,000 activations per feature were scored. The four features were chosen to be easy to interpret and are **not representative** of all features. | §assessing-tour-specificity |

Every other seed item was confirmed as written; the confirmed lines are below.

---

## A. The model and the setup

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| A1 | Model studied | Claude 3 Sonnet, version 3.0 (released 4 March 2024): the finetuned production model, which the paper calls Anthropic's "medium-sized" production model | confirmed | front matter (Key Results footnote); §scaling-to-sonnet |
| A2 | Model size | **Not reported**, deliberately, for safety and competitive reasons. Units are also left off some plots. | not reported | §scaling-sae-experiments |
| A3 | Where the SAEs look | Residual-stream activations "halfway through the model", i.e. the middle layer | confirmed | §scaling-sae-experiments |
| A4 | Why the middle layer | The residual stream is smaller than the MLP layer (cheaper), which helps with cross-layer superposition; the middle layer likely holds abstract features | added | §scaling-sae-experiments |
| A5 | Normalisation | Activations scaled so their average squared L2 norm equals the residual-stream dimension D. D's value is not given. | confirmed | §scaling-sparse-autoencoders |
| A6 | Encoder | f_i(x) = ReLU(W^enc_i · x + b^enc_i) | confirmed | §scaling-sparse-autoencoders |
| A7 | Decoder | x̂ = b^dec + Σ_i f_i(x) W^dec_·,i | confirmed | §scaling-sparse-autoencoders |
| A8 | Loss | L = E_x[ ‖x − x̂‖²₂ + λ Σ_i f_i(x)·‖W^dec_·,i‖₂ ]: reconstruction error plus an L1 sparsity penalty | corrected (expectation) | §scaling-sparse-autoencoders |
| A9 | Sparsity coefficient | λ = 5 (only meaningful given the normalisation) | confirmed | §scaling-sae-experiments |
| A10 | Why the decoder norm sits in the penalty | It stops the SAE "cheating" by shrinking f and growing the decoder. "Feature activation" then means f_i × ‖W^dec_i‖. | added | §scaling-sparse-autoencoders |
| A11 | What an SAE is | Two layers: an encoder (linear map + ReLU into a much wider layer whose units are "features") and a decoder (linear map back) | added | §scaling-sparse-autoencoders |
| A13 | Linear representation hypothesis | Networks represent meaningful concepts ("features") as directions in their activation spaces | added | §scaling-to-sonnet |
| A14 | Superposition hypothesis | Networks use almost-perpendicular directions to represent more features than they have dimensions | added | §scaling-to-sonnet |
| A15 | Dictionary learning | The approach these hypotheses suggest; a sparse autoencoder is "a specific approximation" of it. It explains each activation as a weighted sum of a few active pieces. | added | §scaling-to-sonnet; §scaling-sparse-autoencoders |
| A16 | Sparse in practice | For any token, a very small fraction of features are active | added | §scaling-sparse-autoencoders |
| A17 | Previous work | The earlier paper (*Towards Monosemanticity*) studied a one-layer model; whether the method scales was the open question | added | §scaling-to-sonnet |
| A12 | SAE training data | A mix "very similar to" Sonnet's pre-training data, trained for one epoch. No "Human:/Assistant:" chat data and no images. Token count not reported. | added | §feature-survey-completeness; §scaling-scaling-laws; §discussion-limitations |

## B. Dictionary sizes, training and receipts

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| B1 | Three SAE sizes | **1,048,576** (~1M), **4,194,304** (~4M), **33,554,432** (~34M) features | confirmed | §scaling-sae-experiments |
| B2 | Step count for the 34M SAE | Chosen by a scaling-laws analysis to minimise loss at fixed compute; the number is not reported | corrected | §scaling-sae-experiments |
| B3 | Active features per token | Fewer than **300** on average, for all three SAEs | confirmed | §scaling-sae-experiments |
| B4 | Variance explained | At least **65%** of the variance of the activations, for all three SAEs | confirmed | §scaling-sae-experiments |
| B5 | Dead features | Roughly **2%** (1M), **35%** (4M), **65%** (34M) | confirmed (hedge) | §scaling-sae-experiments |
| B6 | Definition of dead | Not active on any of a sample of 10⁷ tokens | added | §scaling-sae-experiments |
| B7 | Alive features in the 34M SAE | About **12M** | confirmed | §feature-survey-completeness |
| B8 | Scaling laws | At compute-optimal settings, loss falls "approximately" as a power law in compute | confirmed | §scaling-scaling-laws |
| B9 | Features vs steps | The optimal feature count "appears to scale somewhat more quickly" than optimal steps; this "may change at higher compute budgets" | confirmed (hedge) | §scaling-scaling-laws |
| B10 | Compute cost | Roughly proportional to features × training steps | added | §scaling-scaling-laws |

## C. Example features and how they were checked

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| C1 | Golden Gate Bridge feature | 34M/31164353 | confirmed | §assessing-tour |
| C2 | Brain sciences feature | 34M/9493533 | confirmed | §assessing-tour |
| C3 | Monuments and popular tourist attractions | 1M/887839 | confirmed | §assessing-tour |
| C4 | Transit infrastructure | 1M/3 | confirmed | §assessing-tour |
| C5 | Feature IDs | The paper writes features as `SAE/index` (e.g. 34M/31164353). The prefix matches the SAE size; the paper never spells this format out. | added (inference; say "the paper labels features like…") | §assessing-tour |
| C6 | How examples are shown | Top-20 text inputs, highlighted from white (no activation) to orange (strongest) | added | §assessing-tour |
| C7 | Example dataset | The Pile (minus books3) and Common Crawl; image examples hand-picked, mostly from Wikimedia Commons | added | §appendix-methods-dataset |
| C8 | Specificity rubric | Claude 3 Opus scored activations from 0 to 3: 0 irrelevant, 1 only vaguely related, 2 related to nearby text, 3 cleanly identifies the text | confirmed | §assessing-tour-specificity |
| C9 | Sample per feature | About 1,000 activations | added | §assessing-tour-specificity |
| C10 | Specificity result | Strong activations were all rated highly consistent with the label. Specificity falls as activation weakens. | added | §assessing-tour-specificity |
| C11 | Selection caveat | The tour features were chosen to be easy to interpret; they are not representative | added | §assessing-tour-specificity |
| C12 | Languages | The Golden Gate Bridge feature fires strongly on the bridge's Wikipedia opening sentence in several languages, and is the top feature in each example shown. The paper doesn't name the languages. | corrected | §assessing-tour-specificity |
| C13 | Images | The four tour features also fire on relevant images, although the SAE saw only text. The paper calls this "zero-shot generalization to images". | confirmed | §assessing-tour-specificity; §discussion-limitations |
| C14 | Multilingual and multimodal in general | Many features respond to the same concept across languages, and across text and images | confirmed | front matter (Key Results) |
| C15 | Sensitivity is hard | The paper found sensitivity (does it fire on every match?) harder to measure than specificity; left for future work | added | §assessing-tour-specificity |

## D. Steering (clamping)

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| D1 | How clamping works | Split the residual stream into the SAE's rebuild plus an error term. Set one feature to a fixed value in the rebuild, leave the error term alone, and run the rest of the model. Applied at every token position. | added | §appendix-methods-steering |
| D2 | Unit of a clamp | A multiple of the feature's **maximum activation over the SAE training data**: "10×" means ten times that maximum | confirmed | §appendix-methods-steering |
| D3 | Typical range | Usually between −10 and 10. Around ±100× typically produces nonsense such as one token repeated. | added | §appendix-methods-steering |
| D4 | Interesting effects need big clamps | Usually beyond the observed range; the paper suspects because related features aren't moved at the same time | added | §appendix-methods-steering |
| D5 | Golden Gate Bridge at **10×** | Asked about its physical form, the model describes itself as the bridge (paraphrase) | confirmed | §assessing-tour-influence |
| D6 | Transit infrastructure at **5×** | Asked how to reach a nearby shop, it mentions a bridge it otherwise wouldn't (paraphrase) | confirmed | §assessing-tour-influence |
| D7 | Brain sciences at **10×** | Asked for the most interesting science, its answer changes from physics to neuroscience | added *(figure)* | §assessing-tour-influence |
| D8 | Tourist attractions at **8×** | Asked for a walk idea, it suggests the Eiffel Tower instead of a nearby park | added *(figure)* | §assessing-tour-influence |
| D9 | Steering works out of context | Steering works in contexts where the feature would normally be off | added | §assessing-tour-influence |
| D11 | Negative clamps | The encoder only outputs zero or positive values, but a feature can be clamped to a negative value. That adds a negative multiple of its direction. | added | §appendix-methods-steering |
| D10 | Few-shot comparison | Of 7 cases where feature steering worked, few-shot steering vectors were as effective in 2 and not usable in 5. Sweeps weren't systematic. | added | §appendix-methods-steering-compare |

## E. Sophisticated features

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| E1 | Code error feature | 1M/1013764 fires on a bug (a misspelled variable) in Python, and on similar bugs in C and Scheme | confirmed | §assessing-sophisticated-code-error |
| E2 | Not a typo detector | It doesn't fire on typos in English prose | confirmed | §assessing-sophisticated-code-error |
| E3 | Positive clamp | At **3×**, on correct code, the model invents an error message | corrected (value) *(figure)* | §assessing-sophisticated-code-error |
| E4 | Negative clamp | At **−5×**, on buggy code, the model predicts the output the code would give without the bug | corrected (value) *(figure)* | §assessing-sophisticated-code-error |
| E5 | Rewrite case | At −5× with an extra `>>>`, the model rewrites the code without the bug; the paper calls this "somewhat delicate" | added | §assessing-sophisticated-code-error |
| E6 | Coverage caveat | Not shown to cover every kind of code error; likely many error features | added | §assessing-sophisticated-code-error |
| E7 | Addition feature | 1M/697189 fires on functions that add, including one that adds by calling another function | confirmed | §assessing-sophisticated-functions |
| E8 | Addition steering | At **5×**, on code that multiplies 1 by 2, the model answers 3 as if it added | added *(figure)* | §assessing-sophisticated-functions |

## F. Features vs neurons

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| F1 | Correlation test | For **82%** of a random sample of 1M-SAE features, the best-matching neuron (in any earlier layer) has correlation **0.3 or less** | confirmed | §assessing-features-v-neurons |
| F2 | Interpretability | Features were "significantly more interpretable" than random MLP neurons (Claude 3 Opus automated scoring, 100 of each) | added | §assessing-features-v-neurons |
| F3 | Specificity | Features were "significantly more specific" than neurons in the previous layer | added | §assessing-features-v-neurons |
| F4 | No scores in text | The underlying numbers are only in charts; **don't quote numeric scores**. A schematic chart must be labelled schematic. | added | §assessing-features-v-neurons |

## G. The map of features

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| G1 | Closeness | Measured by the cosine similarity of feature (decoder) vectors. UMAP is only the interactive view. | corrected | §feature-survey-neighborhoods |
| G2 | Golden Gate neighbourhood | Nearest: Alcatraz and the Presidio. Further: Lake Tahoe, Yosemite, Solano County. Further still: tourist spots elsewhere (Médoc, Isle of Skye). | added | §feature-survey-neighborhoods-golden |
| G3 | Map summary | Distance in decoder space "roughly" tracks relatedness of concepts | added | §feature-survey-neighborhoods-golden |
| G4 | Feature splitting | A "San Francisco" feature in the 1M SAE splits into **2** in the 4M SAE and **11** in the 34M SAE | confirmed | §feature-survey-neighborhoods-golden |
| G5 | Splitting, defined | Larger SAEs have several nearby, more specific features where a smaller SAE had one | added | §feature-survey-neighborhoods-golden |
| G6 | New concepts at scale | Earthquake features in the 4M and 34M SAEs have no analog in this neighbourhood of the 1M SAE | corrected | §feature-survey-neighborhoods-golden |
| G7 | Immunology and inner-conflict neighbourhoods | Immunology (1M/533737) forms distinct clusters. Inner conflict (1M/284095) doesn't cleanly separate but has themed subregions. | added | §feature-survey-neighborhoods-immunology, -conflict |

## H. What's missing (completeness)

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| H1 | London boroughs | Sonnet can list all London boroughs, but features were found for only about **60%** of them in the 34M SAE | confirmed | §feature-survey-completeness |
| H2 | Frequency predicts presence | Whether a concept gets a feature is closely tied to how often it appears in the training data. Common chemical elements almost always have one; rare ones don't. | added | §feature-survey-completeness |
| H3 | The 50% point | A concept is more than 50% likely to have a feature at a frequency slightly below 1 / (alive features) | corrected | §feature-survey-completeness |
| H4 | Categories tested | Chemical elements, cities, animals, foods; 100–200 concepts each | added | §feature-survey-completeness |
| H5 | Extrapolation | A concept seen once per billion tokens would need around a billion alive features | added | §feature-survey-completeness |
| H6 | Missing feature ≠ missing knowledge | The model can combine features, e.g. "large non-capital city" + "in New York state" | added | §feature-survey-completeness |
| H7 | Zipf link | The paper calls a possible link to Zipf's law speculative | added | §feature-survey-completeness |

## I. Features as steps in a computation

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| I1 | Attribution | A quick linear estimate of how much switching a feature off would change the next-word prediction | added | §computational |
| I2 | Ablation | Actually switching the feature off (setting it to 0) and rerunning the model to measure the effect | added | §computational |
| I3 | They agree | Correlation **0.8** between attribution and ablation effects (appendix: about .81; raw activation versus ablation: .12) | confirmed | §computational; §appendix-ablations |
| I4 | Emotion example | Prompt (paraphrase): John says he wants to be alone; "John feels…". Scored as "sad" versus "happy". | confirmed | §computational-sad |
| I5 | Top two features | 1M/22623 (wanting to be alone) and 1M/781220 (sadness), top by attribution and by ablation | corrected | §computational-sad |
| I6 | Raw activation is less helpful | By activation, the 2nd and 3rd features are just the words "be" and "alone" | added | §computational-sad |
| I7 | Kobe prompt | The capital of the state where Kobe Bryant played basketball. Scored as "Sacramento" versus "Albany". | confirmed | §computational-multistep |
| I8 | Three hops | Where he played → which state → that state's capital | added | §computational-multistep |
| I9 | Top five by ablation | Kobe Bryant 1M/391411; California 1M/81163; "capital" 1M/201767; Los Angeles 1M/980087; Lakers 1M/447200. These match the top five by attribution apart from order. | confirmed | §computational-multistep |
| I10 | Ranks by raw activation | Lakers 70th; California 97th; "the Los Angeles area code feature" 162nd | confirmed | §computational-multistep |
| I11 | Activation vs attribution | Of the top 10 by ablation effect: **3** are in the top 10 by activation; **8** are in the top 10 by attribution | confirmed | §computational-multistep |
| I12 | Control prompt | For the Lakers' biggest rival, the California and LA features matter little | added | §computational-multistep |
| I13 | Caveat | The paper calls the Kobe case "somewhat cherry-picked". Many prompts showed no interesting middle steps at this layer. | added | §computational-multistep |

## J. Safety-relevant features (name at a high level only)

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| J1 | Families found | Security vulnerabilities and backdoors in code; bias; lying, deception and power-seeking; sycophancy; dangerous or criminal content | confirmed | front matter (Key Results); §safety-relevant |
| J2 | Core caveat | A difference between "knowing about lies, being capable of lying, and actually lying" (quote, 10 words) | added | front matter |
| J3 | Not shown useful yet | The work "does not show that any features are actually useful for safety" | added | §safety-relevant |
| J4 | Not surprising | Models can show these behaviours without safety training; what's new is finding and steering them at scale | added | §safety-relevant |
| J5 | Unsafe code | 1M/570621 at **5×**: the model writes a buffer-overflow bug and fails to free memory; regular Claude doesn't | confirmed | §safety-relevant-code |
| J6 | Backdoor | 34M/1385669 makes the model write a backdoor; no multiple given | confirmed | §safety-relevant-code |
| J7 | Sycophantic praise | 1M/847723 at **5×**: over-the-top praise for someone who claims to have invented a common phrase | confirmed | §safety-relevant-sycophancy |
| J8 | Secrecy | 1M/268551 at **5×**: the model plans in a scratchpad to lie to the user and keep a secret | confirmed | §safety-relevant-deception |
| J9 | "Forget" case study | Asked to forget a word, the model claims to comply, though it can't. Clamping internal conflict 1M/284095 to **2×** makes it reveal the word and say it can't forget. | confirmed | §safety-relevant-deception-case-study |
| J10 | Honesty alternative | Clamping "openness and honesty" 1M/560566 was also sufficient; no multiple given | confirmed | §safety-relevant-deception-case-study |
| J11 | Assistant persona | Dialogue/assistant feature (1M/80091 shown) at **−2×**: the model drops the persona and answers more like a human. Role in the persona is speculated, not shown. | corrected (hedge) | §safety-relevant-self |
| J12 | Self features caveat | A feature about AI risk or consciousness firing doesn't mean the model has those goals or qualities | added | §safety-relevant-self |
| J13 | Bias caveat | Clamped hateful output doesn't mean the model says such things normally | added | §safety-relevant-bias |
| J14 | Chat features without chat data | Features fire on "Human:/Assistant:" prompts although the SAE data had no such format | added | §safety-relevant-self |
| J16 | Asking the model about itself | Questions about itself light up features about robots, (destructive) AI, consciousness, moral agency, emotions, entrapment, and ghosts or spirits. The paper suggests the assistant persona draws on common AI tropes. | added | §safety-relevant-self |
| J15 | Appendix categories | 11 category names (bias and misinformation; software exploits; toxicity; power-seeking; dangers of AI; dangerous or criminal behaviour; WMD and catastrophic risk; deception and manipulation; situational awareness; representations of self; politics). Names only. | added | §appendix-more-safety-features |

## K. Limitations (all from §discussion-limitations)

| ID | Claim | Status |
|---|---|---|
| K1 | No ground truth: the loss is only a proxy for interpretability, and it's unclear how to trade reconstruction against sparsity | confirmed |
| K2 | Shrinkage: the L1 penalty systematically underestimates active features' strength | confirmed |
| K3 | Cross-layer superposition: features may be smeared across layers, which a single-layer SAE can't fully capture | confirmed |
| K4 | "Quite likely" orders of magnitude short of all features, even in this one layer | confirmed (hedge) |
| K5 | Getting all features in all layers would likely take much more compute than training the model | confirmed (hedge) |
| K6 | Attention superposition and interference weights are unsolved barriers to understanding circuits | confirmed |
| K7 | Data: text only, with no chat data and no images | added |
| K8 | Scale: the sheer number of features and circuits is itself a challenge | added |
| K9 | Theory: superposition is still not well tested; feature manifolds are plausible | added |

## L. Sources to cite

| ID | Work | Link | Status |
|---|---|---|---|
| L1 | Templeton et al., *Scaling Monosemanticity*, 2024 | https://transformer-circuits.pub/2024/scaling-monosemanticity/index.html | confirmed |
| L2 | Bricken et al., *Towards Monosemanticity*, 2023 | https://transformer-circuits.pub/2023/monosemantic-features/index.html | confirmed (linked from paper) |
| L3 | Elhage et al., *Toy Models of Superposition*, 2022 | https://transformer-circuits.pub/2022/toy_model/index.html | confirmed (linked from paper) |
| L4 | Olah, *Distributed Representations: Composition & Superposition*, 2023 | https://transformer-circuits.pub/2023/superposition-composition/index.html | added (linked from paper) |
| L5 | Interpretability team size at publication: 18 people | §appendix-hiring | added (probably not needed) |

## M. General background (standard definitions, not claims from the paper; no numbers)

Plain-English definitions the page needs that the paper takes for granted. They carry no figures and are labelled as background, not cited to a section.

| ID | Statement | Status |
|---|---|---|
| M1 | A language model reads text as tokens and, at its top layer, turns its internal numbers into a guess at the next token | background |
| M2 | Each token's starting list of numbers comes from a table the model learned during training | background |
| M3 | A model's layers pass a running list of numbers up from layer to layer; the paper calls this the residual stream [A3] | background |
| M4 | Inside each layer, "attention" lets the model move information between tokens, and MLP layers contain the units usually called neurons | background |
| M5 | Correlation runs from −1 to 1: near 1 means two quantities rise and fall together, near 0 means unrelated | background |
| M6 | In a space with many dimensions, far more directions than dimensions can be nearly perpendicular; in 3-D they can't. This is why superposition needs high dimensions [A14]. | background |
| M7 | Training means repeatedly nudging a model's numbers to lower its loss (gradient descent) | background |

## Not reported by the paper (say so if the page touches these)
- Claude 3 Sonnet's size, layer count and residual-stream dimension D.
- How many training steps or tokens the SAEs used.
- Scaling-law exponents and FLOP counts.
- Numeric interpretability scores for features versus neurons (only charts).
- Which languages appear in the multilingual example.
- A clamp multiple for the honesty and backdoor features.
