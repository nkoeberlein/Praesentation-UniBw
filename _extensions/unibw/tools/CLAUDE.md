# _extensions/unibw/tools/

Node scripts that ship with the format. No npm dependencies — plain Node (>= 22) and the Chrome
DevTools Protocol.

## Files

| File | Purpose |
|------|---------|
| `cdp.mjs` | Starts headless Chrome, opens one page, exposes `evaluate`, `gotoDeck`, `screenshot`, `pdf` |
| `export-pdf.mjs` | Opens a rendered deck in Revealjs's print view and writes one PDF page per slide |

## Usage

```bash
node _extensions/unibw/tools/export-pdf.mjs demo.html demo.pdf   # or: make pdf DECK=demo
```

## Patterns

- Code that runs inside the page is passed as a string to `browser.evaluate()`; keep it ES5-style
  and self-contained (no closures over Node variables).
- `gotoDeck()` always goes through `about:blank` first, otherwise a URL that differs only in its
  hash would not reload the page.
- `cdp.mjs` is also imported by `tests/probe.mjs`. Keep its API stable.

## Gotchas

- In a deck created with `quarto use template` or `quarto add` this folder is
  `_extensions/nkoeberlein/unibw/tools/` (Quarto inserts the GitHub user). The Makefile finds the
  script with a wildcard; never hard-code `_extensions/unibw/…` in anything a deck uses.
- Chrome is expected at the default macOS path; set `CHROME_BIN` to override.
- Never wait for `Reveal` on a page that is not a deck — `gotoDeck()` rejects after 20 s.
- The temporary Chrome profile lives in the system temp dir and is removed in `close()`.
- The PDF page size comes from `Reveal.getConfig()`; `pdf-max-pages-per-slide: 1` in `_extension.yml`
  keeps one page per slide.
