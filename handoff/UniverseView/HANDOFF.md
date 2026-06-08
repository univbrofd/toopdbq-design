# HANDOFF — UniverseView 画面全体（地球儀俯瞰 + クラスタピン + 下部リール + 3D オーバーレイ）

アプリの中核 home 画面 `UniverseView` の **画面レベルの組み上げ** を Claude Design で specimen 化する逆ハンドオフ。
**現状実装が単一の正**。希望（拡大ズーム等）は B群として分離して記す。ピン 1 個分の見た目は既存ハンドオフ
（`TerrestrialPin` / `ThreeDTerrestrialView`）が正で、ここでは**それらを部品として画面に組む**ことに集中する。

重要（取り違え注意）: UniverseView は「宇宙に浮く地球儀＋星空」ではない。**MapLibre の positron 地図を globe
projection で pitch 55° に倒した、街区レベル（zoom ~14）の俯瞰**。その地表に投稿スナップが 3D／サムネで刺さる。
旧 `ui_kits/app/UniverseScreen.jsx`（星空 + 青い地球儀）は過去案。**今回の正はこの倒した地図**。

## repo / branch / raw リンク

- repo: `univbrofd/toopdbq`、branch: **`design/ds-sync`**（private。Claude Design は GitHub コネクタで認証取得）
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/{path}`
- DS 索引: `lib-design/DesignSystem/_ds_manifest.json`
- ※ private repo のため未認証 raw は 404。開けないときは「GitHub コネクタで `univbrofd/toopdbq` の
  `design/ds-sync` を読んで」と添える。

## スマホ配置文脈（必須）

- 画面 **393×852 + SafeArea**（status bar 上 / home indicator 下）。`card.css` の `.phone` 枠に**実配置**で描く。
- 背景は full-bleed（地図は端まで）。chrome（バッジ / menu / リール / サイドツール）は SafeArea を避けて重ねる。
- タップ範囲は最小 44pt（menu / message / 投稿ボタンは実寸 44–55px）。

## 成果物（Claude Design が作るもの）

`lib-design/DesignSystem/preview/` に specimen を起こし `_ds_manifest.json` の `cards` に登録
（各 specimen 先頭に `<!-- @dsCard group="Screens" name="..." subtitle="..." -->`）。色は `colors_and_type.css`
の役割トークン、font は Noto Sans JP / Inter、display は Pacifico。**新規発明・部品の作り直しはしない**
（ピンは既存 `comp-terrestrial-*` を流用して画面に置く）。

1. **`comp-universe-screen.html`（新規）** — UniverseView の通常状態を 1 画面で。
   倒した地図（pitch 55）の地表に **main クラスタ中心 1（3D＋サムネ・最大）＋ sub 3D ×4（NW/NE 遠で棒長い・
   SW/SE 近で棒短い）＋ normal 小ピン数個** が刺さり、その上に下記 chrome が乗る全体像。
   下端に**クラスタリール**（main クラスタの全メンバーを横スクロールするサムネ列。代表は白枠）。
2. **`comp-universe-3d-overlay.html`（新規）** — main 3D タップで開く**全画面 3D ビューア**。
   暗転 scrim の中央に正方形で 3D が浮き、ドラッグで 360°回転（＋希望: ピンチ拡大）。タップ元から中央へ
   Hero 拡大した着地状態を 1 枚で描く。

## A群: 画面の組み上げ（実装が正・数値そのまま）

z-order（奥→手前）。出どころ: `PlanetView` / `StoryOverlayView` / `MenuOverlayView`。

### L0 背景 — 倒した地図（`EarthView`）

- MapLibre positron + globe projection。**pitch 55°（既定）**、zoom ~14（街区レベル）。地表が手前で大きく奥で
  小さい倒し込み。地図はライト系（positron）だが上下の scrim で白 chrome の可読性を担保する。

### L1 ピン層（`PlanetView.pinsLayer`）

クラスタを地表にアンカーで刺す。**ピン内部の見た目は既存ハンドオフが正**（このファイルでは再定義しない）:
- 3D 形態（`pin.has3D`）= `comp-terrestrial-stage.html`（ステージビーコンで浮く）＋
  `comp-terrestrial-3d.html`（default=小サムネ / main=3D＋サムネ / sub=3D のみ）。
- サムネ形態 = `comp-terrestrial-thumbnail.html`。
- role 別サイズ・ポール長・サブ4配置・逆三角形/白棒の数値は `TerrestrialPin` / `ThreeDTerrestrialView`
  HANDOFF の「共通: アンカー」をそのまま使う（main＋下sub=逆三角形、上sub=白棒、上sub棒は下subの約10倍長）。

Universe の本筋は 3D スナップ主体。**画面中心の main を 3D＋サムネで最大化**し、周囲に sub 3D ×4 と normal 小ピン。

### L2 chrome（`StoryOverlayView` / `MenuOverlayView`）

| 要素 | 配置 | 仕様 |
|---|---|---|
| top scrim | `top:0 h:150` full-width | linear ↓ `#000` α `0x8C→0x47→0x00`、stops `0 / .42 / 1`。可読性のみ（IgnorePointer） |
| アカウントバッジ | `top:48 left:8` | `AccountBadgeView`（自分アイコン + 名前ピル） |
| menu + message | `top:48 right:8` Row | `WdIconButton` 各 44px、間 8。message 常時 / menu は自分プロフィール時のみ |
| bottom scrim | `bottom:0 h:180` full-width | linear ↑ `#000` α `0x9E→0x00` |
| **クラスタリール** | `left:0 right:0 bottom:≈24`（`Get.height×24/852`） | 下記 L3 |
| 投稿ボタン | `right:8 bottom:≈24` | `WdIconButton` camera / `badgeColor`、**55×55**。main クラスタのサークルへ投稿 |
| サイドツール | 右下（bottom 寄り、`right:8`） | `WdStorySideTool`（いいね/コメント/シェア + 投稿者アイコンを縦並び）。リールと右側で重なるがリールが手前 |

