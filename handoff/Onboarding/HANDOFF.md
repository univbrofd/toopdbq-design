# Onboarding — 初回起動オンボーディングを Quest 全面で一新（新規デザイン依頼）

現行のオンボーディングは **Quest（サークル出題型クエスト）実装より前**の内容で、「サークル＝場所 / 範囲 /
中は投稿・外は閲覧」の説明に終始している。いまのアプリの主役は Quest なので、**訴求そのものを作り直す**。
既存 specimen（`comp-onboarding-01..06-*.html` / `onboarding.css` / `clean.html`）は**旧版・置換対象**。
参照しない（構図を引き継がない）。

同じプロジェクト内の `handoff/AppStorePromo/`（App Store 掲載面）で確定した **Quest の訴求軸とコピー**を、
アプリ内オンボーディングへ翻訳するのが今回の仕事。

- repo: `univbrofd/toopdbq-design` / branch `main`
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- 索引: `DesignSystem/_ds_manifest.json`

---

## 1. AppStorePromo から継承するもの / しないもの

| | |
|---|---|
| **継承する** | 訴求の軸と順序（`handoff/AppStorePromo/copy.json` の 01 quest → 02 area → 03 lock → 04 unlock）。見出しを 1 文の中で太さと色で切り替える書き方。強調語 1 つに `--state-quest-active`。UI を「画面まるごと」でなく**部品として切り取って置く**構図。写真は共有プール（`assets/sample/{uv,reel,user}/`） |
| **継承しない** | **ライト地（`#f7f3ec` / `#efe8dc`）はポスター専用。アプリ内はダーク `--bg #08080b`**。ポスターの斜め配置・マーカー下線・ステッカー散らしも**アプリ内には持ち込まない**（審査向け販促の文法であってアプリ UI ではない）|

一次情報:
- `handoff/AppStorePromo/AppStorePromo.html`（このプロジェクト内。色と訴求の温度感を確認する用）
- `handoff/AppStorePromo/copy.json` — コピーの正（訴求軸）
- `handoff/UniverseQuest/UniverseQuest.html` — **UI 部品の一次情報**（`.strip-board` / `.feed-col .post-cell` /
  `.rail-wrap.day-locked .lock-note` / `.up-card` / `.clear-toast` / `.wd-circle-bar`）。オンボの図案はここから切り出す
- foundation: `DesignSystem/colors_and_type.css` / `preview/card.css` / `taste.md` / `USAGE_RULES.md`

## 2. 実装制約（Flutter 側の現実・厳守）

- **Splash の上に重なる overlay**。独立ルートではない。**初回起動時（OS 位置許可が未回答）だけ**表示され、2 回目以降は出ない。
  → 「毎日使いたくなる」を作る機会は**この一度きり**。情報の網羅より、体験の欲求を立てることを優先する。
- **最後のシーンで OS の位置情報許可ダイアログを実際に呼ぶ**。よって最終シーンは pre-permission（なぜ要るかを納得させる面）で、
  ボタンは 3 択: 「Appの使用中は許可」/「一度だけ許可」/「許可しない」。**拒否でもアプリは進む**（デフォルト位置で起動）ので、
  拒否を袋小路にしない。
- Flutter **native 描画**。地図は**図案化した擬似地図**（透視グリッド＋グロー）で描く。実 3D globe / WebView は使えない。
  → 地図の写実性に依存する図案にしない。
- 画面 **402 × 874pt**（iPhone 17 / `preview/card.css` の `.phone` 既定）、SafeArea 上 62 / 下 34、タップ域 **最小 44pt**。
- 横スワイプのページャ + 進捗ドット + CTA。**スキップ**を常時右上（最終シーン以外）。
- 呼称は必ず「**投稿**」（「ストーリー」禁止）。絵文字なし。ダーク＋カラフル放射グラデ＋ガラス。

## 3. シーン構成（推奨骨子・4 + 許可）

旧版は 6 シーンで説明過多だった。**4 シーン + 許可**に圧縮する。各面 = 1 メッセージ + 1 図。

| # | 役割 | 見出し案（強調語） | 補足案 | 図（UniverseQuest の部位） |
|---|---|---|---|---|
| 01 | HOOK | 近くのフェスに、今日の**お題**。 | 地図の上のサークルには、その日だけのお題が出る。 | 擬似地図 + `.strip-board`（未クリア・ピンクリム・パルス）を主役サイズで浮かせる |
| 02 | AREA | 答えられるのは、いま**そこにいる人**だけ。 | エリアの中から、写真か動画で答える。 | サークル範囲（楕円リング）+ 圏内の自分ピン / 圏外の淡いアバター |
| 03 | LOCK | **君が出すまで**、みんなの答えは見えない。 | 見るだけの人にはなれない。 | `.post-cell` の 2 列グリッドを blur18 + 中央に距離（44px）の lock-note |
| 04 | UNLOCK | 出した瞬間、**全員の答え**がひらく。 | お題は毎日変わる。投稿は消えずに積み上がる。 | 解錠後グリッド + `QUEST CLEARED`（teal リム）。03 → 04 は**同じ絵の前後**として見せる |
| 05 | 許可 | エリアの**中にいるか**を判定するために。 | 位置情報が他のユーザーに共有されることはありません。 | ミニ地図付き許可シート + 3 ボタン |

- **03 → 04 が体験の核**。同じグリッドがぼけ→ひらく、を連続として設計する（ページ送りで絵が変わるのでなく、
  同じ絵の状態が変わる）。ここに一番の演出予算を割く。
- 04 の補足で「毎日変わる／積み上がる」= 再訪動機に触れる。別シーンを足さない。
- コピーは案。`copy.json` の訴求軸を保ったまま、アプリ内の一人称の文体に磨いてよい。**煽り・数値・最上級は禁止**。

