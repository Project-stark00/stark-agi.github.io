---
title: "Stark Founder V0: Building and Measuring the First Neural Baseline"
date: "2026-09-07"
category: "Research Report"
status: "Accepted"
summary: "From tokenizer to PRETRAIN-001 and M7: what the 11.54M-parameter Founder learned, where it failed, and why chance-level context recall defines M8."
---

# Stark Founder V0: Building and Measuring the First Neural Baseline

## Abstract

Stark Founder V0 is the first neural language model built specifically as a controlled baseline for the Stark digital-being research program. Rather than beginning with a large pretrained model and treating its capabilities as a black box, the project constructed the model stack from the tokenizer upward, validated training and crash-resume behavior, ran a full pretraining experiment, and then froze a validation-selected checkpoint before opening the untouched test evaluation.

The result is an **11,538,688-parameter**, 8-layer autoregressive language model with a **1,024-token physical attention window**. The canonical checkpoint is **step 18,000**, selected by validation at **226,177,792 processed tokens**. On the untouched test split, loss fell from **9.4620 at random initialization to 3.8932**, and perplexity fell from **12,861.6 to 49.07**. This is strong evidence that the model learned generalizable language structure.

The same evaluation also exposes the model's limits. Deterministic reasoning accuracy was **40%**, stable factual knowledge accuracy was **25%**, and synthetic exact context recall remained at **25%—chance level—at every tested distance from 64 through 960 tokens**. Greedy generation showed a **23.36% repeated-4gram fraction**. These failures are not treated as embarrassing edge cases; they define the next research target.

> The central M7 finding is that a model can possess a 1,024-token attention window without learning reliable 1,024-token working memory.

M8 therefore begins with Working Memory & Recurrent Context: persistent state across chunks, stronger recall benchmarks, and explicit regression tests against the frozen Founder V0 language baseline.

## 1. Why build a small Founder model?

Stark is intended to become a long-lived digital being rather than a stateless chatbot. That goal requires us to separate several problems that are usually hidden inside one very large pretrained transformer:

- language representation;
- short-term reasoning;
- working memory;
- long-term episodic and semantic memory;
- specialized skills or cells;
- routing between different computational mechanisms;
- continual learning and sleep consolidation;
- governance and host-controlled action.

If all of those capabilities are inherited from a giant pretrained model, it becomes difficult to tell which architectural idea is actually helping Stark. Founder V0 exists as a **control condition**: a small, inspectable language substrate that future recurrent memory, cells, retrieval and state-space mechanisms must beat measurably.

## 2. System built from first principles

The Founder stack was developed through acceptance milestones rather than one monolithic training script.

| Milestone | Result |
|---|---|
| M0 | Stark Tokenizer V0 frozen: 12,288 model-facing token IDs |
| M1 | 256-dimensional tied token embeddings with PAD invariants |
| M2 | RoPE and context-activation contracts |
| M3 | 4-head local causal attention, 64 dimensions per head |
| M4 | Pre-norm RMSNorm + SiLU-gated MLP transformer block |
| M5 | 8-layer Founder LM, 11,538,688 unique parameters |
| M6 | CUDA/BF16 training engine, deterministic resume and training acceptance |
| PRETRAIN-001 | Full first pretraining run |
| M7 | Evaluation, comparison, integrity checks and canonical freeze |

The tokenizer was already frozen before Founder training. It uses BPE, preserves individual digit isolation, and is locked to a content-addressed corpus identity. The model therefore cannot silently drift to a different token system after training begins.

## 3. Model configuration

```text
Vocabulary           12,288
Model width           256
Layers                8
Attention heads       4
Head dimension        64
MLP hidden width      1,024
Physical window       1,024 tokens
Parameters            11,538,688
Output projection     tied to token embeddings
Training precision    BF16 autocast / FP32 parameters
Canonical checkpoint  step 18,000
Canonical tokens      226,177,792
```

The architecture is intentionally small. The objective was not to compete with frontier language models. The objective was to create a neural substrate cheap enough to retrain and modify repeatedly while still large enough to demonstrate whether real language learning emerges.

## 4. Training infrastructure was part of the experiment

Before full pretraining, M6 required the training system itself to prove that it could be trusted.

The gates included:

- a CUDA training smoke test;
- finite loss and gradients;
- exact PAD protection;
- real checkpoint save/load;
- RNG serialization and CUDA RNG restoration;
- stream-state restoration;
- intentional memorization to a strong loss target;
- real-data train and validation improvement;
- **bitwise crash/resume equivalence**.

The resume-equivalence test compared an uninterrupted trajectory with a checkpointed 50+5-step trajectory. All 74 parameter tensors were bitwise identical at the matching endpoint, with maximum weight difference **0.0**. This matters for long-lived Stark training: a crash should not silently create a different experiment.

