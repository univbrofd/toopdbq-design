# UniversePostFlow — 地球から投稿フロー（as-built 逆ハンドオフ）

Flutter で実装済みの「地球から投稿」フロー（投稿ボタン→現在地へ角度0降下→域内サークル選択→撮影→動画トリム→サムネ選択→投稿設定→投稿）の **as-built 実値**を捕捉。Claude Design にこの 4 画面を再現させ、Studio で web↔Flutter をピクセル比較するためのハンドオフ。
（同フォルダ `UniversePostFlow.html` は元になった Claude Design「Earth Globe」specimen。本 HANDOFF は実装が落ちた後の実値を正とする。）

- repo: `univbrofd/toopdbq-design`（`main`）/ raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main`
- 索引: `DesignSystem/_ds_manifest.json` / foundation: `DesignSystem/{USAGE_RULES.md,taste.md,colors_and_type.css,preview/}` / 共有アセット: `assets/icons/`・`assets/sample/`
- 実装参考（別 repo `univbrofd/toopdbq`・リンクは渡さない）: `lib/feature/UniversePostFlow/`・`lib/feature/StoryVideoEdit/`

## スマホ配置文脈（必須）

- 端末枠 = **iPhone 17 / iOS 最新（402×874・角丸55・Dynamic Island・statusbar 62 / home-ind 34）**。`preview/card.css` の `.phone` 既定を使う。各画面 1 ファイルの full-bleed specimen。
- 1=地図の上に下シート、2/3=フルスクリーン編集、4=下シート（編集の上）。タップ範囲最小 44pt。

## 共通トークン（実装値 → DS トークン）

- テキスト: 見出し/本文 ≈ `--text-1`(#fff)、メタ ≈ `--text-3`(rgba .60)、補助 ≈ `--text-2`(rgba .78)。フォント `--font-jp`。
- 角丸: 行/サムネ `--radius-sm`(12)〜`--radius-md`(16)、シート上端 `--radius-lg`(24)、ピル/トグル `--radius-pill`。
- ガラス: 地図上の暗シートは `--lg-tint-dark`(rgba(8,8,12,.44)) + `--lg-blur`(14) 想定。
- 主 CTA: 単色白（StoryPost Flow の monochrome 準拠。文字 #16161C）。
- 絵文字なし・効果は 1 コンポーネント 1〜2 個。

## 画面 1 — サークル選択シート（comp-uvpost-place）

地図（角度0・現在地へ降下・**域内サークルのエリア円**=白 fill .08/選択 .22・line .4/.95、地図タイル dim 0.8）の上に下シート。

- × キャンセル: 44×44（`WdIconButton` standart）、シート右上の上 12px。
- シート: 下端 bottom 26 + SafeArea、左右 14。面 = `--lg-tint-dark`+blur（as-built は不透明 #0C0C10 95%・**要ガラス化**）、角丸 22(≈`--radius-lg`)、上向き影、grabber 40×5 rgba(255,255,255,.30)。
- ヘッダ: 「入っているサークル」(`--text-1`,15,700) + 件数(白,15,800) / 右に 7px 白ドット+「現在地」(`--text-3`,10.5,500)。
- 行（max-height 222・gap6）: padding 9/10、角丸14。**選択**= bg rgba(255,255,255,.13)+border rgba(255,255,255,.55) / 非選択 = bg rgba(255,255,255,.05) border なし。左 44×44 角丸12 サークル画像（`assets/sample/uv/` 等）、名前(`--text-1`,14,700)+「エリア内」ピル（bg rgba(255,255,255,.16)・白6px ドット・9/700）、メタ「半径{r}m · {N}人 · 中心まで{d}m」(`--text-3`,10,600)、右シェブロン（選択=白/非選択=rgba .47。**Material 直書き → DS シェブロンへ**）。
- CTA: 単色白・高さ50・角丸14・カメラアイコン(黒20)+「ストーリーを投稿」(#16161C,15,700)。未選択時 opacity .5。

## 画面 2 — 動画トリム（comp-uvpost-trim）

フルスクリーン #0A0A0C。

- 上バー: × 44 + 「動画を編集」(白,16,700) + 44 spacer（top 60）。
- プレビュー: 左右16・角丸18・黒・動画 cover（specimen は `assets/sample/reel/` か `media` 静止画で可）。
- ラベル行: 「切り取り {m:ss}」(白,13,700・超過時 #FF6B6B) / 右「上限 1:00」(`--text-3`,11,600)。
- トリムバー: 高さ54・バー #222226 角丸10・範囲外マスク rgba(0,0,0,.62)・選択窓 白3px border 角丸9・左右ハンドル 18px 白（外側角丸9・中央 4×20 #0A0A0C グリップ）。
- CTA: 単色白「次へ」。選択尺 **≥60s で無効**（opacity .5・文言「1分未満に切り取ってください」）。

## 画面 3 — サムネイル選択（comp-uvpost-thumb）

フルスクリーン #0A0A0C。

- 上バー: ← 戻る + 「サムネイルを選択」。
- プレビュー: 画面2と同じ枠（選択フレームを表示）。
- 「表紙にするフレームを選択」(白,13,700)。
- スクラブ帯: 高さ64・グラデ #2A2A30→#3A3A42 角丸10・プレイヘッド 36px 白 border3 角丸8 影（specimen は 8 フレーム strip で可）。
- CTA: 単色白「投稿する」。

## 画面 4 — 投稿設定シート（comp-uvpost-confirm）

画面3の上に下シート。

- scrim: rgba(0,0,0,.70)(≈`--scrim-strong`)。
- シート: 面 #101014 96%・上角丸24・上 border rgba(255,255,255,.10)・padding 18/28+SafeArea・grabber 38×4。
- 「投稿の設定」(白,17,700)。
- 行（縦14）: 左にアイコン(17,白)+タイトル(白,14.5,700)、下にサブ(`--text-3`,11.5)。右にトグル 48×28（**ON= `--gradient-colorful`**（as-built は単色白・要修正）/ OFF #555、knob 22）。
  - 「位置情報を付ける」(icon `pin`)= 既定 ON。
  - 「3Dオブジェクトを生成」(icon `dashboard`)「サムネイルから3Dを生成します（位置情報オン時のみ）」= 既定 OFF・位置 OFF 時は不活性（opacity .45）。
- CTA: 単色白「投稿する」+ 下に「キャンセル」(`--text-2`,14,600)。

## 直すべき逸脱（DS 整合）

- トグル ON を単色白 → `--gradient-colorful`（DS の `tg`）。
- 地図上シート面を不透明 → `--lg-tint-dark`+`--lg-blur` のガラス。
- シェブロンが Material 直書き → DS のシェブロン（CSS border 回転 or アイコン）。
- グレーは場当たり hex を避け `--text-1/2/3`・`--lg-tint*` の役割トークンへ。

## 成果物（Claude Design に作らせる）

- `DesignSystem/preview/comp-uvpost-place.html` / `comp-uvpost-trim.html` / `comp-uvpost-thumb.html` / `comp-uvpost-confirm.html`。各先頭に `<!-- @dsCard group="UniversePost" -->`、`_ds_manifest.json` に登録。`.phone`(402×874) full-bleed で実配置描画。Before/After（as-built→DS整合）を併記。
