# tests/

Checks rendered decks in headless Chrome. Run everything with `make test` from the repo root.

## Files

| File | Purpose |
|------|---------|
| `probe.mjs` | Walks through every slide of a rendered deck and collects layout facts (heights, columns, header/footer text, fit level) |
| `check-slides.mjs` | Applies the layout rules of the template to a probe report; exit code 1 on a violation |
| `fixture.qmd` | Stress cases: too many bullets, long code, images, declared column widths, a hopeless table |
| `legacy.qmd` | A deck in the old hand-written style (explicit divider color, manual end slide, English labels) |

## Usage

```bash
make test                                                   # render + check demo, fixture, legacy
node tests/probe.mjs demo.html --shots /tmp/shots > report.json   # raw facts plus one PNG per slide
node tests/check-slides.mjs demo.html --date 01.04.2026
```

## Rules checked

- Content slides are exactly 1080 px high, carry no inline `transform`, and their content stays between
  header and footer.
- No slide is flagged as overflowing, except ids passed with `--expect-overflow`; ids passed with
  `--expect-fit` must have been shrunk.
- Columns have the widths declared in Markdown (±3 percentage points).
- Header shows the section of the slide, also after a deep link; footer shows `n / total` and the date.
- At most one end slide.

## Patterns

- A layout bug gets a slide with an explicit `{#id}` in `fixture.qmd` before it is fixed.
- `probe.mjs` switches slide transitions off and waits for entrance animations (`SETTLE`) before
  measuring; positions taken earlier are still offset.
- The Chrome client lives in `_extensions/unibw/tools/cdp.mjs`, because the PDF export ships with the
  format and uses it too.

## Gotchas

- `tests/*.qmd` find the format through the `_extensions/` folder of the project root; image paths in
  them are relative to `tests/`.
- A top-level HTML comment in a `.qmd` becomes an empty slide. Put notes into YAML comments.
