# HANDOFF — PlanetView の地球儀（Earth globe・live specimen）

UniverseView home の背景＝**地球儀**を Claude Design で**そのまま動かせる**ようにした逆ハンドオフ。
本体の web 実装（`assets/web/earth.html` + `earth/*.js`）を design repo にコピーし、Flutter bridge 不在でも
単体起動する live specimen にしてある。**Claude Design はこの HTML を開けば実物の globe をブラウザで回せる**。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）

## 成果物（この handoff フォルダ内で完結）

- **`handoff/PlanetView/Earth Globe.html`** — live specimen（Claude Design 版。globe ＋ 見た目
  チューニングパネル ＋ 下部サークル別プレイリスト ＋ 投稿ボタン ＋ **地図上の実 3D**）。
- **`handoff/PlanetView/earth/`** — エンジン: `look.js`（見た目モデル）/ `map-core.js`（MapLibre
  positron + globe projection + 3 プリセット）/ `overlay.js`（大気リング/球縁/中心マーカー）/
  `bridge.js`（配線）/ **`models.js`**（three.js custom layer。本体 `assets/web/earth/models.js`
  を `window.EarthMap.map` 用に適合）。
- **3D on map**: `Earth Globe.html` 末尾の bootstrap が **実機の 3D 投稿を各投稿の実 lat/lng
  （RTDB `/story`）に geo-anchor** して `setModels` する（アプリと同じ位置）。`SCALE_M`（実寸 m・
  既定 18）で大きさ調整。GLB は `EXT_meshopt_compression` のため `MeshoptDecoder.ready` 待ち。
- **GLB ソース = 本番 Firebase Storage の公開 URL を直接参照**（`firebasestorage.googleapis.com/...
  /story/{id}/{id}.glb?alt=media&token=...`、`access-control-allow-origin: *`）。
  **design repo にユーザー投稿コンテンツ（GLB/写真）を複製しない**（既に公開済みの URL を指すだけ）。
  これで Claude Design のブラウザからも CORS で取得でき、PII を含みうる素材を公開コピーせずに済む。
  real-10 = ハチ公像（CENTER と同位置）。座標↔story の対応は本体側 `assets/sample/models/MODELS.md`。

## これは「何の」specimen か（重要な切り分け）

UniverseView の見えるものは **2 層**に分かれる:

1. **web globe（＝この specimen の範囲）** — MapLibre の球体（positron + globe projection）、
   **大気リング**、**球縁の白線**、**中心の青ドット**、地表に乗る **3D GLB**（three.js custom layer）。
   ここは web(HTML/JS/WebGL) が描く。だから Claude Design でそのまま動く。
2. **Flutter overlay（この specimen には出ない）** — 投稿サムネ / クラスタピン / アカウントバッジ /
   サイドツール / サークル別プレイリスト / 投稿ボタン。これは Flutter widget を WebView の上に重ねている。
   web globe は pin の screen 投影を計算して Flutter に返すだけで、**pin 自体は描かない**。
   → これらの chrome は別 specimen **`DesignSystem/preview/comp-universe-screen.html`** が正。ここでは触らない。

## globe の実装値（捕捉・Claude Design が見た目を詰める基準）

別 repo `univbrofd/toopdbq`・参考: `assets/web/earth.html` / `earth/map-core.js` / `earth/overlay.js`。
値は下記で固定（実装が正）:

### MapLibre / projection / camera
- style: `https://tiles.openfreemap.org/styles/positron`（淡色 positron）。`antialias: true`（3D 合成に必須）。
- projection: **globe**（`map.setProjection({type:'globe'})` を `style.load` で適用）。
- zoom: `BASE_ZOOM 6.4` / 範囲 `[-6, 16]`（-6 で球が画面の ~1/64＝米粒、16 で街区）。
- pitch: 既定 `55°`（`maxPitch 55` で固定 / `minPitch 0`）。pitch>0 で 3D 建物 ON、padding.top を pitch 比で自動付与。
- bearing 0 固定（`bearingSnap 0`）。本体は `interactive:false`（全ジェスチャ無効）で Flutter が
  `setCamera/setPitch/earthPanBy/setCenter` を連打して駆動する。**specimen だけ pan/zoom を解放**して触れるようにしてある。

