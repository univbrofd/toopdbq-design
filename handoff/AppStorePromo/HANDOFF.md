# AppStorePromo v2 — App Store スクリーンショット（審査リジェクト対応・全面作り直し）

App Store / iPad ストア掲載用のスクショ（ポスター）セット。訴求の主役は **Quest（サークル出題型クエスト）**。
UI の一次情報は `handoff/UniverseQuest/UniverseQuest.html`。

**v1 は App Store 審査で 2.3.3 リジェクト。v1 の構図規則（UI を切り抜いて画面端から食い込ませる／部品だけを拡大して置く）が原因なので、v2 では逆にする。** 差分は §0 に集約。それ以外の色・タイポ・コピーは v1 を維持する。

- 参照 specimen: `../UniverseQuest/UniverseQuest.html`（`?screen` で chrome 無しの画面のみモード）
- foundation: `../../DesignSystem/colors_and_type.css` / `../../DesignSystem/preview/card.css` / `taste.md`
- 写真プール: `../../assets/sample/{uv,user,reel,background}/` ・アイコン: `../../assets/icons/` ・ロゴ: `../../assets/images/logo_toopdbq.png`

---

## 0. リジェクト内容と、v2 での反転（最優先）

App Review（Guideline 2.3.3 — Accurate Metadata）原文:

> The screenshots do not show the actual app in use in the majority of the screenshots.
> **Please display your app in use bigger than marketing artworks and full UI, instead of zoomed up or cut UI.**
> - Marketing or promotional materials that do not reflect the UI of the app are not appropriate for screenshots.
> - The majority of the screenshots should highlight the app's main features and functionality.

提出した v1 の実態（01 面）: 見出しコピーが左半分を占め、アプリ画面は右へはみ出して **横 1/4 以上が面外で切れている**。下のクエストカードも上下が切れ、左下にアバターが半分だけ出ている。→ 「zoomed up or cut UI」「marketing artwork の方が大きい」に該当。

**v2 の絶対条件（全 24 面で例外なし）:**

| # | v1（禁止に変更） | v2（必須） |
|---|---|---|
| R1 | UI を面外へ食い込ませて切る | **アプリ画面 1 枚が面の中に完全に収まる**。上下左右いずれも 1px も切らない |
| R2 | 部品（看板・セル 1 枚）だけを拡大して置く | **画面全体（full UI）を 1 枚**。1 画面に含まれる要素を間引かない・部品単体を主役にしない |
| R3 | パネルを ±2〜4deg 傾ける | **傾き 0deg・正対**。`transform: rotate()` を使わない |
| R4 | 面をまたいで要素を連続させる | **1 面で完結**。またぎ演出は行わない |
| R5 | 見出し 54px が主役 | **画面が主役**。見出しは §3 のサイズまで縮小し、面積・視覚重量ともにマーケ要素 < UI |
| R6 | 切り抜きアバター/ステッカーを 3〜5 個散らす | **0〜2 個**・面の縁で切らない・**UI パネルの上に重ねない** |
| R7 | 面の 40% 以上が UI | **§2 の占有率（高さ 68% 以上・面積 48% 以上）を全面で満たす** |

補足:

- **splash / ログイン画面は 1 面も使わない**（Apple 明記で「app in use」と見なされない）。6 面すべて機能画面。
- 画面は `?screen` 相当の**画面そのもの**として描く（status bar / Dynamic Island / home indicator は画面 chrome なので含めてよい）。**デバイスのハードウェア枠（ベゼル・筐体・Apple のデバイス画像）は描かない**。
- 見出し・バッジ・マーカーは残してよい。禁止されたのは「マーケ要素が UI より大きいこと」であって、コピーを載せること自体ではない。

---

## 1. 成果物（24 アートボード）

| デバイス | 出力 px（Apple 必須） | 制作 CSS px | export DPR |
|---|---|---|---|
| iPhone 6.9" | **1320 × 2868** portrait | 440 × 956 | **3** |
| iPad 13" | **2064 × 2752** portrait | 1032 × 1376 | **2** |

