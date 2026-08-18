# Onboarding — 最初の構図のまま、主役だけ本番部品

repo: `univbrofd/toopdbq-design` / `main`
raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
索引: `DesignSystem/_ds_manifest.json`

**失敗した 2 つ（どちらもやるな）**
1. イラスト再発明（3 枚の縦カード、向かい合う顔、擬似レンジ円）
2. UniverseQuest のホーム画面を丸ごと埋め込む（白面フル、マップパネル切り欠き）

**正しい仕事:** 最初のオンボ構図を残す。中央の主役だけ、本番 UI の HTML/CSS をコピーする。

視覚の正（コピー元）:
- `handoff/UniverseQuest/UniverseQuest.html`
- `handoff/QuestBoard/HANDOFF.md`（看板の実値）

---

## 構図（最初のオンボ・全シーン共通）

`.phone` 402×874。上から:

1. フルブリードの暗い地図（最初の onboarding と同じ map-stage。ピン少量）
2. **中央に主役 1 つだけ**（下表）
3. 下から黒スクリム + foot（eyebrow / 見出し / 本文 / dots / 次へ）
4. 右上「スキップ」（05 は隠す）

ホームの白シート・サークル切替・フッターツールバーは出さない。

---

## 主役（ここだけ本番部品）

| # | 見出し | 中央に置くもの（UniverseQuest からコピー） |
|---|---|---|
| 01 | 世界中に、**1km の舞台**がある。 | **光の壁 WdEriaWall**。`UniverseQuest.html` のフォーカス域（56 分割カーテン・`--gradient-colorful` 11 stop・下濃上薄・天端リム）。擬似の細い楕円リングにしない。タグ `1km` |
| 02 | 毎日のお題を、**写真で届ける。** | **`.strip-board`**（未クリア・QUEST・お題は mock「とぅーぷどぅっくバーで乾杯」）の直下に **`.map-post .mp-cam`**（58px 投稿カメラ）。看板と投稿ボタンをセットで見せる |
| 03 | 達成した人だけが、**中を見られる。** | **投稿ボード**。`.post-cell` を UniverseQuest の列種（A / H / I / F / G / C3）で組む。**9:16 と 16:9 が混ざる。** 2 列そろいの縦長グリッドは禁止。未達成セルは `blur(18px)`。同じボードの解錠後が 03 |
| 04 | いいねが重なったら、**話せる。** | 03 と同じボード（解錠・like 付きセル）。会話は**投稿についての一言**（「この青、同じ路地だ」）。顔を向かい合わせない |
| 05 | 位置情報を使います | 同じ地図の上に許可シート。CTA「はじめる」1 つ |

本文は既存のまま（新しい約束を足さない）:
- 01 サークルは地図の上にいくつもある。それぞれ 1km 以内のエリア。そこにいる人だけが主役。
- 02 毎日クエスト。お題の写真をエリア内から投稿。それだけ。
- 03 達成すると同じお題の投稿が開く。外からは見えない。
- 04 いいねし合いで、その投稿についてメッセージが開く。
- 05 **エリアの中にいるか**を判定する。他人に位置は共有しない。

---

## リストの契約（03 / 04）

前稿の「縦長が 2 列」は捨てる。UniverseQuest の `layoutColumn` と同じ混在:

- 縦セル 9:16（`.post-cell`）
- 横セル 16:9
- 列種 H/I = 横 1 + 縦 3、F/G = 縦 1 + 横 1
- 角丸 14、名前・like は解錠時だけ
- 写真は `../../assets/sample/reel/`

看板の実値は QuestBoard HANDOFF（radius 20、colorful リム 1.5、QUEST ラベル、カメラアイコン）。

光の壁の色は `circles.js` / UniverseQuest と同じパレット:
`#fff0a6 #bfcc96 #80a787 #40837f #005f67 #60566f #804e78 #bf4680 #ff3e88 #e86f6d #d0a052`

---

## 成果物

`handoff/Onboarding/Onboarding.html` + 差分 CSS。`?screen` / `?scene=01..05`。`@dsCard`。bundle で出す。

やらない: 新色、デート構図、6 画面、ホーム画面の丸写し、2 列そろいグリッド。
