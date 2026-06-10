# HANDOFF — TerrestrialPin（UniverseView のピン 3 タイプ）

UniverseView（地球儀）上に立つ地物ピンの **3 つの表示形態**（`TerrestrialType`）を
Claude Design で specimen 化するための逆ハンドオフ。**現状実装が単一の正**。希望・将来案は混ぜず、
いま動いているコードの見た目をそのまま写す（再発明しない）。

形態は `TerrestrialTile`（`EarthClusterThumbWidget.dart`）が `terrestrialType` で 3 つの
自己完結 View に振り分ける:

| type | View | 中身 |
|---|---|---|
| `thumbnail` | `ThumbnailTerrestrialView` | 投稿写真サムネ（角丸枠） |
| `icon` | `IconTerrestrialView` | 投稿者アイコン（円） |
| `threeD` | `ThreeDTerrestrialView` | 枠なし 3D ＋ ステージビーコン |

軸は 2 本あり直交する。**form（type）= データ由来で不変**、**role（配置）= 画面位置で頻繁に変わる**。
- form 確定（engine, `EarthClusterLayoutEngine`）: `rep.pin.has3D ? threeD : thumbnail`。
  **`icon` は実装済みだが engine では未発火**（発火条件が未確定。条件が決まったらここで分岐）。
- role（`EarthClusterRole`）: `normal` / `main` / `subNorthWest` / `subNorthEast` / `subSouthWest` / `subSouthEast`。

## repo / branch / raw リンク

- repo: `univbrofd/toopdbq-design`、branch: **`main`**
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/{path}`
- DS 索引: `DesignSystem/_ds_manifest.json`

## 成果物（Claude Design が作るもの）

`DesignSystem/preview/` に specimen を起こし `_ds_manifest.json` の `cards` に登録
（各 specimen 先頭に `<!-- @dsCard group="Components" name="..." subtitle="..." -->`）。
色は下記コード実値を正とし、`colors_and_type.css` の役割トークンに一致するものはトークンを使う。
font は Noto Sans JP / Inter。

1. **`comp-terrestrial-thumbnail.html`（新規）** — thumbnail 形態。状態 `default(normal) / main / sub` を 1 枚で。
   main は segment（上端）+ member avatar 列（下端）付き。各状態にアンカー（逆三角形/白棒）注釈。
2. **`comp-terrestrial-icon.html`（新規）** — icon 形態。状態 `default(normal) / main / sub`。
   main/sub はアイコン下に名前、default はアイコンのみ。注釈に「engine 未発火・実装のみ」を明記。
3. **3D 形態 = 既存 `comp-terrestrial-stage.html` を流用**（再作成しない）。ステージビーコンはそこが正。
4. **`comp-terrestrial-pin-scene.html`（新規）** — pitch 55° に倒した地図俯瞰に、**3 タイプ混在**の全体像。
   thumbnail/icon は逆三角形ポールで地表に刺さり、3D はステージビーコンで浮く対比を 1 枚で見せる。
   main 中心 1 + sub4（NW/NE 遠で棒長い・SW/SE 近で棒短い）の配置。

## 共通: アンカー（role 軸・実装が正）

サイズ・ポール長は role で決まり 3 type 共通。base = `thumbW 36 × thumbH 64`（scale 1.0, normal）。

| role | size 係数 | base px (W×H) | ポール長 |
|---|---|---|---|
| `normal`（default） | 1.0 | 36×64 | `max(32, max(maxPoleLen, poleFloor) × activeT)`（中心に近いほど長い） |
| `main` | 1.0 | 36×64 | `max(32, … × 0.5)`（元の半分） |
| 上 sub NW/NE | 0.5 | 18×32 | `mainPole × 3.63`（長い） |
| 下 sub SW/SE | 0.5 | 18×32 | `max(32, mainPole × 1/3)`（短い） |

`poleFloor = thumbH × 0.2`、最小ポール 32px。`thumbCenterY = anchor.dy − poleLen − thumbH/2`。
→ 上 sub と下 sub で棒長が 10 倍以上違うのが見た目の肝。

### アンカー描画は type で 2 系統に分かれる

**A. 逆三角形ポール（thumbnail / icon）** — `EarthClusterPolePainter`:
- 逆三角形（`main` + 下 sub SW/SE）: 白 `#ffffff` fill。上辺幅 `clamp(6, 16, poleLen × 0.18)`。
  底に小円 r2.4、先端に小円 r1.8（白）。影 `rgba(0,0,0,0.5)` blur1 ＋右 1.5px オフセット。
