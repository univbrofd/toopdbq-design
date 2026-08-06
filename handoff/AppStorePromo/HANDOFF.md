# AppStorePromo v3 — App Store スクリーンショット（poster タブで作り直し）

App Store / iPad ストア掲載用のポスターセット。訴求の主役は **Quest（サークル出題型クエスト）**。
UI の一次情報は `Universe-Quest.html`（プロジェクト内のタブ）。

**作る場所: プロジェクト直下に新しいタブ `Poster.html` を作成し、そこに 24 面すべてを持つ。** 既存の `handoff/AppStorePromo/AppStorePromo.html`（v1）は履歴として残し、編集しない。

## 経緯 — v1 と v2 の何がダメだったか（両方避ける）

- **v1**（`handoff/AppStorePromo/AppStorePromo.html` / `export/*.png`）は App Store 審査で **Guideline 2.3.3 リジェクト**。
  > The screenshots do not show the actual app in use in the majority of the screenshots.
  > **Please display your app in use bigger than marketing artworks and full UI, instead of zoomed up or cut UI.**

  実態: 見出しコピーが面の半分を占め、UI は面外へはみ出して横 1/4 以上が切れ、下のクエストカードも上下が切れていた。→ 「zoomed up or cut UI」「marketing artwork の方が大きい」に該当。
- **v2**（前回の指示で作った版）は逆に振れすぎた。**アプリの 402×874 をそのまま縮小して、Dynamic Island 付きのデバイス枠に収めた「スクショ写真」風**になり、v1 のアートディレクションから離れてしまった。**これは採用しない。**

**v3 の立て付け（この 2 行がすべて）:**

1. **手法は v1 のまま**＝スクショを貼らず、**ポスターの画角に UI を直接実装する**。ただしアプリの画面比率（402×874）を持ち込まず、**ポスター側の画角を新しいビューポートとして UI を組み直す**。
2. **アプリ画面が v1 よりはるかに広く見える**版面にする（§2 の占有率）。UI は切らない・隠さない・傾けない。

---

## 0. 絶対条件（全 24 面で例外なし）

| # | 禁止 | 必須 |
|---|---|---|
| R1 | UI を面外へ食い込ませて切る | **UI は面の中で完結**。上下左右いずれも切れ・見切れを作らない |
| R2 | アプリ画面を等比縮小してパネルに収める／デバイス筐体・ベゼル・Dynamic Island を描く | **ポスターの画角そのものに UI を実装**。実機 chrome は描かない（画角が実機と違うので描くと嘘になる） |
| R3 | 部品（看板・セル 1 枚）だけを拡大して主役にする | **その画面が成立する一式**を組む（地図・看板・フィード・サークルバー等を間引かない） |
| R4 | パネルを傾ける（±2〜4deg） | **傾き 0deg・正対**。`transform: rotate()` を使わない |
| R5 | 見出し 54px が主役／面をまたぐ連続演出 | **UI が主役**。見出しは §3 のサイズ、1 面で完結 |
| R6 | 切り抜きアバター/ステッカーを 3〜5 個散らす・UI に重ねる | **0〜2 個**・UI の上に重ねない・縁で切らない |
| R7 | UI が面の 40% 程度 | **§2 の占有率（高さ 80% 以上・面積 80% 以上）** |

補足:

- **splash / ログイン画面は 1 面も使わない**（Apple 明記で「app in use」と見なされない）。6 面すべて機能画面。
- 見出し・バッジ・マーカーは残す。禁止されたのは「マーケ要素が UI より大きいこと」であって、コピーを載せること自体ではない。
- UI に出す要素・情報・スタイルは `Universe-Quest.html` に実在するものだけ。ポスター用に機能や表示を発明しない（審査は「実装の反映」を見る）。

---

## 1. 成果物（24 アートボード）

| デバイス | 出力 px（Apple 必須） | 制作 CSS px | export DPR |
|---|---|---|---|
| iPhone 6.9" | **1320 × 2868** portrait | 440 × 956 | **3** |
| iPad 13" | **2064 × 2752** portrait | 1032 × 1376 | **2** |

- 6 パネル × 2 デバイス × 2 言語（ja / en）= 24 枚。
- 出力 px が 1px でもズレると App Store Connect が弾く。

