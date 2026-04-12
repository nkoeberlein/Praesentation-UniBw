# UniBw Quarto Präsentationsvorlage

Quarto Revealjs presentation template in the corporate design of Universität der Bundeswehr München.
Target: 1920×1080 Revealjs slides, embedded as self-contained HTML.

## Build commands

```bash
quarto render presentation-UniBw.qmd   # → presentation-UniBw.html (gitignored)
quarto preview presentation-UniBw.qmd  # live preview with hot reload
quarto render presentation-UniBw.qmd --to pdf
```

## Key files

| File | Role |
|------|------|
| `presentation-UniBw.qmd` | Presentation content + YAML metadata (edit this to customize slides) |
| `_quarto.yml` | Project-level config (`title: "UniBw Präsentation"`, `type: default`) |
| `scss/ubw-theme.scss` | SCSS entry point — color/font variables + `@import` of partials |
| `scss/_*.scss` | SCSS partials (animations, slides, chrome, typography, elements, end-slide) |
| `includes/header-footer.html` | JavaScript that reads YAML `<meta>` tags and injects `.ubw-header` / `.ubw-footer` divs into each slide at runtime |
| `includes/sequential-hash.html` | JavaScript that overrides Revealjs's 2D hash (`/h/v`) with sequential numbering (`#/N`). Required because `hash: false` + `history: false` disable Revealjs's own URL management. |
| `assets/` | Images and logos used in slides |
| `bibliography/` | BibTeX references |

## Patterns

- **SCSS variables** are defined once in `ubw-theme.scss` (`/*-- scss:defaults --*/`).
  All partials imported in `/*-- scss:rules --*/` inherit those variables via `@import` (not `@use`).
- **Metadata** flows: YAML frontmatter → `<meta>` tags (via `header-includes`) → JS in `header-footer.html` → DOM.
- **Section dividers** use `# Title {data-background-color="#2A3D7A"}` syntax.
- **End slide** uses `## {.end-slide data-background-color="..."}` with `.profile-photo` and `.steckbrief` divs populated by JS.
- **URL hash** is managed entirely by `includes/sequential-hash.html` (not Revealjs). The YAML sets `hash: false` and `history: false` to prevent conflicts. Browser back/forward and deep-links to `#/N` work via a `popstate` listener and a `slideMap` lookup table built at `ready` time.
- Generated build artifacts (`*.html`, `*.pdf`, `.quarto/`) are gitignored.

## Gotchas

- `header-footer.html` contains an inlined Base64 SVG for the UniBw signet — do not open in a text editor without line-wrap, it will appear huge.
- `quarto render` requires Quarto CLI to be installed (`quarto.org`).
- The CSL style is fetched from a Zotero URL at render time — needs internet access for first render.
- `hash: false` + `history: false` in the YAML are intentional — removing them breaks sequential URL numbering because Revealjs's `writeURL()` overwrites the hash after every `slidechanged` event.
