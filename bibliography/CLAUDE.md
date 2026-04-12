# bibliography/

BibTeX references for the presentation.

## Files

| File | Purpose |
|------|---------|
| `references.bib` | BibTeX database with all cited works |

## Patterns

- Citation style: IEEE (loaded via Zotero CDN URL in the .qmd YAML: `csl: https://www.zotero.org/styles/ieee`)
- Cite in slides: `[@bibtex-key]` for inline citation, rendered by Pandoc citeproc
- References slide uses `{#refs}` div inside a `.smaller` slide
- Add new entries directly to `references.bib` in standard BibTeX format

## Gotchas

- The CSL file is fetched from the internet at render time. Quarto caches it in `.quarto/` after first download.
- Keys used in the template (`@kay1984`, `@autor2024`, `@autor2025`) are placeholder stubs — replace with real citations before presenting.
