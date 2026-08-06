# AppStorePromo v4 — App Store ポスター（v1 のデザインに戻し、切れ・隠れだけ直す）

App Store / iPad ストア掲載用の**ポスター**。訴求の主役は **Quest（サークル出題型クエスト）**。
作る場所: プロジェクト直下のタブ **`Poster.html`**。UI の一次情報は `Universe-Quest.html`。

## これは「アプリ画面」ではなく「ポスター」

App Store の一覧で**目を引くための販促ビジュアル**を作る。左（または上）にコンセプトのキャッチコピー、その対角に**実際のアプリ画面を傾けて立体的に置く**——v1（`handoff/AppStorePromo/AppStorePromo.html` / `export/*.png`）のあの構図が正解。**v1 のアートディレクションを維持する。**

直前の版（`Poster.html` 現状）は、UI を面いっぱいにフルブリードで敷いただけの「ただのアプリ画面」になっていて、ポスターとして成立していない。**作り直す。**

### v1 から変えるのは 2 点だけ

App Review の Guideline 2.3.3 リジェクト:

> The screenshots do not show the actual app in use in the majority of the screenshots.
> **Please display your app in use bigger than marketing artworks and full UI, instead of zoomed up or cut UI.**

v1 の何が引っかかったか = **アプリ画面が面外へはみ出して 1/4 以上切れていた**こと、**コピーの方が画面より大きかった**こと。この 2 つだけを直す。**傾き・立体感・浮遊感・装飾は v1 のまま残してよい**（Apple は傾いた画面を禁止していない。禁止されたのは「切れた UI」「拡大した部分 UI」「UI より大きいマーケ素材」）。

---

## 0. ルール（全 24 面）

**必ず守る（審査）**

| # | ルール |
|---|---|
| A1 | **アプリ画面は面の中に完全に収まる**。回転・拡大した**後**の外形が面内に収まること。上下左右いずれも 1px も切らない |
| A2 | **画面は full UI**。画面の一部を拡大して切り取らない・部品（看板やセル 1 枚）だけを主役にしない。1 画面が丸ごと見える |
| A3 | **画面 > マーケ要素**。前面の画面の面積が、コピー＋バッジ＋ステッカーの合計面積より大きい。画面の面積は面の **40% 以上** |
| A4 | 画面を隠さない。コピー・バッジ・ステッカー・他の画面を**前面の画面に重ねない**（重ねてよいのは画面の外周から外側だけ） |
| A5 | splash / ログイン画面は 1 面も使わない。6 面すべて機能画面 |
| A6 | 実在しない画面・未実装機能を描かない。UI に出る要素は `Universe-Quest.html` に実在するものだけ |
| A7 | Apple のデバイス枠画像・ベゼル・筐体は描かない（画面そのものを角丸パネルとして置く。status bar / Dynamic Island / home indicator は画面 chrome なので入れてよい） |

**そのまま残す（v1 のデザイン性）**

| # | ルール |
|---|---|
| B1 | **画面は傾けて置く**。6〜12deg 程度の回転、必要なら軽い `perspective` + `rotateY` で「耳を立てた」立体感を出す。正対の真四角に戻さない |
| B2 | 浮遊感を出す影を 1 つ（`0 24px 60px rgba(22,19,31,.18)` 程度）。画面の角丸は 38〜48px |
| B3 | **左にコピー / 右に画面**の対角構図（iPhone 縦面では「左上にコピー / 右下に画面」でよい）。コピーの塊と画面の塊が斜めに向き合う |
| B4 | 見出しは 1 文の中で太さと色を切り替える（細めの黒 + 極太ピンクの `accent`）。`accent` の語に `--gradient-colorful` のマーカー下線を 1 面 1 箇所 |
| B5 | 切り抜き円形アバター / 絵文字ステッカーを 0〜3 個。**画面には重ねない**が、面の縁で切れるのは可（装飾なので A1 の対象外） |
| B6 | 背面にもう 1 枚の画面をずらして重ねてよい（前面より小さく・より強く傾ける）。**背面の画面は切れてよい**（A1 は前面の主役画面にだけ適用） |
| B7 | 地はクリーム（`--promo-bg` / `--promo-bg-alt` を面ごとに交互）。ダーク面は作らない |

---

## 1. 成果物

| デバイス | 出力 px（Apple 必須） | 制作 CSS px | export DPR |
|---|---|---|---|
| iPhone 6.9" | **1320 × 2868** portrait | 440 × 956 | **3** |
| iPad 13" | **2064 × 2752** portrait | 1032 × 1376 | **2** |

- 6 パネル × 2 デバイス × 2 言語（ja / en）= 24 枚。出力 px が 1px でもズレると App Store Connect が弾く。
- `Poster.html` に 24 面を縦に並べ、`?ab=iphone-ja-03` で 1 面だけ描画できるようにする。
- 書き出し: `export/v4/{device}-{lang}-{01..06}.png`（v1 の `export/*.png` は上書きしない）。

