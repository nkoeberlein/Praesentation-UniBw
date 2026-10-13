# scss/

SCSS theme for the Quarto Revealjs presentation. Entry point is `ubw-theme.scss`.

## File map

| File | Content |
|------|---------|
| `ubw-theme.scss` | Colors, fonts, layout variables (`/*-- scss:defaults --*/`) + `@import` of all partials |
| `_animations.scss` | CSS keyframes (fadeInUp, fadeInLeft, fadeInRight, scaleIn, slideInLine) |
| `_layout.scss` | Box model of content slides, density, auto-fit hooks, `.r-stretch`, overflow marker |
| `_slides.scss` | Entrance animation, title slide, section dividers |
| `_chrome.scss` | `.ubw-chrome` canvas, `.ubw-header`, `.ubw-footer`, progress bar, fragment animations |
| `_typography.scss` | `h2`/`h3`, lists, code blocks |
| `_elements.scss` | Columns, blockquotes, tables, callout boxes, references, links, images |
| `_end-slide.scss` | End/thank-you slide, auto-animate, speaker notes |
| `_print.scss` | Restores the box model inside Revealjs's print view (`html.reveal-print`) |

## Patterns

- Variables are defined in `ubw-theme.scss` defaults. Partials see them via `@import`
  (shared scope — do NOT switch to `@use`).
- `$ubw-content` is the selector for "normal content slide" (everything except title slide, H1
  dividers and the end slide). Use `#{$ubw-content} { … }` instead of `.reveal .slides section`,
  which also hits stack wrappers and the special slides.
- Layout values (`$ubw-header-height`, `$ubw-gap-top`, `$ubw-side-padding`, …) are **px on the
  1920×1080 canvas**. Header and footer are scaled together with the slides, so px are safe there.
  Inside slides use `em`, so density and auto-fit can scale the content.
- Font size of a content slide = root × `--ubw-density` × `--ubw-fit`. `.smaller` only sets
  `--ubw-density: 0.7`; the JS in `includes/auto-fit.html` sets `--ubw-fit`.

## Gotchas

- Children of a content slide are flex items with `flex: 0 0 auto`. Do not allow shrinking: blocks
  with `overflow: hidden` (tables, callouts) would be squeezed silently instead of triggering auto-fit.
- Pandoc gives H1 dividers the class `title-slide` as well. Title-only rules must use `#title-slide`,
  divider-only rules `.title-slide.level1`.
- Revealjs's print view resets `padding`, `display`, `position` and `transform` on every section with
  `!important`. Anything the print view needs has to be repeated in `_print.scss` with `!important`.
- A line of highlighted code must stay `inline-block`; `display: block` doubles the line spacing.
