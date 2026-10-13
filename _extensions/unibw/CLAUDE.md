# _extensions/unibw/

The Quarto format extension. A deck uses it with `format: unibw-revealjs`.

## Files

| File | Purpose |
|------|---------|
| `_extension.yml` | Revealjs options, institute defaults and option defaults of the format |
| `ubw.lua` | Pandoc filter: divider colors, `source="…"` lines, references slide, end slide, JSON config for the page |
| `ubw_meta.lua` | Helpers for the filter: reading YAML fields, labels (de/en), images as data URIs, profile card |
| `title-slide.html` | Pandoc template partial for the title slide |
| `scss/` | Theme |
| `includes/` | JavaScript that runs in the page: header/footer, auto-fit, URL hash |
| `assets/` | Logos and title background shipped with the format |
| `tools/` | Node scripts for PDF export (used by `make pdf`) |

## How metadata reaches the slides

```
deck YAML + _quarto.yml + _extension.yml
   └─ ubw.lua ─┬─ title-slide.html      (template variables, incl. ubw-author-line, ubw-course-line)
               ├─ end slide / steckbrief (HTML built in Lua)
               └─ <script id="ubw-config"> JSON → includes/chrome.html (header, footer, options)
```

## Patterns

- Paths in `_extension.yml` are relative to this folder. Files the filter reads at render time are resolved
  with `quarto.utils.resolve_path()`; paths given in a deck's YAML are relative to the deck.
- Logos and the title background are embedded as data URIs by the filter, so they work with and without
  `embed-resources` and no path has to survive into the HTML.
- User-facing texts come from `M.LABELS` in `ubw_meta.lua` (keyed by `lang`). Add new texts there, in both
  languages, never as literals in Lua or JS.
- The filter must stay idempotent towards hand-written structure: an existing `.end-slide` heading, an
  existing `#refs` div or an explicit background on an H1 always wins.

## Gotchas

- `require("ubw_meta")` only works because `ubw.lua` adds its own directory to `package.path` first.
- Boolean YAML values arrive as Lua booleans, quoted ones as strings — always go through `M.flag()`.
- The JSON config sits inside a `<script>` element: `<` is escaped as `<` in `page_config()`.
- Quarto gives columns without declared width `width: 50%`. The end slide overrides that, otherwise the
  profile card wraps.
