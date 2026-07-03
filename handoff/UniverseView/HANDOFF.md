# HANDOFF — UniverseView 現行仕様（2D poster）specimen の新規作成

アプリ本体は **3D 表示・3D 投稿レーンを全撤去**した。現行の UniverseView = MapLibre globe ＋
**2D poster サムネピン** ＋ 下部 poster ストリップ。この現行仕様の specimen
**`UniverseView2D.html` を新規作成**する。既存の 3D specimen（`UniverseView.html` ＋ `earth/*.js`）は
**デザイン探求として温存 — 変更・削除しない**（その spec は `HANDOFF-3D.md`）。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色 canonical は `DesignSystem/colors_and_type.css`）
> 実装の対応箇所は「別 repo `univbrofd/toopdbq`・参考」（Claude Design は読めない。値は本書に固定）。

## 成果物

- `handoff/UniverseView/UniverseView2D.html` — 現行仕様の live specimen（1 ファイル、`.phone` 実配置）
- 2D 固有の JS が要るなら `handoff/UniverseView/earth2d/*.js` に新設。
  **既存 `earth/*.js` は 3D specimen 専用 — 変更禁止**（`map-core.js` / `posts.js` の読み取り流用は可）
- データは `earth/posts.js` をそのまま読む（GENERATED・手編集禁止。`assets/mock` から再生成される）。
  2D では `thumbUrl` / `videoUrl` / `lat,lng` / `circleId` / `cluster` を使い **`glbUrl` は無視**する

## 現行仕様（実装値で固定）

### マップ / カメラ

- MapLibre GL JS 5・positron スタイル・globe projection。pitch は 2 段階 `{0, 55}`（既定 55）、bearing 0 固定
- 中心マーカー: 青ドット `rx=10`・`rgba(66,133,244,0.80)`・白縁 1.2px・`ry = rx × cos(pitch)`（地面貼付き楕円）＋ blur(4px) glow
- 球縁白線 8px ＋ 成層圏リング（3D specimen と同じ）。place 系ラベル text-size 8px 固定・road shield 非表示

### ピン = 2D poster サムネ（3D オブジェクトは存在しない）

- 基本サイズ **36×64**（縦 poster）。地面 anchor から pole（支柱・最低 32px）で浮く
- 中心接近で拡大: activeT = 八次 ease-in（`t⁸`）。範囲のほぼ全域は無反応、中心の最後 10〜15% で急拡大。
  中心ジャストの最大幅 = **画面幅の 80%**
- 役割: `main` ×1.0 固定（中心クラスタの代表・最前面）/ `sub`（NW/NE/SW/SE）×0.5 固定
  （NW/NE は pole ×3.63 で高く、SW/SE は短 pole）/ `normal` は activeT 連動
- 装飾（全ピン共通）:
  - gradient-border 枠 1.5px（main 2px）: 135° `#211C1C → rgba(255,255,255,0.64)`、radius 外 8 / 内 6.5
  - refractive glass edge: 上端 specular `rgba(255,255,255,0.34)→0`（14%）・内側ヘアライン
    `rgba(255,255,255,0.12)` 0.5px・下端の沈み `rgba(0,0,0,0.5)`
  - 浮遊影: main `blur34 offset(0,14) rgba(0,0,0,0.70)` ＋ colorful glow halo
    （pink `rgba(255,62,136,0.26)` blur26 / teal `rgba(0,95,103,0.18)` blur30 / yellow `rgba(255,240,166,0.14)` blur22）。
    非 main は `blur18 offset(0,7) rgba(0,0,0,0.62)`
- main ＋ 複数メンバー時:
  - サムネ上端に StoryViewer 風セグメント（高さ 2.5・gap 2・白 / `rgba(255,255,255,0.30)`・最大 6 本＋総数）
  - サムネ下にメンバー avatar 列（径 = thumbW×0.42、clamp 14–36・白枠 1.2px・最大 5・溢れは白地黒字 `+N` chip）
- クラスタ数バッジ: 右上角の dark glass pill `rgba(8,10,16,0.62)`・枠 `rgba(255,255,255,0.16)` 0.8px・
  高さ main 30 / 他 22・白 bold 14/11・tabular numerals・`99+` clamp
- **代表が動画投稿 → 動画ピン**: 縦長カード radius 6・muted loop 自動再生（poster=サムネ）・
  下端に like/comment 数のみ（白 icon 13px ＋ Inter 11 bold・下端グラデ `rgba(0,0,0,0.70)→0`）・影 blur12 offset(0,6)

### タップ挙動（フォーカス = 3D 360°回覧は存在しない）

- **main 代表タップ → story 全画面**（Hero 拡大でその場から開く）
- **main ＋ 複数メンバー → メンバー cycle**（タップごとに次メンバーへ代表差替）
- **非 main タップ → 地図がそこへ flyTo（800ms）＋ 代表昇格**（ユーザー選択 1.5s ロック）
- 3D フォーカス / focus dock / 弧カルーセルは無い

