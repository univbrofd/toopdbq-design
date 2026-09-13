# HANDOFF — タイムライン home「サークル設立」ページ（空のタイムラインを設立の案内にする）

## 依頼

タイムライン home（起動の既定表示・白面のサークル横ページャ）で、現在地がどのサークルのエリアにも
入っていないとき **2 ページ目に「この場所」= サークル設立プレースホルダ**が差し込まれる。
いまこのページは灰色の投稿枠 1 枚の下が**全面空白**で、何をする場所か伝わらない（`shots/01`）。

ここに旧クエスト home の同ページが持つ **「サークルの作り方」3 ステップ**（`shots/02`・design `.ns-onb`）
と同じ趣の案内を置き、**その場でサークル設立へ入れる CTA** を足す。3 案。

- 起点（Remix 元）: `app/CircleTimeline.html`（screen-only。元は `handoff/UniverseQuest/UniverseQuest.html?view=timeline`）
- 作り方の意匠の正: `handoff/UniverseQuestNoArea/UniverseQuestNoArea.html` の `.ns-onb` 一式（`.ns-lead` / `.ns-steps` / `.ns-step` / `.ns-cta`）
- foundation: `DesignSystem/colors_and_type.css`（色の canonical）/ `DesignSystem/preview/card.css`（`.phone` 402×874）

## 契約（破ると壊れる）

- キャンバスは `.phone`（402×874・statusbar 62・home-ind 34）。面は白 `#ffffff`。地図は無い（地図が出るのは旧 home だけ）
- **ヘッダーは実装固定・触らない**: y 0–118（statusbar 62 + 行 56）、下端 hairline `rgba(8,8,11,.08)`。
  名前「この場所」（Noto Sans JP 700 15px `#08080b`）/ サブ「0件の投稿・どのサークルにも属していません」
  （11px `rgba(8,8,11,.56)`）/ 右端 chevron 36px = 次のサークルへ。スクロールで上へ逃げる quick-return
- **FAB は実装固定**: colorful camera 55px、画面下端中央、bottom = 34 + 16（= y 769–824）。
  残す / 隠す / 置き換えのどれでもよいが、残すなら CTA と重ねない
- 横スワイプ = サークル切替（ページャ）。白面の中に横スクロール要素を置かない。縦スクロールは可
- CTA のタップ = **設立コンポーズ**（現行の投稿枠タップと同じ導線）: クエスト入力 → サークル名と範囲
  （直径 100m〜1km・既定 1km）→ 撮影 → 投稿完了でサークルとお題が同時に作られる。中心 = 現在地固定。
  CTA は 1 つ。デザインが決めるのは見た目と文言だけ（フローは変えない）
- フォント: 見出し・本文 = `--font-jp`（Noto Sans JP）、数字・日付 = `--font-latin`（Inter）
- 色は hex / rgba で固定（下記）。ガラス / blur は使わない（白面・性能）
- 既存コピー（arb 由来・文言はそのまま使う）:
  - 行タイトル「サークルを設立する」/ 作り方見出し「サークルの作り方」
  - 1「クエストを考える。」— お題を考えてみんなに撮影してもらおう
  - 2「サークルの名前を考える。」— 自由に好きな名前をつけて ／ 注釈「＊サークルの名前は投票制なので、変わる可能性があります。」
  - 3「自分で考えたクエストに挑戦する」— 今いる場所で撮影して投稿する
  - 旧 home のポップアップ「サークルを作成！」「今いる場所で写真と撮って、サークルを作成できます。」（見出しに流用可）
  - **新規コピー**（CTA ラベル・リード等）は提案してよい。`<!-- copy:new -->` で印を付ける（実装側で arb 化する）

## 実測（知らないと外す）

- 自由に使える領域: **y 118–769 の 402×651**（ヘッダー下〜FAB 上）。FAB を隠すなら y 118–840
- 現行（`shots/01`）の弱点: (a) 投稿枠のコピー「このクエストに投稿」が誤り（このページにお題は無い）
  (b) 枠の下 y 470〜 が全面空白 (c) 行タイトル横の日付「9/14」が無意味 (d) 作り方の説明が無い (e) CTA が無い
- 参照（`shots/02`）の実値 = `.ns-onb`: padding 46px 20px / gap 26 / 見出し 800 15.5px 1.6 `#0a0a0d` letter-spacing .01em /
  ステップ gap 22・行 gap 13 / 番号 26×26 Inter 900 15px `#0a0a0d` tabular（円・色背景なし）/
  題 700 14px 1.35 `#0a0a0d` / 説明 500 12.5px 1.6 `rgba(10,10,13,.56)` / 注釈 500 10.5px 1.55 `rgba(10,10,13,.36)`
- DS にある CTA 語彙 `.ns-cta`: 高さ 52・pill・`--gradient-colorful-linear`（135deg #fff0a6 → #005f67 38% → #ff3e88 70% → #d0a052）・
  白 700 15px・影 `0 8px 24px rgba(255,62,136,.28)`。実装にはまだ無い（今回足す）
- タイムライン通常ページ（`shots/03`）の語彙: 行タイトル（お題 700 15px `#08080b` + 日付 Inter 13px `rgba(8,8,11,.56)`、左 16）、
  ボード = 幅いっぱい 16:9・`rgba(0,0,0,.16)`・角丸 8・中央に 26px アイコン + 700 15px ラベル、下に hairline

## 成果物

- `handoff/TimelineFounding/TimelineFounding-{a,b,c}.html` — 3 案。それぞれ `.phone` にページ全体
  （固定ヘッダー + 案の中身 + FAB の扱い）を実配置。`?screen` で画面だけの表示に対応
- 探索軸（似た案を 2 つ出さない）: **a** = `.ns-onb` をそのまま移植し CTA を足す最小差分 /
  **b** = タイムラインのボード語彙（行タイトル + 16:9 カード）で作り方と設立枠を組み直す /
  **c** = 空白を活かして「この場所」（現在地・半径 1km）を主役にした導入 + 作り方は簡潔化
- 全案に 3 ステップと CTA を含める
- `gallery.html` に 3 案を横並び。各ファイル冒頭コメントに設計意図（何を優先し何を捨てたか）
- 各 specimen 先頭に `<!-- @dsCard group="TimelineFounding" name="…" subtitle="…" -->` を付け
  `DesignSystem/_ds_manifest.json` の `cards` に登録
- 触らない: `app/`（GENERATED）/ `DesignSystem/colors_and_type.css` / `baseline/` / 既存 handoff
- 最終はダウンロード可能な bundle