```css
.ab        { position: relative; overflow: hidden; flex: none; isolation: isolate; }
.ab.iphone { width: 440px;  height: 956px;  }
.ab.ipad   { width: 1032px; height: 1376px; }
```

## 2. 画面の作り方

- **スクショ画像を貼らない。** `Universe-Quest.html` の markup と CSS を流用して**生きた DOM** で組む（3x でも文字がシャープ、blur / gradient / object-fit が実物のまま効く）。
- 画面は **402 × 874**（アプリの画面比）で組み、ポスター上のサイズには `transform: scale()` を使ってよい。**等比縮小は可・部分拡大は不可**（A2）。
- 傾きと立体は画面の外側のラッパーに `rotate` / `perspective` を掛ける。中の UI のレイアウトは崩さない。
- iPhone 面と iPad 面で**同じ DOM** を使う。iPad は画面を大きく置き、コピーとの間合いを広げるだけ（iPad 用に別 UI を作らない）。
- 写真は `assets/sample/uv/` `assets/reel/` `assets/sample/user/` から。**新しい画像を持ち込まない**。
- UI 内の日本語（お題名・サークル名）も ja/en で差し替える。**en 面に日本語 UI を残さない**。

### 各面に置く画面

| 面 | 画面（`Universe-Quest.html` の状態） |
|---|---|
| 01 hero | Quest home。3D 地図 + `#globe-frame`（クエストリング・未クリアのピンクリム）+ `.strip-board`（看板）+ `.wd-circle-bar` |
| 02 area | 同 home の圏内状態（リング内に自分ピン） |
| 03 lock | `.feed-sheet` 展開。`.post-cell` blur18 + `.rail-wrap.day-locked` の `.lock-note`（距離・経路） |
| 04 unlock | `.up-veil`/`.up-card`（`#upTitle` `#upState` `#upBar`）+ `.clear-toast` + 解錠後 `.feed-col` |
| 05 world | 地図引き（複数サークルのリング） |
| 06 circle | `.wd-circle-bar` + `.tl-sheet`（`.tl-head` `.tl-list`） |

## 3. タイポ

| 用途 | ja | en | iPhone | iPad |
|---|---|---|---|---|
| 見出し | Noto Sans JP 900 | Inter 900 | 42〜48 / 行間 1.08 / letter-spacing -0.02em | ×1.5 |
| 見出し（弱） | Noto Sans JP 700 | Inter 700 | 同上・色 `--promo-ink` | ×1.5 |
| 補足 | Noto Sans JP 500 | Inter 500 | 17 / 行間 1.45 / `--promo-ink-2` | ×1.5 |
| バッジ | Noto Sans JP 700 | Inter 800 | 14 | ×1.5 |

見出しは 2 行まで（`copy.json` の `\n` を `white-space: pre-line` で守る）。3 行になるならサイズを下げず語を削る。A3 を満たす範囲でできるだけ大きく。

## 4. パレット

```css
--promo-bg:      #f7f3ec;
--promo-bg-alt:  #efe8dc;
--promo-ink:     #16131f;
--promo-ink-2:   rgba(22,19,31,.62);
--promo-accent:  #ff3e88;
--promo-mark:    var(--gradient-colorful);
--promo-panel-shadow: 0 24px 60px rgba(22,19,31,.18);
```

ピンクは見出しの強調語とバッジだけ。**UI 内の色には触らない**（`Universe-Quest.html` のまま）。foundation は `colors_and_type.css` を参照し複製しない。

## 5. コピー（`copy.json` が正）

- `panels[].{ja,en}.{headline, accent, sub, badge?}` を流し込む。ハードコードしない。
- `accent` は headline 内の実在部分文字列。**その語だけ**強調 + マーカー。
- `badge` は 01 / 04 のみ。無い面に足さない。
- 面の役割（01 フック → 02 圏内限定 → 03 ロック → 04 解錠 → 05 世界 → 06 仲間）は入れ替えない。
- `metadata` は App Store Connect 入力用。ポスターには載せない。

## 6. 出力前セルフチェック（24 面すべて）

1. ポスターとして成立しているか（コピーと傾いた画面が対角に向き合い、一覧で目を引く）。ただのアプリ画面になっていない。
2. 前面の画面が**回転後も**面内に完全に収まっている（切れ 0px）。
3. 画面が full UI（部分拡大・部品単体でない）。
4. 画面の面積 ≥ 面の 40%、かつコピー＋バッジ＋ステッカーの合計面積より大きい。
5. 前面の画面の上に何も重なっていない。
6. デバイス筐体・ベゼルを描いていない。splash / ログインを使っていない。
7. 出力 px が 1320×2868 / 2064×2752 ちょうど。

## 7. やらないこと

- 「今すぐダウンロード」「No.1」「最高の」等の煽り文・実証できない数値。
- Apple のデバイス枠画像・ロゴ・App Store バッジ。
- 効果の全部盛り（`taste.md` 7原則: 1 面 1〜2 個）。
- 実在人物に見える写真への実名風テキスト（サンプルプール内で完結させる）。
