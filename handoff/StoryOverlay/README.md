# StoryOverlay — handoff

Universe / StoryViewer 横断の常駐 chrome（`GetMaterialApp.builder` 在駐）のデザイン。

## 中身

- `clean.html` — フルスクリーン 393×852 比較ハーネス（globe / photo 切替）
- `comp-story-overlay.html` — specimen カード（Before/After 解説つき）

css / アイコンは複製せず共有 `../../DesignSystem/` を参照する。

## 由来

Claude Design bundle `story-overlay`（逆ハンドオフ `design/story-overlay-handoff` ブランチの HANDOFF.md 起点）。

## 実装の着地

- 保護スクリム上下・8pt グリッド（top:48）→ `lib/feature/Main/StoryOverlayView.dart`
- 右上 menu / message を 1 ガラス語彙に統一 → `lib/feature/Main/MenuOverlayView.dart`
- 空アバター `IconImage(person)` on `--surface-input` → `lib/feature/Main/AccountBadgeView.dart`
- サークルフッターは実装を単一の正とし、DS 欠落カードを新設 → `../../DesignSystem/preview/comp-circle-footer.html`
