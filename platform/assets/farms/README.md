# Member farm logos

Every farm sets its own logo by uploading a profile image when it registers, or
at any time afterwards from its Profile tab. That upload is stored with the
farm's record and is what appears across the platform, so this folder is only a
fallback for farms whose artwork you want to ship with the site.

Resolution order for a farm's mark:

1. the profile image the farm uploaded,
2. a `logo` path set on the member record,
3. `assets/farms/<farm-name>.png` — this folder,
4. the farm's monogram, if none of the above exist.

Files placed here are looked up by the farm's own name, so no code change is
needed when a farm is added.

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

The registered name has to match for the lookup to find the file, so a farm that
signs up as "She Farms Ltd" would need `she-farms-ltd.png`.

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
