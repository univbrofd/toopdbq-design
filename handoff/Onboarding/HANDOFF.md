# Onboarding — UniverseQuest 画面そのもので説明する

repo: `univbrofd/toopdbq-design` / `main`
raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
索引: `DesignSystem/_ds_manifest.json`

**視覚の一次情報はこれ 1 枚だけ:**
`handoff/UniverseQuest/UniverseQuest.html`

前稿（イラストの 3 枚カード、浮遊 QuestBoard、向かい合う顔、擬似グリッドだけの地図）は失敗。ユーザーは「アプリの実画面と同じエリアとクエストリストを見せて、具体的に想像させたい」。

---

## 何を作るか

`handoff/Onboarding/Onboarding.html` を作り直す。5 面。各面の**中央の絵は UniverseQuest の `.phone` をコピーした実画面**。その上にオンボ用の skip / foot を重ねるだけ。

- 各面は `.phone`（402×874・角丸 55・island / statusbar 62 / home-ind 34）に実配置
- `?screen` で chrome 無し、`?scene=01` で 1 面
- `Onboarding.css` は差分だけ（foundation と UniverseQuest のレイアウト式をコピーして再発明しない）
- 写真・アイコンは `../../assets/` のみ。絵文字なし。呼称は「投稿」

---

## 必須手順（これを守らないとまた失敗する）

1. 先に `UniverseQuest.html` を読む。`.phone` の計算式・`#map`・白面・`.feed-sheet`・`.circle-strip`・`.strip-title`・`.post-cell`・`.rail-wrap.day-locked`・`.lock-note`・`.map-post` を把握する
2. そのマークアップと CSS を **Onboarding に複製**する（見た目を「寄せる」のではなく同じ部品）
3. 地図は UniverseQuest と同じ MapLibre globe（`earth/` を参照してよい）。擬似グリッド地図に戻さない
4. リストは `.post-cell` のフリーボード。3 枚の縦カードを新しく描かない
5. お題は `.strip-title`（黒 56% / 15px）＋必要なら `.strip-board`。独自のガラス看板を発明しない

UniverseQuest のレイアウト式（そのまま使う）:

```
vw=402  vh=874
map-ratio=3/4
map-h = vw * 3/4
map-r = 24
map-gap = 34
feed-h = vh - map-h + map-gap
quest-h = feed-h - 25
```

白面がマップパネル（下角丸 24）を切り欠く。フィード上端はマップに 34px 重なる。

---

## 5 面 = 同じホーム画面の状態違い

コピーは意味固定。新しい約束を足さない。

| # | 見出し | ホーム画面の状態（UniverseQuest のどれ） |
|---|---|---|
| 01 サークル | 世界中に、**1km の舞台**がある。 | マップが主役。サークル域（直径がマップ幅の 72%）が見える。下に白フィードが少し覗く。ピン複数可 |
| 02 クエスト | 毎日のお題を、**写真で届ける。** | 同じホーム。`.strip-title` にお題（例: とぅーぷどぅっくバーで乾杯）。`.map-post` カメラ。ボードは **day-locked**（blur 18 + lock-note） |
| 03 ひらく | 達成した人だけが、**中を見られる。** | **02 と同じ構図の解錠後。** `.post-cell` が鮮明。名前・いいねが見える。03 は 02 の after |
| 04 メッセージ | いいねが重なったら、**話せる。** | 解錠済みボードのまま。**投稿 2 枚**（`.post-cell`）に like が付いている。その上に写真／お題の短い会話（「この青、同じ路地だ」）。人の顔を向かい合わせない |
| 05 許可 | 近くのサークルを見つけるために位置情報を使います | 同じホームを背景に、下シート（radius 22 / `#16131f`）。CTA「はじめる」1 つ。OS ダイアログは描かない |

本文（01–04）:
- 01: サークルは地図の上にいくつもある。それぞれに決められたエリアがある。半径 1km 以内。そこにいる人だけが、その日の主役になる。
- 02: サークルでは、毎日クエストが出る。お題にちなんだ写真を、そのエリアの中から投稿する。それだけ。
- 03: クエストを達成すると、同じ場所・同じお題に応えた人たちの投稿が開く。外からは、見えない。
- 04: 誰かの投稿にいいねする。その人もあなたの投稿にいいねしてくれたら、メッセージが開く。
- 05 本文: **エリアの中にいるか**を判定して、今日のクエストに参加できる場所を見つける。位置情報が他人に共有されることはありません。

chrome: 右上「スキップ」（05 は隠す）。foot = eyebrow + 見出し + 本文 + dots +「次へ」。見出し Noto 700 29、強調 1 語だけ colorful。本文 Noto 500 14.5 `--text-2`。下部スクリム必須（白フィードの上でも文字が読める）。

---

## デートに見せない

04 禁止: 向かい合う顔、中央ハート、マッチバッジ、性別/年齢カード、スワイプで人を選ぶ UI、恋・出会いコピー。主役は投稿セル。

---

## やらないこと

- UniverseQuest に無い UI の発明
- 旧 `comp-onboarding-01..06` の構図を引き継ぐ
- 擬似グリッド地図だけにする（マップは UniverseQuest と同じ globe）
- ライト地・ポスター文法
- 6 画面・まとめ画面・サークル作成の教示
- 効果の盛りすぎ（1 面 1〜2。02→03 の解錠だけ厚くしてよい）

実装対応（別 repo `univbrofd/toopdbq`・参考）: `lib/feature/Onboarding/`、`lib/feature/Universe/widgets/UniverseCircleHomeView.dart`、`lib/component/ui/view/CircleFocus/QuestFeedSheet.dart`。
