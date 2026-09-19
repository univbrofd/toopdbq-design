# HANDOFF — PlaceRanking（行ったお店のランキング）

プロフィールに **3 つ目のタブ「ランキング」** を足し、自分が行ったお店（= 投稿にリンクした場所）を
**自由なタイトルのランキング**として並べる機能の、UI を設計してほしい。範囲は 2 つ:
**(A) プロフィールのランキングタブ**（一覧 + 右下の追加 FAB）と、**(B) FAB から入るランキング作成フロー**
（home と同じ地図を全面に敷き、真上から見下ろすマップで**最初にサークルを選ぶ**）。
挙動・データ・配置の制約は下記で固定。「何を・どの順で・どの形で見せるか」と、サークルを選んだ後の
手順の組み立てを探索してほしい。

## repo / raw リンク

- repo: `univbrofd/toopdbq-design`、branch **`main`**
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`（public・認証不要）
- DS 索引: `DesignSystem/_ds_manifest.json` → foundation は `DesignSystem/USAGE_RULES.md` / `DesignSystem/taste.md` /
  `DesignSystem/colors_and_type.css` / `DesignSystem/preview/card.css`（`.phone` = iPhone 17・402×874）
- 視覚ブリーフ: `handoff/PlaceRanking/brief.html`（実測図 3 枚 + 固定値の表。まずこれを見る）
- 流用する specimen: 地図 = `handoff/TimelinePlaceMode/place-map.js`（MapLibre・`data-pitch="0"` で真上。
  `areaAdd(map, center, radius)` がエリア 1 個を描く = サークルの数だけ呼ぶ）/ ライト面の投稿行 =
  `DesignSystem/components/WdTimelinePost/card.html`（`.tlp`）/ 場所の見え方 = `handoff/PlaceCard/HANDOFF.md`
- as-built スクショ（実機 mock・iPhone 17e を 2x に落とし実測を描き込んだもの。`shots/`）:
  `profile-tabs.jpg`（今のプロフィール = 投稿 / 下書きの 2 タブ）/ `map-topdown-circles.jpg`（home のマップを真上から =
  サークル名 + active のリング + 場所ピン）/ `circle-create-flow.jpg`（既存のマップ上フロー = サークル作成の chrome）

## これは何か（プロダクト文脈）

- 投稿には Google マップのリンクを 1 本添えられ、backend が**場所**（店）に解決してサークルごとにまとめる
  （`circlePlaces`）。**「行ったお店」= 自分の投稿にリンクした場所**。プロフィールの投稿タブと同じ土台
- ランキング = **タイトル（自由入力）+ 所属サークル + 順位付きの場所リスト**。1 人が何本でも作れる
  （例: 「渋谷の締めラーメン」「道玄坂で朝まで」「原宿カフェ 5 選」）。タイトルごとに 1 本のリスト
- 見る場所 = プロフィールの**タブ行の 3 つ目「ランキング」**（投稿 / 下書き / ランキング。他人のプロフィールでは
  下書きが無いので 投稿 / ランキング）。タブの中に自分のランキングが並ぶ
- 作る入口 = ランキングタブの**画面右下の追加 FAB**（`assets/icons/icon_add.png`）。タップで**画面遷移**して作成フローへ
- 作成フロー = **home と同じ地図を背景に全面に敷く**（フロー専用のマップ。終わったら捨てる = 戻ったら home の地図は
  そのまま）。**最初のステップはサークル選択**: 地図は**真上から見下ろす（pitch 0）**、**サークル名とエリア（円）を
  全部描く**。タップで選ぶ。以降のステップ（場所を選ぶ → 順位を決める → タイトル → 保存）は探索の対象

## 固定（契約 — 破ると実装できない）

- 画面 402×874（`preview/card.css` の `.phone`）。status bar 62 / home indicator 34。タップ範囲は最小 44pt
- **(A) プロフィール = ライト面**（白 `#fff` / ink `#08080b` / ink-sub `rgba(8,8,11,.56)` / hairline `rgba(8,8,11,.08)`）。
  ユーザーバー（高さ 104・スクロールで上へ退避）→ **タブ行 44**（バーと一緒に上がり **status bar の直下で止まる**）→ フィード。
  タブ行は固定・変更不可: タブは**等分**（3 タブ = 各 134）、ラベル 14 / 選択 w700 ink + 下線 2 ink / 非選択 w500 ink-sub、
  下端 hairline。ランキングタブの中身（一覧）と FAB だけが設計対象
