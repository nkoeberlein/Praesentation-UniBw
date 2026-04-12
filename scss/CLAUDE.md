# scss/

SCSS theme for the Quarto Revealjs presentation. Entry point is `ubw-theme.scss`.

## File map

| File | Lines | Content |
|------|-------|---------|
| `ubw-theme.scss` | ~43 | Color/font variables (`/*-- scss:defaults --*/`) + `@import` of all partials |
| `_animations.scss` | ~83 | CSS keyframe definitions (fadeInUp, fadeInLeft, scaleIn, etc.) |
| `_slides.scss` | ~192 | Global slide padding, title slide, section divider slides |
| `_chrome.scss` | ~201 | `.ubw-header`, `.ubw-footer`, progress bar, fragment animations |
| `_typography.scss` | ~139 | `h2`/`h3` styles, unordered/ordered lists, code blocks |
| `_elements.scss` | ~218 | Columns, blockquotes, tables, callout boxes, references, links, images |
| `_end-slide.scss` | ~184 | End/thank-you slide, auto-animate, speaker notes, print styles |

## Patterns

- Variables (`$ubw-orange`, `$ubw-dark-blue`, etc.) are defined in `ubw-theme.scss` defaults section.
  All partials import them via `@import` (which shares the parent scope — do NOT switch to `@use`).
- Quarto requires the `/*-- scss:defaults --*/` and `/*-- scss:rules --*/` comment markers only in the
  entry file (`ubw-theme.scss`). Partials are plain SCSS.
- Quarto resolves the theme path relative to the `.qmd` file. The entry file is referenced as
  `scss/ubw-theme.scss` in the YAML front matter.
