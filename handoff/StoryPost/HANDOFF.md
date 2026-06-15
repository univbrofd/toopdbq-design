# StoryPost — 投稿フロー（撮影 → 編集 → マップで位置決め）

撮影/アルバム選択 → テキスト編集 → 「投稿へ」→ **Universe（地球儀）上で地図を動かし、画面中心ピンの位置を投稿位置として確定**するまでの 3 シーン。最終確定後のアップロード演出は対象外（このハンドオフは「マップを動かして位置を決めるまで」）。

実装由来の一次情報を値で固定（別 repo `univbrofd/toopdbq` 参考）。色は `DesignSystem/colors_and_type.css` が canonical、寸法・コピー・状態は下の値が正。

- repo: `univbrofd/toopdbq-design` / `main`
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main`
- DS 索引: `DesignSystem/_ds_manifest.json`（cards / tokens / fonts）
- foundation: `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css` / `preview/`

## 成果物（作ってほしいもの）

3 シーンを **1 シーン = 1 full-bleed specimen ファイル**で。保存先 `DesignSystem/preview/comp-storypost-{scene}.html`：

1. `comp-storypost-shoot.html` — 撮影
2. `comp-storypost-edit.html` — テキスト編集
3. `comp-storypost-place.html` — マップで位置決め（compose）★ 本命

各 specimen 先頭に `@dsCard`、`_ds_manifest.json` に登録。各画面は `preview/card.css` の `.phone` 枠（iPhone 17 = 402×874・Dynamic Island）に実配置で描く。写真は `assets/sample/` プール、アイコンは `assets/icons/`、地球儀の背景は既存 `UniverseView` / `PlanetView` specimen の地球儀をそのまま流用してよい。

## スマホ配置文脈（必須）

全シーン full-bleed・ダーク。実装の座標基準は 393×852（specimen は .phone=402×874 に等価配置）。タップ範囲は最小 44pt。

### シーン1 — 撮影 `shoot`
- 背景: カメラプレビューを full-bleed（specimen は `assets/sample/` の写真で代用）。地は `--black`。
- 上: `WdNavigationHeader`（standart = 戻る付き）を status bar 直下に。
- 下: ボトムスタック（Column, 下寄せ）
  - `WdCameraFooter`（standart）= 横並び中央: [アルバム＝`WdIconButton` icon `image`/standart] — gap **80** — [シャッター＝`WdTakeButton`] — gap **80** — [カメラ切替＝`WdIconButton` icon `swap`/standart]
  - gap **36**
  - `WdCircleFooter`（simple）= 投稿先サークルのピル

### シーン2 — テキスト編集 `edit`
- 背景: 撮った写真を full-bleed（`assets/sample/`）。その上に配置済みテキスト（ドラッグ配置・回転/拡縮された日本語テキスト 1〜2 個）。
- 右端中央: テキスト追加ボタン＝`WdIconButton`（icon `text`, variant **badge**, badgeIcon `add`）。位置 `right: 約2%（≈8px）`・縦中央。
- 下中央: 投稿へ進むボタン＝`WdIconButton`（icon `check`, variant **standartColor** = カラフルリム）。中央寄せ。
- gap **36** → `WdCircleFooter`（simple）
- 上: `WdNavigationHeader`（titleless = 閉じる ✕ のみ、タイトルなし）

### シーン3 — マップで位置決め `place` ★本命
- 背景: **Universe の地球儀を full-bleed**。ユーザーが地図をドラッグして動かす（globe 操作）。
- **画面中心に投稿写真のピンを固定**（`Terrestrial` サムネピン 1 個）。地図を動かすとピンは常に中心に追従し、**地図中心＝投稿位置**であることを示す。他のピン・3D は非表示（compose 中は中心ピンだけ）。中心であることが伝わる演出（中心マーカー/十字/「ここに投稿」の含意）があると良い。
- 右上: 閉じる ✕。`SafeArea(bottom:false)` 下、`Padding(8)`、`47×47` のタップ枠の中央に `close` アイコン `24×24`。
- 下部アクションバー（bottom 固定、`SafeArea(top:false)`、`Padding LTRB 16/32/16/16`、Column min）:
  - スクリム背景 = 縦 LinearGradient（top→bottom）`rgba(0,0,0,0)` → `rgba(0,0,0,0.80)` → `rgba(0,0,0,0.95)`、stops `0 / 0.5 / 1`
  - `WdSettingRow`（width **280**）: アイコン `dashboard` + ラベル **「3D投稿」**（Noto Sans JP w700 14 / `--text-1`）+ 右に `WdToggl`（OFF 既定）
  - gap **12**
  - `WdSettingRow`（width 280）: アイコン `pin` + ラベル **「位置情報」** + `WdToggl`（ON 既定）
  - gap **16**
  - `WdIconTextButton`（variant **specialFat**, icon `check`, text **「投稿する」**）= 主 CTA、横いっぱい
  - gap **16**
  - `WdGestureText`「**下書き保存する**」（Noto Sans JP w500 12 / `--text-1`、下線なしのテキストリンク）

## 使う既存パーツ（新規発明しない）

`WdNavigationHeader` / `WdCircleFooter` / `WdSettingRow`（"Rows & lists"）/ `WdToggl` / `WdIconButton` / `WdIconTextButton`（"Action buttons"）/ `IconImage`（`image` `swap` `text` `add` `check` `close` `dashboard` `pin` `camera`）。地球儀は `UniverseView` / `PlanetView` specimen を流用。

## 直すべき逸脱 / 改善余地（Before/After で提案して）

- **撮影フッターの `WdTakeButton` / `WdCameraFooter` が DS カード未登録**。撮影シーンを機に specimen 化・`_ds_manifest.json` 登録（`Wd*` 命名）。
- compose の閉じる ✕ が素の `IconImage`（47×47 の手書き枠）。既存 `WdIconButton`（close/simple 系）に寄せられないか。
- 「下書き保存する」が生 `Text`（色 white 直値）。`--text-1` トークン参照のテキストリンク役割に正規化。
- 下部スクリムが黒の生 rgba。`colors_and_type.css` に `--scrim-*` があれば役割トークンへ寄せる。
- 撮影/編集/位置決めで **ボトムの構造（フッター + サークルピル）の縦リズムを揃える**と 3 シーンの連続性が出る（現状 gap 36 は撮影/編集のみ）。

## Claude Design へ（このまま指示）

- 3 シーンを `.phone`（402×874）full-bleed で。位置決めシーンを主役に厚く。
- 既存 `Wd*` とトークン（`colors_and_type.css`）で構成、絵文字なし、効果は 1 コンポーネント 1〜2 個。
- 世界観: ダーク＋カラフル放射グラデ＋ガラス＋写真フルブリード、Noto Sans JP / Inter。
- 現状からの改善案を Before/After で。各 specimen 先頭 `@dsCard` + `_ds_manifest.json` 登録。最終はダウンロード可能な bundle で出力。