- **(B) フロー = 地図が全面**（下に一覧のシートを持たない）。地図は openfreemap liberty のライトな街路図・**真上（pitch 0）**・
  1 本指 pan / ピンチ可。**chrome は地図の上に載る暗ガラス**（`--lg-tint-dark`。明るい地図の上で白文字 AA を保つ）。
  glass 形状 ≤ 6 / 画面、リスト行に glass 禁止（`taste.md` の予算）
- **サークルの描き方は地図側（canvas）の既存意匠を流用**: 名前 = 15px w800 白 + 黒ハロー（`shots/map-topdown-circles.jpg` の拡大）、
  密集は今の zoom で 1 群にまとめ「代表名 +N」（64px 間引き）。エリア = 円（既存値 `#08080b` 16% 塗り + 線 90%）。
  active（選択中）の壁は真上では**白い光のリング**。**選択 / 非選択 / まとめ の見え方は変えてよい**が、この 3 要素
  （名前・円・リング）の組み合わせで表現する（新しいピン形状・アイコン付きマーカーは発明しない）
- フォント Noto Sans JP（本文）/ Inter（数字）。絵文字なし。アイコンは `assets/icons/`、写真は `assets/sample/`
- 実装は Flutter（挙動は Controller 側）。specimen は**静的 HTML + 最小の JS**（地図の初期化・タブ切替程度）

## 出せる情報（データの棚卸し）

| 由来 | 項目 | 例 | 備考 |
|---|---|---|---|
| ランキング | タイトル / 所属サークル / 場所の並び / 作成日 | `渋谷の締めラーメン` / サークル渋谷 / 5 件 / 9/12 | 件数上限は未定（想定 3〜10） |
| 場所（`Place`） | 名前 / 短い住所 / 写真 1 枚 / 座標 / 投稿数 / 最新投稿の時刻 / Google マップ URL | `TK NIGHTCLUB` / `渋谷区, 東京都` / あり or **なし** / 3 件 | 写真の無い場所・座標の無い場所（ピン無し）もある |
| 場所の詳細（Places API・**未取得もある**） | 正式住所 / カテゴリ / 評価と件数 / 営業時間 | `night_club` / `4.5 (1,500)` / `20:00–5:00` | 取れていない場所 = `detailsPending` |
| 自分の投稿 | その場所への自分の投稿（メディア / キャプション / 時刻） | サムネ 1〜3 枚 | ランキングの行にサムネを出せる |
| サークル | 名前 / 説明 / 中心と半径（500〜800m）/ 現在地からの距離 / **自分がリンクした場所の数** / 場所の総数 | `サークル渋谷` / `渋谷駅周辺のコミュニティ` / 500m / 320m / 3 / 12 | 選択画面のバッジ等に使える |

## as-built の実値（起点にする）

- タブ行: 高さ 44・白・下端 hairline。3 タブは 134 等分。フィード先頭 = 62 + 104 + 44 = 210。バーが退くとタブ行は y 62〜106
- 投稿行（`WdTimelinePost`・ランキングの行の土台に使える）: 左右 inset 16 / 内側 gap 12 / 行の上下 pad 20 / アバター 32 /
  名前 16 w700 ink + 時刻 ink-sub / アクション icon 18。写真は幅いっぱい
- home の FAB（参考の意匠）: colorful グラデの円 55 + 白アイコン 28（画面右上・投稿カメラ）。マップ上の小さな
  ボタンは 38〜40 の暗ガラス円 + 白アイコン 18〜24
