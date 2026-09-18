# HANDOFF — PlaceCard（場所の吹き出しカード）のデザイン探索

サークルタイムライン home の正方形マップで**場所ピンをタップすると出る吹き出しカード**（場所モードの
ポップアップ）を、いろんなパターンで設計してほしい。土台は `handoff/TimelinePlaceMode/`（場所モード全体の
as-built と specimen）。**このハンドオフはカードだけ**を扱う。挙動・データ・配置の制約は下記で固定、
「何を・どの順で・どの形で見せるか」を自由に探索してほしい。

## repo / raw リンク

- repo: `univbrofd/toopdbq-design`、branch **`main`**
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`（public・認証不要）
- DS 索引: `DesignSystem/_ds_manifest.json` → foundation は `DesignSystem/USAGE_RULES.md` / `DesignSystem/taste.md` /
  `DesignSystem/colors_and_type.css` / `DesignSystem/preview/card.css`（`.phone` = iPhone 17・402×874）
- 起点 specimen: `handoff/TimelinePlaceMode/TimelinePlaceMode.html`（`.tpm-map` = 本物の MapLibre 地図 `place-map.js` /
  `.tpm-pin` = 場所ピン / `.tpm-card` = 旧カード）。地図とピンはそのまま流用し、カードだけ差し替える
- as-built スクショ（実機 mock・iPhone 17e・1170×2532）: `shots/home-before-tap.png`（タップ前の home）/
  `shots/A-horizontal-asbuilt.png`（現行 = 写真が左の横並び）/ `shots/B-vertical-wip.png`（検討中 = 写真が上の縦並び。
  カメラを北へ寄せてピンを下げ、上に領域を空けた）

## これは何か（プロダクト文脈）

- 投稿に添えた **Google マップのリンク**を backend が「場所」に解決し、同じ店の投稿を場所でまとめる。
  home の正方形マップにはそのサークルの場所が**写真の角丸スクエア（36 / r11）のピン**で常に貼ってある
- ピンをタップ → **場所モード**: マップはその場所へ pan、ピンが選択状態（白枠 + scale 1.14）になり、**吹き出しカード**が
  ピンの上に出る。下半分の一覧はその場所の投稿に切り替わる。カードの × で解除（サークルのタイムラインへ戻る）
- カードの役割は「ここがどこか」を一目で確かめて、必要なら Google マップで開くこと。投稿そのものは下の一覧が見せる
- ドラッグで地図を動かすと**中心に最も近いピンへ選択が移り、カードも差し替わる**（120ms cross-fade・カードは 180ms で移動）

## 出せる情報（データの棚卸し）

**A. 今すでに持っている**（追加コストなし）

| 由来 | 項目 | 例 | 備考 |
|---|---|---|---|
| OGP（Google マップの共有ページ） | 店名 | `WOMB` / `TK NIGHTCLUB` | og:title `店名 · 地域` の前半 |
| OGP | 地域（短い住所） | `渋谷区, 東京都` | og:title の後半。Places が取れれば正式住所で上書き |
| OGP | 写真 1 枚 | 店の代表写真 or ストリートビュー | og:image を R2 に複製。**無い場所もある** |
| OGP | 1 行説明 | `★★★★☆ · ナイトクラブ` の形が多い | og:description。投稿のリンクには残るが場所ノードには未保持（出すなら派生に足す） |
| Toopdbq | 投稿数 / 最新投稿の時刻 | `3件の投稿` / `9/9` | 場所ごと。**サークル横断**（同じ店を別サークルでも語れる） |
| Toopdbq | その場所の投稿（メディア / 投稿者 / キャプション） | 下の一覧と同じ行 | サムネ 1〜3 枚・投稿者アイコンをカードに出すことも可能 |
| Toopdbq | 現在地からの距離 / エリア内か | `320m` | サークルの距離計算を流用できる |
| Toopdbq | 元の共有 URL | `maps.app.goo.gl/...` | `Google Mapsで開く` の遷移先 |

**B. Google Places API (New) で取得済み**（月 900 件の上限つきで backend が解決。**取れていない場所 = `detailsPending` もある**）

| 項目 | 例 | 備考 |
|---|---|---|
| 正式名称 / 正式住所 | `日本、〒150-0042 東京都渋谷区宇田川町１３−８ ちとせ会館 B1` | 長い。1 行なら省略が要る |
| 座標 | — | ピンの位置（**座標が無い場所**もある = 検索リンク等。ピンは立たない） |
| カテゴリ | `night_club` / `cafe` / `park` | 英語の type 文字列。表示名に訳す必要あり |
| 評価 / 件数 | `4.5` / `1,500` | 無い場所もある |
| 営業時間（曜日別 periods + 曜日別テキスト） | `20:00–5:00`（深夜跨ぎ）/ `24時間営業` | 今のカードは **営業中（閉店時刻まで）/ 営業時間外（次の開店から）/ 未取得** の 3 状態に畳んでいる |
| Web サイト / 電話 | `https://…` / `03-…` | 未表示 |
| Google マップ URI | — | CTA の遷移先候補 |

