# Member farm logos

Drop each member farm's logo in this folder. The platform looks the file up by
the farm's own name, so no code change is needed when a farm is added.

## Naming rule

Take the farm name exactly as it appears in Member management, lower-case it,
and replace every run of non-alphanumeric characters with a single hyphen:

| Farm name | File to add |
|---|---|
| She Farms | `she-farms.png` |
| Fair Farms | `fair-farms.png` |
| Iringa Agro Fresh | `iringa-agro-fresh.png` |
| Nahdi Youth Farm | `nahdi-youth-farm.png` |
| Pinerjo Smart Farm | `pinerjo-smart-farm.png` |

## File requirements

- **Format** — PNG with a transparent background. A JPEG carries a white box
  around the mark (Brand Guidelines p21, "Always PNG for logos").
- **Size** — square-ish, 256–512 px on the long edge. The mark is contained,
  never cropped or stretched, so any aspect ratio is placed safely.
- **Background** — transparent. Logos sit on white tiles throughout the app;
  a logo supplied on a dark background will show that background as a block.

Until a file is present the farm's monogram is shown in its place, so a missing
logo never breaks a layout.

## Overriding a path

If a farm's artwork must live somewhere else, set a `logo` property on that
member record in `index.html` and it takes precedence over the name lookup:

```js
she: { name:'She Farms', logo:'assets/farms/she-farms-2027.png', ... }
```
