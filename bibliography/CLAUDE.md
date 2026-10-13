# bibliography/

BibTeX references for the presentation.

## Files

| File | Purpose |
|------|---------|
| `references.bib` | BibTeX database with all cited works |

## Patterns

- Citation style: IEEE (loaded via Zotero CDN URL in the .qmd YAML: `csl: https://www.zotero.org/styles/ieee`)
- Cite in slides: `[@bibtex-key]` for inline citation, rendered by Pandoc citeproc
- With `bibliography:` set, `ubw.lua` appends a references slide before the end slide. A deck that
  places `::: {#refs}` itself (as `demo.qmd` does, to add the copyright box) keeps its own slide.
- A source line on a slide can cite too: `## Title {source="nach [@kay1984]"}`
- Add new entries directly to `references.bib` in standard BibTeX format

## Gotchas

- The CSL file is fetched from the internet at render time. Quarto caches it in `.quarto/` after first download.
- Keys used in `demo.qmd` (`@kay1984`, `@autor2024`, `@autor2025`) are placeholder stubs.
- This folder is not copied by `quarto use template` (see `.quartoignore`); a new deck brings its own `.bib`.