**C. 取れるが未取得**（Places API (New) の追加フィールド。SKU 層が上がる = コスト増。**採用は提案でよい**）

- 写真（複数・`photos[]` の参照 → Place Photo で取得。1 枚ごとに課金）/ 写真の権利表記
- 表示用カテゴリ名 `primaryTypeDisplayName` / 営業ステータス（休業・閉業）/ 価格帯 `priceLevel` `priceRange`
- 編集部の 1 行紹介 `editorialSummary` / 生成要約 `generativeSummary` / レビュー本文 `reviews`（最上位 SKU）
- 属性（テイクアウト / 予約可 / 屋外席 / 子連れ / ペット可 / 決済手段 など多数。最上位 SKU）
- 混雑・所要時間・経路（別 API）

## 配置文脈（スマホ・必須）

- 画面 402×874（`preview/card.css` の `.phone`）。status bar 62 / home indicator 34
- **上 = 正方形の地図パネル**（画面上端から 402×402、full-bleed）。**下 = 白面の一覧**（角丸 12 でパネルの下端に 12 かぶさり、
  上端に grab bar 14）。地図の見える下端 = 390
- **ヘッダー行（status bar 直下・高さ 56）が地図の上に乗る**: 左に戻る 44（場所モード中）、**中央に active のサークル名**
  （白の素のテキスト 15 / 700 + 黒い影）、右に投稿カメラ FAB（アイコン 28・タップ 55）。**カードはこの行と重なりうる**
  （`shots/B-vertical-wip.png` でサークル名がカードの裏に隠れている = 決めてほしいこと①）
- **ピン**: 36×36 / r11 の写真タイル。中心 = 地点。選択中は白枠 2.5 + scale 1.14。タップ領域 44×44
- **ピンの位置（構図）は選べる**: 地図はタップした場所をパネルの一点に置く。現行 A はパネルの 2/3（y ≈ 271）、
  検討中 B は下寄り（y ≈ 355・カメラを北へ寄せる）。**それより下はタイルが白面にかかる**（上限 ≈ 360）。
  → カードに使える縦の領域 = status bar + 8（= 70）〜 ピンのタイル上端 − 脚 10。A で約 170、B で約 250
- カードの横位置 = ピン中心 − 幅/2 を左右 10 に clamp。脚（三角 高さ 10・幅 18）はカード内でピン中心に追従。
  上に入り切らないときだけ**ピンの下へ反転**（脚が上向き）
- 地図はライトな街路図（openfreemap liberty・3D ビル・白い光壁のエリア）。**カードは白面（ライト）**が既定だが、
  Toopdbq の世界観（`taste.md`: ダーク + ガラス + 写真フルブリード）をどこまで持ち込むかは提案の余地

## as-built の実値

共通: 白 `#fff` / r16 / 影 `0 6px 18px rgba(8,8,11,.18)` / ink `#08080b` / ink-sub `rgba(8,8,11,.56)` / ink-faint `.40` /
teal `#0d5f67`（CTA）/ golden `#d0a052`（★）/ success `#4caf50`（営業中ドット）/ ドット off `rgba(8,8,11,.28)`。
フォント: Noto Sans JP（本文）/ Inter（数字）。padding 14 / 上 14 / 下 13。× は名前行の右端（22×22・icon_close 12 ink-sub）

- **A 横並び（現行）**: 幅 min(336, 画面幅 − 20)・高さ 126（住所無しは 103）。左に高さいっぱいの写真 min(118, 34%)
  （無ければ ink 地 + `icon_pin_location.png` 26 白）。右に 名前 17/700 → 住所 13.5 ink-sub → 営業状態 13.5
  （`● 営業中  5:00 まで` / `● 営業時間外  20:00 から` / `営業時間は未取得` faint）→ 下段 左 `★ 4.5 (1,500)` 13 Inter・右 `Google Mapsで開く ›` 13/700 teal
- **B 縦並び（検討中）**: 幅 min(264, 画面幅 − 20)・高さ 234（住所無しは 211）。上に幅いっぱいの写真 108（上角 r16）、
  下に A と同じテキスト。ピンを下げて（y ≈ 355）領域を確保
