# Toopdbq — Design System

**Toopdbq** is a geographic, community-based social media app. People form **Circles** tied to a real-world location (a center point + a radius in meters), and posting rights are governed by where you physically are: **inside the area you can post, outside you can only view**. Content is shared as **Stories** (full-screen photo/video), browsed through a tactile, swipe-driven viewer, and discovered on a 3D **Universe** globe studded with story pins.

The product is a Flutter app (`Flutter 3.0+ · GetX · Firebase · Google Maps`). It is unapologetically **dark, glassmorphic and photographic**: full-bleed imagery fills the screen, and the entire UI floats on top as translucent black "glass" controls with hairline gradient borders. The single recurring flourish is a **colorful radial gradient** (warm yellow → teal → hot-pink → golden) used on the most important actions.

> The name "Toopdbq" appears as a Pacifico-script wordmark in the auth/splash hero. Japanese is the primary content language.

## Core surfaces / products

This system documents **one product — the Toopdbq mobile app** — across its key surfaces:

| Surface | What it is |
|---|---|
| **Auth / Splash** | Onboarding over a grainy gradient-figure photo; Google & Apple sign-in. |
| **Story Viewer** | Full-screen, three-axis story browser (← → circles, ↑↓ users, tap = next content). Overlaid glass header progress bar, side like/comment tools, bottom circle footer, post & search buttons. |
| **Universe** | 3D globe (WebGL earth) with clustered story pins; tap a pin → Hero-transition into the Story Viewer. Top-left user block, bottom header row. |
| **Circle Timeline / Select** | Bottom-sheet timelines of a circle's stories, map preview, member status, distance slider. |
| **Story Post** | Camera capture (take button), draft, confirmation. |
| **Profile** | User block, follow/mutual relations, circle list. |

## Sources

This system was reconstructed from materials the user supplied. You may not have access; they are recorded so you can dig deeper if you do.

