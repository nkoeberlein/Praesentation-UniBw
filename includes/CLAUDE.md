# includes/

HTML fragments injected into the Revealjs output at render time.

## Files

| File | Injected via | Purpose |
|------|-------------|---------|
| `header-footer.html` | `include-after-body` in .qmd YAML | JavaScript that reads YAML `<meta>` tags and injects `.ubw-header` and `.ubw-footer` divs into every slide at runtime; also populates the `.steckbrief` on the end slide |

## Patterns

- `include-after-body` runs after the slide body, so the script can safely query `.reveal` elements.
- Metadata flows: `.qmd` YAML → `header-includes` meta tags → JS in this file → DOM.
- The file contains an inlined Base64-encoded SVG for the UniBw signet — normal to look large in an editor.
- Do not open without line-wrap enabled; the Base64 blob is a single very long line.
