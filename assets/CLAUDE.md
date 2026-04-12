# assets/

Static image assets used by the presentation. All files are referenced directly in the .qmd or injected by header-footer.html.

## Files

| File | Used in | Purpose |
|------|---------|---------|
| `luftaufnahme-unibw-muenchen.jpg` | Title slide (`data-background-image`) | Aerial photo of UniBw campus, opacity 0.15 |
| `Signet_UniBw.svg` | `header-footer.html` (header-right) | Official UniBw seal/signet |
| `Signet_UniBw.pdf` | — | PDF version of the signet (not used at render time) |
| `IA_logo.png` | `header-footer.html` (header-left) | Angewandte Informatik faculty logo |
| `Athene.png` | Available for slide use | UniBw Athene mascot (right-facing) |
| `AtheneGespiegelt.png` | Available for slide use | UniBw Athene mascot (mirrored, left-facing) |
| `profilfoto.png` | End slide `.profile-photo` | Speaker profile photo (circular crop, 400×400px display) |

## Conventions

- Replace `profilfoto.png` with the actual speaker photo before use — must be square or close to square for best circular crop.
- Logos (`Signet_UniBw`, `IA_logo`) are institutional assets and fall outside the MPL 2.0 license.
- Do not add large raster images here without compressing first — the build embeds everything into a single HTML file.