- 6 パネル × 2 デバイス × 2 言語（ja / en）= 24 枚。
- 1px でもズレると App Store Connect が弾く。`.ab` は `width/height` 固定・`overflow:hidden`。ただし **v2 では `overflow` に頼って要素を切らない**（R1）。

```css
.ab            { position: relative; overflow: hidden; flex: none; isolation: isolate; }
.ab.iphone     { width: 440px;  height: 956px;  }
.ab.ipad       { width: 1032px; height: 1376px; }
```

ファイル名: `shots/{device}/{lang}/{01..06}-{slug}.png`（例 `shots/iphone/ja/03-lock.png`）
specimen: `AppStorePromo.html`（全 24 面を縦に並べ、`?ab=iphone-ja-03` で 1 面だけ描画できるようにする）

---

## 2. レイアウト — 画面が主役の版面（数値で固定）

アプリ画面のアスペクトは **402 : 874**（iPhone 17）。パネルはこの比を崩さない（`object-fit` 的に潰さない・引き伸ばさない）。

### iPhone 面（440 × 956）

```
y=48   ┌ 見出しブロック（高さ最大 160・左右 marginX 32）
y=224  ├ アプリ画面パネル  w=317 / h=690（= 402:874）・水平中央・傾き 0
y=914  └ 下余白 42
```

- 画面パネル: **高さ占有 72%・面積占有 52%**。これを下回らない（R7 の下限は高さ 68% / 面積 48%）。
- 見出しブロックは**上 160px 以内に収める**。3 行に増えたらサイズを下げるのではなく語を削る。
- パネル角丸 `48px`・影 `--promo-panel-shadow` 1 つだけ。

### iPad 面（1032 × 1376 / 3:4）

- 左テキスト / 右パネルの 2 カラム。**左 362 / gap 64 / 右パネル w=566 h=1230**（= 402:874）・垂直中央・傾き 0・右余白 40。
- 画面パネル: 高さ占有 89%・面積占有 49%。
- 余る左側は**部品を足して埋めない**。1 面 1 メッセージのまま余白として使う。
- iPhone 面を引き伸ばさない。部品は同じまま（`--u: 1.55`）、配置だけ組み替える。

---

## 3. タイポ（v1 から縮小。UI に主役を譲る）

| 用途 | ja | en | iPhone（440 幅） | iPad（×1.55） |
|---|---|---|---|---|
| 見出し | Noto Sans JP 900 | Inter 900 | **40** / 行間 1.08 / letter-spacing -0.02em | 62 |
| 見出し（弱） | Noto Sans JP 700 | Inter 700 | 同上・色 `--promo-ink` | 62 |
| 補足 | Noto Sans JP 500 | Inter 500 | **17** / 行間 1.45 / `--promo-ink-2` | 26 |
| バッジ | Noto Sans JP 700 | Inter 800 | 14 | 22 |

- 見出しは **2 行まで**（v1 の 2〜3 行から短縮）。`copy.json` の `\n` を `white-space: pre-line` で守る。
- 見出し内で太さ・色を切り替える（細めの黒 + 極太ピンクの `accent`）文法は維持。
- マーカー下線（`--gradient-colorful` の帯・高さ 0.34em・角丸 4px）は維持。ただし **傾き 0deg**（R3）・1 面 1 箇所。

## 4. パレット（v1 から変更なし）

```css
--promo-bg:      #f7f3ec;
--promo-bg-alt:  #efe8dc;
--promo-ink:     #16131f;
--promo-ink-2:   rgba(22,19,31,.62);
--promo-accent:  #ff3e88;
--promo-mark:    var(--gradient-colorful);
--promo-panel-shadow: 0 18px 48px rgba(22,19,31,.16);
```

面の地は `--promo-bg` / `--promo-bg-alt` を交互。ダーク面は作らない。ピンクは見出しの強調語とバッジだけ。UI パネル内の色には触らない（specimen のまま）。

---

## 5. UI の作り方 — 画面を丸ごと、生きた DOM で組む

`<img>` でスクショを貼らない原則（＝ 3x で真にシャープ・blur / gradient / object-fit が実物のまま効く）は v1 から維持。**変えるのは「何を置くか」**: 部品ではなく `UniverseQuest.html` の**画面 1 枚をそのまま**置く。

