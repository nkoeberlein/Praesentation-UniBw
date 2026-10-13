# UniBw Quarto Präsentationsvorlage

Quarto format extension `unibw-revealjs`: Revealjs slides in the corporate design of Universität der
Bundeswehr München. Target: 1920×1080 canvas, one self-contained HTML file per deck.
The goal of the template is that a deck is written in plain Markdown and needs no manual layout work.

## Commands

```bash
make render DECK=demo     # quarto render demo.qmd → demo.html (gitignored)
make preview DECK=demo    # live preview
make pdf DECK=demo        # one PDF page per slide, via headless Chrome
make test                 # renders demo + test decks and checks the layout rules
```

## Key files

| Path | Role |
|------|------|
| `_extensions/unibw/` | The format itself — see its CLAUDE.md. Everything a deck needs ships from here. |
| `template.qmd` | Starter copied by `quarto use template`. Keep it minimal. |
| `demo.qmd` | Shows every supported element; also the main deck for `make test`. |
| `_quarto.yml` | Project metadata: the speaker's personal fields, shared by all decks in the folder. |
| `tests/` | Layout checks in headless Chrome and two fixture decks. |
| `.quartoignore` | Files `quarto use template` must not copy into a new deck. |

## Patterns

- A deck sets `format: unibw-revealjs` and a few YAML keys. All Revealjs options, the institute defaults
  and the option defaults live in `_extensions/unibw/_extension.yml`.
- Anything repetitive belongs in the Lua filter (`ubw.lua`), not in the deck: divider colors, end slide,
  references slide, source lines.
- Every YAML field is optional. New fields must be read with `M.text()` / `M.flag()` from `ubw_meta.lua`,
  which return `nil` for missing or empty values.
- After any change to the extension run `make test`. When adding an element type, add a slide to
  `demo.qmd`; when fixing a layout bug, add the failing case to `tests/fixture.qmd`.

## Gotchas

- Write `date:` in ISO form (`2026-04-01`). Quarto reads `01.04.2026` as month.day and shows 04.01.2026.
- `hash: false` + `history: false` are intentional — `includes/sequential-hash.html` owns the URL.
- Slide PDFs come from Chrome's print view (`?print-pdf`). `quarto render --to pdf` builds a LaTeX document.
- About 2.9 MB of every HTML file are Source Sans fonts that Quarto's Revealjs base theme always embeds;
  the template itself adds well under 1 MB.
- Work on `develop`; never merge or push without an explicit instruction in the same message.
