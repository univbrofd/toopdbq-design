# AppStorePromo — App Store スクリーンショット（Quest 全面）

App Store / iPad ストア掲載用のスクショ（ポスター）セット。訴求の主役は **Quest（サークル出題型クエスト）**。
UI の一次情報は `handoff/UniverseQuest/UniverseQuest.html`。
**スクショは貼らない。その markup / CSS の部品を、ポスターのアートボードに直接組む**（新規に画面を発明しない・§5）。

- 参照 specimen: `../UniverseQuest/UniverseQuest.html`（`?screen` で chrome 無しの画面のみモード）
- foundation: `../../DesignSystem/colors_and_type.css` / `../../DesignSystem/preview/card.css` / `taste.md`
- 写真プール: `../../assets/sample/{uv,user,reel,background}/` ・アイコン: `../../assets/icons/` ・ロゴ: `../../assets/images/logo_toopdbq.png`

---

## 1. 成果物（24 アートボード）

| デバイス | 出力 px（Apple 必須） | 制作 CSS px | export DPR |
|---|---|---|---|
| iPhone 6.9" | **1320 × 2868** portrait | 440 × 956 | **3** |
| iPad 13" | **2064 × 2752** portrait | 1032 × 1376 | **2** |

- 6 パネル × 2 デバイス × 2 言語（ja / en）= 24 枚。
- 1px でもズレると App Store Connect が弾く。`.ab` は `width/height` 固定・`overflow:hidden`・`transform` によるはみ出しは必ずクリップ。

```css
.ab            { position: relative; overflow: hidden; flex: none; isolation: isolate; }
.ab.iphone     { width: 440px;  height: 956px;  }
.ab.ipad       { width: 1032px; height: 1376px; }
```

ファイル名: `shots/{device}/{lang}/{01..06}-{slug}.png`（例 `shots/iphone/ja/03-lock.png`）
specimen: `AppStorePromo.html`（全 24 面を縦に並べ、`?ab=iphone-ja-03` で 1 面だけ描画できるようにする）

---

## 2. 参照デザインの文法（この 8 つを守れば「あの感じ」になる）

参照は askus のストア面。**構図の文法だけ借り、配色は Toopdbq に置換する**（色をそのまま真似ない）。

1. **1 面 = 1 メッセージ + 1 UI**。見出しは 2〜3 語 × 2〜3 行、それ以上入れない。
2. **見出しは 1 文の中で太さと色を切り替える**（例: 細めの黒 `今日の` + 極太ピンク `お題`）。全部同じ強さにしない。
3. **キーワードにマーカー下線**。参照の黄色ハイライト = Toopdbq では `--gradient-colorful` の帯（高さ 0.34em・文字の後ろ・角丸 4px・わずかに右上がり 0.6deg）。1 面につき **1 箇所だけ**。
4. **UI はデバイス枠を出さず、切り取って画面端から食い込ませる**。`.phone` のベゼル/影は使わず、角丸 28px のパネルとして 1〜2 枚を斜め（±2〜4deg）に置く。
5. **UI は必ず面の 40% 以上**を占める（Apple 審査 2.3.3: スクショはアプリの実使用画面であること。文字だけの面は不可）。
6. **切り抜き円形アバター/絵文字ステッカーを 3〜5 個散らす**。面の縁で半分切れさせる。影は 1 つだけ（`0 8px 24px rgba(0,0,0,.14)`）。
7. **バッジ pill を 1 面に最大 1 個**（例 `エリア内だけ` / `24h で入れ替え`）。参照の「400k daily users」枠。数字を盛らない、事実だけ。
8. **要素を面をまたいで連続させる**（1 面右端で切れた円が 2 面左端に続く）。一覧で横に並んだとき 1 枚の絵に見える。

---

## 3. パレット（ライト + ブランドピンク）

DS の役割トークンに載せる。**新しい色を発明しない**。

