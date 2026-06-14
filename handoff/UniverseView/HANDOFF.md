# HANDOFF — UniverseView 画面全体（実機スクショ基準・完全再現用）

アプリ中核 home 画面 `UniverseView` の **画面レベルの組み上げ** を Claude Design で specimen 化する逆ハンドオフ。
**現状実装＝実機の描画が単一の正**。今回は **実機スクリーンショットを添付**し、現 `comp-universe-screen.html`
が実機と乖離している点を Before/After で直すのが目的。

> 直し方の原則: **下の実機スクショ（real-*.jpg）に視覚を合わせる**。CSS の作りやすさで地図/オブジェクトを
> 近似しない。スクショに無いもの（発光ステージリング・グレー結晶・太い道路・緑の公園・リール内の
> アバター/ユーザー名/出典ラベル等）は **足さない**。

## ⚠️ 取り違え注意（現 specimen の根本的なズレ）

現 `comp-universe-screen.html` は次が実機と**大きく違う**。スクショで確認して直すこと:

| 箇所 | 現 specimen（誤り） | 実機（正・スクショ参照） |
|---|---|---|
| **地図** | 60°近く倒した擬似パース格子＋緑の公園ブロブ＋青い川＋太い白道路 | **淡い positron 街区地図**。傾きは**ごく浅い**（zoom~14 の globe projection で床のように倒れて見えない）。緑/青/太道路は無く、薄グレーに**細い道路と日本語＋ローマ字ラベルが密**に並ぶ |
| **3D オブジェクト** | グレーの多面体クリスタル（gem SVG）が**発光ステージリング＋細い縦棒**の上に乗る | **写真由来の photorealistic な人物 GLB**（人の半身像など）が**リング・棒・逆三角形ナシで地図に直接**乗る。**role でサイズが激変**（main は画面を覆うほど巨大／sub は小さい） |
| **main の添えサムネ** | 3D の横に回転した小サムネカード（main-thumb） | **無い**。main は巨大な 3D 単体 |
| **アカウントバッジ** | ガラスのピル（gradient border）＋アイコン＋名前 | **ピル無し**。丸アイコン 40px＋白い名前テキストのみ（top scrim 上に直書き） |
| **クラスタリール cell** | 画像＋下端にアバター＋ユーザー名＋グラデ＋"main"フラグ | **画像＋枠だけ**（メタ表記は一切無し）。"Insta360 Ace Pro 2" 等は**写真自体に焼き込まれた文字**で UI ではない |
| **投稿ボタン** | `.wd-icon-btn.color` + `.wd-badge.color`(add アイコン) | `WdIconButton(camera, **badgeColor**)`、badge アイコンも **camera**、55×55 |

## specimen の 3D 表現（重要・回帰防止）

実機スクショは**視覚の参照（レイアウト・サイズ・配置・世界観）**であって、**ピクセルの素材ではない**。
- **スクショから人物を切り抜いた PNG（背景抜き）を specimen に貼らない**。エッジ・ラベル残り・低解像で
  「変な表示」になる（実装に寄せすぎた失敗例）。
- 3D オブジェクトは **DS の中立な角丸プレースホルダカード**（人物シルエット＋小さな 3D キューブ glyph、
  CSS/SVG のみ・外部素材なし）で表し、**role でサイズだけ変える**（main 巨大／sub 小）。地表に直接置き、
  リング/棒/三角は出さない。実機が写真由来の人物 GLB であることは legend / lede の注記で伝える。
- リールは「画像＋枠だけ」。サンプル画像は DS 同梱（`assets/sample/reel/reel001..12.jpg` の共有プール）で可。
- canonical: `DesignSystem/preview/comp-universe-screen.html`（この方針で実装済み）。
  3D オーバーレイの「3D 本体」はロード演出と同じ **materialize クリスタル**の語彙で可（`comp-universe-3d-overlay.html`）。

## 実機スクリーンショット（正・これに合わせる）

raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/shots/`

- **`real-home.jpg`** — UniverseView 通常状態の全画面（iPhone 17 実機）。**最重要リファレンス**。
  淡い地図／巨大な人物 3D（中央の横たわる人物＝main）／右の人物 3D（sub）／左の青髪 3D（sub）／
  上の丸い 3D バブル＋「+」／左上アカウントバッジ／右上 menu+message／右サイドツール／
  下端リール（縦長サムネ 2 枚、左に白枠＝代表）／右下カラフル投稿ボタン。
- **`real-objects.jpg`** — 3D オブジェクト拡大。**リング/棒/三角が無く**地図に直接立つ人物 GLB と、
  淡い positron 地図＋密ラベル（NISHI-SHINJUKU / YOYOGI 等）が分かる。
- **`real-side-rail.jpg`** — 右サイドレール拡大。上に丸い media バブル＋「+」、下にガラス円ボタン
  （heart / message / location）。半透明グレーで暗め。
- **`real-reel.jpg`** — 下端リール＋投稿ボタン拡大。cell は**縦長画像＋枠のみ**（代表=白枠）。
  投稿ボタンは**カラフルグラデのリング**を持つカメラ。
- 対比用（現 specimen の描画）: `design-current-top.png` / `design-current-bottom.png`。

## repo / branch / raw リンク

- repo: `univbrofd/toopdbq-design`、branch: **`main`**
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/{path}`
- DS 索引: `DesignSystem/_ds_manifest.json`

## スマホ配置文脈（必須）

- 画面 **393×852 + SafeArea**（status bar 上 / home indicator 下）。`card.css` の `.phone` 枠に**実配置**で描く。
- 背景は full-bleed（地図は端まで）。chrome（バッジ / menu / リール / サイドツール）は SafeArea を避けて重ねる。
- タップ範囲は最小 44pt（menu / message 各 44px、投稿ボタン 55×55）。

## 成果物（Claude Design が作るもの）

`DesignSystem/preview/` の specimen を**実機スクショに合わせて作り直す**（`_ds_manifest.json` の
`cards` は登録済み。先頭 `<!-- @dsCard group="Screens" ... -->` は維持）。色は `colors_and_type.css` の役割トークン、
font は Noto Sans JP / Inter、display は Pacifico。**ピン 1 個の内部表現は既存 `comp-terrestrial-*` が正**（再発明しない）。

1. **`comp-universe-screen.html`（作り直し）** — 上表の 6 点を実機に合わせて修正。`real-home.jpg` の見た目に寄せる。
2. **`comp-universe-3d-overlay.html`（維持/微修正）** — main 3D タップで開く全画面ビューア。下記 B 群。

## L0 背景 — 倒した地図（`EarthView`）

- MapLibre **positron + globe projection**。初期 **pitch 55°（zoom≥14 で適用）/ zoom ~14**（街区レベル）。
- ただし **実機では床のように激しく倒れて見えない**（globe + padding.top 補正で傾きは浅い）。`real-home.jpg`
  のとおり、**薄グレーの positron に細い道路と日本語＋ローマ字の地名ラベルが密**に乗る、ほぼ俯瞰の見え方。
- 緑の公園・青い川・太い白道路・強いパース格子は**描かない**。地図は明るいので可読性は上下 scrim で担保。
- specimen 化のヒント: 倒した地図グリッドは `reproduction-hacks.md` の「傾いた地図グリッド → CustomPainter 手動投影」
  と同様、**極薄**（alpha 0.03〜0.07）の細線格子＋淡いブロック差＋多数の地名ラベルで近似。傾きは弱め。

## L1 ピン層（`PlanetView.pinsLayer`）

実機の見た目（`real-objects.jpg`）:
- **3D 形態（`pin.has3D`）= 写真由来の人物 GLB**。`ThreeDTerrestrialView` が per-GLB の WebView で three.js
  モデルを描く（地図 WebGL の中ではなく **Flutter オーバーレイ**として 1 ピン 1 WebView）。
- **default 状態では発光ステージリング・縦棒・逆三角形は出ていない**（オブジェクトが地図に直接乗る）。
  既存 `comp-terrestrial-stage.html` のステージビーコンは「3D 形態の語彙」だが、UniverseView 通常画面の
  スクショでは**棒/リングが目立たない**。specimen は `real-home.jpg` の「地図に直接立つ巨大 main＋小さい sub」
  を優先して描く（棒/リングを主役にしない）。
