# HANDOFF — TimelinePlaceMode（サークルタイムラインの「場所モード」）

サークルタイムライン home（`handoff/UniverseQuest/UniverseQuest.html` の `.tl-standalone` = 白面のフィード）に
**場所モード**を足した。投稿に貼られた Google マップのリンクをタップすると、画面上半分がサークルのエリア地図
（場所ピン + 場所カード）、下半分がその場所の投稿タイムラインへ切り替わる。**現状実装（as-built）を単一の正**として
値で捕捉した。Claude Design には、この as-built を土台に **UI / UX の改善案（Before / After）と、`.phone` 枠に
実配置した画面 specimen** を作らせる。実装挙動は再発明しない（挙動・データは下記のとおり固定）。

## repo / raw リンク

- repo: `univbrofd/toopdbq-design`、branch **`main`**
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`（public・認証不要）
- DS 索引: `DesignSystem/_ds_manifest.json` → foundation は `DesignSystem/USAGE_RULES.md` / `DesignSystem/taste.md` /
  `DesignSystem/colors_and_type.css` / `DesignSystem/preview/card.css`（`.phone` = iPhone 17・402×874）
- 起点 specimen: `handoff/UniverseQuest/UniverseQuest.html`（`?view=timeline` で `.tl-standalone`。投稿行 `.tlp` / リンクカード `.tlp-og` / ヘッダー `.tl-head`）
- as-built スクショ（実機 mock・iPhone 17e）: `shots/P00-timeline.png`（入る前）/ `shots/P01-place-mode.png`（場所モード・WOMB 選択）/
  `shots/P02-place-switch.png`（別ピン TK NIGHTCLUB に切替・営業時間あり）/ `shots/P03-back.png`（戻った後）

## これは何か（プロダクト文脈）

- 投稿には 1 本だけリンクを添えられる（OGP スナップショット付きカード）。リンクが **Google マップの場所**のとき、
  backend が場所 ID でグループ化する。**同じ店の別の共有 URL でも同じグループ**になる
- 場所モード = 「この場所についてサークルで語られている投稿」を、地図上の位置と一緒に見る画面。
  入口は投稿行のリンクカードのタップだけ（ヘッダー等に別の入口は無い）
- 場所ごとに持っているデータ: 名前 / 住所（Google マップの OGP 由来 = `店名 · 渋谷区, 東京都` 形式）/ 写真 1 枚（OGP の og:image）/
  座標 / 投稿数 / 最新投稿時刻。**解決済みの場所だけ**追加で: 今日の営業時間（曜日別 periods）/ 評価と件数 / 電話 / Web サイト /
  カテゴリ（`night_club` 等）。営業時間などが未取得の場所（`detailsPending`）もある = カードは名前 / 住所 / 写真だけになる
- 座標を持たない場所（検索リンク等）はピンが立たず、タイムライン側にだけ存在する

## 配置文脈（スマホ・必須）

- 画面 402×874（`preview/card.css` の `.phone`。基準 393×852 でも比率は同じ）。status bar 62 / home indicator 34
- **上半分 = 地図パネル**: 画面上端から **高さ = 画面高 / 2（437）**、幅いっぱい・角丸なし・下端に 1px の区切り `rgba(8,8,11,.18)`。
  地図はサークルのエリア構図（クエスト表示と同じ: エリアの白い光壁リング、pitch 60）。パネルの外（下半分）は白面
- **下半分 = 場所のタイムライン**: 白面。上端にヘッダー 56（戻る / 場所名 / `N 件の投稿 · サークル名`）、その下に投稿行（既存 `.tlp` と同じ行）が縦スクロール。
  下端 padding = home indicator + 104（既存 home と同じ）
- 地図パネルの前景（地図の上に重なる Flutter 層）: 左上に戻るボタン（38 の白丸・left 6 / top = status bar + 4）、場所ピンのタップ領域、
  選択中の場所のカード（ピンの上に浮く）
- タップ範囲: ピン = 直径 34 の円（最小 44pt に満たない → 改善対象）、戻る 38（→ 44 へ）、ヘッダーの戻る 44×44、カード全面、投稿行は既存どおり
- 地図パネルはタッチで動かない（パン / ズーム不可）。上方向へのドラッグ（-6px）で場所モードを抜ける

## as-built の実値（これを起点に。値は実装から捕捉済み）

面・色（ライト面の役割トークン。specimen 内の変数名は既存 `.tl-*` に合わせる）
- 白面 `#ffffff` / ink `#08080b` / ink-sub `rgba(8,8,11,.56)` / hairline `rgba(8,8,11,.08)` / リンク teal `#0d5f67`（`.tlp-chip` と同じ）
- フォント: Noto Sans JP（本文）/ Inter（数字・バッジ）