- 既存のマップ上フロー（サークル作成 `shots/circle-create-flow.jpg`）: 真上 pitch 0・左上 × 40（黒 40% の円 + 白 18）・
  中央タイトル 18 w700 白 + 影（blur 6 黒 80%）・浮きパネル `rgba(21,21,26,.8)` r18 縁白 14%・下端シート `rgba(10,10,14,.9)` 上角 r24・
  CTA 高さ 56 r8。**この暗い chrome の流儀に揃える**
- 地図の zoom の目安（実測・mock 7 サークル・真上）: 12 → 名前 1 群 / 13.45 → 2 / 14.12 → 3 / 15.24 → 5 / 16 → 6。
  1 サークル（半径 500m）を画面幅の 72% に fit すると zoom ≈ 14.2。サークル選択の初期構図は**現在地（無ければ home の active）を中心に
  zoom ≈ 13.5〜14**（2〜3 群が見える）が妥当。ピンチで寄ると群がほどける
- 場所ピン（既存・流用可）: 36×36 / r11 の写真タイル、件数バッジ、選択中は白枠 2.5 + scale 1.14。写真が無ければ ink 地 + `icon_pin_location.png`

## 決めてほしいこと（探索の軸）

1. **一覧の形（A）**: タイトルごとに何をどこまで見せるか — 全件展開（1. 2. 3. … の行）/ タイトル + 上位 3 件 + 「もっと見る」/
   横スクロールの帯。順位の表現（数字 / メダル的な強弱 / 1 位だけ大きい）。行に出す情報（場所名 / 写真 / 短い住所 / 自分の投稿サムネ /
   カテゴリ）。サークル名の置き場（タイトルの脇か、行か）。行タップ = 場所モード（home の地図で見る）へ飛ぶ想定
2. **FAB（A）**: 追加 FAB の大きさ・面（colorful グラデは最重要アクション 1〜2 箇所限定。ここに使うか、暗い面にするか）・
   位置（既定の候補: end 16 / bottom = 34 + 16 / Ø56）・スクロール中の挙動（残す / 縮む）・空のとき（ランキングが 0 本）の
   案内との関係
3. **サークル選択（B-1）**: タップで**即決**か、**選択 → 確認 CTA**か。選択中のサークルの示し方（リング + 名前の強調 + 下端に
   名前 / 説明 / 自分の場所の数のカード？）。自分の場所が無いサークルの扱い（既定: 選べる。候補はそのサークルの場所全部）。
   現在地の示し方。chrome = 左上 戻る（×）/ タイトル「サークルを選ぶ」/ 進む CTA の有無と置き場
4. **サークルを選んだ後（B-2 以降）**: 既定の想定は 場所を選ぶ（同じ地図に場所ピン + 一覧、自分が投稿した場所を先頭に）→ 順位を決める
   （ドラッグで並べ替え）→ タイトル入力 → 保存。**ステップの併合・順序の変更は自由**（例: 選ぶと同時に順位が決まる /
   タイトルを最初に聞く）。地図をどこまで使い続けるか（場所選びも地図上 / 一覧だけ）。投稿していない店を
   Google マップのリンク貼り付けで足せるか（既存の「リンクを追加」ダイアログと同じ入力）
5. **状態**: ランキング 0 本（タブが空）/ サークルに場所が 0 件 / 写真の無い場所 / 長いタイトル・長い店名 / 他人のプロフィール
   （閲覧のみ・FAB 無し）/ 保存中・失敗
6. **モーション**: FAB → フローの画面遷移（地図が下から現れる / 全面フェード）、サークル選択の確定（選んだサークルへ寄る？）、
   フロー完了 → タブへ戻って新しいランキングが先頭に現れる入場

## 成果物（Claude Design が作るもの）

