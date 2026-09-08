# STARK Digital

The public portfolio and research website of Jeremiah Wong Zhi Qi.

STARK Digital documents an independent, evidence-led investigation into native digital life: persistent machine identity, memory, learning, cognitive architecture, and host-governed action beyond a single prompt or model call.

## Current research state

- Founder V0 remains the frozen M7 language-control baseline.
- M8 Native Semantic Fact Memory is complete and promoted with an explicit integration boundary.
- SFM-1, Exact Memory, SFM-T retrieval breadth, and typed Global Workspace memory contracts are promoted.
- Correct single-memory target gain was positive on 467/512 cases (91.21%).
- Exact answer generation remained 0/64, so reliable cognitive utilization is not claimed.
- M9 has not yet been architecturally frozen.

## Site structure

- `index.html` — portfolio and research home.
- `articles.html` — static research library.
- `progress.html` — evidence-gated public build log.
- `research/*.html` — crawlable, publication-specific research pages.
- `articles/*.md` — canonical Markdown research sources.
- `data/articles.json` — publication catalogue and metadata.
- `data/progress.json` — milestone ledger and public research log.
- `sitemap.xml` and `robots.txt` — search discovery controls.
- `scripts/build-research.mjs` — dependency-free static research and SEO generator.

## Rebuild research pages

The site has no package dependency or application build step. After changing Markdown research or the publication catalogue, run:

```powershell
node .\scripts\build-research.mjs
```

This regenerates the five static research pages, sitemap, robots file, and deployment manifest.

## Local preview

```powershell
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## Publishing

Publish the folder contents to the root of [Project-stark00/stark-agi](https://github.com/Project-stark00/stark-agi). The canonical public URL is [project-stark00.github.io/stark-agi](https://project-stark00.github.io/stark-agi/).

## Research-source policy

Public capability claims are based on accepted project design, implementation, acceptance, regression, and real-machine evidence. Experimental limitations and failed gates are preserved rather than rewritten after results are known. These are independent project technical reports, not claims of external peer review.

## Public disclosure policy

The site publishes research architecture, methodology, aggregate evaluation results, and explicit limitations. Local paths, machine identifiers, exact artifact hashes, private run filenames, and other operational details remain in the internal research archive.