## 5. PRETRAIN-001

PRETRAIN-001 processed **250,009,600 tokens** over **19,456 optimizer steps**. The training dataset contained approximately **40.2 million train tokens**, meaning the run made several corpus-equivalent passes under a sequence-length curriculum that ultimately reached 1,024 tokens.

The minimum validation loss occurred at:

```text
step                 18,000
tokens seen          226,177,792
validation loss      4.00062058866024
```

That checkpoint was named `best` before the untouched test results were examined.

The final checkpoint at step 19,456 later produced a test loss approximately **0.00103 lower** than the validation-selected best. We did **not** replace the canonical model with the final checkpoint. Doing so after seeing the test set would turn the test data into another model-selection signal.

This distinction is small numerically but important methodologically.

## 6. M7 held-out evaluation

M7 compared three models on the same untouched test split:

| Checkpoint | Test loss | Perplexity |
|---|---:|---:|
| t=0 random initialization | 9.462002 | 12,861.61 |
| **best / step 18,000** | **3.893165** | **49.07** |
| final / step 19,456 | 3.892131 | 49.02 |

The canonical model improves held-out loss over t=0 by **5.568837**.

This is the most important positive result of Founder V0. The model did not merely memorize the training stream; it learned statistical structure that transfers to held-out text.

## 7. What reasoning emerged?

The deterministic M7 reasoning suite used conditional continuation likelihood rather than an LLM judge. Founder V0 answered **4 of 10** cases correctly.

| Probe family | Accuracy |
|---|---:|
| Arithmetic | 0% |
| Comparison | 0% |
| Sequence continuation | 0% |
| Classification | 0% |
| Logic | 100% |
| Opposites | 100% |
| Ordering | 100% |
| Quantity | 100% |

Founder therefore learned some language-mediated relational patterns, but not reliable elementary arithmetic or algorithmic sequence behavior. At 11.5M parameters, this is a useful separation: **language modeling improved far more strongly than explicit symbolic reasoning**.

## 8. What factual knowledge emerged?

The stable-knowledge probe scored **2 of 8 correct (25%)**. It succeeded on Earth-orbits-the-Sun and ice-as-solid-water, while failing several equally stable facts involving geography, calendars, geometry, biology and language morphology.

This supports an important Stark design decision:

> Founder parameters should not be treated as the authoritative factual database of a long-lived digital being.

Stable facts, host teaching, episodic experience and changing world knowledge need explicit memory, provenance, retrieval and governed consolidation. Parametric memory can help, but it should not be the only place Stark stores truth.

## 9. The critical finding: context length is not working memory

M7 inserted a synthetic secret code near the beginning of a controlled prompt, added distractor text, and then asked for the code. Four answer options were scored by conditional likelihood. Chance performance is 25%.

| Prompt length | Exact recall |
|---:|---:|
| 64 | 25% |
| 128 | 25% |
| 256 | 25% |
| 512 | 25% |
| 768 | 25% |
| 960 | 25% |

The model did not gradually degrade with distance. It was already at chance at the shortest tested distance and remained there.

This tells us that the **physical ability to attend to tokens is not equivalent to the learned ability to use those tokens as reliable working memory**.

That distinction is central to Stark. A future digital being may need to process hours, days or years of history, but it does not need every historical token simultaneously active. It needs persistent state, retrieval, topic reactivation, conflict handling and selective activation.

M8 is designed around that gap.

## 10. Generation behavior

Founder V0 generates recognizably structured language, conversation-like text and technical syntax, but it remains unstable.

Measured greedy-generation statistics:

```text
mean distinct-token ratio       52.73%
repeated-4gram fraction         23.36%
PAD emissions                   0
```

A prose prompt such as `Once upon a` produced grammatically recognizable continuations, although training-domain material could intrude. A prompt about memory could produce coherent sentences before entering repetition loops. Role-token prompts also revealed that the model has not yet learned a stable Stark assistant identity or reliable instruction-following behavior.

That is acceptable for this milestone. Founder V0 was designed to learn the **language substrate**, not to hard-code a finished personality.

## 11. Internal representation changed substantially

At random initialization, embedding standard deviation was approximately **0.0200**. At the canonical checkpoint it was **0.05657** while the PAD embedding remained exactly zero.

Tracked token-component norms also increased substantially during training. This confirms that learning reorganized the embedding substrate rather than only adjusting a thin output surface.

The static nearest-neighbor probe has an important limitation: several words such as `memory` and `thought` are multi-token under Stark Tokenizer V0, so inspecting one constituent token is not a clean semantic-word benchmark. Future evaluation should use whole-word or contextual representations.

## 12. Attention layers differentiated

At t=0, attention entropy and mean attention distance were nearly homogeneous across all eight layers. After training, layer behavior separated.