### L3 クラスタリール（`_ClusterReel`・今回の主役）

「main に選ばれたクラスタの**他のコンテンツ一覧**」。画面下端で横スクロールするサムネ列:
- データ源: アクティブ planet の **main クラスタ全メンバー**（`mainTerrestrial.allPins`）。1 セルに束ねた同地点の全投稿。
- レイアウト: 横 `ListView`、padding 左右 **16**、item 間 **8**。
- サムネ: **100 × 178px（9:16 縦長）**。外枠 `BorderRadius 14`、内画像 `ClipRRect 12`（cover）。
  - **代表（現 main）= 白枠 `#ffffff` 2.5px**、その他 = `rgba(255,255,255,0.2)`（`0x33FFFFFF`）1px。
  - 画像欠落時 = `#2a2a2a` に `image_not_supported` アイコン（`rgba(255,255,255,0.4)` 24px）。
- タップ: そのサムネを**代表（main）へ昇格**（`selectRepresentative`）→ 地図中心の main 3D が差し替わる。

→ specimen は **5〜7 枚**並べ、先頭（または中央）1 枚だけ白 2.5px 枠でハイライトし「これが今 main」と分かる絵にする。

## B群: 3D オーバーレイ（実装が正 + 希望を分離）

`ThreeDOverlayLayer` / `_ThreeDOverlay`。main 3D タップ → 全画面ビューア。

**A群（実装が正・数値そのまま）**:
- scrim: 黒 `rgba(0,0,0,0.62)`（Hero 進行 t に比例してフェードイン）。
- 3D コンテナ: 画面中央・**正方形 = 短辺 × 0.86**（393 幅なら ≈ 338px）。透明背景に 3D のみが浮く（枠なし）。
- 登場: タップ元矩形 → 中央正方形へ **320ms easeOutCubic** の Hero 拡大（scale + 位置 lerp）。
- 操作: **横ドラッグで 360°回転**（自動回転は停止）。**背景タップで閉じる**（reverse anim）。
- ロード中 = 抽象クリスタルの materialize 演出（`comp-terrestrial-stage.html` のクリスタルと同系。中央に小さく）。
- **chrome は無い**（閉じるボタン・操作ヒント・テキストは現状なし）。specimen もミニマルに。

**B群（希望・これから実装したい）**:
- **ピンチで自由拡大**（現状は回転のみ）。「360°回転＋拡大の自由操作モード」を体現する。
- 任意で控えめな**操作ヒント**（例: 下端に小さく「ドラッグで回転・ピンチで拡大」）と**閉じる×**。
  入れる場合は glass チップ / `WdIconButton` 流用で、3D の主役性を消さない最小限に。

## 参照ファイル（全て上記 raw リンクで取得可）

