# includes/

HTML fragments with JavaScript, injected via `include-after-body` (order matters).

## Files

| File | Purpose |
|------|---------|
| `header-footer.html` | Builds `.ubw-chrome` with header and footer, keeps it at the scale of the slides, updates section title and slide number, rebuilds the title slide, fills `.steckbrief`, adds header/footer copies per page in the print view |
| `auto-fit.html` | Reduces the font size of a content slide step by step (`--ubw-fit`) until its content fits; marks slides that still overflow with `data-ubw-overflow` |
| `sequential-hash.html` | Replaces Revealjs's 2D hash (`#/h/v`) by sequential numbering (`#/N`) |

## Patterns

- Metadata flows: `.qmd` YAML → `header-includes` meta tags → `getMeta()` in `header-footer.html` → DOM.
- Header and footer are **not** children of the slides. They sit in one `.ubw-chrome` element that has
  the size of the slide canvas and is scaled with `Reveal.getScale()` on every `resize` event.
- Section title per slide is computed once at `ready` and stored in `data-ubw-section`.
  Never derive it from navigation history.
- Auto-fit measures all slides at `ready`, again when web fonts or late images arrive, and again on
  `pdf-ready`. It never uses `transform`, because Revealjs animates slides through `transform`.

## Gotchas

- `header-footer.html` contains two Base64 logos on single very long lines. Read it with an offset or
  with `cut -c1-200`, and edit it with exact-string replacements only.
- Slides far away from the current one sit in a stack with `display: none` and have no layout.
  `auto-fit.html` shows the stack while measuring (`withLayout`).
- Entrance animations move blocks by 30 px. Measurements must run with the class `ubw-measuring`
  on `.reveal`, which switches animations off.
- `{{< meta key >}}` fails on boolean YAML values. Options read through a meta tag must be strings.