- **Figma:** `Master.fig` (file_key `XbYi1tWX4fy7LtbSTaieVV`). Pages: `feature`, `view-component`, `widget-component`, `userstory`, `resorce`, `panel`.
- **GitHub:** [`univbrofd/toopdbq`](https://github.com/univbrofd/toopdbq) @ `master` — the Flutter app. Key paths used:
  - `lib/component/ui/resource/FigmaColors/FigmaColors.dart` — gradient definitions (exact stops).
  - `lib/component/ui/widget/` — `WdText`, `WdIconButton`, `WdTextButton`, `WdLoginButton`, `WdTextField`, `WdToggl`, `WdNavigationHeader`, `WdUserBar`, `WdCircleBar`, `WdMenuItem`…
  - `lib/component/ui/view/` — `WdAuthCard`, `WdCircleFooter`, `WdCircleBar`, `Earth/`, `CelestialSky/`.
  - `lib/feature/` — `StoryViewer`, `Universe`, `Auth`, `Profile`, `StoryPost`.
  - `lib/component/constants/Sample*Data.dart` — real sample copy (circle names, user names).
  - `.claude/rules/` — engineering + Figma-to-Flutter conventions.

  → **Explore the repo further** for production work — the `CLAUDE.md` files per feature are exceptionally detailed and are the real source of truth for behavior.

---

## CONTENT FUNDAMENTALS

**Language & voice.** Copy is **Japanese-first**, warm and inviting rather than corporate. The hero line reads *「Toopdbqで新しい世界を見つけてください」* ("Find a new world with Toopdbq") — gentle imperative, polite **〜ください** form, speaking *to* the user. UI verbs are short and direct: *「このサークルを選択」* (Select this circle), *「ポストする」* (Post), *「近くの投稿を探す」* (Find nearby posts), *「コンテンツがありません」* (No content).

**Casing & Latin.** Latin runs in Inter and is used for: the wordmark, system/status strings (*Uploading… 47%*), and short metadata. English status text is **Sentence case**, never SHOUTY. Toggle states are the only all-caps tokens: **ON / OFF**.

**Numerals & units.** Distances carry a large value + small unit (e.g. `10.0` at 15px, `m` at 7px). Counts are terse: *「＋3人が参加中」* ("+3 people joining").

**Person.** Second-person, implicit subject (typical JP). The app addresses *you*; it rarely says "we".

**Emoji.** **None.** No emoji anywhere in the product UI. Iconography is a custom monochrome PNG set (see ICONOGRAPHY). Don't introduce emoji.

**Tone in one line.** Calm, photographic, a little dreamy — the chrome gets out of the way so user photos and the globe carry the emotion.

**Sample content (use these for mocks):**
- Circles: 渋谷コミュニティ, 新宿グループ, 原宿コミュニティ — each with a one-line description like *「渋谷駅周辺のコミュニティ」*.
- Usernames: SunnyVi, Kawaii, Dreamy, foodie, Pixel, ZenGarden, Starry, o_cean, Mocha.
- Comments: *「いいね！素敵な写真ですね。」*, *「ここはどこですか？」*

---

## VISUAL FOUNDATIONS

**Overall vibe.** Dark, glassy, photographic, spatial. Think "a window onto a glowing 3D earth, with UI hovering in glass." High contrast: pure black and pure white do most of the work; color is rationed to one signature gradient.

**Color.** The palette is almost monochrome — `#000` and `#fff` plus cool grays (`#7f7f7f` fields, `#444` tracks, `#212121`). Every control surface is **translucent black glass** (`rgba(0,0,0,0.51)`), not opaque. The one accent is the **colorful radial gradient** (`#FFF0A6 → #005F67 → #FF3E88 → #D0A052`) anchored beyond the bottom-right corner — reserved for the highest-intent actions (post button, primary CTA, active toggle). Semantic color is minimal: like = pink/red, success `#4CAF50`, error `#FF6B6B`. See `colors_and_type.css`.

**Type.** Three families: **Pacifico** (script) for the wordmark *only*; **Noto Sans JP** for Japanese copy and bold button text; **Inter** for Latin UI, labels and numerals. Weights run light→black. Text over photos almost always carries a **shadow** (`0 4px 4px` or a soft `0 0 8px` glow) for legibility.

**Backgrounds.** Full-bleed photography (AI-generated, Midjourney-style) is the backdrop for nearly every screen — warm-meets-cool, soft grain. The auth screen uses `auth_background.png`, a grainy blue→orange gradient figure. Behind the globe: deep space / star field (`assets/celestial/stars`). No flat color screens except loaders/dialogs (which flip to a light scrim).

**Glass & blur.** The defining material: `backdrop-filter: blur(2px)` + `rgba(0,0,0,0.51)` fill + a 1px **diagonal gradient hairline** (`#211C1C → rgba(255,255,255,0.64)`, dark corner to bright corner). Used on every icon button, the circle bar, chips, snackbars. Modal scrims dim the screen to 64–80% black.

**Gradients used three ways.** (1) the colorful radial accent; (2) **protection gradients** — top/bottom black-to-transparent veils behind headers (`rgba(0,0,0,0.5) → transparent`) so white UI stays legible over any photo; (3) the diagonal glass-edge border. Note the codebase interpolates the colorful gradient in **OkLAB** to match Figma — color transitions are perceptually smooth, not muddy.

**Corner radii.** `8px` buttons & cards; `16px` the auth card and pill icon-text button; `~99–100px` fully-rounded text fields, toggles and the circle bar; perfect circles for icon buttons & avatars. Nothing is sharp-cornered.

**Borders.** Almost always the 1px diagonal gradient hairline (never a flat gray line). The Google sign-in button gets a brighter 4-color gradient border (pink→lime→mint→violet).

**Shadows / elevation.** Soft and dark: avatars `0 2px 8px rgba(0,0,0,0.7)`, cards `0 8px 24px`, the toggle pill has a subtle **inner** shadow. Text shadows are part of type, not decoration. There is no light-mode "material" elevation — depth comes from blur + photography, not gray boxes.

**Hover / press.** This is a touch app: no hover states. Feedback is **tap** (`InkWell`/`GestureDetector`) and motion — scale/opacity transitions rather than color shifts. For web mocks, emulate press with a slight scale-down (~0.97) and/or brief opacity dip; don't invent new hover colors.

**Animation.** Restrained and physical. `Curves.easeInOut` (≈`cubic-bezier(.4,0,.2,1)`) for toggles (200ms); `Curves.easeOut` for the 1.2s StoryViewer fade-in; **Hero** flight transitions between a Universe pin and the full-screen story (the hallmark interaction); drag-to-dismiss with translate + scale + spring-back. No bounces, no infinite decorative loops.

**Transparency & blur — when.** Glass blur for any control floating over content; protection gradients whenever white text/icons sit on unknown imagery; full scrims for modal focus. Opaque surfaces are the exception (loaders, dialogs).

**Layout rules.** Reference frame **393 × 852** (sizes are responsive: `Get.width`/`Get.height`, never hardcoded). `SafeArea` always. Headers are fixed at top (93px tall incl. 46px status inset); footers fixed at bottom. Z-order is Stack-based: photo → protection gradient → UI → overlays/sheets. Bottom controls cluster at the right (post/search), the circle bar spans the width.

**Cards.** Rare — the product favors full-bleed over carded layouts. Where they exist (auth card, circle mini-cards) they're `16px`-rounded, photo-filled, with the gradient hairline and a dark protection gradient for text legibility.

---

## ICONOGRAPHY

Toopdbq uses a **custom monochrome PNG icon set** — not an icon font, not SVG, not emoji, not Unicode glyphs. Each icon is a small white-on-transparent PNG (~70×70 source) rendered through `IconImage(variant, color)` and tinted white by default. They are deliberately simple line/solid glyphs, optically sized for ~14–24px.

**The set (30 variants), copied into `assets/icons/`:**
`add · back · camera · check · close · comment · dashboard · delete · edit · expand · explore · group · image · leave · like · map · menu · mic · near · next · person · pin · pin_location · report · search · share · spot · swap · text`

Two variants (`grid`, `shuffle`) fall back to **Material rounded** icons (`grid_view_rounded`, `shuffle_rounded`) — the only place Material iconography appears.

**Brand logos** (`assets/images/`): `logo_google.png`, `logo_apple.png` — used only on the sign-in buttons.

**Usage guidance.**
- Always render icons **white** over photos/glass; tint to `#000` only inside light chips (e.g. the relation badge on an avatar).
- Pair icons with the glass circle-button treatment (`WdIconButton`) rather than placing bare icons on photos.
- For HTML mocks, reference the real PNGs from `assets/icons/` (e.g. `<img src="../assets/icons/icon_like.png">` with a white tint). **Do not** redraw them as inline SVG or substitute emoji.
- If you need an icon not in the set, match the existing style (simple, monoline, white) — or flag it.

---

## INDEX — what's in this system

| File / folder | Contents |
|---|---|
| `README.md` | This document. |
| `USAGE_RULES.md` | **Binding extraction of the real `lib/component/ui/` system** — mandatory tokens (`FigmaColors` gradients, `WdText`), the full `Wd*` component catalog, naming conventions, the `Color(0xAARRGGBB)` rule, and the **avoid** list. Read this first before designing. |
| `taste.md` | **Aesthetic / "de-amateurise" rules** — the 7 craft principles (effects subtraction, hierarchy, 8pt padding, grid sizing, optical icons, normalized radius/shadow), a pre-ship smell-test, and the per-`Wd*` redesign rollout table. |
| `colors_and_type.css` | All color + type tokens (CSS custom properties + semantic type classes). Import this everywhere. |
| `SKILL.md` | Agent-Skill manifest for using this system in Claude Code. |
| `fonts/` | `Pacifico-Regular.ttf` (wordmark). Inter + Noto Sans JP load from Google Fonts. |
| `assets/icons/` | The 29 custom white PNG UI icons. |
| `assets/images/` | `auth_background.png`, `logo_google.png`, `logo_apple.png`. |
| `preview/` | Design-system specimen cards (colors, type, components) shown in the Design System tab. |
| `ui_kits/app/` | High-fidelity, interactive recreation of the Toopdbq mobile app — components + a click-through `index.html`. |

> **Substitutions flagged:** Inter & Noto Sans JP are loaded from Google Fonts (the app bundles the TTFs via `pubspec.yaml`; only Pacifico's TTF was in the repo). The colorful gradient is approximated in CSS sRGB (the app bakes OkLAB-interpolated stops). Story/circle photography in mocks uses the app's own sample image URLs where reachable, else neutral placeholders.