### 装飾レイヤ（z 昇順・`earth.html` の値そのまま）
- `#bg-white` z0 — 本体は背景 `#000000`。**specimen は宇宙の暗色グラデ**に変更（`#0d1020→#04040a`）。
- `#strato-shadow` z1 — **大気（成層圏）リング**。中心 `--cx --cy`・半径 `--r`・幅 `--w` を毎フレ更新する
  radial-gradient。色は `rgba(164,188,250,1.0)`（内縁）→ `rgba(104,118,155,0.5)`（中）→ 透明。`blur(6px)`。
  球の縁が見える引き（低 zoom）でのみ `display:block`。
- `#map` z2 — MapLibre canvas（球の中だけ描画、外は透明）。
- `#center-overlay` z3 — **中心マーカー**。`ellipse#center-marker` = `fill rgba(66,133,244,0.80)` /
  `stroke #FFFFFF 1.2` / `rx,ry 10`（pitch で `cos(pitch)` 楕円化）。外周 `#center-marker-glow`
  = `rgba(66,133,244,0.33)` を `blur(4px)`。
- `#globe-frame` z4 — **球の見かけ縁の白線**。`circle stroke #ffffff 8`（`vector-effect:non-scaling-stroke`）、
  SVG 全体に `blur(3px)`。strato と同じ円近似 (cx,cy,r) で追従。低 zoom でのみ `display:block`。

### 3D GLB（`models.js`・three.js custom layer）
- `window.setModels({models:[{id,lat,lng,url,scale?}]})` で GLB を地表に配置。`scale` は実寸(m)、既定 400m。
- 地図の pitch/zoom/bearing に追従し「地表に乗る」。ライト = Ambient 0.9 + Directional 0.7。
- specimen は `assets/sample/models/model-01..03.glb` を渋谷付近に置いている（実機は写真由来の人物 GLB）。

## specimen の動かし方（earth-globe.html）

- 下部プリセット: **🌍 Globe**（zoom2.3・宇宙に浮かぶ球＝大気リング/白縁が出る・自動自転）/
  **🗾 Region**（zoom8.2 pitch35・日本広域）/ **🏙 Street+3D**（zoom14 pitch55・街区＋地表 3D）。
- **ドラッグで回す / ホイールで寄り引き**（specimen だけ pan+zoom を解放。touch rotate は無効）。
- Globe ビューは自動自転、手で触ると止まる。

## Claude Design に詰めてほしい点（globe の見た目だけ）

スマホ配置文脈: 画面 **402×874 + SafeArea**（iPhone 17 / iOS 最新）。globe は **full-bleed**（端まで）背景。
chrome（バッジ/リール/サイドツール）は別 specimen の領分なのでここでは足さない。

- **大気リング**の色・太さ・滲み（`--strato` 三色 / `blur`）— 宇宙に浮かぶ感、明るすぎ/暗すぎの調整。
- **球縁の白線**の太さ・滲み（`stroke-width` / `blur`）。
- **中心マーカー**の色・サイズ・楕円化・グロー。
- 宇宙背景（`#bg-white`）のグラデ — positron の淡色球と馴染む暗色。
- positron の**ラベル/道路 shield** の出方（本体は `shrinkPlaceLabels` で place ラベル縮小・shield 非表示）。
- 「引き（Globe）↔ 寄り（Street）」の見え方の連続性（zoom レンジ・pitch・padding）。

逸脱して直すなら: 色は **役割トークン**（`colors_and_type.css`）へ寄せる（場当たり hex を避ける）。
globe の青系（大気 `rgba(164,188,250)` / 中心 `rgba(66,133,244)`）はブランドの寒色側と整合させてよい。

## 取り込み（Claude Design が export したら）

bundle URL を `/import-design-bundle {URL}` で渡す。`handoff/PlanetView/` 配下を更新・push する。