### 下部 poster ストリップ（旧リールの置換）

- main クラスタの members（代表を先頭）を poster 横並び 1 行で表示。circle 別の複数行リールは**廃止**
- card **92×122**（3:4）・radius 12・gap 10・左右 padding 16・画面下端から **46px**
- 動画投稿は中央に ▶ 30px 白。エラー placeholder `#2A2A30`
- cell タップ = **story 全画面を開く**（代表化ではない）

### edge indicator（画面外の近隣クラスタ）

- 画面内縁にクランプした**円形 glass チップ 56px**（中身 = 代表サムネ・地 `rgba(8,8,12,0.55)`・
  枠 `rgba(255,255,255,0.55)` 1.5px・影 blur18・pulse リング 2.8s・最大 6 個）。タップでそこへ寄せる
- 3D 版の「矢印＋距離」チップより簡素（方向矢印・距離ラベルは無い）

### app chrome

- 上部スクリム 150px: `rgba(0,0,0,0.55) → rgba(0,0,0,0.28)`（42%）`→ 0`
- 左上 AccountBadge（top 48 / left 8）、右上メッセージアイコン
- 右下 投稿ボタン **58×58**（right 12 / bottom ≈ 画面高の 2.8%・カメラアイコン＋add バッジ・badgeColor variant）
- **Universe home にサイドツール（like/comment/map 縦列）は出さない**（story 全画面時のみ）。
  地図上は動画ピン下端の like/comment 数だけ

### story 全画面

- poster / 動画ピン / ストリップ cell から開く 2D フィード。既存 3D specimen の `.story-fs`
  （2D スワイプフィード: 横=同サークル / 縦=近傍サークル・セグメント進捗）の方向で OK

## スマホ配置文脈

画面 **402×874 ＋ SafeArea**（iPhone 17 / `DesignSystem/preview/card.css` の `.phone`・statusbar / Dynamic Island / home-ind chrome）。
globe は full-bleed 背景。ストリップ `left:0 right:0` 下端、投稿ボタン右下、タップ範囲 ≥44pt。

## 実装の対応箇所（別 repo `univbrofd/toopdbq`・参考。本書の値が design 上の正）

- `lib/component/ui/view/Earth/ThumbnailTerrestrialView.dart` / `VideoTerrestrialView.dart` — ピン装飾・動画ピン
- `lib/component/ui/view/Earth/ClusterMediaStripView.dart` — 下部 poster ストリップ
- `lib/component/ui/view/Earth/EarthEdgeIndicatorView.dart` — edge チップ
- `lib/component/ui/view/Planet/PlanetViewController.dart` — タップ / 代表選定 / クラスタ
- `lib/feature/Main/StoryOverlayView.dart` — スクリム / 投稿ボタン / chrome 出し分け

## Claude Design に貼るプロンプト

```
to claude
------------------------------------------------------
UniverseView の「現行仕様（3D なし・2D poster）」specimen を新規作成して。
既存の UniverseView.html（3D 版）はデザイン探求として温存 — 変更・削除しないこと。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/HANDOFF.md

作るもの: handoff/UniverseView/UniverseView2D.html（新ファイル。2D 固有 JS は earth2d/ へ。
既存 earth/*.js は 3D specimen 専用につき変更禁止・map-core.js / posts.js の読み取り流用は可）。

核（HANDOFF の「現行仕様」の値で固定）:
1. ピン = 2D poster サムネ（36×64 基準・gradient-border・glass edge・main は colorful glow halo）。
   3D オブジェクト・フォーカス（360°回覧）・focus dock は存在しない。
2. 代表が動画の main は縦長動画カード（muted loop・下端に like/comment 数のみ）。
3. 下部 = main クラスタ members の poster ストリップ 1 行（92×122・radius12・gap10・bottom46・
   動画は▶バッジ・タップで story 全画面）。circle 別複数行リールは廃止。
4. タップ: main 代表 → story 全画面（Hero 拡大）/ main+複数 → メンバー cycle /
   非 main → flyTo 800ms + 代表昇格（1.5s ロック）。
5. 画面外クラスタは縁の円形 glass チップ 56px（代表サムネ・pulse）。矢印+距離は無し。
6. chrome: 上部スクリム・左上バッジ・右下投稿ボタン 58×58。home にサイドツールは出さない。

データは earth/posts.js をそのまま読む（thumbUrl/videoUrl を使い glbUrl は無視。手編集禁止）。
土台は USAGE_RULES.md と taste.md。色は colors_and_type.css の役割トークン、
新規発明はしない。最終はダウンロード可能な bundle で出力して。
--------------------------------------------------
```

## 取り込み

Claude Design が bundle を export したら `/import-design-bundle {URL}` で取り込む（`handoff/UniverseView/` を更新・push）。