- role 別サイズ・配置（main 中心で最大／sub は周囲で小）の数値は `TerrestrialPin` / `ThreeDTerrestrialView`
  HANDOFF を参照。ただし**見た目の主役は「巨大な人物 3D」**で、グレー結晶ではない。
- サムネ形態（`has3D` でない投稿）= `comp-terrestrial-thumbnail.html`（角丸写真）。

## L2 chrome（`StoryOverlayView` / `MenuOverlayView`）— 実装の実値

| 要素 | 配置 | 仕様（実装が正） |
|---|---|---|
| top scrim | `top:0 h:150` full-width | linear ↓ `#000` α `0x8C→0x47→0x00`、stops `0 / .42 / 1`（IgnorePointer） |
| **アカウントバッジ** | `top:48 left:8` | **ピル無し**。`ClipOval` 丸アイコン **40×40** ＋ gap **8** ＋ 名前 `WdText`（白 / Noto / **14px / w600** / shadow `0xCC000000` blur4 offset(0,1)）。背景ガラス・枠は付けない |
| menu + message | `top:48 right:8` Row gap8 | `WdIconButton` 各 **44px**（暗めガラス円）。message 常時 / menu は自分プロフィール時 or debug 時 |
| bottom scrim | `bottom:0 h:180` full-width | linear ↑ `#000` α `0x9E→0x00` |
| サイドツール | 右下（`right:8`、下端から sidetool＋`SizedBox(167)` ぶん上） | `WdStorySideTool`：**上に投稿者アイコン**（丸 media）→ like → comment → share（share は hasLocation 時のみ）。半透明グレーのガラス円 |
| **クラスタリール** | `left:0 right:0 bottom:Get.height×24/852` | 下記 L3 |
| **投稿ボタン** | `right:8 bottom:Get.height×24/852` | `WdIconButton(icon: camera, variant: **badgeColor**, badgeIcon: **camera**)`、**55×55**。カラフル放射グラデのリング＋カメラバッジ。activeStory のサークルへ投稿 |

## L3 クラスタリール（`_ClusterReel`・主役）— 実装の実値

main クラスタの全メンバー（`mainTerrestrial.allPins`）を下端で横スクロールするサムネ列:
- レイアウト: 横 `ListView.separated`、padding 左右 **16**、item 間 **8**。高さ = thumbH。
- サムネ: **`thumbW 100 × thumbH 100×16/9 ≈ 177.8`（9:16 縦長）**。外枠 `BorderRadius 14`（border のみ）、
  内画像 `ClipRRect 12`（`BoxFit.cover`）。
  - **代表（現 main）= 白枠 `#ffffff` 2.5px**、その他 = `rgba(255,255,255,0.2)`（`0x33FFFFFF`）1px。
  - 画像欠落時 = `#2A2A2A` に `image_not_supported` アイコン（`0x66FFFFFF` 24px）。
- **cell の中身は画像のみ**。アバター・ユーザー名・グラデ・"main" フラグ・出典ラベルは**描かない**
  （写真に文字が写っていても UI ではない）。タップでその pin を代表へ昇格（`selectRepresentative`）。
- specimen は **5〜7 枚**並べ、先頭（または中央）1 枚だけ白 2.5px 枠でハイライトし「これが今 main」と分かる絵に。

## B群: 3D オーバーレイ（`comp-universe-3d-overlay.html`）

`ThreeDOverlayLayer` / `_ThreeDOverlay`。main 3D タップ → 全画面ビューア。実装が正:
- scrim: 黒 `rgba(0,0,0,0.62)`（Hero 進行 t に比例フェードイン）。
- 3D コンテナ: 画面中央・**正方形 = 短辺 × 0.86**（393 幅なら ≈ 338px）。透明背景に 3D のみ（枠なし）。
- 登場: タップ元矩形 → 中央正方形へ **320ms easeOutCubic** の Hero 拡大。
- 操作: **横ドラッグで 360°回転**（自動回転停止）。**背景タップで閉じる**。**chrome は無い**（specimen もミニマル）。
- ロード中 = 抽象クリスタルの materialize（`comp-terrestrial-stage.html` 系。中央に小さく）。
- 希望（B 群）: ピンチ拡大の自由操作モード＋最小限の操作ヒント/閉じる×を Before/After で添える。

