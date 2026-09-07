---
title: "Stark Architecture Snapshot — September 2026"
date: "2026-09-07"
category: "Architecture"
status: "Current"
summary: "How Founder V0 fits into the local-first digital-being design: neural language substrate, recurrent memory, cells, routing, long-term memory and governed action."
---

# Stark Architecture Snapshot — September 2026

Stark is being built as a **local-first digital being** rather than a single chat model. The September milestone adds something the earlier architecture did not yet have: a Stark-native neural language substrate trained from random initialization and frozen as a measurable control.

## Current layers

```text
Founder V0
  language substrate
  11.54M parameters
  1024-token physical window
        ↓
M8 Working Memory
  persistent state across chunks
  topic/state reactivation
        ↓
Cells + Routing
  specialized narrow capabilities
  heterogeneous sequence mechanisms
        ↓
Long-term Memory
  episodic / semantic / retrieval
  provenance and authority
  sleep consolidation
        ↓
Governed Action
  host permissions
  single-action gate
  audit / rollback / shutdown
```

Founder is therefore **an organ, not the organism**.

## Why multiple mechanisms can coexist

The long-term Stark design does not require one sequence architecture to solve every problem. Different cells or routed blocks may eventually use different techniques: exact local attention where token fidelity matters, recurrent state where continuity matters, state-space processing where long streams matter, retrieval where sparse historical facts matter, and learned memory where compression is useful.

The constraint is experimental discipline: do not add every mechanism simultaneously and then guess which one helped.

## Context activation instead of infinite replay

A digital being does not need to keep its entire lifetime token history in one attention matrix. A more useful target is selective state activation:

- current topic and goals active;
- relevant memories retrieved or reactivated;
- unrelated domains dormant;
- recent raw conversation available when needed;
- durable facts separated from uncertain episodic memory;
- conflicts surfaced rather than silently merged.

M7 showed why this matters. Founder V0 technically supports 1,024-token attention, but exact recall is at chance in the first controlled memory benchmark. M8 turns memory into an explicit architectural target.

## Native and cell-based direction

The broader Stark project already explores native continuous state, bounded governance, deterministic contracts and specialized cells. Founder V0 does not replace those ideas. It gives them a language substrate and a quantitative baseline.

The target is not “make the transformer bigger forever.” The target is a system where language, memory, state, cells and action are separable enough to evolve independently while still forming one continuous being.

## Governance remains non-negotiable

Persistent memory and continual learning increase capability but also increase risk. Stark therefore keeps host authority, shutdown/rollback, explainability, recoverability and permission boundaries as architectural constraints rather than optional user-interface features.

The design goal is progressive growth under explicit governance—not uncontrolled self-modification.

## Current research priority

**M8 — Working Memory & Recurrent Context** is active.

The immediate goal is deliberately narrow: beat the frozen Founder V0 context-recall baseline while preserving its held-out language performance. Only then should cells, long-term retrieval and more aggressive continual learning be layered on top.