場所ピン（地図に貼る DOM マーカー。位置は場所の座標、`anchor: bottom`・viewport 平行）
- 円 直径 34（r 17）: 場所の写真を cover、`border: 2.5px solid #fff`、`box-shadow: 0 2px 8px rgba(8,8,11,.35), 0 0 0 1px rgba(8,8,11,.08)`。
  写真が無い場所は `#08080b` 地に `assets/icons/icon_pin_location.png`（16・白）
- 円の下に三角形の脚 高さ 9（白・`drop-shadow(0 1px 1px rgba(8,8,11,.25))`）
- 件数バッジ（投稿 2 件以上）: 右上 `-6,-6`、高さ 18・最小幅 18・padding 0 5、`#08080b` 地 / 白文字 Inter 700 11、外周 `0 0 0 2px #fff`
- 選択中: `scale(1.18)`（原点 = 脚の先）+ 円に `0 0 0 3px #08080b`。非選択（選択があるとき）: opacity .72。切替 180ms `cubic-bezier(.2,0,0,1)`
- 選択中のピンが画面外なら何も出ない（カードも出ない）

場所カード（選択中のピンの上。`left = ピン中心 − 幅/2` を左右 12 内に clamp、`top = ピン円の上端 − 10 − カード高`、上は status bar + 50 より下に clamp）
- 幅 264 / 高さ **76**（営業時間の行があるときは **92**）/ 角丸 14 / 白 / `box-shadow: 0 6px 18px rgba(8,8,11,.18)` / padding 12
- 左: 写真 52×52・角丸 10（写真が無ければ `#08080b` 地 + `icon_pin_location.png` 20 白）
- 右（縦中央揃え）: 名前 Noto Sans JP 700 14 / lh 1.3 ink・1 行省略 → 住所 11 ink-sub・1 行省略 → **今日の営業時間 11 / 600 ink**
  （例 `20:00–5:00`。深夜跨ぎは close の日が翌日。複数区間は ` / ` 連結。未取得なら行ごと無し）→ 余白 2 → `Google Mapsで開く` 11 / 600 teal
- カード全面タップ = Google マップを外部で開く。カードに矢印・吹き出しの脚は無い（→ 改善対象）
- 表示していないが持っているデータ: 評価（例 4.5）と件数（1,500）/ 電話 / Web サイト / カテゴリ / 曜日別の営業時間全体

戻るボタン（地図左上）
- 38 の白丸、`box-shadow: 0 3px 10px rgba(8,8,11,.18)`、中に `assets/icons/icon_back.png` 14 ink

タイムラインのヘッダー（下半分の先頭・高さ 56・下に hairline）
- 左: 戻る 44×44（`icon_back.png` 16 ink）→ 場所名 Noto Sans JP 700 15 ink・1 行省略 → 2px → `N 件の投稿 · サークル名` 11 ink-sub
- 場所名はピン一覧が届く前は投稿のリンクカードの OGP タイトル（`TK NIGHTCLUB · 渋谷区…` の前半）から出す

投稿行
- 既存の `.tlp`（`UniverseQuest.html`）と同一: アイコン 32 + 名前 + 時刻 / 本文 / メディア / いいね・コメント・共有 / 右端にリンクカード `.tlp-og`
- 同じ場所のリンクカードはタップ無効（既に開いている）。**別の場所**のリンクカードをタップするとその場所へ切替（ピン・カード・リストが差し替わる）
- 空: 中央に `投稿がありません`（13 ink-sub）。読み込み中は下端に 20 のスピナー

モーション（as-built）
- 入る: 白面の上端から地図パネルが**降りてくる**（高さ 0 → 437、360ms `cubic-bezier(.16,1,.3,1)`）と同時に、
  サークルのフィード + ヘッダーが **左へ抜け**（x 0 → −100%）、場所のタイムラインが **右から入る**（x +100% → 0）、440ms 同カーブ。
  地図はサークルのエリアへ 500ms でカメラが寄る。ピンは一覧の取得後に出る（数百 ms 遅れ・アニメ無し = 改善対象）
