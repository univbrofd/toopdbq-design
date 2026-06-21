# HANDOFF — 3D GLB ビューア 発色契約（rendering contract）

Universe / Studio で .glb を表示するときの **正しい・明るい発色の描画契約**。アプリ側で
「発色が暗い・くすむ」を解消した確定設定を design repo に捕捉し、Claude Design の GLB specimen
（`uv3d.js` ＝ 共有マウンタ）が**アプリと同じ見た目**で 3D を出せるようにする。

これは「中身（アンカー形状・タイプ別表示）」の handoff ではない（それは `ThreeDTerrestrialView`）。
ここは **レンダラ設定（encoding / tone mapping / IBL / lights / framing）だけ**を正として渡す横断契約。

## repo / branch / raw リンク

- repo: `univbrofd/toopdbq-design`、branch: **`main`**
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/{path}`
- DS 索引: `DesignSystem/_ds_manifest.json`
- 共有マウンタ: `DesignSystem/preview/uv3d.js`（既存・全 3D specimen が使う）
- vendor: `DesignSystem/preview/vendor/`（`three.min.js` r128 / `GLTFLoader.js` / `OrbitControls.js` /
  **`RoomEnvironment.js`（本 handoff で追加済み）**）

## なぜ暗くくすむのか（根本原因）

three.js の WebGLRenderer は既定 `outputEncoding = LinearEncoding`。GLTF のテクスチャは sRGB なので、
Linear 出力のままだとガンマが合わず**暗く・彩度が落ちて**見える。加えて `pbr:true` で生成した
マテリアル（Tripo image_to_model の既定）は反射成分を照らす **環境光(IBL)** が無いと金属/光沢部が
黒く沈む。**Tripo API 側に明るさ・発色のパラメータは無い**（`texture_quality`=解像度 / `texture_alignment`=
整合性 / `pbr`=既定 true）ので、発色は**表示側の契約で決める**。

## アプリ確定値（正・そのまま写す）

別 repo `univbrofd/toopdbq` の `assets/web/model.html` / `scripts/tripo/viewer/single.html` で実測・採用済み。
three r128 で全 API 動作確認済み（`sRGBEncoding` / `ACESFilmicToneMapping` / `PMREMGenerator` / `RoomEnvironment`）。

```js
// renderer（透明背景。地図 / サムネ / サークル画像が後ろに透ける）
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.outputEncoding   = THREE.sRGBEncoding;          // ← くすみ最大要因の修正（必須）
renderer.toneMapping       = THREE.ACESFilmicToneMapping; // 明るさノブの土台
renderer.toneMappingExposure = 1.25;                      // ← 「明るめ」採用値（暗ければ 1.4〜1.6）

// IBL（PBR の反射成分を起こす。これが無いと envMapIntensity が死ぬ）
scene.environment = new THREE.PMREMGenerator(renderer)
  .fromScene(new THREE.RoomEnvironment(), 0.04).texture;

