# HANDOFF — UniverseView（Earth Globe・live specimen / 画面全体）

アプリ中核 home 画面 `UniverseView` の **live specimen**。MapLibre positron globe ＋ **画面空間 3D オーバーレイ**
＋ 下部サークルプレイリスト ＋ 右サイドツール ＋ 投稿ボタン を 1 ファイルに組み上げ、Flutter 無しで
ブラウザでそのまま動く。`Earth Globe.html` を開けば globe が回り、3D をタップでフォーカス回覧できる。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
> 旧 `handoff/PlanetView/`（globe 背景のみの先代 specimen）は本 handoff に統合・廃止。

## 成果物（このフォルダ内で完結）

- **`Earth Globe.html`** — live specimen 本体。head で DS `colors_and_type.css` ＋ MapLibre v5 ＋
  three.js 0.128（GLTFLoader / meshopt）を読む。アセットは共有単一ソースを参照（`../../assets/...` /
  `../../DesignSystem/...`、per-View の `assets/` は持たない）。
- **`earth/`** — エンジン:
  - `look.js` — 見た目モデル ＋ 右の調整パネル（globe/marker/atmosphere/frame ＋「周辺オブジェクト指標」）
  - `map-core.js` — MapLibre positron（`basemaps.cartocdn.com/.../positron`）＋ globe projection ＋ 3 プリセット
  - `overlay.js` — 大気リング（`#strato-shadow`）/ 球縁白線（`#globe-frame`）/ 中心マーカー
  - `objects3d.js` — **画面空間 3D オーバーレイ**（本 specimen の主役。下記）
  - `models.js` — 旧・地図密着方式（実寸 m の three.js custom layer）。**現行は未使用**だが参照のため残置
  - `bridge.js` — プリセット / パネル / init 配線
- **`shots/`** — 実機スクショ（`real-home.jpg` 他）。**世界観・配置の正**。CSS の作りやすさで近似せずこれに寄せる。

## アーキテクチャの要点（地図密着 → 画面空間オーバーレイ）

旧方式（`models.js`）は 3D を地図 WebGL 内に実寸 m で描いたため zoom で大きさが変わり、ヒットテスト/
フォーカスが難しかった。現行 `objects3d.js` は **地図の上に独立した three.js キャンバスを重ね**、毎フレーム
各投稿の lat/lng を `map.project()` で画面ピクセルに射影し、その位置に **一定ピクセルサイズ** で描く。

- **ズーム非依存の一定サイズ** — 縮小/拡大しても 3D の大きさは一定（位置だけ追従）。`cfg.MARKER_PX` 既定 96px。
- **メインオブジェクト 2×** — 毎フレ画面中心に最も近い 1 個を main に選定し `cfg.MAIN_SCALE`(=2) で拡大。
  pan に応じ滑らかに grow/shrink（ポップしない）。フォーカス中は選定停止。`cfg.MAIN_*` で調整。
- **タップ挙動の出し分け** — **main をタップ→フォーカス**（中央へ Hero 拡大・320ms easeOutCubic・背景の地図のみ
  scrim で暗転）。**main 以外をタップ→地図がその位置へ glide**（= その対象が新しい main になる。フォーカスしない）。
- **360°回覧** — フォーカス中はドラッグで全方向回転（横=ヤウ / 縦=ピッチ / 離すと慣性）。`cfg.IDLE_SPIN` 自動回転。
  閉じるは ✕ ボタン（**フォーカス中オブジェクトの左上角**に追従配置・画面端から余白）または背景タップ。