## 参照ファイル

実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。この HANDOFF の値が design 上の正）:
- lib/feature/Universe/UniverseView.dart（PlanetView を 1 個置く薄い View）/ CLAUDE.md / SPEC.md
- lib/component/ui/view/Planet/PlanetView.dart（背景/ピン/ジェスチャ/3D オーバーレイの 4 レイヤ Stack）
- lib/feature/Main/StoryOverlayView.dart（top/bottom scrim・AccountBadgeView・リール _ClusterReel・投稿ボタン・サイドツール）
- lib/feature/Main/AccountBadgeView.dart（アイコン 40＋名前のみ。ピル無し）
- lib/feature/Main/MenuOverlayView.dart（右上 menu + message）
- lib/component/ui/view/Earth/ThumbnailTerrestrialView.dart / ThreeDTerrestrialView.dart（ピン/3D 描画・ThreeDOverlayLayer）
- lib/component/ui/view/Earth/EarthClusterPolePainter.dart（棒/逆三角形の painter。default では目立たない）
- lib/component/ui/view/Earth/CLAUDE.md / SPEC.md（pitch 55・positron globe・zoom レンジ）

部品ハンドオフ（ピン内部はここが正・再定義しない）:
- `handoff/ThreeDTerrestrialView/HANDOFF.md` / `handoff/TerrestrialPin/HANDOFF.md`

DS 基盤:
- `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css` / `preview/components.css`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
- `DesignSystem/_ds_manifest.json`（索引）

## Claude Design に貼るプロンプト

```
DS を正として、home 画面 UniverseView の specimen を「実機スクショに合わせて」直して。
現 comp-universe-screen.html は実機とかなり違うので、添付スクショ（real-*.jpg）に視覚を寄せること。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/HANDOFF.md
実機スクショ(正):
  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/shots/real-home.jpg
  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/shots/real-objects.jpg
  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/shots/real-side-rail.jpg
  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/shots/real-reel.jpg

直す点(HANDOFF の「取り違え注意」表のとおり。スクショに無いものは足さない):
1. 地図 = 緑公園/青川/太道路/強パース格子をやめ、淡い positron の街区地図に。傾きはごく浅い。
   薄グレー＋細い道路＋日本語/ローマ字の地名ラベルが密に乗るほぼ俯瞰の見え方。
2. 3D = グレー結晶＋発光ステージリング＋細棒をやめ、写真由来の人物 GLB が
   リング/棒/三角ナシで地図に直接乗る形に。role でサイズ激変(main は巨大/sub は小)。main の添えサムネは消す。
3. アカウントバッジ = ガラスピルを消し、丸アイコン40px＋白名前テキスト(Noto 14 w600 影)だけに。
4. リール cell = 画像＋枠のみ。アバター/ユーザー名/グラデ/"main"フラグ/出典ラベルを全部消す。
   100×178(9:16)、外枠r14・内画像clip12、代表=白2.5px/他=rgba(255,255,255,.2)1px。5〜7枚で1枚だけ白枠。
5. 投稿ボタン = WdIconButton(camera, badgeColor) でカメラバッジ、55×55。
6. chrome の数値は維持: top scrim h150(8C→47→00 stops0/.42/1) / bottom scrim h180(9E→00) /
   バッジ top48 left8 / menu+message top48 right8(44px gap8) / サイドツール右下(上に投稿者アイコン)。

色は colors_and_type.css の役割トークン、font=Noto Sans JP/Inter、display=Pacifico。
@dsCard は維持し _ds_manifest.json 登録済み前提。新規発明・specimen に無い組み上げはしない。
最終はダウンロード可能な bundle で出力して。
```

## 取り込み（ダウンロード後）

Claude Design が bundle を出したら `/design {URL}` で取り込み →
この repo の `DesignSystem/preview/` ＋ `_ds_manifest.json` superset へ reconcile →
`univbrofd/toopdbq-design` の `main` へ push。