// 直接光（IBL の上に最小限）
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const dir = new THREE.DirectionalLight(0xffffff, 0.7); dir.position.set(1, 1, 2); scene.add(dir);
```

- **フレーミング**: 底面接地（モデル下端を y=0 へ）＋ 水平中心寄せ、ゆっくり自動回転（~26s/周）。
  ローダは `GLTFLoader` ＋ `MeshoptDecoder`（meshopt 圧縮 GLB のため必須）。
- **明るさノブ**: アプリは `window.setExposure(v)` で実機調整可。採用値 **1.25**。

## design 側の現状と差分（`uv3d.js`）

`uv3d.js` は **既に** sRGB + ACES を持つ（design 側で sRGB 問題は独自解決済み）。アプリと一致させるための
差分は **2 点だけ**:

| 項目 | uv3d.js 現状 | アプリ確定 | 対応 |
|---|---|---|---|
| `outputEncoding` | `sRGBEncoding` ✓ | `sRGBEncoding` | 一致・変更不要 |
| `toneMapping` | `ACESFilmicToneMapping` ✓ | 同 | 一致・変更不要 |
| `toneMappingExposure` | 既定 **1.15** | **1.25** | **1.25 に上げる**（既定値） |
| `scene.environment`（IBL） | **無し**（`envMapIntensity=0.6` が envMap 無しで死んでいる） | `PMREMGenerator.fromScene(RoomEnvironment, 0.04)` | **追加**（vendor 済み RoomEnvironment.js を読み込む） |
| 照明リグ | warm 3点（key 2.7 / fill 0.8 / rim 0.9 / amb 0.55） | neutral（amb 1.0 / dir 0.7） | **taste 判断**（下記） |

### 照明リグは taste の判断（design が決める）

アプリは neutral（白 ambient 1.0 ＋ dir 0.7 ＋ IBL）。`uv3d.js` は意図的な **warm "atelier" 3点リグ**。
IBL を**強い warm リグの上に**そのまま足すと露出オーバーになりうる。reconcile 案（推奨は A）:

- **A（推奨・アプリ準拠）**: IBL を主光源にし、warm 3点を弱める（key 2.7→~1.2 / fill 0.4 / rim 0.5 /
  amb 0.4 目安）＋ exposure 1.25。アプリの見た目に最も近く、彩度・明度が破綻しない。
- **B（atelier 維持）**: 現 warm リグを残し IBL は `fromScene(RoomEnvironment, 0.04)` を弱めに併用、
  exposure は 1.1〜1.15 に抑える。temperature は warm のまま。

どちらでも `outputEncoding=sRGB` ＋ exposure ノブは必須。`envMapIntensity=0.6` は IBL を入れて初めて効く。

## サンプル GLB（design repo 内・そのまま使える）

`assets/sample/3d/{id}/`（**15 件**）。各ディレクトリに `model.glb` / `thumbnail.jpg` / `video.mp4` / `meta.json`。
specimen は共有 `assets/` を参照（per-View に複製しない）:

- raw 例: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmbpk42_d6sz/model.glb`
- 軽い順の目安: `mqmbpk42_d6sz` / `mqmbpn15_v9lg`（~0.7–0.9MB）。重め: `mqmcyl7q_ts1m`（~5MB）。

## スマホ配置文脈（必須）

3D が出る画面（画面 393×852・SafeArea 考慮）:

- **地図に直接乗る**（Universe home）: 透明背景で地図ピン上に full-bleed。底面接地フレーミング。
- **3D フォーカス全画面**（main タップ）: サークル画像背景＋暗 scrim **rgba(0,0,0,0.55)**、前面中央に
  3D を**短辺×0.86 の正方領域・枠なし**で。Hero 拡大 320ms easeOutCubic。横ドラッグで 360°。
- いずれも背景が透けるので、発色契約（sRGB＋IBL）が効くと暗背景でも沈まず明るく出る。

## 成果物（Claude Design が作るもの）

1. **`uv3d.js` を発色契約へ更新** — exposure 既定 1.25、`RoomEnvironment` IBL を `scene.environment` に。
   vendor の `RoomEnvironment.js` を specimen の `<head>` で three の後に読み込む。照明リグは A/B から選ぶ
   （推奨 A）。`mount(host, { exposure })` の既定を 1.25 に。
2. **`comp-3d-viewer-contract.html`（新規 specimen）** — sample GLB を 1 体、`.phone` 枠の「3D フォーカス
   全画面」配置（scrim .55・短辺×0.86・枠なし）で描く。exposure スライダー（0.6–2.2・既定 1.25）で
   明るさノブを実演。先頭に `<!-- @dsCard group="Components" name="3D Viewer — 発色契約" subtitle="..." -->`
   を付け `_ds_manifest.json` に登録。
3. 既存の 3D specimen（terrestrial 系）が `uv3d.js` を使っているなら、契約更新後の見た目を確認。

色は `colors_and_type.css` の役割トークン、font=Noto Sans JP / Inter、display=Pacifico。

## 参照ファイル

実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF が design 上の正）:
- `assets/web/model.html`（per-GLB ビューア・確定値の出どころ）
- `scripts/tripo/viewer/single.html` / `viewer/globe.html`（同契約に統一済み）
- `lib/component/ui/view/Earth/ThreeDTerrestrialView.dart`（Flutter 側 3D 形態）

DS 基盤:
- `DesignSystem/preview/uv3d.js`（更新対象の共有マウンタ）
- `DesignSystem/preview/vendor/RoomEnvironment.js`（本 handoff で追加）
- `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css` / `_ds_manifest.json`

## 取り込み（ダウンロード後）

Claude Design が bundle を出したら `/import-design-bundle {URL}` で取り込み → `DesignSystem/preview/`
＋ `_ds_manifest.json` superset reconcile → `univbrofd/toopdbq-design` `main` push。