- **向き** — GLB 既定は右(+X)向きなので `cfg.FACE_DEG=-90`（カメラ＝画面手前向き）＋投稿ごと ±`JITTER_DEG` ジッタ。
- **ヒットプロキシ** — 各マーカーに不可視の余裕ボックスを当て、細身/複雑なシルエットでもマーカー全面が確実にタップ可能。
- **縁インジケーター（周辺オブジェクト指標）** — 画面中央が孤立しがちな Street ビュー向けの施策。画面外の近隣
  オブジェクトを **画面の淵ギリギリ**（外縁が端を ~8px はみ出す）にクランプしたガラスチップで提示。各チップは
  対象 3D の **ライブポートレート** ＋ 方向シェブロン（実ベアリング）＋ 距離（haversine）。レイヤは 3D マーカー /
  chrome の **下**（端で重なると後ろへ潜る）。スタイル（サムネ/矢印/ドット/オフ）・出現条件（1個/2個まで/常に・
  既定=2個まで）・サイズ・距離ラベル・パルス・最大数をパネルで切替（「施策」比較用）。

GLB ソース = 本番 Firebase Storage の公開 URL を直接参照（`firebasestorage.googleapis.com/.../story/{id}/{id}.glb`、
CORS `*`）。**design repo にユーザー投稿コンテンツ（GLB/写真）を複製しない**。bootstrap に渋谷の実投稿 11 件を
各実 lat/lng で配置（`real-10`=ハチ公像＝map CENTER）。meshopt 圧縮のため `MeshoptDecoder.ready` 待ち。

## globe 装飾レイヤ（z 昇順・`overlay.js` / `look.js` の値）

- `#bg-white` — 宇宙背景グラデ（pale positron 球と馴染む soft な light blue-gray。`white`/`cool`/`deep` をプリセット化）。
- `#strato-shadow` — 球縁の **大気リング**。teal 系 radial。低 zoom（球の縁が見える引き）でのみ表示。
- `#map` — MapLibre canvas（球の中だけ描画、外は透明）。
- `#center-overlay` — **中心マーカー**（青ドット `rgba(66,133,244)` ＋白縁 ＋ glow ＋ ping。pitch で楕円化）。
- `#globe-frame` — 球の見かけ縁の **白線**。低 zoom でのみ表示。

3 プリセット: **🌍 Globe**（引き・宇宙に浮かぶ球・自動自転）/ **🗾 Region**（日本広域）/
**🏙 Street+3D**（街区 zoom~16・pitch55・**初期表示**。ハチ公像が中央 main に出る）。specimen は pan+zoom を解放。

## 下部 chrome（specimen に composite 済み・実機の領分）

- **サークルプレイリスト**（`#playlist`） — 4 行（渋谷コミュニティ等）の縦並び、各行 story サムネを横スクロール。
  cell タップで白枠（代表）が移動し `uv:select` 発火。背後に読みやすさ用の保護ベール。
- **WdSideTool**（右端中央） — アバター（フォローバッジ）→ like → comment → pin の縦レール（DS `components.css`）。
  like はタップでトグル（pink fill ＋ カウント増減・`uv:like`）。
- **投稿ボタン**（右下） — カラフル放射グラデのリング ＋ カメラ ＋ add バッジ。タップで `uv:post`。
- フォーカス中もプレイリスト / サイドツール / 投稿ボタンは **3D の上に持ち上げて** タップ可能（押してもフォーカス維持）。

## スマホ配置文脈

画面 **402×874 + SafeArea**（iPhone 17 / iOS 最新・`card.css` `.phone`）。globe は full-bleed 背景。
chrome は SafeArea を避けて重ねる。タップ範囲 ≥44pt（投稿ボタン 55×55）。

## 実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。この HANDOFF / 実機が正）

- lib/feature/Universe/UniverseView.dart・UniverseController（home 画面）
- lib/component/ui/view/Earth/（globe WebView ＋ ピン ＋ 3D オーバーレイ）/ ThreeDTerrestrialView.dart
- lib/feature/Main/StoryOverlayView.dart（リール・投稿ボタン・サイドツール・scrim）
- 部品ハンドオフ（再定義しない）: `handoff/ThreeDTerrestrialView/` / `handoff/TerrestrialPin/` /
  `handoff/UniverseCircleReel/` / `handoff/WdStorySideTool/`

## 取り込み済み

本 bundle は `/import-design-bundle` で取り込み・push 済み。Flutter 具現化は `/design-to-flutter UniverseView`。
