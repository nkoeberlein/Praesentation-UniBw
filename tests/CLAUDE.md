# tests/

Checks a rendered deck in headless Chrome. No npm dependencies — plain Node (>= 22) and the
Chrome DevTools Protocol.

## Files

| File | Purpose |
|------|---------|
| `cdp.mjs` | Starts headless Chrome, opens one page, exposes `evaluate`, `gotoDeck`, `screenshot`, `pdf` |
| `probe.mjs` | Walks through every slide and collects layout facts (heights, columns, header/footer text) |

## Usage

```bash
quarto render presentation-UniBw.qmd
node tests/probe.mjs presentation-UniBw.html                 # JSON report on stdout
node tests/probe.mjs presentation-UniBw.html --shots /tmp/s  # plus one PNG per slide
```

## Patterns

- Code that runs inside the page is passed as a string to `browser.evaluate()`; keep it ES5-style
  and self-contained (no closures over Node variables).
- Measurements are taken after `SETTLE`, which waits for all entrance animations. Measuring earlier
  returns positions that are still offset by the animation.
- `gotoDeck()` always goes through `about:blank` first, otherwise a URL that differs only in its
  hash would not reload the page.

## Gotchas

- Chrome is expected at the default macOS path; set `CHROME_BIN` to override.
- Never wait for `Reveal` on a page that is not a deck — `gotoDeck()` rejects after 20 s.
- The temporary Chrome profile lives in the system temp dir and is removed in `close()`.
