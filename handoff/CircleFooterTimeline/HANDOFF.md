# HANDOFF — CircleFooter ＋ CircleTimeline モーション

サークルフッターと、フッタータップで立ち上がる CircleTimeline ドラッグシートの
**現状実装を単一の正**として、DS specimen（`comp-*.html`）に忠実にビジュアル化する逆ハンドオフ。
**実装挙動は再発明しない**（specimen は実装を写す鏡）。

## repo / branch / raw リンク

- repo: `univbrofd/toopdbq-design`、branch: **`main`**
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/{path}`（public repo・raw リンクで直接取得可）
- DS 索引: `DesignSystem/_ds_manifest.json`

## 成果物（Claude Design が作るもの）

既存 DS 語彙（`.wd-footer` / `.wd-circle-bar` / `.wd-icon-btn(.color)` / `.wd-badge` / 役割トークン）を再利用し、`DesignSystem/preview/` に specimen を起こす。`_ds_manifest.json` の `cards` に登録（`<!-- @dsCard group="Components" name="..." subtitle="..." -->` を先頭に付与）。

1. **`comp-circle-footer.html`（既存・正）** — 触る必要があれば実装値で。フッターの正は下記「フッター仕様」。
2. **`comp-circle-timeline.html`（新規）** — CircleTimeline ドラッグシートの **3 状態 + dismiss + 投稿モード** を1枚で見せる specimen。各状態の画面高比・スナップ閾値を注釈で添える。
3. 可能なら **モーション storyboard**（フッタータップ → collapsed → middle → full → 閉じる、の連続）を `comp-circle-timeline-motion.html` として1枚。状態サムネを左→右に並べ、遷移条件を矢印注釈で。

## フッター仕様（`WdCircleFooter` standart・実装が正）

- レイアウト: `Column[ 上: タイムライン投稿(edit)ボタン 55×55, gap16, 下: Row[ Expanded(WdCircleBar) + gap8 + camera 55×55 ] ]`
  - **縦並びは上=投稿(edit) / 下=camera**（実装どおり。`_buildStandart`）
- ボタン variant（実装 enum と1対1）:
  - 上 edit = `IconButtonVariant.standart`（ガラスのみ・**バッジ無し**）
  - 下 camera = `IconButtonVariant.badgeColor`（カラフル放射グラデ + camera バッジ）
- タップ配線（→ `MainController`）:
  - WdCircleBar タップ → `onCircleTap` → CircleTimeline を**通常**表示（`showCircleDetail(circle)`）
  - edit タップ → `onTimelinePostTap` → CircleTimeline を**投稿モード**表示（`showCircleDetail(circle, postTarget: story)` → 最上部にインライン投稿フォーム）
  - camera タップ → `onStoryPostTap` → StoryPost エディタ（別フロー・タイムラインではない）

## モーション仕様（`CircleTimelineOverlay`・実装が正）

- 画面高比（fraction）: **collapsed 0.25 / middle 0.5 / full 0.92**
- 高さは**シートの縦ドラッグ**で制御（`_onVerticalDragUpdate`: fraction += -dy/screenH、clamp[0, 0.92]）
- ドラッグ離しのスナップ（`_snapToNearest`）:
  - `< 0.125`（collapsed×0.5）→ **dismiss**
  - `< 0.375`（(collapsed+middle)/2）→ collapsed
  - `< 0.71`（(middle+full)/2）→ middle
  - それ以上 → full
- フリック（|velocity|>800）:
  - 上: collapsed→middle、それ以外→full
  - 下: full/middle→middle、middle/collapsed→**dismiss**
- collapsed 中はシート本体タップで `onHeaderTap`（close/edit ボタンは非表示）
- シート外は透明タップ領域 → `onDismiss`（下の Universe / StoryViewer が透ける。背面マップは持たない）
- 投稿モード: シート最上部にインライン投稿フォーム（対象 story の id/サムネ付き）
- 既知の未配線: 内側リストの**スクロール**で full 化する経路は未実装（`_onScroll` は空プレースホルダ＝「将来の full 遷移トリガー用」）。今回は**ドラッグ式の既存モーションを正**にビジュアル化する。

## 実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF の値が design 上の正）:

- `lib/component/ui/view/WdCircleFooter/WdCircleFooter.dart`
- `lib/component/ui/view/WdCircleBar/WdCircleBar.dart`
- `lib/component/ui/widget/WdIconButton/WdIconButton.dart`
- `lib/component/ui/modal/CircleTimeline/CircleTimelineSheetView.dart`
- `lib/component/ui/modal/CircleTimeline/CLAUDE.md`（モーションの living spec）
- `lib/component/ui/view/WdCircleTimeline/WdCircleTimeline.dart`
- `lib/feature/Main/CircleTimelineHostView.dart`
- `lib/feature/Main/StoryOverlayView.dart`
- `lib/feature/Main/MainController.dart`（フッター節 `onCircleTap` / `onTimelinePostTap` / `onStoryPostTap`）

DS 基盤:
- `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css`（色の canonical は `colors_and_type.css` の役割トークン）
- `DesignSystem/preview/components.css`（`.wd-footer` 等の既存クラス）
- `DesignSystem/preview/comp-circle-footer.html`（既存フッター specimen）
- `DesignSystem/_ds_manifest.json`（索引）

## Claude Design に貼るプロンプト

```
main の DS を正として、CircleFooter と CircleTimeline ドラッグシートの
specimen を起こして。実装挙動は再発明せず、HANDOFF の数値どおりに写すこと。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/CircleFooterTimeline/HANDOFF.md

作るもの:
1. comp-circle-timeline.html — シート3状態(collapsed 0.25 / middle 0.5 / full 0.92)
   + dismiss + 投稿モードを1枚で。各状態に画面高比とスナップ閾値を注釈。
2. comp-circle-timeline-motion.html — フッタータップ→collapsed→middle→full→閉じる
   の storyboard（状態サムネを並べ、遷移条件を矢印注釈）。
3. comp-circle-footer.html は既存。フッターは上=投稿(edit,standart) / 下=camera(badgeColor)。

既存 DS 語彙(.wd-footer / .wd-circle-bar / .wd-icon-btn(.color) / .wd-badge / 役割トークン)
だけを使う。新規発明・specimen に無い組み上げはしない。色は colors_and_type.css の役割
トークン、font は Noto Sans JP / Inter、display は Pacifico。各 specimen 先頭に
<!-- @dsCard group="Components" name="..." subtitle="..." --> を付け、_ds_manifest.json に登録。
```

## 取り込み（ダウンロード後）

Claude Design が bundle を出したら `/design {bundle URL}` で取り込み → `DesignSystem/preview/` + `_ds_manifest.json` superset へ reconcile → `univbrofd/toopdbq-design` `main` へ push。