```css
.ab        { position: relative; overflow: hidden; flex: none; isolation: isolate; }
.ab.iphone { width: 440px;  height: 956px;  }
.ab.ipad   { width: 1032px; height: 1376px; }
```

- タブ: **`Poster.html`（新規）**。24 面を縦に並べ、`?ab=iphone-ja-03` で 1 面だけ描画できるようにする。
- 書き出し: `export/v3/{device}-{lang}-{01..06}.png`（v1 の `export/*.png` は上書きしない）。

---

## 2. 版面 — UI をポスター画角にフルブリードで実装

**共通構造（iPhone / iPad とも同じ）:** 上にコピー帯、その下は**面の左右端まで UI**。UI は角丸なし・影なし・枠なしで面に直に接する（＝「パネルを置く」のではなく「面が UI になる」）。

### iPhone 面（440 × 956）

```
y=0    ┌ コピー帯  高さ 184（地 --promo-bg / --promo-bg-alt・左右 padding 32）
y=184  ├ UI 面     440 × 772 ← このサイズを 1 つのビューポートとして UI を実装
y=956  └
```

- UI 占有: **高さ 81% / 面積 81%**。下限は高さ 80% / 面積 80%。
- UI の上端は帯の下に**直に接する**（隙間・角丸・影を作らない）。

### iPad 面（1032 × 1376）

```
y=0    ┌ コピー帯  高さ 250（左右 padding 72）
y=250  ├ UI 面     1032 × 1126
y=1376 └
```

- UI 占有: **高さ 82% / 面積 82%**。2 カラム（左テキスト / 右 UI）にはしない。
- iPhone 面を引き伸ばさない。**1032×1126 の画角として UI を組み直す**（§2-1）。

### 2-1. 「画角として組み直す」の意味（v2 との決定的な違い）

- **402×874 のレイアウトを scale で縮小しない。** `transform: scale()` で全体を縮める実装は禁止。
- 440×772（iPad は 1032×1126）を**そのまま CSS のビューポートとして扱い**、地図の見え方・看板の幅・フィードの列数と段数・カードの寸法・サークルバーの位置を、その画角で自然に収まるよう**再配置する**。
  - 例: iPhone 面（440×772・アプリより横長）→ フィードは 3 列のまま、縦は 2 段までで下端で切らずに終える。
  - 例: iPad 面（1032×1126・大きく横長）→ フィードを 4〜5 列に増やす、地図の見える範囲を広げる。**要素を発明せず、既存要素の列数・見える範囲で埋める**。
- フォントサイズ・アイコン・角丸は UI 本来の値（`Universe-Quest.html` のまま）。**ポスターだからと UI 内の文字を拡大しない。**
- 文字が切れる・カードが半分だけ見える状態を残さない。切れるくらいなら要素数を減らして**きれいに終わらせる**。

---

## 3. コピー帯（v1 のアートディレクションを維持・サイズだけ縮小）

| 用途 | ja | en | iPhone | iPad |
|---|---|---|---|---|
| 見出し | Noto Sans JP 900 | Inter 900 | **38** / 行間 1.1 / letter-spacing -0.02em | 58 |
| 見出し（弱） | Noto Sans JP 700 | Inter 700 | 同上・色 `--promo-ink` | 58 |
| 補足 | Noto Sans JP 500 | Inter 500 | **16** / 行間 1.45 / `--promo-ink-2` | 24 |
| バッジ | Noto Sans JP 700 | Inter 800 | 13 | 20 |

- 見出しは **2 行まで**。`copy.json` の `\n` を `white-space: pre-line` で守る。3 行になるならサイズを下げず語を削る。
- 見出し内で太さ・色を切り替える文法（細めの黒 + 極太ピンクの `accent`）は v1 のまま維持。
- マーカー下線（`--gradient-colorful` の帯・高さ 0.34em・角丸 4px）維持。ただし**傾き 0deg**・1 面 1 箇所。
- バッジ pill は 01 / 04 のみ、帯の中・見出しの上。

## 4. パレット（変更なし）

