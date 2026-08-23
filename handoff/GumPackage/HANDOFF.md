# GumPackage v3 — 板ガム配布パッケージ / 上段を法定表示へ (HANDOFF)

## このラウンドの変更点（v2 → v3）

1. **面構成を微調整**: 仕上がり **69 × 52 mm**（v2 は 65×52）。上段 **18**・中段 **22**・下段 **12** mm。
2. **上段を差し替え**: ロゴ＋ワードマークの帯 → **法定表示（名称 / 原材料名 / 内容量 / 製造者 / 製造所 / アレルギー / 栄養成分表示）**。
3. **中段は現状維持**（v2 確定案 4a のまま。幅 65→69mm への再フィットのみ）。
4. **日本語版と英語版の両方**を作る。

配布する実物 = ロッテの板ガム（9枚入り）を自作スリーブで包む形。スリーブが商品表示面を隠すため、法定表示をスリーブ側に載せる。

## 規格（印刷前提）

- 仕上がり **横 69 × 縦 52 mm**・片面。塗り足し 3mm → **artboard 75 × 58 mm**。
- 安全余白は取らない（v2 と同じ full bleed 設計）。端の光学調整は 2mm 前後まで。
- 折り線: 仕上がり上端から **18mm** と **40mm** の水平 2 本（artboard 座標では上端から 21mm / 43mm）。畳むと**下段（40–52mm の 12mm 帯）は隠れる**。
- ガイド（イエロー破線 = 折り線）は `sc-if` で消せる非印刷ガイドにする。trim 枠は描かない。
- app 画面ではないので device frame（`.phone`）不使用。

## Foundation（コピーせず参照）

- 色・タイポ: `../../DesignSystem/colors_and_type.css` を `@import`。
- 美学: `../../DesignSystem/taste.md` 厳守。
- 背景グラデ: `--gradient-colorful`（放射 11-stop）。v2 確定案 4a は**無回転**で使用。
- ワードマーク "Toopdbq" は Pacifico（`--font-display`）、日本語は `--font-jp`、英数字は `--font-latin`。
- QR: `./qr/toopdbq_com.svg`（焼込 `https://toopdbq.com`・ECL Q・**再生成/改変禁止**・dark-on-white）。

---

## 上段 0–18mm（69 × 18mm）= 法定表示 ★今回の主題

### 何を載せるか（一字一句このまま）

**日本語版（正）— ロッテ チューインガム ＜ラムネ＞**

| 項目 | 値 |
|---|---|
| 名称 | チューインガム |
| 原材料名 | ぶどう糖（国内製造）、砂糖、還元パラチノース、水あめ、植物油脂、ゼラチン、ウーロン茶抽出物／ガムベース、酸味料、軟化剤、加工でん粉、香料、着色料（クチナシ、紅花黄）、甘味料（アセスルファムK）、増粘多糖類、ヘスペリジン |
| 内容量 | 9枚 |
| 製造者 | 株式会社ロッテ　〒160-0023 東京都新宿区西新宿3-20-1 |
| 製造所 | 株式会社ロッテ 狭山工場　埼玉県狭山市新狭山1-2-1 |
| アレルギー | ●アレルギー物質（28品目）ゼラチン使用。 |
| 栄養成分表示（1パック9枚当り） | 熱量 78kcal / 蛋白質 0g / 脂質 0g / 炭水化物 20.5g / 食塩相当量 0.004g / ぶどう糖 10.0g |

**英語版（参考訳）— Lotte Chewing Gum &lt;Ramune&gt;**

| Field | Value |
|---|---|
| Product name | Chewing Gum |
| Ingredients | Glucose (produced in Japan), sugar, reduced palatinose, starch syrup, vegetable oil, gelatin, oolong tea extract / gum base, acidulant, softener, modified starch, flavoring, coloring (gardenia, safflower yellow), sweetener (acesulfame K), thickening polysaccharide, hesperidin |
| Net content | 9 sticks |
| Manufacturer | Lotte Co., Ltd.　3-20-1 Nishi-Shinjuku, Shinjuku-ku, Tokyo 160-0023, Japan |
| Plant | Lotte Co., Ltd. Sayama Plant　1-2-1 Shin-Sayama, Sayama-shi, Saitama, Japan |
| Allergens | ●Allergens (28 designated items): contains gelatin. |
| Nutrition Facts (per pack / 9 sticks) | Energy 78 kcal / Protein 0 g / Fat 0 g / Carbohydrate 20.5 g / Salt equivalent 0.004 g / Glucose 10.0 g |

**もう 1 フレーバー（ロッテ 歯につきにくい梅ガム）を同じレイアウトで差し替えられる構造にすること。** 差分は 2 箇所だけ:

- 原材料名 = `砂糖（国内製造）、水あめ、ぶどう糖、還元パラチノース、ウーロン茶抽出物、食塩、ゼラチン／ガムベース、酸味料、香料、軟化剤、甘味料（アセスルファムK、スクラロース）、アントシアニン色素`
  （EN: `Sugar (produced in Japan), starch syrup, glucose, reduced palatinose, oolong tea extract, salt, gelatin / gum base, acidulant, flavoring, softener, sweeteners (acesulfame K, sucralose), anthocyanin color`）
- 栄養成分表示 = `熱量 81kcal / 蛋白質 0g / 脂質 0g / 炭水化物 20.7g / 食塩相当量 0.007g`（**ぶどう糖の列なし＝5 列**）
  （EN: `Energy 81 kcal / Protein 0 g / Fat 0 g / Carbohydrate 20.7 g / Salt equivalent 0.007 g`）

→ **栄養表は 5 列と 6 列の両方で成立する組み方**にする（列幅を固定値で決め打ちしない）。

### 組み方（参考 = ロッテ実物の側面表示）

実物パッケージの構造をそのまま踏襲する:

- **ラベルは各行の先頭に太字インライン**（`名称 チューインガム`）。ラベル用の縦罫カラムは作らない — 幅を食う。
- **1 行に 2 項目を同居**させてよい（`名称 …` の右端に `内容量 9枚`）。
- **項目の切れ目は細い水平罫 1 本**（0.3mm）。囲み枠は使わない。
- **アレルギー行は独立**させ、`●` 付き・太字・赤系で目立たせる（実物と同じ）。K100 でも可。
- **栄養成分表示は罫線の表**（見出し行 + 数値行）。キャプション「栄養成分表示（1パック9枚当り）」は表の 1 行目に左寄せで入れる。

### 実測（★設計を縛る事実 — 推測でなく実測値）

69×18mm の枠に、上記を**はみ出し 0** で組める**最大級数**を二分探索した結果:

| 構造 | 日本語 | 英語 |
|---|---|---|
| **A. 全部入り（栄養＝罫線表）** | **1.15mm**（3.3pt）実高 17.72mm | **1.05mm**（3.0pt）実高 17.90mm |
| B. 全部入り（栄養＝罫線なし inline 1 行） | 1.20mm | 1.20mm |
| **C. 栄養成分表示だけ下段へ逃がす** | **1.60mm**（4.5pt）実高 17.54mm | **1.40mm** |

計測条件: padding 上下 0.8mm / 左右 1.0mm、line-height 1.22、罫 0.3mm、Noto Sans JP / Inter。再現ハーネス = `./fit-harness.html`（数値がコンソールに出る）。

**ここから来る結論:**

- 英文は同じ内容で**日本語より 38% 字数が多い**（259em → 358em）。**英語版のほうが必ず小さくなる**ので、EN を先に組んで成立させ、JA をそれに合わせるほうが破綻しない。
- **1.05–1.15mm = 3.0–3.3pt。白抜き（knockout）では確実に潰れる。** 既存の印刷制約「白抜き細文字 <5pt 禁止」に抵触するので、**法定表示帯は白 or クリーム地に K100** を既定とする。
- 参考写真（ロッテ実物）は白抜きだが、**ロッテは名称〜アレルギーと栄養成分表示を別々の面に分けて**おり、1 面あたりの密度が我々の半分以下。同じ見た目を 1 面 18mm でやると 3.3pt の白抜きになる。
- **級数を上げたいなら C（栄養成分表示を下段 12mm へ逃がす）が唯一有効なレバー**。JA 1.15 → 1.60mm（+39%）。下段は畳むと隠れる面なので、法定表示の一部を置くことの是非は要判断（※下記フラグ参照）。

---

## 中段 18–40mm（69 × 22mm）= 現状維持

v2 確定案 4a の中段をそのまま。幅が 65→69mm になった分だけ再フィットする（**内容・級数・構成は変えない**）。

- 左（`flex:1`）: `ガムを噛んで` / `友達を増やそう`（`<br>` で 2 行）
  - `font-size:5.6mm; font-weight:900; line-height:1.12; letter-spacing:-0.06em; color:#fff; white-space:nowrap;`
  - `text-shadow:0 0.4mm 0.8mm rgba(0,0,0,.35);`
- 右: 白チップ `21×21mm` / `border-radius:2mm` / `background:#fff`、中に `qr/toopdbq_com.svg` を `19.6×19.6mm`
- 左右の `gap:1.6mm`、帯の `padding:0 0.4mm`、`align-items:center`
- 幅 +4mm 分は**左のコピー側の余白に回す**（QR チップは 21mm 固定・縮小禁止）

## 下段 40–52mm（69 × 12mm）= 畳むと隠れる面

v2 確定案 4a と同じ既定:

- 左: `審査基準: 噛み方のキレ ・ 目線 ・ 余裕`（`2.5mm / weight 500 / #fff / nowrap`）
- 右: `toopdbq.com`（`--font-latin` / `2.5mm / weight 600 / #fff`）
- `padding:0 0.4mm 0.4mm; align-items:flex-end; justify-content:space-between;`