- CTA のタップだけ Google マップを開く（当たり判定は下段の余白まで）。カードの面はタップを地図へ通さないだけ。× で解除
- コピー（日本語 arb・変更可）: `Google Mapsで開く` / `営業中` / `営業時間外` / `{time} まで` / `{time} から` / `24時間営業` /
  `営業時間は未取得` / `{count}件の投稿`

## 決めてほしいこと（探索の軸）

1. **ヘッダー行との関係**: カードが戻る / サークル名 / FAB に重なってよいか。重ねるならサークル名を隠すか、
   カードを行の下に収めるか（その場合は縦の領域が 56 減る）、カードを画面下（一覧側）に置く別案もあり
2. **情報量と優先順位**: 名前 / 住所 / 営業状態 / 評価 / 写真 / 投稿数 / 距離 / カテゴリ のうち**一目で要るもの**。
   「詳しく」の第 2 層（タップで広がる・一覧側のヘッダーへ送る 等）を持つか
3. **形**: 吹き出し（脚あり）か、脚なしのフローティングか、ピンそのものが広がるか（タイルの写真がカードの写真になる連続性）。
   写真の位置（左 / 上 / 背景フルブリード + スクリム / 無し）と比率
4. **状態**: 写真なし / 住所なし / 営業時間未取得（`detailsPending`）/ 24 時間営業 / 深夜跨ぎ / 評価なし / 長い店名・住所
   / 座標なし（ピンが無い = カードも出ない。一覧側だけ）
5. **CTA と ×**: `Google Mapsで開く` の強さと置き場、× の要否（地図タップ / 戻るで解除できる）、
   「ここに投稿する」導線の要否
6. **切替のモーション**: ドラッグで隣のピンへ移るときの差し替え（今は cross-fade 120ms + 移動 180ms）

## 成果物（Claude Design が作るもの）

- `handoff/PlaceCard/PlaceCard.html` — `.phone`（402×874）に**実配置**した specimen。`TimelinePlaceMode.html` の地図 + ピン
  （`place-map.js` / `.tpm-pin`）を流用し、**カードのパターンを 4〜6 案**横に並べる（案ごとに 1 phone）。
  各案は同じ場所（`TK NIGHTCLUB`: 営業中・評価 4.5 (1,500)・写真あり）で描き、案の下に**状態バリエーション**
  （写真なし / 未取得 / 長い名前）を小さく添える。各案の先頭に `<!-- @dsCard -->` と「狙い」1 行
- `handoff/PlaceCard/PlaceCard.css` — View 固有の差分だけ（foundation はコピーせず参照）
- 推し案 1 つと、その理由（情報の優先順位・ヘッダーとの関係・縦の領域の使い方）
- `DesignSystem/_ds_manifest.json` の `cards` に登録。写真は `assets/sample/`、アイコンは `assets/icons/`
- 最終はダウンロード可能な bundle

参考（別 repo `univbrofd/toopdbq`・Claude Design は読まない）: 実装は `lib/feature/Universe/widgets/PlaceMapForeground.dart`
（`_PlaceCardBody` / `_cardGeometry`）、構図は `UniverseCircleUsecase.placeAnchorDyDesign`、データは `lib/model/Place.dart` /
`PlaceDetails.dart` / `PostLink.dart`、Places の取得は `backend/functions/src/service/place/PlacesApiService.ts`。

## Claude Design に貼るプロンプト

```
サークルタイムライン home の場所ピンをタップしたときの「吹き出しカード」（PlaceCard）の
デザインを、複数パターンで作って。
索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/PlaceCard/HANDOFF.md

土台は USAGE_RULES.md と taste.md。地図とピンは handoff/TimelinePlaceMode/TimelinePlaceMode.html
のものを流用し、カードだけ差し替える。HANDOFF の「出せる情報」の範囲で、何を・どの順で・
どの形で見せるかを 4〜6 案。挙動と配置の制約（正方形の地図パネル・ヘッダー行・ピンの
位置・縦の領域）は固定。

世界観は厳守: Noto Sans JP / Inter、絵文字なし、役割トークン（ink / ink-sub / teal / golden /
success）と assets/icons/ を使う。Material アイコン直書き・場当たりグレー禁止。

スマホアプリ前提（必須）: 画面 402×874（card.css の .phone）、SafeArea 考慮、タップ範囲は
最小 44pt。各案は .phone 枠に実配置で描き、状態バリエーション（写真なし / 営業時間未取得 /
長い名前）を添えること。推し案 1 つと理由を書き、各案の先頭に @dsCard を付けて
_ds_manifest.json に登録。最終はダウンロード可能な bundle で出力して。
```