- 抜ける（戻るボタン / ヘッダーの戻る / 地図の上ドラッグ）: 逆再生。地図パネルが上へ畳まれ、サークルのフィードが左から戻る
- 別ピンをタップ: カードとヘッダーが即時差し替わり（アニメ無し = 改善対象）、リストは先頭から読み直し

## 直すべき逸脱 / 改善余地（Claude Design に考えてほしいこと）

1. **ピン**: 写真丸 + 脚は暫定。Toopdbq の地図ピン語彙（`handoff/TerrestrialPin/` / `handoff/TerrestrialThumbPin/` の投稿ピン）と並んだとき区別がつき、かつ同じ世界観に見えること。タップ範囲 44 の確保。件数バッジ・選択状態・「営業時間あり / 未取得」「座標なし」の表現
2. **場所カード**: 吹き出しとしての形（脚の有無）、ピンとの位置関係、営業時間の「営業中 / 営業時間外 / 未取得」状態、評価・件数の出し方、`Google Mapsで開く` の CTA の強さ。長い店名 / 住所の折り返し。カードが status bar 直下に押し込まれるケース（ピンが画面上寄り）
3. **遷移の読ませ方**: 「サークル → 場所」に入った / 戻ったことが分かるヘッダーの文脈（パンくず？ サークル名の残し方）、ピンが遅れて現れるときの出方、別ピン切替のアニメ
4. **タイムライン側**: 場所名ヘッダーの情報設計（名前 / 件数 / サークル名 / 住所のどれを出すか）、他サークルの投稿が混ざるときの見せ方（場所グループはサークル横断）、空状態、「この場所に投稿する」導線（未実装・要否の提案でよい）
5. **地図パネル**: 上半分固定でよいか（ピンが域外のときの扱い）、パネル下端の区切り、戻るボタンの置き場（カードと重なる）
6. Material アイコン直書き・場当たりグレー禁止。役割トークン（ink / ink-sub / hairline / teal）と `assets/icons/` を使う

## 成果物（Claude Design が作るもの）

- `handoff/TimelinePlaceMode/TimelinePlaceMode.html` — `.phone`（402×874）に実配置した画面 specimen。1 ファイルで **4 シーン**を横に並べる:
  S0 サークルタイムライン（入る前・`.tl-standalone` そのまま）/ S1 場所モード（選択ピン + カード + 場所のタイムライン）/
  S2 別ピン選択（営業時間あり）/ S3 状態バリエーション（営業時間未取得・座標なし・空）。各シーン先頭に `<!-- @dsCard -->`
- `handoff/TimelinePlaceMode/TimelinePlaceMode-motion.html` — 入る / 抜ける / 別ピン切替の storyboard（状態サムネ左→右 + 遷移条件の注釈）
- Before（as-built = `shots/`）/ After（提案）を並べた注釈。変更点は「なぜ」を 1 行で
- `DesignSystem/_ds_manifest.json` の `cards` に登録。foundation はコピーせず参照（View 固有の差分だけ `TimelinePlaceMode.css`）。
  写真は `assets/sample/`、アイコンは `assets/icons/`
- 最終はダウンロード可能な bundle

参考（別 repo `univbrofd/toopdbq`・Claude Design は読まない）: 実装は `lib/feature/Universe/widgets/TimelineHomeView.dart` /
`PlaceMapForeground.dart` / `PlaceTimelineList.dart`、ピンは `assets/web/earth/places.js`。

## Claude Design に貼るプロンプト

```
サークルタイムライン home の「場所モード」（TimelinePlaceMode）のデザインを作って。
索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/TimelinePlaceMode/HANDOFF.md

土台は USAGE_RULES.md と taste.md。起点は handoff/UniverseQuest/UniverseQuest.html の
tl-standalone（白面のフィード）と、HANDOFF に値で書いた as-built。挙動とデータは固定、
新規発明はせず既存の Wd* / .tlp とトークン（colors_and_type.css）を使うこと。

スマホアプリ前提（必須）: 画面 402×874（card.css の .phone）、SafeArea 考慮。
上半分 = サークルのエリア地図 + 場所ピン + 場所カード、下半分 = 場所のタイムライン。
タップ範囲は最小 44pt。

HANDOFF の「直すべき逸脱 / 改善余地」1〜6 に答える形で、Before（shots/）/ After を
並べて示し、TimelinePlaceMode.html（4 シーン）と TimelinePlaceMode-motion.html
（入る / 抜ける / 別ピン切替）を作り、各 specimen 先頭に @dsCard を付けて
_ds_manifest.json に登録。最終はダウンロード可能な bundle で出力して。
```
