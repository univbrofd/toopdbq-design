---
name: toopdbq-design
description: Use this skill to generate well-branded interfaces and assets for Toopdbq, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read USAGE_RULES.md FIRST (the binding extraction of the real lib/component/ui system — mandatory tokens, the Wd* component catalog, naming, and the "avoid" list), then taste.md (the craft / de-amateurise rules), then README.md, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation
- **Toopdbq** is a dark, glassmorphic, photographic geo-community social app (location-based Circles, full-screen Stories, a 3D Universe globe). Japanese-first copy, no emoji.
- **Tokens:** `colors_and_type.css` — import it for every mock. Black/white + cool grays, one signature colorful radial gradient (`#FFF0A6 → #005F67 → #FF3E88 → #D0A052`), translucent-black glass surfaces with diagonal gradient hairlines.
- **Type:** Pacifico (wordmark only), Noto Sans JP (JP copy / bold buttons), Inter (Latin / numerals).
- **Icons:** custom white PNGs in `assets/icons/` — reference them directly, never redraw or substitute emoji.
- **UI kit:** `ui_kits/app/` — copy its `app.css` + `.jsx` components to assemble screens fast.
- **Specimens:** `preview/` cards show every color, type and component treatment.

When in doubt, match the app: full-bleed photography, glass controls, the colorful gradient reserved for the highest-intent action, soft dark shadows, nothing sharp-cornered.
