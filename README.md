# StarkAGI Public Website — September 2026

Static website package for the public StarkAGI research page.

## Current public milestone

- Stark Founder V0 is frozen after M7 acceptance.
- Canonical checkpoint: PRETRAIN-001 step 18,000.
- Parameters: 11,538,688.
- Held-out test loss: 3.893165.
- Held-out perplexity: 49.07.
- M8 Working Memory & Recurrent Context is active.

## Files

```text
index.html
progress.html
articles.html
css/style.css
js/app.js
js/progress.js
js/articles.js
data/progress.json
data/articles.json
articles/*.md
```

There is no build step and no external JavaScript dependency.

## Preview

Do not open the JSON/Markdown pages directly with `file://`; browser security may block `fetch()`.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Publish

Upload the contents of this folder to the root of `https://github.com/Project-stark00/stark-agi` and enable GitHub Pages for the main branch/root directory.

## Research source

The September Founder V0 article is based on the accepted PRETRAIN-001/M7 artifacts supplied during the research session. Capability scores are published as baseline measurements rather than retroactive pass thresholds.
