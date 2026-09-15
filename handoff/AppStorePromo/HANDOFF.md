# AppStorePromo v6 — App Store ポスター（Timeline · tall）

App Store 掲載用のスクリーンショット 4 面。訴求の主役は**地図つきタイムライン home / 場所モード / クエストボード / 全画面表示**。
作る場所: Claude Design プロジェクト直下のタブ **`Poster.html`**（このフォルダの `Poster.html` が一次ソース。プロジェクト root へは
`../../DesignSystem/...` → `_ds/.../` と `shots/v6/` → `handoff/AppStorePromo/shots/v6/` のパス書き換えだけして書き込む）。

## 構成（copy.json が正）

| # | key | 役割 | 画面（mock・iPhone 17e 1170×2532） |
|---|---|---|---|
| 01 | home | 近くで何が起きているか、地図と投稿から見えてくる | 正方形マップ（エリア・サークル名・場所ピン）+ 投稿フィード |
| 02 | place | 気になる店の雰囲気を、その場所に集まる投稿から知る | 吹き出しカード + その場所の投稿一覧 |
| 03 | board | 同じお題への投稿を通じて、街の人たちと参加体験を共有する | クエストボード拡大（上にマップ + お題 / 下に 3 段タイル） |
| 04 | full | 写真・動画を大きく見て、その場の雰囲気に浸る | 投稿の全画面 + いいね / コメント / 共有 |
| 01b | home | A/B 用の第 2 フック | 01 と同じ画面 |

## 構図（v5 → v6 の差分）

- 440×956 の黒地はそのまま。書き出し 1320×2868 @3x（`node scripts/design/poster_export.mjs`）
- コピー帯 252px → **176px**。上 = 補足 22px/700、下 = 見出し 2 行 **48px/900/行高 52**（en は Inter 42/48）。左右 24px。文字数依存の自動縮小は廃止（全行 8 文字以内）
- **筐体（ベゼル）を外し、画面の下端を切らない**: 実機スクショ全体を等比で 344×744・x 48 / y 192 に置く（面の約 61%）。旧 2.3.3 リジェクト（切れた UI・画面よりマーケ素材が大きい）への対処
- accent = 1 面 1 語。色は DS の `--state-like`（#ff3e88 = brand pink。GPT 案のシアンは DS に無いので採用しない）
- 画面の合成 / 部分拡大 / コピーの重ねはしない。写真は mock（`assets/mock`・架空アカウント）

## 撮影

`lib-test/testPosterShots/`（`SUITE=testPosterShots SIM_UDID=<iPhone17系> RECORD=0 bash lib-test/test_flutter.sh`）。
先に `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4`。
出力 `flutter/{home,place,full,board-list,board}.png` → `shots/v6/{key}-ja.png` へコピー。en 面は UI 言語を en にして撮り直す（未）。

## 文言の作り方

`COPY_PROMPT.md`（調査 → 構成案 → コピー → What's New を 1 回で頼む自己完結プロンプト）→ 回答の JSON を `copy.json` へ。