- 白棒（上 sub NW/NE のみ）: strokeWidth 1.6・round・白。底円 r2.4 / 先端円 r1.8。影 strokeWidth 1.8
  `rgba(0,0,0,0.5)` blur1 ＋右 1.5px。（長い pole で逆三角形だと上辺が広がり過ぎるため棒に戻す）
- 接続線: poleTip → オブジェクト下端を `rgba(255,255,255,0.6)` の 0.8px 線で繋ぐ。

**B. ステージビーコン（3D のみ）** — `_ThreeDBeaconPainter`、モノクロ白:
- 接地点: 白発光ドット（2 層グロー + 白コア、半径 `clamp(1.8, 3.0)`）。
- 光の軸: 接地点 → poleTip の細い直線（幅 `clamp(1.2, 2.6)`、白グラデ + soft glow halo）。
- 浮遊ステージ: 薄い 1 本リング楕円（`rw = ow×0.46`, `rh = rw×0.4`）+ 下の白アンダーグロー +
  内側の淡い radial fill + 外グロー + 上端ハイライト弧。
- 統合影: 接地点 + 軸 + ステージを 1 path にまとめ offset(1,3)・blur3.5・`rgba(0,0,0,0.25)`。
- `main` は枠・グロー・軸を一段明るくする。

## 共通: バッジ（3 type 共通）

- **cluster badge**（`totalCount > 1`、サムネ右上角）: 白円 `#ffffff`、枠 `#999999` 1px、
  影 `rgba(0,0,0,0.45)` blur4、黒文字 w700。径 `clamp(14, 32, min(W,H)×0.45)`、文字 = 径×0.5。`99+` 上限。
- **pin badge**（通知・サムネ左上角、18px）: 赤円 `#ff3b30`、白枠 1.5px、影 `rgba(0,0,0,0.45)` blur4、
  白文字 10px w700。

## Type 1: thumbnail（`ThumbnailTerrestrialView`）

- 枠: `borderRadius 6`、border 白 alpha `180→255`（highlight 0→1）1px、影 `rgba(0,0,0,0.45)` blur8。
  内側 `ClipRRect 5` に投稿写真（cover）。placeholder `#9e9e9e`。
- **main 限定の装飾**:
  - segment（StoryViewer 風、サムネ上端）: top/side inset 4、seg 高 2.5・gap 2・最大 6 本、
    active `#ffffff` / inactive `rgba(255,255,255,0.3)`、pill 角丸、影 `rgba(0,0,0,0.4)` blur1.5 offset(0,0.5)。
    7 本以上は 6 本 + 末尾に総数 `9px`。
  - member avatar 列（サムネ下端 +4px、複数オーナー時）: 円 径 `clamp(14, 36, thumbW×0.42)`、
    bg `#222222`、白枠 1.2、影 `rgba(0,0,0,0.4)` blur4、gap 3、最大 5 + overflow チップ（白円・黒 `+N`）。

## Type 2: icon（`IconTerrestrialView`）

- アイコン: 1:1 円、bg `#222222`、白枠 1.2、影 `[rgba(0,0,0,0.4) blur8 offset(0,1), rgba(0,0,0,0.2) blur3]`。
  ClipOval に投稿者アイコン（cover）。placeholder `#9e9e9e`。
