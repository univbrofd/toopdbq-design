# AppStorePromo v6 — App Store ポスター（Timeline · tall）

App Store 掲載用のスクリーンショット 4 面。訴求の主役は**地図つきタイムライン home / 場所モード / クエストボード / 全画面表示**。
作る場所: Claude Design プロジェクト直下のタブ **`Poster.html`**（このフォルダの `Poster.html` が一次ソース。プロジェクト root へは
`../../DesignSystem/...` → `_ds/.../` と `shots/v6/` → `handoff/AppStorePromo/shots/v6/` のパス書き換えだけして書き込む）。

## 構成（copy.json が正）

| # | key | 役割 | 画面（本番データ・iPhone 17e 1170×2532） |
|---|---|---|---|
| 01 | home | 「この街、何がある？」（旧 alt hook と入替） | `01-home-ja.png` 正方形マップ + 投稿フィード（sim） |
| 02 | place | 気になる店の雰囲気を、その場所に集まる投稿から知る | `02-place-ja.png` 吹き出しカード + 一覧（実機 iPhone 17 Pro） |
| 03 | board | 同じお題への投稿を通じて、街の人たちと参加体験を共有する | `03-board-ja.png` ボード拡大（お題「ウィンクして」・sim） |
| 04 | full | 写真・動画を大きく見て、その場の雰囲気に浸る | `04-full-ja.png` 投稿の全画面（sim） |

スクショはユーザー撮影（`shots/v6/`）。自動撮影版は `shots/v6-auto/`（ignore）。alt hook（01b）は廃止。

## 構図（v5 → v6 の差分）

- 440×956。**地は黒**、下半分（45%〜）に DS の `--gradient-colorful-linear`（135° = 斜めに変化）を opacity .78 のマスクで透過表示（濃いめ）。文字は白。書き出し 1320×2868 @3x（`node scripts/design/poster_export.mjs`）
- コピー帯 252px → **176px**。上 = 補足 22px/700、下 = 見出し 2 行 **48px/900/行高 52**（en は Inter 42/48）。左右 24px。文字数依存の自動縮小は廃止（全行 8 文字以内）
- **筐体（ベゼル）を外し、画面の下端を切らない**: 実機スクショ全体を等比で 344×744・x 48 / y 192 に置く（面の約 61%）。旧 2.3.3 リジェクト（切れた UI・画面よりマーケ素材が大きい）への対処
- accent = 1 面 1 語。色は DS の `--state-like`（#ff3e88 = brand pink。GPT 案のシアンは DS に無いので採用しない）
- 画面の合成 / 部分拡大 / コピーの重ねはしない。画面は本番データ（渋谷スクランブル = seed_shibuya の実投稿）

## 撮影

`lib-test/testPosterShots/`（本番: `DART_DEFINES="" SUITE=testPosterShots SIM_UDID=<iPhone17系> RECORD=0 bash lib-test/test_flutter.sh`。
`DART_DEFINES` 未設定なら mock）。先に `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4`
と `simctl location set 35.6595,139.7004`（渋谷スクランブルの中心 = 最寄り + エリア内）。
出力 `flutter/{home,place,full,board-list,board}.png` → `shots/v6/{key}-ja.png` へコピー（board は拡大版）。
本番の場所は `--dart-define=POSTER_PLACE=<名前の一部>` で選べる。en 面は UI 言語を en にして撮り直す（未）。

## 文言の作り方

`COPY_PROMPT.md`（調査 → 構成案 → コピー → What's New を 1 回で頼む自己完結プロンプト）→ 回答の JSON を `copy.json` へ。
