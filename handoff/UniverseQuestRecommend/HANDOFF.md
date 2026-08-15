# UniverseQuestRecommend — 起動直後のおすすめ（前日のクエスト結果一覧）

repo: `univbrofd/toopdbq-design`（branch `main`）
raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main`
DS 索引: `DesignSystem/_ds_manifest.json`

## 何の画面か

アプリを開いた**一発目に出る全画面**。前日に各サークルで行われたクエスト
（コンテスト）の**結果 = 優勝作品（いいね 1 位の投稿）**を一覧で見せる。
UniverseQuest の**リスト拡大表示（feed-max）と同じデザイン言語**
（白面 + 角丸 14 の写真セル）で、コンテンツをぎっしり詰める。

- セルタップ → そのサークルのクエストフィード（UniverseQuest）へ遷移
  （タップしたサークルが先頭・タップしたお題の位置から表示）。画面全体が
  上へ抜けながらフェードアウト（380ms ease-out）。
- 縦スクロールで結果が続く。マップ・フッター等の chrome は一切出ない。

## スマホ配置文脈（必須）

- specimen は `DesignSystem/preview/card.css` の `.phone`（iPhone 17
  402×874・Dynamic Island・statusbar 62 / home-ind 34）に **full-bleed** で。
- リスト上余白 = safe-area top + 10。下端は最後のセル + 96 の余白。
- タップ範囲 = セル全体（最小 44pt は自明に満たす）。

## 現仮実装の実値（Flutter 側。参考: 別 repo `univbrofd/toopdbq` の
QuestRecommendSheet — 差し替え前提の初稿）

レイアウト:
- 外周 pad 10 / セル間 gap 7 / 2 列（colW = (W - 20 - 7) / 2）
- 投稿の画角のまま敷く: 縦（ar ≤ 1、9:16 系）= 低い方の列へ masonry /
  横（ar > 1、16:9）= 両列を揃えて**全幅 1 枚**
- media の下にキャプション帯 24（サークル名の小テキスト）

見出し（左上・仮コピー）:
- `Quest results` Inter w800 22 / rgba(0,0,0,.90) / ls -1%
- サブ `昨日のクエストの優勝作品` Noto Sans JP w500 11.5 / rgba(0,0,0,.54)

セル（優勝作品）:
- 角丸 14・下地 #101014・写真 cover（動画は poster 静止画）
- 縦スクリム: rgba(0,0,0) alpha .35 → .14 → .30 → .14 → .25
  （stops 0/.3/.5/.7/1。中央のオーバーレイ可読用）
- **中央オーバーレイ**: サークル名 Inter w700 11 / rgba(255,255,255,.85) /
  ls 8% → 7px → **お題タイトル**（コンテスト内容）Noto Sans JP w700 15 /
  #fff / lh 1.4 / 最大 3 行 / 黒シャドウ 2 層（0 1 10 .85 + 0 0 26 .60）
- 左上: 優勝者名 Inter w700 11.5 / #fff + シャドウ
- 右下: 花アイコン（`assets/icons/` の like）13 + いいね数 Inter w700 11.5 /
  #fff（1000 以上は 1.2k 表記）
- media 下キャプション: サークル名 Inter w600 10.5 / rgba(0,0,0,.50)

## サンプルデータ（前日の結果 5 件）

| サークル | お題（コンテスト） | 優勝いいね | 画角 |
|---|---|---|---|
| Ranway Shibuya | ファッションバトル｜テーマ：白 | 4.2k | 縦 |
| GrafitiMan Circle | 心に響いた言葉 | 3.1k | 横 |
| Shokugeki no Shibuya | Shokugeki \| テーマ : 日本食 | 5.0k | 縦 |
| Shibuya Skateboard Park | 最高のトリック | 3.6k | 横 |
| Shibuya Dance | ダンスチャレンジ \| テーマ : Neon Lights | 4.8k | 縦 |

写真は共有プール `assets/sample/reel/` を参照（per-View 複製禁止）。

## Claude Design への要求

1. この画面の完成デザインを 1 枚: `UniverseQuestRecommend.html`
   （`.phone` full-bleed・上記データ 5 件 + あと数件で「ぎっしり」感）。
2. 世界観は UniverseQuest（`handoff/UniverseQuest/`）の feed-max と地続きに。
   「結果発表 / 優勝」の高揚感（例: 1 位の花・リム等）は既存トークン
   （`colors_and_type.css`）と効果 1〜2 個の範囲で。
3. 見出しコピー・階層（日付の見せ方含む）は改善提案歓迎。英字は
   先頭 1 文字のみ大文字（ALL CAPS 禁止）。
4. セル中央 = サークル名 + お題、セル下 = サークル名小テキスト、の情報構造は
   維持（タップで結果の詳細フィードへ飛ぶ、が伝わること）。

## 直すべき逸脱（初稿の既知課題）

- 見出し・スクリムは場当たり値。役割トークンへ寄せる提案が欲しい。
- 「1 位」であることの記号が弱い（いいね数のみ）。順位表現の提案が欲しい。
