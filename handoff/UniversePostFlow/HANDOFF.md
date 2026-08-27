# UniversePostFlow — クエスト投稿フロー（as-built 逆ハンドオフ）

Flutter で実装済みの投稿フローの **as-built 実値**。home のクエストカメラから入る
**1 route・3 状態**（撮影 → 編集 → 確認）で、`StoryPostView` が全部を持つ。
地図・サークル選択・位置情報は**この route に無い**（サークルは入口で確定済み）。

- repo: `univbrofd/toopdbq-design`（`main`）/ raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main`
- foundation: `DesignSystem/{USAGE_RULES.md,taste.md,colors_and_type.css,preview/}` / 共有アセット: `assets/icons/`・`assets/sample/`
- specimen: `handoff/UniversePostFlow/UniversePostFlow.html`（3 状態を切り替える live specimen。`?screen` で画面のみ全面）
- 現状スクショ（as-built・mock web ビルド実測）:
  - `shots/current-shooting.jpg` — 撮影
  - `shots/current-editing.jpg` — 編集（テキスト）
  - `shots/current-confirm.jpg` — 確認
- 🗄 旧世代（2026-07 の「地球から投稿」フロー。**Remix 元にしない**）:
  `shots/current-circle-select.png` / `shots/current-thumb.png` / `comp-uvpost-thumb.dc.html`

## スマホ配置文脈（必須）

- 端末枠 = **iPhone 17 / iOS 最新（402×874・角丸55・Dynamic Island・statusbar 62 / home-ind 34）**。
- 3 状態とも**フルスクリーン**（下シートを持たない）。タップ範囲最小 44pt。
- メディアは撮影・編集が `cover`、確認だけ**黒地に `contain`**（投稿前に何が写るかを確かめる画面なので実装が意図的に別扱い）。

## 共通トークン（実装値 → DS トークン）

| 実装値 | トークン |
|---|---|
| `Color(0x0FFFFFFF)` ガラス面 | `--lg-tint` |
| `Color(0x7008080C)` 明背景上の chrome | `--lg-tint-dark` |
| blur 14 / saturate 1.6 | `--lg-blur` / `--lg-saturate` |
| `colorfulLinearGradient` #FFF0A6→#005F67→#FF3E88→#D0A052（135°） | `--gradient-colorful-linear` |
| いいね済み `#FF3E88` | `--primary` 系のピンク端 |

## 全状態で共通 — クエストヘッダー（`WdQuestHeader`）

`top = safeTop + 17` / 左右 12。戻る 40×40 円（`--lg-tint-dark`・縁 rgba(255,255,255,.18) 0.75px・
影 0 4px 12px rgba(0,0,0,.25)・アイコン 16）+ 中央カード + 右 40×40 の空きスロット。

- お題名: 18px / w700 / line-height 1.34 / letter-spacing 1% / 白 + **黒 1.4px 縁取り**（`paint-order: stroke fill`）
- カウントダウン: 9px 下・**Inter 26px / w700 / tabular-nums** / 同じ縁取り。1s で自走
- 締切超過は文言を「滑り込みセーフ」に差し替え **19px**。投稿はブロックしない
- 背面 glow（カラーグラデ blur）は **home ヘッダー専用**。投稿フローでは敷かない

## 状態 1 — 撮影（`shooting`）

- フッターは `bottom = safeBottom + 2` の 1 行: `[112px 左スロット][12][シャッター 84][12][112px 右スロット]`
- 写真 / 動画トグル: padding 3 / r9999 / 面 rgba(0,0,0,.35) / 縁 rgba(255,255,255,.15)。
  セグは padding 12×6・13px w700。選択中 = 白面 + `#16161C`、非選択 = rgba(255,255,255,.82)
- シャッター 84×84・白 4px 縁・4px の間・白い中身
- 反転 47×47 の `--lg-tint` ガラス円（アイコン 24）

## 状態 2 — 編集（`editingFree`）

- 入った瞬間にテキスト入力が自動で開く（プレースホルダ「テキストを入力」）
- 置いた文字は**白 + 黒影のみ・面を持たない**
- テキスト追加ボタン: 右端（画面幅 2%）・上下中央・55×55 の暗ガラス円「Tt」+ 右上に ＋ バッジ（22×22）
- 確定 ✓: 下中央・55×55・暗ガラス面 + **colorful 1.5px リング**（面にグラデを透かせない）

## 状態 3 — 確認（`confirming`）

- 下スクリム 260px（下 rgba(0,0,0,.6) → 上 透明）
- サイドツール: 右 12・`bottom = 112`（サークルフッター直上）。上から アバター 47 → いいね → コメント、間 16。
  数字は 11px w700 白。いいね済みはアイコンを `#FF3E88`・縁も同色（カウントは白のまま）
- アクションバー: `bottom = 112` / 左 16 / **右 76**（サイドツールの rail を避ける）
  - 投稿する = 高さ 47・**角丸 16**・colorful グラデ・チェックアイコン + 文字
  - 12px 下に「下書き保存する」12px w500 白（面なし）
- サークルフッター: 全幅・高さ **112**。カバー 48 円 + 名前 15px w700 + 説明 12px rgba(255,255,255,.72)。
  タップでこの 1 件だけのタイムラインプレビュー（画面高 62%）

## 投稿後

`投稿する` → アップロードはバックグラウンド、画面はホームへ戻る。進捗バーは specimen では
画面内に出しているが、実装ではホーム側に出る（`WdUploadProgressBar`）。

## 直すべき逸脱 / 検討ポイント（Claude Design への相談）

- 撮影の 写真/動画 トグルが左に寄っていて、シャッターとの視覚重心がやや非対称
- 確認画面の「下書き保存する」が面を持たず、投稿ボタンの影に埋もれて弱い
- 締切超過の「滑り込みセーフ」は文字サイズが落ちるだけで、切迫感の演出が無い