構造 C を採る案では、ここに**栄養成分表示の表**が入る（その場合は上の 2 要素を 1 行に圧縮するか、`toopdbq.com` だけ残す）。

## 背景（v2 4a と同じ）

- artboard 全面 `background:#005f67`
- グラデ層: `position:absolute; left:-12.5mm; top:-21mm; width:100mm; height:100mm; background:var(--gradient-colorful);`（**無回転**。75mm 幅に対して 100mm 角を中央寄せ = left は -12.5mm。v2 の -14.5mm から更新）
- grain 層: `inset:0; background-image:var(--grain); background-size:35mm 35mm; opacity:.16; mix-blend-mode:overlay;`（`sc-if` で切替）

## 印刷の実測制約（v2 から継続）

- QR は**実寸 ≥13mm 角**・quiet zone を潰さない・dark-on-white。4a の 19.6mm は維持。
- `#ff3e88` は CMYK で沈む。細い白抜き文字には使わない。
- 極細線 <0.3mm 禁止。白抜き細文字 <5pt 禁止（→ 法定表示帯は白地 K100）。
- 手渡し→手元スキャン距離 10–15cm。

## 案出しの条件

**日本語版 4 案 ＋ 英語版 4 案 = 計 8 案。** 同じ番号の JA/EN はペア（同一レイアウトの言語違い）にする。

探索軸（**似た案を 2 つ出さない**・4 案で全部使う）:

1. **白帯フル幅** — 上段全面を白地にして K100。最も安全・実物に近い密度。
2. **クリーム地の札** — `#fdf6e3` 系の紙色パネル。v2 の 2e（レトロ駄菓子）の質感を法定表示に転用。
3. **構造 C（栄養を下段へ）** — 上段を 1.6mm まで拡大し、栄養表を下段へ。**必ず 1 案含める。**
4. **白抜き（参考写真そのまま）** — teal 暗部の上に白文字。**読めないリスクを承知の比較用として 1 案だけ。** 級数と潰れ具合が判断できるよう他案と同一条件で。

全案とも: 面構成 18/22/12 × 69mm 固定、中段は 4a のまま、QR 19.6mm、折り線ガイドあり。

各案の冒頭コメントに設計意図（狙い・級数の決め方・地色の判断）を 2–3 行。

## ★判断が要るフラグ（デザイン側で握りつぶさず、案の中で扱うこと）

1. **ロゴが package から消える。** 上段からロゴ＋ワードマークが無くなり、中段も現状維持なので、Toopdbq の署名は QR と下段の `toopdbq.com` だけになる。ブランド面としてこれでよいかは案の中で提示する（例: 下段に小さくワードマークを戻す案を 1 つ混ぜる）。
2. **法定表示帯の中に Toopdbq のロゴを置かない。** 帯には `製造者 株式会社ロッテ` が明記される。同じ枠内に Toopdbq のマークを並べると**製造者の誤認**を招く。ロゴを戻すなら帯の外（中段・下段）に置くこと。
3. **英語版は参考訳。** 日本の食品表示法が要求するのは日本語表示。英語版は併記・補助であり、**日本語版を置き換えない**。英語版単独で配布する想定なら、日本語表示も同じ面に残す構成にする。
4. **栄養成分表示を「畳むと隠れる下段」に置いてよいか**（構造 C）。表示は購入者が見られる状態である必要があるため、隠れる面に置くのは判断が要る。案としては出すが、この論点をコメントに明記すること。

## Smell test（出す前）

- [ ] 上段の 7 項目（名称 / 原材料名 / 内容量 / 製造者 / 製造所 / アレルギー / 栄養成分表示）が**全部**あり、はみ出し・省略が無いか
- [ ] 原材料名の文字列が**一字一句このまま**か（`／` と `、` の使い分け含む）
- [ ] 栄養表が 6 列（ラムネ）と 5 列（梅）の両方で崩れないか
- [ ] 面構成 18 / 22 / 12 × 69mm と折り線・塗り足し 3mm が全案で守られているか
- [ ] 中段が 4a のまま（コピー・級数・QR 19.6mm）か
- [ ] 白抜き案以外で、本文が白抜き細文字になっていないか
- [ ] JA 4 案 / EN 4 案が揃い、構造 C が 1 案含まれているか
- [ ] 英字が全大文字になっていないか

## このディレクトリのファイル

- `GumPackage.dc.html` — v2 の 17 artboard（4a 確定案 + 3a–3h + 2a–2h）。**v3 はここに追記せず新規ファイルへ。**
- `GumPackage_v1.dc.html` — v1 の 8 案（コピー A–D 準拠）
- `fit-harness.html` — 上段フィットの再計測ハーネス（級数を変えると実高 mm がコンソールに出る）
- `qr/toopdbq_com.svg` — QR（改変禁止）
- `support.js` — dc-runtime（GENERATED）
