# Toopdbq — App UI Kit

A high-fidelity, interactive recreation of the **Toopdbq** mobile app (geo-community social). Cosmetic, not production code — built to be pieced together for mocks and prototypes. Visuals are lifted from `univbrofd/toopdbq` (Flutter) so colors, radii, gradients and type match the real app.

## Run it
Open `index.html`. The prototype boots on the **Login** screen — tap a sign-in button to enter, then explore:

1. **Login** — auth card over `auth_background.png`, Pacifico wordmark + JP hero, Google / Apple buttons.
2. **Universe** — a glowing 3D-style globe over a starfield, studded with story pins (the colorful-ringed pin is the "main" circle). Tap any pin (or the bottom-right nearby-search button) to open a story.
3. **Story Viewer** — full-screen story with the glass overlay system: segmented progress bar, user header, side rail (like / comment / share), bottom **circle bar** + **post** button. Tap the **left/right** thirds of the image to move between stories; the **close** / **search** buttons return to the Universe; tap the **circle bar** to open the timeline.
4. **Circle Timeline** — bottom sheet: circle profile, member status, map preview, story-thumbnail grid, and a primary "ポストする" CTA. Tap a thumbnail to jump into that story.

## Files

| File | Role |
|---|---|
| `index.html` | Phone shell + state machine wiring the screens together. |
| `app.css` | Imports the DS tokens; recreates the glass / gradient / pill idioms as classes. |
| `data.js` | Sample circles, users & stories (from the app's `Sample*Data.dart`). |
| `Primitives.jsx` | `Icon`, `IconButton`, `ActionButton`, `StatusBar`, `StatusChip`, `CircleBar`, `Avatar`, `Toggle`. |
| `LoginScreen.jsx` | Auth card (`WdAuthCard` + `WdLoginButton`). |
| `UniverseScreen.jsx` | Globe + pins (`UniverseView` / `EarthPinsOverlay`). |
| `StoryViewerScreen.jsx` | Full-screen viewer (`StoryViewerView` + `WdStoryHeader` + side tools + `WdCircleFooter`). |
| `CircleTimelineSheet.jsx` | Circle timeline sheet (`CircleTimelineSheetView`). |

## Component → source map
`IconButton` → `WdIconButton` (simple / standart / standartColor / badgeColor / badge) · `CircleBar` → `WdCircleBar` + `WdSpesialIcon` · `Toggle` → `WdToggl` · login buttons → `WdLoginButton` · `cta` → `WdTextButton` · field → `WdTextField` · header → `WdNavigationHeader` + `WdStoryHeader` · footer → `WdCircleFooter` · member row → `WdMemberStatus` · distance chip → `WdStatusBar`.

## Faithfulness & gaps
- Icons are the **real app PNGs** (`assets/icons/`); logos are the real `logo_google/apple.png`.
- The **globe** is a stylized 2D recreation — the real app renders a WebGL earth (`lib/component/ui/view/Earth/`) with clustered pins and Hero-flight transitions into the viewer. The kit fakes the Hero flight with a scale-up.
- Story/avatar photography uses the app's own sample image URLs (Midjourney CDN). If a CDN image is unavailable it falls back to a gradient.
- Camera capture (`StoryPost`), Profile, Chat and the map (`WdGoogleMap`) surfaces are **not** recreated here — left out rather than approximated. Add them by following the same component patterns.

> Note: the assembled phone may preview as a black frame in DOM-rerender thumbnailers (the `overflow:hidden` + stacked absolute layers defeat html-to-image). **Open `index.html` in a real browser** to view and interact — it renders correctly there.
