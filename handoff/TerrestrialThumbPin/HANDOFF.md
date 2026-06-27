# HANDOFF — TerrestrialThumbPin（地球儀上の投稿サムネピン・再デザイン）

UniverseView（地球儀）の上に立つ **投稿写真サムネのピン**（`ThumbnailTerrestrialView`）の **見た目を作り直す**逆ハンドオフ。
現状実装は機能するが**デザインが平凡**なので、構造（＝何であるか）は維持しつつ visual を引き上げてほしい。
ピンの 3 形態と pole/role の全体構造は別 handoff `handoff/TerrestrialPin/HANDOFF.md` が正（深掘りはそちら参照）。本書は **thumbnail 形態 1 本に絞った改善依頼**。

## これは何か（スマホ配置文脈・必須）

- 画面 393×852、SafeArea。背景は **MapLibre のダーク globe が full-bleed**（地図そのものが背景）。
- ピンは投稿の lat/lng の真上に浮き、**pole で地表に「溶接」される**＝「その場所に刺さった 1 つの瞬間」。地図をパン/ズームすると位置追従。
- 画面**中心に最も近いセルの代表 = `main`**（大きく前面）。それ以外は `normal`（小）。同じ場所に複数投稿があるとピンに **件数バッジ**が付く。
- タップ → その投稿へフォーカス/オープン（タップ範囲 最小 44pt）。

## repo / raw / 索引

- repo `univbrofd/toopdbq-design`・branch `main`。raw base `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引 `DesignSystem/_ds_manifest.json`。foundation: `DesignSystem/colors_and_type.css`（色の正）/ `taste.md` / `USAGE_RULES.md` / `preview/card.css`
- サムネ写真は共有プール `assets/sample/reel/reel001..NNN.jpg`（縦長＝9:16 向き）を参照（per-View に複製しない）

## 対象 4 状態（これを作る）

| 状態 | 条件 | サムネ寸法(9:16) | 装飾 |
|---|---|---|---|
| 通常 (normal) | 中心セル以外の代表 | 54×96 | サムネ＋pole のみ |
| 件数バッジ | 同セルに複数投稿（例 5） | 63×112 | ＋右上角に件数バッジ |
| 件数バッジ 99+ | 100 件以上 | 63×112 | バッジ "99+" |
| メイン代表 | 画面中心セルの代表（巨大 main） | 144×256 | 拡大サムネ（前面・主役） |

寸法は role と中心への近さで連続的に変わる（pole 長も）。詳細係数は `handoff/TerrestrialPin/HANDOFF.md` 参照。**全サムネ 9:16 縦長を厳守**。

## 現状実装の捕捉値（＝改善の出発点。別 repo `univbrofd/toopdbq` 参考・リンクは張らない）

- **サムネ枠**: 角丸 `6px`（内clip `5px`）。border `1px rgba(255,255,255,.706)`（代表ほど明るく最大 `1.0`）。影 `0 0 8px rgba(0,0,0,.451)`。写真は `object-fit:cover` で full-bleed。
- **pole（溶接）**: 白の**逆三角形**（上辺幅 `clamp(6,16, poleLen×0.18)`）が地表 anchor（点・下）から poleTip（幅広・上）へ。anchor に白丸 r2.4、poleTip に白丸 r1.8。poleTip→サムネ下端を `0.8px rgba(255,255,255,.6)` の細線で接続。影は右へ 1.5px。
- **件数バッジ**: 円 `min(w,h)×0.45` を `14–32px` でクランプ。**右上角の中心**に重ねる。白 bg・border `1px #999`・影 `0 0 4px rgba(0,0,0,.451)`・文字 黒 bold `size×0.5`。`>99` は "99+"。
- 既存の web 再現（参考）: `comp-terrestrial-stage.html` は 3D 形態のステージ。thumbnail 形態の specimen は**まだ無い**。

## なぜ平凡か → 引き上げてほしい方向

現状は「白いヘアライン枠の写真＋細い三角棒＋ベタ白の丸バッジ」で、機能はするが**ステッカー的で安っぽい / 奥行きが無い / globe の世界観と馴染まない**。

**KEEP（構造・絶対維持）**: 9:16 写真 full-bleed / 地表へ溶接する pole の比喩 / 右上の件数バッジ / normal↔main のスケール差 / ダーク globe 上で写真が主役。

**ELEVATE（自由に良くしてよい）**:
- 枠: ヘアライン白 → **署名グラデ枠（`--gradient-border`）か liquid-glass の 1px 屈折エッジ**で上質に。`main` は subtle な glow/ring で「主役感」。
- 溶接: 三角棒を**奥行きのある anchor 表現**へ（地表に planted した接地影・光の芯など）。globe 曲面に刺さって見える説得力。
- 件数バッジ: ベタ白丸 → **ガラス/数字タイポを整えた洗練バッジ**（視認性は維持）。
- 全体: 「場所に固定された 1 つの物語」という temperature を上げる（プレミアムな geo-pin）。効果は **1 specimen 1〜2 個まで**。

## 成果物（Claude Design が作る）

`DesignSystem/preview/` に specimen を起こし、各先頭に `<!-- @dsCard group="Components" name="..." subtitle="..." viewport="WxH" -->` を付け `_ds_manifest.json` の `cards` に登録。色は `colors_and_type.css` の役割トークン優先。font は Noto Sans JP / Inter、絵文字なし。

1. **`comp-terrestrial-thumbnail.html`（新規）** — 4 状態（通常 / 件数 5 / 99+ / メイン代表）を 1 枚に並べ、各に Before（現状値）/After を併記。サムネは `assets/sample/reel/` を使用。
2. **`comp-terrestrial-thumb-scene.html`（新規・任意）** — `card.css` の `.phone` 枠の中に、ダーク globe を想定した背景の上で **main 大 + normal 小を数個** 配置した実機サイズの全体像（タップ範囲・浮遊感が分かるよう）。

## 直すべき逸脱

- 場当たりの白/グレー直書き → `colors_and_type.css` の役割トークン。
- Material 風の素朴な丸バッジ・素の三角 → taste.md の世界観（ダーク＋カラフル放射グラデ＋ガラス＋写真フルブリード）に寄せる。
