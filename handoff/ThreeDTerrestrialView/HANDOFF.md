# HANDOFF — ThreeDTerrestrialView タイプ別表示

地球儀（Universe）上に 3D オブジェクトを置く `ThreeDTerrestrialView` の **タイプ別表示**
（デフォルト / メイン / サブ）を Claude Design で起こすための逆ハンドオフ。

2 つの軸が混在するので **正の出どころを取り違えない**こと:

- **A群（既存実装が正）= アンカー表現・配置・傾き**: 逆三角形の土台＋地表へ伸びる棒、サブ4配置、
  上下でアンカー長が違う、pitch 55°の俯瞰。**数値どおりに写す**（再発明しない）。
- **B群（これから実装する希望）= タイプ別の中身**: デフォルト=小画像 / サブ=3D / メイン=3D＋サムネ。
  現状実装と一部異なる**新しい振る舞い**。ここは「こう変えたい」希望としてデザインする。

## repo / branch / raw リンク

- repo: `univbrofd/toopdbq`、branch: **`design/ds-sync`**（private。Claude Design は GitHub コネクタ＝認証付きで取得）
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/{path}`
- DS 索引: `lib-design/DesignSystem/_ds_manifest.json`（pull 済みのはず）
- ※ private repo のため未認証 raw は 404。Claude Design がリンクを開けないときは
  「GitHub コネクタで `univbrofd/toopdbq` の `design/ds-sync` を読んで」と添える。

## 成果物（Claude Design が作るもの）

`lib-design/DesignSystem/preview/` に specimen を起こし、`_ds_manifest.json` の `cards` に登録
（各 specimen 先頭に `<!-- @dsCard group="Components" name="..." subtitle="..." -->`）。色は
`colors_and_type.css` の役割トークン、font は Noto Sans JP / Inter、display は Pacifico。

1. **`comp-terrestrial-3d.html`（新規）** — タイプ別 3 状態を1枚で並べる specimen。
   各状態に「中身」と「アンカー形状」を注釈で添える:
   - **default（normal）** = 小さいサムネ画像のみ（3D なし・棒は最小）
   - **main** = 3D ＋ サムネイル（中心・最大・セグメント/アバター列あり）
   - **sub** = 3D のみ（小・4方向・アンカーで浮遊）
2. **`comp-terrestrial-3d-scene.html`（新規）** — **傾けた俯瞰（pitch 55°）の地図シーン**に
   **メイン中心1個 ＋ サブ4個（NW/NE/SW/SE）が埋まった全体像**。真上からでなく地球儀を倒した
   見た目で、各オブジェクトがアンカー（逆三角形＋棒）で地表に刺さっているのが分かる絵。
   上サブ（NW/NE）は棒が長く、下サブ（SW/SE）は棒が短い差を見せる。

## B群: タイプ別の中身（希望・これから実装）

`EarthClusterRole` が役割を決める（`normal` / `main` / `subNorthWest` / `subNorthEast` /
`subSouthWest` / `subSouthEast`）。3D 形態（`TerrestrialType.threeD` = `pin.has3D` のとき）で
タイプ別に**こう出し分けたい**:

| タイプ | role | 中身（希望） | 現状実装 |
|---|---|---|---|
| デフォルト | normal | **小さいサムネ画像のみ**（3D を出さない） | 現状は normal でも 3D WebView を出している → 画像に変える |
| メイン | main | **3D ＋ サムネイル**（＋セグメント＋メンバーアバター列） | サムネ半分＋セグメント＋アバター（3D は出るが主役化していない）→ 3D を主役に |
| サブ | sub×4 | **3D のみ**（小・装飾なし） | サムネ 1/4。3D を出す |

- サムネ画像と 3D は**同じ投稿**由来（`EarthPin.thumbnailUrl` ＝ `StoryData.imageUrl`、
  `EarthPin.threeDPath` ＝ `StoryData.threeDPath`）。「画像を下敷きに作った 3D」という関係を
  メインで両方見せる（例: 3D の傍に小さくサムネを添える）。

## A群: アンカー・配置・傾き（実装が正・数値そのまま）

出どころ: `EarthClusterPolePainter` / `EarthClusterLayoutEngine` / `WdEarthPin`（逆三角形は同一アルゴリズム）。

### 逆三角形アンカー＋ポール

- **逆三角形**: 底（anchor＝地表点）から上辺（poleTip＝オブジェクト直下）への 3 点 Path。
  - 塗り **白 `#ffffff`**、影 **`rgba(0,0,0,0.5)`** ＋ blur 1px ＋ 右 1.5px オフセット
  - 上辺幅 `topWidth = clamp(6, 16, poleLen × 0.18)`（ポールが長いほど広がる、最大16）
  - 底に小円 r2.4px、先端に小円 r1.8px（いずれも白）
- **接続線**: poleTip → オブジェクト下端を **`rgba(255,255,255,0.6)`** の細線で繋ぐ
- **棒 vs 逆三角形の出し分け**:
  - `main` ＋ 下サブ（SW/SE）→ **逆三角形**（地表に刺さる土台感）
  - 上サブ（NW/NE）→ **細い白棒線**（ポールが極端に長く逆三角形だと上辺が広がり過ぎるため棒に戻す）

