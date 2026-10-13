# _extensions/unibw/assets/

Images that belong to the format and ship with every deck. `ubw.lua` reads them at render time and
embeds them as data URIs.

## Files

| File | Used for | YAML key to override |
|------|----------|----------------------|
| `IA_logo.png` | Header, left (institute logo) | `logo-left` |
| `Signet_UniBw.svg` | Header, right (UniBw signet) | `logo-right` |
| `luftaufnahme-unibw-muenchen.jpg` | Title slide background, 1920 px wide, shown at 15 % opacity | `title-background` |

## Conventions

- Each key accepts a path relative to the deck, or `false` to switch the image off.
- These are institutional assets and fall outside the MPL 2.0 license.
- Everything here is embedded into every rendered deck. Compress before adding:
  `sips -Z 1920 -s format jpeg -s formatOptions 60 in.jpg --out out.jpg`.
- When adding a file, add its extension to `MIME` in `../ubw_meta.lua` if it is not listed there.