```css
--promo-bg:      #f7f3ec;
--promo-bg-alt:  #efe8dc;
--promo-ink:     #16131f;
--promo-ink-2:   rgba(22,19,31,.62);
--promo-accent:  #ff3e88;
--promo-mark:    var(--gradient-colorful);
```

コピー帯の地は `--promo-bg` / `--promo-bg-alt` を面ごとに交互。ピンクは見出しの強調語とバッジだけ。**UI 内の色には触らない**（`Universe-Quest.html` のまま）。パネル影（`--promo-panel-shadow`）は v3 では使わない（UI が面に直接接するため）。

---

## 5. 各面に組む画面

| 面 | 画面（`Universe-Quest.html` の状態） |
|---|---|
| 01 hero | Quest home。3D 地図 + `#globe-frame`（クエストリング・未クリアのピンクリム）+ `.strip-board`（看板）+ `.wd-circle-bar` + フィード上段 |
| 02 area | 同 home の圏内状態（リング内に自分ピン） |
| 03 lock | `.feed-sheet` 展開。`.post-cell` blur18 + `.rail-wrap.day-locked` の `.lock-note`（距離・経路） |
| 04 unlock | `.up-veil`/`.up-card`（`#upTitle` `#upState` `#upBar`）+ `.clear-toast` + 解錠後 `.feed-col` |
| 05 world | 地図引き（複数サークルのリング） |
| 06 circle | `.wd-circle-bar` + `.tl-sheet`（`.tl-head` `.tl-list`） |

実装手順:

1. `Universe-Quest.html` の markup と CSS を流用して `Poster.html` に組む（`<img>` でスクショを貼らない。生きた DOM のまま＝ 3x でも文字が真にシャープ、blur / gradient / object-fit が実物のまま効く）。
2. foundation は `DesignSystem/colors_and_type.css` を参照。**複製しない**。
3. デバイス差はスケール変数 1 本（`.ab.iphone { --u: 1 }` / `.ab.ipad { --u: 1.5 }`）＋ §2-1 の再配置で吸収する。iPad 用に別 DOM を作らない。
4. 写真は `assets/sample/uv/` `assets/reel/` `assets/sample/user/` から。**新しい画像を持ち込まない**。
5. UI 内の日本語テキスト（お題名・サークル名など）も ja/en で差し替える。**en 面に日本語 UI を残さない**。

---

## 6. コピー（`copy.json` が正）

- `panels[].{ja,en}.{headline, accent, sub, badge?}` をそのまま流し込む。ハードコードしない。
- `accent` は headline 内の実在部分文字列。**その語だけ** `--promo-accent` + マーカー。
- `badge` があるのは 01 / 04 のみ。無い面に足さない。
- 面の役割（01 フック → 02 圏内限定 → 03 ロック → 04 解錠 → 05 世界 → 06 仲間）は入れ替えない。
- `metadata` は App Store Connect の入力用。ポスターには載せない。

---

## 7. 出力前セルフチェック（24 面すべて）

1. UI が面の左右端まで届き、上端はコピー帯に直に接している（隙間・角丸・影なし）。
2. UI 占有が高さ 80% 以上・面積 80% 以上。
3. UI 内に**切れている要素が 1 つも無い**（半分だけのカード・途中で切れた文字・見切れたバー）。
4. `transform: scale()` でアプリ画面を縮めていない。デバイス枠・ベゼル・Dynamic Island を描いていない。
5. 傾き 0deg（`rotate()` が 1 つも無い）。
6. ステッカー ≤ 2 個、UI に重なっていない。
7. 画面は実在の状態で、部品だけの拡大になっていない。splash / ログインを使っていない。
8. 出力 px が 1320×2868 / 2064×2752 ちょうど。

## 8. やらないこと（審査・品位）

- 「今すぐダウンロード」「No.1」「最高の」等の煽り文・実証できない数値を置かない。
- 実在しない画面・未実装機能を描かない。
- Apple のデバイス枠画像・ロゴ・App Store バッジを面に入れない。
- 効果は 1 面 1〜2 個（`taste.md` 7原則）。マーカー・ステッカーを全部盛りしない。
- 実在人物に見える写真に実名風テキストを重ねない（サンプルプール内で完結させる）。
