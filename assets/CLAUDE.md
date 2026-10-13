# assets/

Images of the demo deck. Logos and the title background of the format itself live in
`_extensions/unibw/assets/`.

## Files

| File | Used in | Purpose |
|------|---------|---------|
| `profilfoto.jpg` | `demo.qmd` (`profile-photo:`) | Placeholder speaker photo, 600×600 px, shown as a circle on the end slide |
| `Athene.png` | `demo.qmd`, `tests/fixture.qmd` | UniBw Athene mascot (right-facing) |
| `AtheneGespiegelt.png` | Available for slide use | Athene, mirrored |
| `Signet_UniBw.pdf` | — | PDF version of the signet (not used at render time) |

## Conventions

- Replace `profilfoto.jpg` with the real speaker photo — square, about 600 px is enough.
- Photos as JPEG, diagrams as SVG or PNG. JPEGs get rounded corners and a shadow automatically;
  `{.plain}` on the image removes it, `{.shadow}` adds it to other formats.
- Compress before adding — every image is embedded into the rendered HTML:
  `sips -Z 1920 -s format jpeg -s formatOptions 60 in.jpg --out out.jpg`.
- The UniBw images are institutional assets and fall outside the MPL 2.0 license.
