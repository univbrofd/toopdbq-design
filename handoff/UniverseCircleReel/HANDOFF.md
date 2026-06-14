# HANDOFF — UniverseCircleReel（下部リールを「サークル別プレイリスト」へ＋3Dフォーカスのサークル背景）

UniverseView home 画面の**下部リール再設計**と**3D フォーカス状態**、および**タップ動線（モーション）**を Claude Design で specimen 化する逆ハンドオフ。画面の chrome（地図・scrim・バッジ・サイドツール・投稿ボタン・3D ピン）は既存 `handoff/UniverseView/HANDOFF.md` が正。**ここは下部リール＋フォーカス＋動線だけ**を扱う。

世界観厳守: ダーク（`--bg #08080b`）＋カラフル放射グラデ（`--gradient-colorful`）＋ガラス。Noto Sans JP / Inter。絵文字なし。効果は 1 要素 1〜2 個。呼称は「投稿」（「ストーリー」禁止）。`.phone` は **iPhone 17（402×874）既定**。

## 現状（実装＝正・維持する値）

- 現リール = メインクラスタの全メンバー（`allPins`）を**1 本の横スクロール**で並べる。
- cell（**この見た目は維持**）: **100×177.8（9:16 縦長）**、外枠 `BorderRadius 14`（border のみ）、内画像 `ClipRRect 12`（cover）。**代表＝白枠 `#ffffff` 2.5px**／非代表＝`rgba(255,255,255,.2)` 1px。欠落＝`#2A2A2A`＋`image_not_supported`。cell は**画像＋枠のみ**（アバター/名前/グラデは描かない）。
- リール下端＝画面高×24/852。タップで `selectRepresentative` → その投稿が地図上の**メイン代表（巨大 3D）**に昇格。

## データ前提（実装側の制約・設計はこれに従う）

- クラスタリングは**地理セル単位**で、**サークル単位グルーピングは現状無い**。ただし各投稿（`Terrestrial`）は **`circleId` / `circleName` / `circleImageUrl`（denormalized）** を持つ → これで `allPins` を**サークルごとにグループ化できる**（今回の新設計の核）。
- フォーカスの背景に使う「サークル画像」＝ その投稿の `circleImageUrl`。

## 作ってほしいもの（新設計）

### 1. `comp-universe-screen.html`（下部リールだけ差し替え）— **サークル別プレイリスト**
現在の 1 本横リールを、**サークルごとの「行」を縦に積む**プレイリストへ:
- **縦スクロール**: メインクラスタ内のサークルごとに 1 行。下端 scrim 内に 2〜3 行が見え、上方向にめくれる。
- **各行**: 左に**サークルヘッダー**（`assets/sample/uv/circle-NN.png` の丸サムネ 28〜32px ＋ サークル名 `--text-2` 12px・1行省略）。その右に**そのサークルの投稿を横スクロール**（cell は上記「維持する見た目」のまま、9:16・枠14/12）。
- 横スクロールは**行ごとに独立**。行内の先頭 or 任意 cell が**代表なら白枠 2.5px**。
- 投稿サムネは `assets/sample/uv/story-01..10.png`、サークルサムネは `assets/sample/uv/circle-01..10.png` を使う（10 投稿・10 サークルぶん用意済み）。
- 画面全体は `.phone`（iPhone17）枠に full-bleed。下部は既存の bottom scrim（h180 `0x9E→0x00`）の上にプレイリストを重ねる。投稿ボタン（camera/badgeColor 55×55・右下）とサイドツールは既存どおり共存。

### 2. `comp-universe-focus.html`（**新規**）— 3D フォーカス状態
メインの巨大 3D を**もう一度タップ**するとフォーカス状態へ:
- **背景**: フォーカス中の投稿の**サークル画像が全画面背景**（`assets/sample/uv/circle-NN.png` を `cover`＋暗い scrim `rgba(0,0,0,.55)` でガラス化）。← **ここが新規**（従来は地図背景）。
- **前面**: 中央に **3D オブジェクト**（`assets/sample/uv/obj-01..04.png` の透過 PNG を使用）。サイズ＝**短辺×0.86 の正方領域**に収まる。枠なし。
- **操作ヒント**: 「ドラッグで 360°」を最小限のヒントで（`--text-3`）。閉じる×は控えめに上部。chrome は最小。
- 登場は地図ピン矩形→中央へ **320ms easeOutCubic** の Hero 拡大（モーション specimen で表現）。

### 3. `comp-universe-flow.html`（**新規**）— タップ動線（モーション）
横並び 4 コマで状態遷移を示す（各コマ `.phone` を縮小配置でも可）:
1. **通常**: 地図に 3D ピン群＋下部サークル別プレイリスト。代表＝白枠。
2. **リストの投稿をタップ** → その投稿が**地図のメイン代表（巨大 3D）に置き換わる**（白枠が移動）。
3. **メイン 3D をタップ** → **フォーカス開始**（Hero 拡大・サークル画像が背景にフェードイン）。
4. **フォーカス中**: サークル画像背景＋前面 3D、ドラッグで 360°。背景タップ/×で 1 へ戻る。

## 用意済みアセット（共有 `assets/` 単一ソース）

- 投稿サムネ: `assets/sample/uv/story-01.png` … `story-10.png`（9:16）
- サークルサムネ: `assets/sample/uv/circle-01.png` … `circle-10.png`（正方・アバター調）
- 3D オブジェクト（背景透過）: `assets/sample/uv/obj-01.png` … `obj-04.png`
- specimen からの相対参照（`DesignSystem/preview/*.html` は `../../assets/...`）。

## repo / raw リンク

- repo: `univbrofd/toopdbq-design`、branch: `main`（public・raw 直取得可）
- 索引: `DesignSystem/_ds_manifest.json` / 画面 chrome の正: `handoff/UniverseView/HANDOFF.md`
- 既存スクショ参照（任意）: `handoff/UniverseView/shots/real-home.jpg` / `real-reel.jpg`

## トークン根拠（新規発明禁止）

`DesignSystem/colors_and_type.css`（`--bg` / `--text-1/2/3` / `--gradient-colorful` / `--scrim*` / `--radius-*`）。Flutter 側 `FigmaColors.dart` がこれを鏡写し。`.phone`/`.statusbar`/`.dynamic-island`/`.home-ind` は `DesignSystem/preview/card.css`。

## 取り込み（ダウンロード後）

bundle を `/design {URL}` で取り込み → `DesignSystem/preview/`＋`_ds_manifest.json`（superset）へ reconcile → `univbrofd/toopdbq-design` `main` へ push → Flutter 具現化（`_ClusterReel` を circleId グループ化＋`enter3dFocus` 背景にサークル画像）。