| パネル | 画面の状態（すべて画面全体を描く） |
|---|---|
| 01 hero | Quest home。3D 地図 + `#globe-frame`（クエストリング・未クリアのピンクリム）+ `.strip-board`（看板）+ `.wd-circle-bar` + 下部フィード上端まで含む |
| 02 area | 同 home の圏内状態（リング内に自分ピン）。画面全体 |
| 03 lock | `.feed-sheet` 展開。`.post-cell` が blur18 + `.rail-wrap.day-locked` の `.lock-note`（距離・経路）まで含む画面全体 |
| 04 unlock | `.up-veil`/`.up-card`（`#upTitle` `#upState` `#upBar`）+ `.clear-toast` + 解錠後 `.feed-col` の画面全体 |
| 05 world | 地図引き（複数サークルのリング）の画面全体 |
| 06 circle | `.wd-circle-bar` + `.tl-sheet`（`.tl-head` `.tl-list`）の画面全体 |

### 5-1. 手順

1. `UniverseQuest.html` から**画面 1 枚分の DOM**と、それが依存する CSS 規則だけを `AppStorePromo.css` に写す（foundation は `colors_and_type.css` を参照。**複製しない**）。
2. スケール変数は 1 本: `.ab.iphone { --u: 1 }` / `.ab.ipad { --u: 1.55 }`。同じ markup で 2 デバイスを成立させる（iPad 用に別 DOM を作らない）。
3. パネルの入れ物は `.ui-panel { width: calc(317px * var(--u)); aspect-ratio: 402/874; border-radius: calc(48px * var(--u)); overflow: hidden; box-shadow: var(--promo-panel-shadow); }`。
4. 画面 DOM は 402×874 の座標系で組み、`transform: scale(317/402)` + `transform-origin: top left` で**パネル全体に等比フィット**させる（一部を拡大するための scale は禁止・R2）。
5. 写真セルは `assets/sample/uv/` `assets/sample/reel/` から。**新しい画像を持ち込まない**。
6. UI 内の日本語テキスト（お題名・サークル名など）も ja/en で差し替える。**en 面に日本語 UI を残さない**。

---

## 6. パネル構成とコピー（v1 から変更なし）

**コピーは `copy.json` が正**。ハードコードせず、そこから流し込む。

- `headline` の `\n` が改行位置の指定（`white-space: pre-line`）。
- `accent` は headline 内の実在部分文字列。**その語だけ** `--promo-accent` + マーカー。
- `badge` があるのは 01 / 04 のみ。無い面に足さない。
- 面の役割（01 フック → 02 圏内限定 → 03 ロック → 04 解錠 → 05 世界 → 06 仲間）は入れ替えない。
- `metadata` は App Store Connect の入力用。ポスターには載せない。

---

## 7. 出力前セルフチェック（24 面すべてで通すこと）

1. アプリ画面が面内に**完全に**収まっている（上下左右の切れ 0px）。
2. 画面パネルの高さ占有 ≥ 68%・面積占有 ≥ 48%。
3. 見出し・バッジ・ステッカーの合計面積 < 画面パネルの面積。
4. 傾き 0deg。`rotate()` が 1 つも無い。
5. ステッカー ≤ 2 個、UI パネルに重なっていない、縁で切れていない。
6. 画面は実在の状態（`UniverseQuest.html` に存在する）で、部品だけの拡大になっていない。
7. splash / ログイン画面を使っていない。
8. 出力 px が 1320×2868 / 2064×2752 ちょうど。

## 8. やらないこと（審査・品位）

- 「今すぐダウンロード」「No.1」「最高の」等の煽り文・実証できない数値を置かない。
- 実在しない画面・未実装機能を描かない。
- Apple のデバイス枠画像・ロゴ・App Store バッジを面に入れない。
- 効果は 1 面 1〜2 個（`taste.md` 7原則）。マーカー・ステッカーを全部盛りしない。
- 実在人物に見える写真に実名風テキストを重ねない（サンプルプール内で完結させる）。
