# includes/

HTML fragments with JavaScript, injected via `include-after-body` in `_extension.yml` (order matters).

## Files

| File | Purpose |
|------|---------|
| `chrome.html` | Reads the JSON config, builds `.ubw-chrome` with header and footer, keeps it at the scale of the slides, updates section title and slide number, adds header/footer copies per page in the print view |
| `auto-fit.html` | Reduces the font size of a content slide step by step (`--ubw-fit`) until its content fits; marks slides that still overflow with `data-ubw-overflow` |
| `sequential-hash.html` | Replaces Revealjs's 2D hash (`#/h/v`) by sequential numbering (`#/N`) |

## Patterns

- Configuration comes from `<script id="ubw-config" type="application/json">`, written by `ubw.lua`.
  Do not add `<meta>` tags or read YAML any other way.
- DOM is built with `createElement` + `textContent`, never with HTML strings — metadata is user input.
- Header and footer are **not** children of the slides. They sit in one `.ubw-chrome` element that has
  the size of the slide canvas and is scaled with `Reveal.getScale()` on every `resize` event.
- Section title per slide is computed once at `ready` and stored in `data-ubw-section`.
  Never derive it from navigation history.
- Auto-fit measures all slides at `ready`, again when web fonts or late images arrive, and again on
  `pdf-ready`. It never uses `transform`, because Revealjs animates slides through `transform`.
- Every script starts with `if (Reveal.isReady()) init(); else Reveal.on('ready', init);`.

## Gotchas

- Slides far away from the current one sit in a stack with `display: none` and have no layout.
  `auto-fit.html` shows the stack while measuring (`withLayout`).
- Entrance animations move blocks by 30 px. Measurements must run with the class `ubw-measuring`
  on `.reveal`, which switches animations off.
- The selector for content slides exists twice: `CONTENT` in `auto-fit.html` and `$ubw-content` in
  `scss/ubw-theme.scss`. Change both together (the agenda `section#TOC` has no `.slide` class).
- The overflow marker is only visible with class `ubw-debug`, set on localhost (quarto preview) or with
  `?ubw-debug` in the URL — never in a presentation opened from a file.