実装（正・画面組み上げ）:
- `lib/feature/Universe/UniverseView.dart`（`PlanetView` を 1 個置く薄い View）/ `CLAUDE.md` / `SPEC.md`
- `lib/component/ui/view/Planet/PlanetView.dart`（背景/ピン/ジェスチャ/3D オーバーレイの 4 レイヤ Stack）
- `lib/feature/Main/StoryOverlayView.dart`（top/bottom scrim・バッジ・**クラスタリール `_ClusterReel`**・投稿ボタン・サイドツール）
- `lib/feature/Main/MenuOverlayView.dart`（右上 menu + message）
- `lib/component/ui/view/Earth/ThreeDTerrestrialView.dart`（**3D オーバーレイ `ThreeDOverlayLayer`** + クリスタル演出）
- `lib/component/ui/view/Earth/EarthClusterModels.dart`（`EarthClusterRole` / `TerrestrialType` / `allPins`）
- `lib/component/ui/view/Earth/CLAUDE.md`（pitch/zoom レンジ・positron globe）

部品ハンドオフ（ピン内部はここが正・再定義しない）:
- `lib-design/handoff/ThreeDTerrestrialView/HANDOFF.md`（3D タイプ別・アンカー・サブ4配置・pitch 55）
- `lib-design/handoff/TerrestrialPin/HANDOFF.md`（thumbnail/icon/threeD・バッジ・ポール長）

DS 基盤:
- `lib-design/DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css`
- `lib-design/DesignSystem/preview/components.css`（既存クラス語彙）/ `comp-terrestrial-stage.html`（3D 形態の正）
- `lib-design/DesignSystem/_ds_manifest.json`（索引）

## Claude Design に貼るプロンプト

```
design/ds-sync の DS を正として、アプリ home 画面 UniverseView の「画面全体」specimen を起こして。
ピン1個の見た目は既存 comp-terrestrial-* が正なので作り直さず、それらを画面に組むことに集中する。
private repo なので GitHub コネクタで univbrofd/toopdbq の design/ds-sync を読むこと。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/lib-design/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/lib-design/handoff/UniverseView/HANDOFF.md

前提（取り違え注意）: 宇宙に浮く地球儀+星空ではない。MapLibre positron を globe projection で
pitch 55°に倒した街区レベル(zoom~14)の俯瞰地図。その地表に投稿スナップが3D/サムネで刺さる。
旧 UniverseScreen.jsx(星空+青い地球儀)は使わない。

スマホ前提(必須): 393×852 + SafeArea。card.css の .phone 枠に実配置で。地図は full-bleed、
chrome は SafeArea を避けて重ねる。タップ範囲 最小44pt。

作るもの:
1. comp-universe-screen.html — 通常状態の全画面。
   - 倒した地図(pitch 55)に main中心1(3D+サムネ・最大) + sub 3D×4(NW/NE遠で棒長い・SW/SE近で短い)
     + normal小ピン数個。ピン内部とアンカー数値は HANDOFF 参照(comp-terrestrial-stage/3d/thumbnail 流用)。
   - chrome(A群 L2 の数値どおり): top scrim(h150,#000 α8C→47→00 stops0/.42/1) / アカウントバッジ(top48 left8)
     / menu+message(top48 right8, WdIconButton44, 間8) / bottom scrim(h180,#000 α9E→00)
     / 投稿ボタン(camera,55×55,right8 bottom≈24) / サイドツール(WdStorySideTool,右下)。
   - 主役=下端クラスタリール(_ClusterReel): main クラスタ全メンバーを横スクロール。
     サムネ100×178(9:16)、外枠 BorderRadius14・内画像 ClipRRect12、padding左右16・間8。
     代表=白枠#fff 2.5px、他=rgba(255,255,255,.2) 1px。5〜7枚並べ1枚だけ白2.5px枠でハイライト。
2. comp-universe-3d-overlay.html — main 3Dタップで開く全画面ビューア。
   scrim 黒rgba(0,0,0,.62)、中央に正方形(短辺×0.86)で3Dが枠なしで浮く。タップ元から中央へ
   320ms easeOutCubic で Hero拡大した着地状態。横ドラッグで360°回転・背景タップで閉じる(chromeなし)。
   B群(希望)として、ピンチ拡大の自由操作モードと、最小限の操作ヒント/閉じる×を Before/After で添える。

色は colors_and_type.css の役割トークン、font=Noto Sans JP/Inter、display=Pacifico。各specimen先頭に
<!-- @dsCard group="Screens" name="..." subtitle="..." --> を付け _ds_manifest.json に登録。
新規発明・specimen に無い組み上げはしない。最終はダウンロード可能な bundle で出力して。
```

## 取り込み（ダウンロード後）

Claude Design が bundle を出したら `/design {bundle URL}` で取り込み →
`references/handoff.md` C の reconcile（新規カードを repo へ、manifest を superset マージ）→
`design/ds-sync` へ push → 実装段階で B群（ピンチ拡大の自由操作モード等）を反映する。