## 4. 実装値（現行実装から捕捉。図案の部品はこの値で描く）

**クエスト看板**（`.strip-board` 相当）: radius 20 / padding 16·12·16·11 / 面 `#1b1b20`→`#121216`（135°）/
リム 1.5px `--gradient-colorful-linear` / 影 `0 8 24 rgba(0,0,0,.45)` / 未クリアは `--state-quest-active-ring` の
パルス輪（0 → 16px・2.2s ease-out infinite）。行1 = 5px のピンク dot（同 2.2s で 1→.3→1）+ `QUEST`（Inter 700 / 9px /
letter-spacing .14em / `rgba(255,255,255,.66)`）+ 右端に日付 pill（面 `rgba(255,255,255,.09)` / radius 9999 /
padding 10·3 / Inter 600 10px）。タイトル = Noto 700 15px 白（影 `0 0 8 #000`）、説明 = Noto 500 10.5px /
行間 1.5 / `--text-2`。下端 dots = 5px（active は幅 14 の白ピル・250ms ease-in-out）。クリア済みはリムを
`#4be3b0 → #3fd0e0` に替え `QUEST CLEARED`。

**ロックセル**: `blur(18px) brightness(.72) scale(1.08)`。テキスト・投稿者名は非表示。
**lock-note**: 面を持たず縦グラデスクリムのみ（stops 0 / .34 / .5 / .66 / 1 = alpha 0 / .44 / .60 / .44 / 0）。
中央に距離 Inter 700 **44px**（影 `0 2 14 rgba(0,0,0,.6)`）+ 単位 15px、その下に経路ボタン。

**許可シート**: radius 22 / 面 `--surface-raised #16131f` / 1px `rgba(255,255,255,.08)` /
影 `0 -8 40 rgba(0,0,0,.6)` / 上端にミニ地図 156px。アイコンタイル 46 · radius 14 · `--gradient-colorful`。
見出し Noto 700 18px 行間 1.4 / 本文 Noto 500 13px 行間 1.7 `--text-2`（要点だけ白 700）。
ボタン: 許可 50h（colorful + 中心スクリム `radial 90% at 50% 52%, rgba(0,0,0,.5) → 0` + `--gradient-border` 1px）/
一度だけ 50h（`--surface-input #2b2b2b`）/ 許可しない 44h（文字のみ `--text-3`）。すべて radius 12。

**共通 foot**（再利用可能な既存部品がある）: eyebrow = 番号 Noto 700 11px（tracking 2.2）+ 18×1px の白 40% バー +
ラベル `--text-3` / タイトル Noto 700 29px 行間 1.34（強調語だけ `--gradient-colorful-linear` の文字グラデ）/
本文 Noto 500 14.5px 行間 1.75 `--text-2`（最大幅 318）/ dots 6px・active は幅 22 の colorful ピル（300ms `--ease-out`）/
CTA 54h · radius 12 · colorful + 中心スクリム + `--gradient-border` 1px + 次アイコン 17。
下部は 62% 高の黒スクリム（`#08080b` を alpha 1 / .92 / .55 / 0、stops .06 / .26 / .55 / 1）で可読性を構造で担保。

## 5. モーション（Flutter で再現するので仕様を明記すること）

各シーンに「入場（何がどの順に・何 ms・どのイージング）」「常時アニメ（あれば 1 つだけ）」「シーン間の連続」を
specimen 内にコメント or 併記の表で残す。基準: `--ease-out cubic-bezier(.16,1,.3,1)` / 入場 500〜600ms /
ページ送り 460ms。**常時アニメは 1 面 1 つまで**（`taste.md` の効果予算）。03 → 04 の解錠だけは例外的に主役演出として厚く。

## 6. 成果物

- `handoff/Onboarding/Onboarding.html` — 全シーンを縦に並べた specimen。`?screen` で chrome 無しの**画面のみ**を
  縦フルスクリーン、`?scene=03` で 1 面だけ描画できるようにする。各面は `.phone`（402×874）に**実配置**。
- `handoff/Onboarding/Onboarding.css` — この View 固有の差分のみ。**foundation をコピーしない**（`colors_and_type.css` /
  `card.css` / `components.css` は参照）。
- `DesignSystem/_ds_manifest.json` に `group="Onboarding"` で登録（superset・既存カードを消さない）。
- アセットは共有 `assets/` を相対参照（`../../assets/...`）。per-View に複製しない。新しい画像を持ち込まない。
- 旧 `comp-onboarding-01..06-*.html` / `onboarding.css` / `clean.html` は**出力に含めない**（取り込み側で削除する）。
- 最終は**ダウンロード可能な bundle** で出力。

## 7. やらないこと

- 新しい色・フォントの発明（トークンは `colors_and_type.css` が canonical）。
- ライト面・ポスター文法（斜め配置 / マーカー下線 / ステッカー）のアプリ内持ち込み。
- 実装できない図案（実写の 3D globe、実地図タイル、平行して動く多層パララックス）。
- 未実装機能・存在しない画面を描く（描く UI は `UniverseQuest.html` に実在する状態のみ）。
- 効果の盛りすぎ（1 面 1〜2 効果。`taste.md` の smell test を通す）。
- 説明の網羅。**1 面 1 メッセージ**、読ませずに分からせる。

## 実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。値は §4 が正）

`lib/feature/Onboarding/`（View / Controller / widgets `ObMapStage` `ObCircleRange` `ObMarker` `ObFoot`）、
`lib/component/ui/view/CircleFocus/`（`QuestBoard` / `QuestFeedSheet`）、`lib/feature/Splash/SplashController.dart`。