### ポール長（地図からの浮き）

`anchor`（地表点）から上にオブジェクトが `poleLen` だけ浮く。`thumbCenterY = anchor.dy − poleLen − thumbH/2`。

| role | ポール長 | サイズ係数 |
|---|---|---|
| normal（デフォルト） | `max(32, base × activeT)`（中心に近いほど長い） | 1.0 |
| main | `max(32, base × 0.5)`（mainPole 基準） | 1.0（最大・thumb×5 相当） |
| 上サブ NW/NE | **mainPole × 3.63**（長い） | 0.5 |
| 下サブ SW/SE | **max(32, mainPole × 1/3)**（短い） | 0.5 |

→ 上サブと下サブで棒の長さが **10倍以上違う**のが見た目の肝。最小ポール 32px。

### サブ4配置（地理楕円）

`EarthSubRoleAssigner` が中心周りの 4 楕円から最寄り候補を 1 つずつ winner に。シーン絵の配置目安:

| サブ | 方位 | 距離 | 棒 |
|---|---|---|---|
| NW | 333° | 遠（dist 2.7） | 長い |
| NE | 27° | 遠（dist 2.7） | 長い |
| SW | 232° | 近（dist 1.6） | 短い |
| SE | 128° | 近（dist 1.6） | 短い |

### 傾き（俯瞰）

- MapLibre **globe projection ＋ pitch**。pitch は 0°（真上）/ **55°（既定）** / 85°（最大）。
  シーン specimen は **55° の倒し込み**で描く（地球儀の丸みが見え、奥が小さく手前が大きい）。
- pitch が立つほどポールは長く・サムネは拡大（55° 付近がピーク）。Flutter 側は投影済み座標を
  受け取るだけ（Matrix4 変換はしない）＝ specimen も「倒した絵」を静的に描けば良い。

## 参照ファイル（全て上記 raw リンクで取得可）

実装（正）:
- `lib/component/ui/view/Earth/ThreeDTerrestrialView.dart`（3D 形態の本体・role 別装飾）
- `lib/component/ui/view/Earth/EarthClusterPolePainter.dart`（逆三角形・棒・影・接続線）
- `lib/component/ui/view/Earth/EarthClusterLayoutEngine.dart`（role 別サイズ・ポール長・anchor/tip 計算）
- `lib/component/ui/view/Earth/EarthClusterModels.dart`（`EarthClusterRole` / `TerrestrialType` enum）
- `lib/component/ui/view/Earth/EarthSubRoleAssigner.dart`（サブ4配置の方位・距離）
- `lib/component/ui/view/Earth/EarthPitchCurves.dart`（pitch カーブ・ポール/拡大連動）
- `lib/component/ui/view/Earth/ThumbnailTerrestrialView.dart`（サムネ装飾の数値・参考）
- `lib/component/ui/widget/WdEarthPin/WdEarthPin.dart`（単体ピンの逆三角形・同アルゴリズム）
- `lib/model/EarthPin.dart` / `lib/model/StoryData.dart`（thumbnailUrl / threeDPath の出どころ）

DS 基盤:
- `lib-design/DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css`
- `lib-design/DesignSystem/preview/components.css`（既存クラス語彙）
- `lib-design/DesignSystem/_ds_manifest.json`（索引）

## Claude Design に貼るプロンプト

```
design/ds-sync の DS を正として、Universe の 3D オブジェクト表示
ThreeDTerrestrialView のタイプ別 specimen を起こして。
private repo なので GitHub コネクタで univbrofd/toopdbq の design/ds-sync を読むこと。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/lib-design/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq/design/ds-sync/lib-design/handoff/ThreeDTerrestrialView/HANDOFF.md

作るもの:
1. comp-terrestrial-3d.html — タイプ別3状態を1枚で。
   default=小サムネ画像のみ / main=3D+サムネ(最大・中心) / sub=3Dのみ(小)。
   各状態にアンカー形状(逆三角形 or 白棒)とポール長の注釈。
2. comp-terrestrial-3d-scene.html — pitch 55°の倒した地図俯瞰に
   メイン中心1個 + サブ4個(NW/NE遠で棒長い・SW/SE近で棒短い)が刺さった全体像。

アンカー数値は HANDOFF の A群どおり(逆三角形=白#fff/影rgba(0,0,0,0.5)blur1/上辺幅clamp(6-16)/
接続線rgba(255,255,255,0.6)、main+下sub=逆三角形・上sub=白棒、上sub棒は下subの約10倍長)。
タイプ別の中身は B群(希望)どおり。色は colors_and_type.css の役割トークン、
font=Noto Sans JP/Inter、display=Pacifico。各specimen先頭に
<!-- @dsCard group="Components" name="..." subtitle="..." --> を付け _ds_manifest.json に登録。
新規発明・specimen に無い組み上げはしない。
```

## 取り込み（ダウンロード後）

Claude Design が bundle を出したら `/design {bundle URL}` で取り込み →
`references/handoff.md` C の reconcile（新規カードを repo へ、manifest を superset マージ）→
`design/ds-sync` へ push。実装段階で B群（タイプ別の中身）を `ThreeDTerrestrialView` に反映する。