- `handoff/PlaceRanking/PlaceRanking.html` — `.phone`（402×874）に**実配置**した specimen を横に並べる:
  **A. ランキングタブ**（2〜3 案）/ **B-1. サークル選択**（2〜3 案。地図は `place-map.js` を `data-pitch="0"` で。
  サークルは `assets/mock` 相当の 5〜7 個: 渋谷 / 道玄坂 / 代々木 / 神宮前 / 原宿 / 恵比寿 / 中目黒。
  半径 500〜600m・重なりあり）/ **B-2 以降**（推し案の手順を 1 本通しで）/ **状態バリエーション**（空・写真なし・他人）。
  各案の先頭に `<!-- @dsCard -->` と「狙い」1 行
- `handoff/PlaceRanking/PlaceRanking.css` — View 固有の差分だけ（foundation はコピーせず参照）
- 推し案 1 つと、その理由（一覧の情報の優先順位・FAB の重み・サークル選択の確定のさせ方・手順の数）
- `DesignSystem/_ds_manifest.json` の `cards` に登録。写真は `assets/sample/`、アイコンは `assets/icons/`
- 最終はダウンロード可能な bundle

参考（別 repo `univbrofd/toopdbq`・Claude Design は読まない）: タブ行 `lib/feature/Profile/widgets/ProfileTabBar.dart`、
プロフィールの一覧 `lib/feature/Profile/widgets/ProfileTimeline.dart`、地図の名前 / 円 `assets/web/earth/circles.js`（`setCircles`）と
`lib/feature/Universe/UniverseCircleUsecase.dart`（`_syncMapCircles` / `_clusterCircles`）、真上の構図 `CircleFocusCamera.topDown`、
マップ上フローの前例 `lib/feature/CircleCreate/`、場所 `lib/model/Place.dart` / `PlaceDetails.dart`、
自分の投稿の索引 `userPost/{uid}/{postId}`（`{circleId, postId, time}`）。フローの地図はフロー専用の `EarthView` を生成し、
終了で dispose（home の Earth は借りない）。

## Claude Design に貼るプロンプト

```
プロフィールに足す「ランキング」タブ（行ったお店のランキング）と、右下の追加 FAB から入る
ランキング作成フロー（home と同じ地図を全面に敷き、真上から見下ろすマップで最初にサークルを選ぶ）
のデザインを、複数パターンで作って。
索引:     https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
ブリーフ: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/PlaceRanking/brief.html
仕様(正): https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/PlaceRanking/HANDOFF.md

まず brief.html を見て、HANDOFF.md の全文を読むこと。土台は USAGE_RULES.md と taste.md。
地図は handoff/TimelinePlaceMode/place-map.js を data-pitch="0" で流用し、サークルの数だけ
areaAdd で円を描く。ライト面の行は DesignSystem/components/WdTimelinePost/card.html の .tlp を土台に。

固定（変えない）: 画面 402×874（card.css の .phone）、タブ行 44 の見た目と等分、プロフィール =
ライト面、フロー = 地図が全面 + 暗ガラスの chrome（--lg-tint-dark）、サークルは 名前（15px w800
白 + 黒ハロー）・円・active の白い光のリング の 3 要素で表現、glass ≤ 6 / 画面、タップ 44pt 以上。

探索: (A) ランキングタブの一覧の形と FAB を 2〜3 案、(B-1) サークル選択の確定のさせ方と選択中の
示し方を 2〜3 案、(B-2 以降) 場所を選ぶ → 順位 → タイトル → 保存 の手順を推し案で 1 本通しで。
似た案を 2 つ出さない。空（ランキング 0 本）・写真なし・他人のプロフィールの状態を添える。

世界観は厳守: Noto Sans JP / Inter、絵文字なし、役割トークンと assets/icons/・assets/sample/ を
使う。Material アイコン直書き・場当たりグレー・新しいマーカー形状の発明は禁止。

納品: handoff/PlaceRanking/PlaceRanking.html（各案 1 phone・先頭に @dsCard と狙い 1 行）+
PlaceRanking.css（差分だけ）+ 推し案 1 つと理由。_ds_manifest.json の cards に登録し、
最終はダウンロード可能な bundle で出力して。
```