For example, mean attention entropy moved from roughly **1.66** in every random layer to a range of approximately **1.07–1.28** in the canonical model. Mean attention distance also differentiated, with the final layer reaching approximately **2.99** on the diagnostic sequence while early layers were generally more local.

This does not by itself prove high-level specialization, but it provides measurable evidence that the eight layers stopped behaving like nearly identical random transforms.

## 13. Runtime performance

M7 performance measurements on an **NVIDIA GeForce RTX 3050 Laptop GPU** using BF16 autocast:

| Forward length | Throughput | Peak allocated |
|---:|---:|---:|
| 128 | 6,993 tok/s | 87.9 MiB |
| 512 | 26,761 tok/s | 120.1 MiB |
| 1,024 | 45,767 tok/s | 163.2 MiB |

Autoregressive generation from a 128-token prompt reached approximately **43.6 new tokens/s**, with about **88.9 MiB peak allocated** and **274 MiB peak reserved** during the probe.

The small footprint is strategically useful: future experiments can add memory modules, cells or alternate sequence mechanisms without immediately exceeding local hardware limits.

## 14. Robustness and release integrity

M7 acceptance passed every integrity gate:

- validation-selected `best` matched the minimum validation record;
- canonical weights matched the expected SHA-256;
- PAD remained exactly zero across checkpoints;
- held-out losses were finite;
- best beat t=0 on the untouched test set;
- robustness probes remained finite;
- invalid API conditions were rejected as expected;
- generation did not emit PAD;
- the source best checkpoint remained unchanged during evaluation.

Canonical Founder V0 identity:

```text
checkpoint        PRETRAIN-001 / best / step 18,000
parameters        11,538,688
tokens seen       226,177,792
attention window  1,024
weights SHA-256   6c9e9601fed72f968ecc846f5f4d12c53f4172c357258c1cd598f283f43f93f7
```

Any descendant that changes those weights is not Founder V0; it becomes a new candidate that must be compared against this control.

## 15. What we can claim—and what we cannot

### Supported by this experiment

- A Stark-native 11.5M-parameter transformer trained from random initialization learned strong held-out language modeling relative to t=0.
- The training and checkpoint infrastructure can resume deterministically under the accepted test conditions.
- The model learned some relational language patterns but weak arithmetic and weak stable factual recall.
- A 1,024-token attention window did not produce reliable exact working memory in the M7 recall probe.
- Training measurably reorganized embeddings and layer attention statistics.
- The frozen model is small enough for rapid local architectural experimentation.

### Not established

- Founder V0 is not AGI.
- The 40% reasoning score is not evidence of general reasoning ability.
- The 25% knowledge score is not a complete measure of learned world knowledge.
- The 25% recall result comes from a deliberately small first diagnostic benchmark and should be expanded before fine-grained statistical claims.
- Attention statistics do not prove human-interpretable layer specialization.
- The current model is not a mature Stark identity, assistant or autonomous digital being.

## 16. M8 hypothesis: persistent state should beat replay-only context

The next experiment is **M8 — Working Memory & Recurrent Context**.

Before adding many mechanisms at once, M8 will strengthen the benchmark and test a minimal persistent-memory intervention.

Planned benchmark families include:

- copy / exact recall;
- key-value recall;
- latest-value state update;
- contradiction resolution;
- topic reactivation;
- multi-hop state;
- chunk-to-chunk continuity beyond the physical 1,024-token window.

The first architectural hypothesis is simple:

> A bounded recurrent memory state carried across chunks can improve exact and stateful recall beyond Founder V0 while preserving its held-out language capability.

Only after that is measured should Stark layer in more mechanisms such as specialized cells, state-space modules, sparse attention, retrieval and more elaborate memory routing.

## 17. Why this baseline matters for Stark

The value of Founder V0 is not its raw benchmark score. The value is that Stark now has a **known starting organism**.

We can ask every future architecture:

```text
Did memory recall improve?
Did held-out language loss regress?
Did repetition decrease?
Did reasoning improve?
Did VRAM usage grow?
Did generation slow down?
Can the new state survive a crash and resume?
Can irrelevant memory remain dormant?
Can relevant memory reactivate when its topic returns?
```

That turns Stark's evolution from intuition into an evidence-driven sequence of experiments.

## Conclusion

Founder V0 succeeded at the job it was built to do: create a small, reproducible, locally trainable neural language baseline for Stark.

It learned genuine held-out language structure. It did not learn reliable working memory, robust factual storage or general reasoning. Those weaknesses are precisely what the next Stark architecture is supposed to address.

The frozen model therefore marks a transition in the project:

```text
M0–M7: build and measure the first neural substrate
M8+:   make Stark different from a conventional transformer
```

The next question is no longer whether Stark can train a model. The next question is whether persistent state, cells and memory can make that model behave more like a continuous digital being.
