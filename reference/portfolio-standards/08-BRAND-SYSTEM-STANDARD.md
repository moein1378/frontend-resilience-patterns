# Portfolio Brand System Standard

All project brands belong to one family while retaining an individual identity.

## Shared geometry

- Base grid: `64 × 64`.
- Safety area: 8 units.
- Outline stroke: 4.5 units, round caps, round joins.
- Primary silhouette: one continuous or visually unified abstract mark.
- Detail count: no more than five meaningful visual parts.
- Logo must remain identifiable at 16px.
- No gradients in favicons; project UI may use restrained gradients separately.

## Required variants

1. `logo-outline.svg` — transparent, two-color stroke mark for documentation and diagrams.
2. `logo-filled.svg` — transparent, two-color filled mark for hero sections.
3. `logo-solid.svg` — one-color mark for stamps, monochrome contexts, and small rendering.
4. `logo-lockup.svg` — mark plus project name.
5. `favicon.svg`, multi-size PNG favicons, `favicon.ico`, Apple touch icon, Android/PWA icons, and `site.webmanifest`.

## Relationship to design tokens

- Primary logo color is `--color-brand`.
- Secondary detail color is `--color-accent`.
- Solid favicon background uses the brand color and a white glyph.
- The logo may not introduce a color absent from the project token system.
- Logo corner softness, line rhythm, and negative space must match component radius and spacing decisions.

## Use policy

- README hero: filled logo or lockup.
- Architecture diagrams: outline logo.
- App navigation: solid logo at 24–32px.
- Favicon/PWA: generated solid favicon assets only.
- Do not redraw the logo inside application components; consume repository assets.