- 名前: `main` / `sub` ではアイコン下 +4px に名前（白 11px w700、影 `rgba(0,0,0,0.9)` blur6 offset(0,1)
  + `rgba(0,0,0,0.7)` blur3）。`default(normal)` はアイコンのみ。
- ※ **engine 未発火**: 現状 engine は `has3D→threeD / それ以外→thumbnail` しか選ばないため icon は
  まだ地図に出ない。specimen の注釈に「実装済み・dispatch 条件 TBD」と明記。

## Type 3: threeD（`ThreeDTerrestrialView`）

- **全ロールでステージ + 裸 3D**（normal も裸 3D が乗る）。アンカーは上記 B（ステージビーコン）。
- 中身（ステージの上に浮く）:
  - ロード中 = 抽象クリスタルの materialize 演出（暗色 conic クリスタル + 上昇スキャン帯 + 脈動オーラ。くるくる無し）。
  - ok = 透明背景の three.js WebView のみ（枠なしで 3D が浮く）。
  - error = `#2a1212` に broken_image 赤アイコン + 「3D失敗」。
- specimen は既存 `comp-terrestrial-stage.html` が正。新規作成しない。

## 参照ファイル

実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF が design 上の正）:
- `lib/component/ui/view/Earth/EarthClusterThumbWidget.dart`（`TerrestrialTile` の type 振り分け）
- `lib/component/ui/view/Earth/ThumbnailTerrestrialView.dart`
- `lib/component/ui/view/Earth/IconTerrestrialView.dart`
- `lib/component/ui/view/Earth/ThreeDTerrestrialView.dart`（ステージビーコン `_ThreeDBeaconPainter` 同梱）
- `lib/component/ui/view/Earth/EarthClusterPolePainter.dart`（逆三角形・白棒・影・接続線）
- `lib/component/ui/view/Earth/EarthClusterLayoutEngine.dart`（role 別サイズ・ポール長・anchor/tip）
- `lib/component/ui/view/Earth/EarthClusterModels.dart`（`EarthClusterRole` / `TerrestrialType` enum）

DS 基盤:
- `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css`
- `DesignSystem/preview/components.css`（既存クラス語彙）/ `comp-terrestrial-stage.html`（3D 形態の正）
- `DesignSystem/_ds_manifest.json`（索引）

## Claude Design に貼るプロンプト

```
DS を正として、UniverseView の地物ピン 3 タイプ（thumbnail / icon / threeD）の
specimen を、現状実装どおりに起こして。希望や将来案は足さず、実装の見た目だけを写す。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/TerrestrialPin/HANDOFF.md

作るもの:
1. comp-terrestrial-thumbnail.html — thumbnail 形態。default(normal)/main/sub を 1 枚。
   main は segment(上端) + member avatar 列(下端)。各状態にアンカー(逆三角形/白棒)注釈。
2. comp-terrestrial-icon.html — icon 形態。default(normal)/main/sub。
   main/sub はアイコン下に名前、default はアイコンのみ。「engine 未発火・実装のみ」を注釈。
3. comp-terrestrial-pin-scene.html — pitch 55° の倒した地図俯瞰に 3 タイプ混在。
   thumbnail/icon は逆三角形ポール、3D はステージビーコンで浮く対比。main 中心 1 + sub4
   (NW/NE 遠で棒長い・SW/SE 近で棒短い)。
3D 形態は既存 comp-terrestrial-stage.html を流用し再作成しない。

数値は HANDOFF の「共通: アンカー」「共通: バッジ」「Type 1/2」どおり。色はコード実値を正に
colors_and_type.css の役割トークンへ寄せる。font=Noto Sans JP/Inter。各 specimen 先頭に
<!-- @dsCard group="Components" name="..." subtitle="..." --> を付け _ds_manifest.json に登録。
新規発明・specimen に無い組み上げはしない。
```

## 取り込み（ダウンロード後）

Claude Design が bundle を出したら `/design {URL}` で取り込み →
`DesignSystem/preview/` + `_ds_manifest.json` superset reconcile →
`univbrofd/toopdbq-design` `main` push。