```css
--promo-bg:      #f7f3ec;              /* 面の地。Quest フィードの白と地続き */
--promo-bg-alt:  #efe8dc;              /* 2・4・6 面の地（交互に振る） */
--promo-ink:     #16131f;              /* = --surface-raised。見出しの主色 */
--promo-ink-2:   rgba(22,19,31,.62);   /* 補足文 */
--promo-accent:  #ff3e88;              /* = --state-quest-active。見出しの強調語 */
--promo-mark:    var(--gradient-colorful);  /* マーカー下線・バッジ */
--promo-panel-shadow: 0 18px 48px rgba(22,19,31,.16);
```

- 面の地は `--promo-bg` と `--promo-bg-alt` を交互。ダーク面は作らない（一覧で沈む）。
- ピンクは**見出しの強調語とバッジだけ**。UI パネル内の色には触らない（specimen のまま）。

## 4. タイポ

| 用途 | ja | en | サイズ（iPhone 440 幅） |
|---|---|---|---|
| 見出し | Noto Sans JP 900 | Inter 900 | 54 / 行間 1.06 / letter-spacing -0.02em |
| 見出し（弱） | Noto Sans JP 700 | Inter 700 | 同上・色 `--promo-ink` |
| 補足 | Noto Sans JP 500 | Inter 500 | 19 / 行間 1.45 / `--promo-ink-2` |
| バッジ | Noto Sans JP 700 | Inter 800 | 15 / uppercase は en のみ |

- iPad は見出し 88 / 補足 28（幅比 1032/440 で単純スケールせず、**上表 ×1.55 に丸める**）。
- en は ja より 1 行増えやすい。**3 行を超えたら語を削る**（サイズを下げない）。

---

## 5. UI の作り方 — アートボードに直接組む

`UniverseQuest.html` の markup と CSS を**そのまま流用**する。パネルごとに使う部位:

| パネル | 使う部位（UniverseQuest 内） | 状態 |
|---|---|---|
| 01 hero | `#map` + `#globe-frame`（クエストリング）+ `.strip-board`（看板: `.qb-title` `.qb-date` `.qb-dots`）+ `.wd-circle-bar` | 未クリア（ピンクリム・パルス） |
| 02 area | `#map` + `#globe-frame` + `.wd-circle-bar` | 圏内。リング内に自分ピン |
| 03 lock | `.feed-sheet` / `.feed-col` の `.post-cell` を blur18 + `.rail-wrap.day-locked` の `.lock-note`（距離・経路ボタン） | ロック |
| 04 unlock | `.up-veil`/`.up-card`（`#upTitle` `#upState` `#upBar`）+ `.clear-toast` + 解錠後の `.feed-col` | CLEARED |
| 05 world | `#map` 引き（3D 地図・複数サークルのリング） | — |
| 06 circle | `.wd-circle-bar` + `.tl-sheet`（`.tl-head` `.tl-list`）| — |

### 5-1. 原則 — スクショを貼らず、アートボードに直接 UI を組む

**この handoff は HTML なので、アートボード自体が UI の描画面になる。** 画面を撮った画像を貼る作業ではない。

- **`<img>` でアプリ画面を貼らない。** 面に置く UI はすべて **生きた DOM**（UniverseQuest の markup ＋ CSS）。
- **画面まるごとでなく「部品」を置く。** 参照ポスターが効いているのは、画面全体でなく *看板だけ* *セル 1 枚だけ* *アップロードカードだけ* が浮いているから。上の表の部位を**単体で**アートボードに配置してよい。
- **寸法はポスターの座標系で決める。** 402×874 の `.phone` を作って全体を縮小しない。部品の `width` / `font-size` を**アートボード上で見せたい実寸**で指定する。
- **アプリの寸法に縛られない。** 看板をヒーローとしてアプリの 2 倍で置く、セルを 1 枚だけ 320px で置く、が可能（CSS でありビットマップではないため）。

これで得られること（画像貼付では出せない）:

- **3x 出力でも文字が真にシャープ**。スクショの拡大では絶対に出ない解像度になる。
- ロックの blur、`--gradient-colorful`、写真の `object-fit` が**実物のまま**効く（近似を作らない）。
- お題名・アバター・セル写真を面ごとに差し替えられる → **ja / en の作り分けが CSS 変数とテキスト差し替えだけで済む**。

### 5-2. 手順

1. `UniverseQuest.html` から必要な DOM 断片と、それが依存する CSS 規則だけを `AppStorePromo.css` に写す（foundation は `colors_and_type.css` を参照。**複製しない**）。
2. **スケール用の単位変数を 1 本置く。** `.ab.iphone { --u: 1 }` / `.ab.ipad { --u: 1.55 }` とし、部品側は `calc(N * 1px * var(--u))` で寸法を書く。→ **同じ markup が 2 デバイスで成立する**（iPad 用に別 DOM を作らない。レイアウトの組み替えだけ §7 で行う）。
3. 部品の入れ物は `.ui-panel { border-radius: calc(28px * var(--u)); overflow: hidden; box-shadow: var(--promo-panel-shadow); }`。切り取りたいときだけ内側で `transform: scale()` + `transform-origin` を使う。**文字を大きく見せる目的で scale を使わない**（`font-size` で作る。scale はレイアウトを歪める）。
4. ステータスバー / Dynamic Island / ホームインジケータは**出さない**（部品配置なので chrome は不要）。
5. 写真セルは `assets/sample/uv/` `assets/sample/reel/` から。**新しい画像を持ち込まない**。
6. UI 内の日本語テキスト（お題名・サークル名など）も ja/en で差し替える。**en 面に日本語 UI を残さない**。

---

## 6. パネル構成とコピー

**コピーは `copy.json` が正**（文字数・accent の実在チェック済み）。ハードコードせず、そこから流し込む。

```
copy.json
  panels[]  .id  .ja/.en { headline, accent, sub, badge? }
  alt_hook          01 の A/B 用 差し替え案（同じ構造）
  metadata  .ja/.en { name, subtitle, keywords, promotional_text, description }  ← 面には使わない
```

- `headline` の `\n` が**改行位置の指定**。ブラウザの自動折返しに任せず `white-space: pre-line` で従う。
- `accent` は headline 内の実在部分文字列。**その語だけ** `--promo-accent` + マーカー（§2-3）を当てる。
- `badge` があるのは 01 / 04 のみ。無い面にバッジを足さない。
- 面の役割（01 フック → 02 圏内限定 → 03 ロック → 04 解錠 → 05 世界 → 06 仲間）は入れ替えない。**1〜3 面が一覧で見える範囲**なので密度をここに寄せる。
- `metadata` は App Store Connect の入力用。ポスターには載せない。

---

## 7. iPad 13"（3:4）の組み替え

iPhone 面を引き伸ばさない。**部品は同じまま（`--u: 1.55`）、配置だけ組み替える**（iPad 用の DOM を別に作らない）。

- 縦 1 カラム → **左テキスト / 右 UI の 2 カラム**（左 42% / 右 58%、gap 72px）。
- 3:4 で余る横幅は、**部品を増やして埋めない**。1 面 1 メッセージのまま余白として使う（§2-1）。
- UI パネルは 2 枚重ね（前面 0deg・背面 -4deg・背面は 60px 右下オフセット）。
- 散らすアバターは iPhone の 1.4 倍サイズ・個数は同じ（増やすと散らかる）。
- 面をまたぐ連続要素は iPad でも維持する。

---

## 8. やらないこと（審査・品位）

- 「今すぐダウンロード」「No.1」「最高の」等の煽り文・実証できない数値を置かない。
- 実在しない画面・未実装機能を描かない（描いた画面は必ず `UniverseQuest.html` に存在する状態）。
- Apple のデバイス枠画像・ロゴ・App Store バッジを面に入れない。
- 効果は 1 面 1〜2 個（`taste.md` 7原則）。マーカー・傾き・ステッカーを全部盛りしない。
- 実在人物に見える写真に実名風テキストを重ねない（サンプルプール内で完結させる）。
