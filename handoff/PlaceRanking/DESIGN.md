# PlaceRanking v2 — 作成フロー 4 面 + 写真を追加 + ストーリーズ共有（実装ルール）

この文書だけで Flutter に再現できるように、specimen（HTML）の値を全部書き出した。
**HTML は見本であり、移植先は `lib/feature/PlaceRanking/`**（`PlaceRankingCreateView.dart` / `widgets/PlaceRankingSheet.dart` /
`PlaceRankingBox.dart` / `PlaceRankingPlaceDetail.dart` / `PlaceRankingTopPanel.dart` / `PlaceRankingMap.dart`）。
フローの骨格・挙動（HANDOFF.md「固定」）は変えない。変えるのは見た目と、新規の 2 機能（写真を追加 / ストーリーズ共有）。
忠実度: **hifi**（px・色・字は下記どおり。`Get.width` 比で 402 基準にスケール）。

specimen: `PlaceRanking.html`（4 面 + 状態）/ `PlaceRanking-layout.html` + `ranking-layout.js` + `ranking-live.js`（確認モードの配置検証・アルゴリズムの正本）/
`PlaceRanking-share.html`（ストーリーズ共有）/ `PlaceRanking-fonts.html`（書体の比較・結論 = 現行のまま）。CSS = `PlaceRanking.css`。

---

## 0. トークン（この View で使う値。foundation は `DesignSystem/colors_and_type.css`）

| 役割 | 値 |
|---|---|
| ink / ink-sub | `#08080B` / `rgba(8,8,11,.56)` |
| hairline / 帯 / 選択の面 | `rgba(8,8,11,.08)` / `rgba(8,8,11,.06)` / `rgba(8,8,11,.04)` |
| 写真が無い地 | `#101014` + `icon_pin_location` 白 55%（写真の 26%） |
| 白い面（chrome） | `rgba(255,255,255,.95)` |
| 営業中の緑 | `#2FBF71` |
| ジャンル色（選択中のチップだけ） | as-built の `primaryType` 表（night_club `#E040FB` ほか。HANDOFF.md） |
| 地図の下地 | openfreemap liberty・pitch 0・bearing 0 |
| safe | status 62 / home 34。タップ ≥ 44 |
| 書体 | 和文 Noto Sans JP / 英数 Inter。**斜体は Inter だけ**（和文に擬似斜体を掛けない） |
| 角丸 | ピル 9999 / シート 16 / 写真 6〜8 / チェック 8 / 順位ステッカー ピル |
| ステッカーの影 | `0 3px 10px rgba(0,0,0,.25)`（地図の上）/ `0 2px 8px rgba(8,8,11,.22)`（シートの中） |
| glass | 戻るボタンの 1 つだけ / 画面（`--lg-tint-dark` + blur 14 / saturate 160%）。他は全部不透明 |
| easing | `--ease-out` = cubic-bezier(0,0,.2,1) / `--ease-standard` = cubic-bezier(.4,0,.2,1) |

色は ink と白の 2 色 + ジャンル色 1 箇所。colorful グラデはこのフローで使わない（プロフィールの FAB が持つ）。絵文字はジャンルのチップだけ。

---

## 1. 上部 chrome（差分だけ）

- 戻る 44 の丸: 左 8・上 safe+6。glass（唯一）。`icon_back` 18 白。
- ジャンルのチップ: 高さ 34・r17・pad 0 12・13px w700・絵文字 + ラベル。**面 + 影 `0 2 8 rgba(8,8,11,.12)` の 1 群**（as-built の 縁 + glow を外す）。選択 = ジャンル色の面 + 白文字。
- 検索欄 44・r22・白 95% + 同じ影・`icon_search` 16（ink 60%）・「場所を検索」15 ink-sub。位置 上 safe+58、左右 16。
- マーカー: ヒット = 赤 28×40（白の内縁 2）。ランキングに入れた = 白 + ink 縁 1.5 + 中央に `1st`（Inter 12 w800・接尾辞 .68em）。選択中 1.2×（先端固定）。
- 現在地 = 白い点 14 + ink リング 2.5。

---

## 2. シート（`DraggableScrollableSheet`・白・上角 r16・影 `0 -4 20 rgba(0,0,0,.2)`・つまみ 36×4 `rgba(8,8,11,.16)` 上下 6）

**順番は固定: 詳細（選択中のみ）→ 箱 → リスト**。「直前の操作のセクションが先頭」は廃止。
場所をタップ（マーカー / リストの行 / 箱の列）= 詳細が先頭に現れてシートを一番上へスクロール（`scrollTo`、`scrollIntoView` は使わない）。
リストのチェック = 箱に入るだけで位置は動かない。セクションの区切り = 8px の帯 `rgba(8,8,11,.06)`。セクション内 pad 8 16 16（2 つ目以降は上 12）。
高さ: 中 0.45 → スクロールで 0.8 / 地図を触ると短く（146）/ 詳細が出たとき 0.65（560px）。

見出しはセクションごとに形が違う（同じ強さを並べない）: 候補 = eyebrow / 箱 = 下線フィールドのタイトル / 詳細 = 店名 + ×。

### 2.1 (3) リスト

- eyebrow 高さ 24: 「{ジャンル} 候補」11 w700 ink-sub letter-spacing .04em + 件数 Inter 12 w800 ink。右端に補足「この範囲」11 w500。
- 行 88（左右 16 まで面を伸ばす）・下端 hairline・選択中の行 = `rgba(8,8,11,.04)`。
  - 写真 88×66・白縁 3・r8・影・**奇数行 −2° / 偶数行 +2°**。写真なし = `#101014` + pin 20（50%）。
  - 名前 15 w700 1 行省略 / 住所 12 ink-sub 2 行。gap 12。
  - 右端チェック: 枡 24 r8・内縁 1.5 `rgba(8,8,11,.30)`、タップ 44（右 −10）。on = ink の面 + `icon_check` 13 白。
  - on のとき写真の左上（−8,−8）に順位ステッカー: 高さ 22・ピル・白 + ink 縁 1.5・Inter 11 w800・−8°。
- 状態（eyebrow は残す）: 読み込み = スピナー 18 / 引きすぎ = 「地図を寄せると場所が出ます」/ 0 件 = 件数 0 + 「この範囲に{ジャンル}の場所はまだありません」。本文 12.5 ink-sub 中央、上 20 下 8。
- 並びは評価順（評価は見せない）。

### 2.2 (2) ランキング調整（箱）

- タイトル行 min 44: 「私の」「ランキング」15 w400 ink、真ん中 = **テキストフィールド**: 高さ 32・16 w700・下線 1.5 ink・左上に鉛筆 16（ink の丸 + 白縁 1.5、`icon_edit`）・max 250 省略。タップ域 上下 +6 = 44。空 = ジャンル名。タップ → ダイアログ（2.5）。
- 列: 幅 84・gap 2・左右 −6・pad 上 10。中身 = ミニスタック 64 + 名前。
  - ミニスタック 64: 白縁 3・r5・影。2 枚目 `translate(5,−4) rotate(7°)`、3 枚目 `translate(−5,−2) rotate(−8°)`。描く順 3 → 2 → 1。写真なし = 暗い地 + pin 18。
  - 順位ステッカー 左上（−10,−10）: 高さ 24・ピル・白 + ink 縁 1.5・Inter 12 w800・−8°。
  - × 右上: 20 の ink の丸 + 白縁 1.5・`icon_close` 8。タップ 44（右上 −20）。
  - 名前 11 w700 2 行中央。
  - **空の列**（3 列に満たないとき）: 破線 1.5 `rgba(8,8,11,.22)` r6 の枡 + 順位ステッカー ink-sub（縁も .22）+ 1 列目の下だけ「候補にチェック」/ 2 件以上入ったら「次の候補」11 w500 ink-sub。3 件以上入れたら消える。
- ドラッグ（固定）: 触った瞬間から動く・`translateY(−4) scale(1.08)`・影 `0 10 22 rgba(8,8,11,.30)`・列の transform 160ms standard。動かさずタップ = 詳細を先頭に。
- 「作成」: 上 12・幅いっぱい・**高さ 56 ピル・白の面 + ink 内縁 1.5・ink 17 w700**（確認モードの「保存」と同じ作法）。空なら 40%・無効。押下 scale .97。

### 2.3 (1) 詳細（思い出の写真 3 枡が主役）

- 頭: 店名 17 w700 2 行 + ジャンル名 12 ink-sub（上 6）/ 右に × 44（`icon_close` 14 ink 60%、右 −12）。× = 選択解除 = 詳細が消え、箱 → リストが上へ詰まる。
- **枡 110×110 × 3・gap 12**（= 幅いっぱい）。上 8、pad 4 0 6。
  - 1 枡目 = 場所の代表写真（タグ「代表」）。2・3 枡目 = 自分がその場所へ投稿した画像・新しい順（タグ = 日付 `9/12` Inter）。
  - 写真: 白縁 3・r8・影。タグ: 左下 6・高さ 20・r4・白 95%・10 w800。
  - **空いている枡 = 「写真を追加」**: 破線 1.5 `rgba(8,8,11,.28)` r8・`icon_camera` 20 ink + 「写真を追加」12 w700 ink 縦並び gap 6。押下で `rgba(8,8,11,.04)`。説明文は付けない。
  - 3 枚そろったら追加の枡は消え、eyebrow「思い出の写真 / 写真をタップで入れ替え」を出す。写真タップ → その枡だけスクリム 64% + 「入れ替え」（白ピル 28・11）/「削除」（白縁 1.5 60%）。各タップ 44。代表（1 枡目）は削除不可（入れ替えのみ）。削除 → 枡が空き「写真を追加」が戻る。
- メタ（上 12）: `★ 4.5 (1,500)` Inter 13 w600 / 緑の点 7 + 「営業中」12.5 w600 + 「5:00 まで」ink-sub w400。gap 14。未取得 = 「営業時間を確認中」。
- 住所 13（上 10）と、右下に **チェック 24 r8（タップ 44）= ランキングに入れる / 外す**（リストと同じ形）。as-built の「ランキングに入れる / 外す」の丸ボタンは廃止。
- 営業時間 = 2 列グリッド（曜日 2.5em / 時間）12 ink-sub 行間 1.7（任意・スクロールで見える）。
- 16:9 の写真は廃止（代表写真は 1 枡目）。

### 2.4 (5) 写真を追加 — 入口

- 「写真を追加」の枡（または「入れ替え」）→ 白のアクションシート（左右 8・下 safe+8・r16・影）: 見出し「{店名} に写真を追加」12 ink-sub 中央 / 行 56「カメラで撮る」`icon_camera` / 「ライブラリから選ぶ」`icon_image`（15 w700・アイコン 20 ink・hairline 区切り）/ 8 の帯 / 「キャンセル」15 w600 ink-sub。背景スクリム `rgba(0,0,0,.45)`。
- カメラ / ライブラリ = 既存の投稿フロー（`StoryPost`）へ、**場所のリンクを自動で付けて**遷移。投稿完了で作成フローへ戻り、枡に写真が fade 200ms で入る。同時に箱の列のミニスタックに 1 枚増える（+7° へ開く 180ms）。
- データ: `PlaceRankingService.fetchEntryMedia` = 代表写真 + 自分の投稿画像（新しい順・最大 2）。

### 2.5 タイトル編集ダイアログ

- スクリム 45%。幅 280・r16・pad 24 20 20・白。「私の」15 w700 / 入力 44・22 w700 中央・下線 2 ink・autofocus・caret 2×24 / 「ランキング」15 w700 / 「決定」44 ピル ink・白 15 w700（上 10）。gap 10。空で決定 = ジャンル名に戻る。

---

## 3. (4) 確認モード（「作成」後・同じ地図の上・シート無し）

### 3.1 カメラ

上位 3 件の三角形の重心を画面中心 (201, 437) に。囲む円（下限 120m・余裕 ×1.8）が幅の 72% に入る zoom。pitch 0・bearing 0（変えない）。1 件だけ = その地点を中心・下限 120m。

### 3.2 描く物は 4 つだけ: 写真 / 重なり / 順位 / 名前（+ 地点の印と点線）

- **写真のスタック（16:9）**: `1 位 352×198 / 2 位 280×158 / 3 位 216×122`。白縁 4・r6・影 `0 3 10 rgba(0,0,0,.25)`。
  枚数ぶん重ねる（最大 3）: 2 枚目 `translate(8,−6) rotate(2.5°)`、3 枚目 `translate(−8,−5) rotate(−3°)`。1 枚なら重なり無し。0 枚 = 暗い地 + pin。描く順 3 位 → 2 位 → 1 位。
- **順位ステッカー**: 写真の左上（−12,−12）・高さ 28・ピル・白 + ink 縁 1.5 + 影 `0 2 6 .25`・Inter 14 w800 `1<small>st</small>`（small .68em）・−8°。
- **名前の帯**: 写真の下端中央、bottom −14（= 45% 重ね）・−4°・高さ 26・r4・白・影 `0 2 6 .2`・pad 0 12・**15 w800 ink**・1 行・max 190 省略。英数 = Inter italic（letter-spacing .01em）/ 和文 = Noto 非斜体。ジャンル色は使わない。
- **地点の印**: ink の点 10 + 白縁 2.5 + 影。z は写真の**下**（写真に隠れた地点は見えない）。
- **点線**: 地点が写真の縁から 24 以上離れているとき、地点 → 写真の縁（x は写真の幅内 ±12 に clamp、y は上辺 or 下辺 +14）へ ink 1.5・dash 4 4・60%。
- **4 位以下**: 丸い写真ピン 36（白縁 2.5・影）+ 左上に順位ピル 18（Inter 10 w800）。地点そのものに置く（配置計算の対象外）。
- **タイトル**（上 safe+14・左右 20・中央・−3°・タップ不可）: 1 行目 = タイトル **Noto 900 27px / 行間 1.25・白・ink の輪郭 6px**（`paint-order: stroke fill` 相当 = Flutter は Stack で stroke の Text を下に、fill の Text を上に）。2 行目 = `BEST {N}` **Inter italic 900 30px**・同じ輪郭・letter-spacing .02em。タイトル空 = ジャンル名。
- **保存**: 下 safe+12・中央・高さ 56・ピル・min 220・pad 0 40・**白 + ink 内縁 1.5 + 影 `0 8 24 rgba(8,8,11,.18)`・ink 17 w700**。保存中 = ラベルをスピナー 20（ink・2.5）に、戻るを無効、pan 停止。失敗 = シート型スナック + 「再試行」。
- 戻る（glass 44）= シートに戻る（シートが下から復帰、カメラは作成前へ）。

### 3.3 行配置（= `ranking-layout.js` の `PkRows.place`。そのまま移植）

同じ高さに他の順位を置かない = 画面を「行」で使う。3000 ケース乱数 + 108 ケース総当たりで 100% 収まる（`PlaceRanking-layout.html`）。

```
SAFE  = { x0: 8, x1: 394, y0: 200, y1: 760 }          // 上 = タイトルの下端 / 下 = 保存ピルの上端
SIZES = [[352,198],[280,158],[216,122]]               // 1 位 / 2 位 / 3 位 (w, h)
LAB_DROP = 14  GAP = 16  LEADER = 24  WEIGHT = [10, 3, 1]

place(pts[3], ranks[3]):                              // pts = 投影 px、ranks[i] = i 番目の地点の順位 (0..2)
  best = null
  for order in 6 通りの並び（上 → 下に置く index の順）:
    rows = order.map(i => { h: SIZES[ranks[i]].h + LAB_DROP, w: SIZES[ranks[i]].w, t: pts[i].y − SIZES[ranks[i]].h/2 })
    // 1) 目標の高さへ置き、上から順に GAP を守って下へ押す
    for k in 0..2: y[k] = max(rows[k].t, k ? y[k−1] + rows[k−1].h + GAP : SAFE.y0)
    // 2) 下端からはみ出した分を引き上げる
    for k in 2..0: y[k] = min(y[k], (k < 2 ? y[k+1] − GAP : SAFE.y1) − rows[k].h)
    // 3) 上端をもう一度守る（合計 552 ≤ 560 なので必ず入る）
    for k in 0..2: y[k] = max(y[k], k ? y[k−1] + rows[k−1].h + GAP : SAFE.y0)
    cost = Σ WEIGHT[ranks[i]] × |cy_i − pts[i].y|       // 1 位のずれを最も嫌う
    cx_i = clamp(pts[i].x, SAFE.x0 + w/2, SAFE.x1 − w/2) // 横は地点に寄せて clamp
    if cost < best.cost: best = { centers, sizes }
  return best
leader(i) = |cy − pts[i].y| > h/2 + LEADER || |cx − pts[i].x| > w/2 + LEADER   // 点線を出すか
```

1 件だけ = 1 位の行を地点の高さに置くだけ。2 件 = 同じ手続きを 2 行で。安全域の y0/y1 はタイトルの実高さ・保存ピルの位置から取ってよいが、最低 552 + 2×GAP の高さが要る。

### 3.4 状態

1 件だけ（BEST 1・形は変えない）/ 3 件が近い（通常の状態 — 2・3 位が上下の行へ、点線で結ぶ）/ 写真 1 枚（重なり無し）/ 写真 0 枚（暗い地 + pin）/ 長い店名（帯 190 で省略・全文は保存後の詳細で）/ 保存中（スピナー）。

---

## 4. Instagram ストーリーズ共有（`PlaceRanking-share.html`）

現行の `WdTimelinePost.share`（OS 共有シートにテキスト）とは**別の専用経路**。ランキングだけこの経路。

### 4.1 入口

保存が済んだ瞬間、確認モードの「保存」ピルが同じ位置・同じ材質で **「ストーリーズに共有」+ `icon_share` 18** に cross-fade 160ms（min 260・pad 0 28・1 行）。その上（bottom safe+76）に「保存しました」の白いステッカー 32（`icon_check` 12 + 12 w700・影）が 2 秒。戻る = 作ったランキングの詳細へ。
Instagram 未インストール（`canLaunchUrl('instagram-stories://share')` = false）→ 文言は **「画像を共有」**。

### 4.2 共有面（確認モードの上に重ねる）

- スクリム `rgba(8,8,11,.78)`。ヘッダ 56（safe の下）: 中央「ストーリーズに共有」16 w700 白、左に × 44（`icon_close` 16 白）。
- **プレビュー 270×480**（= 1080×1920 の 1/4）: 中央・上 safe+64・r14・影 `0 12 40 rgba(0,0,0,.5)`。中身は下記 4.3 を 1/4 で描く。
- **背景の選択**（上 safe+566、左右 16）: eyebrow「背景」11 w700 白 60% / 枡 60 r10 × 横一列 gap 10:
  `地図`（既定・ラベル帯 18 「地図」9 w700）/ ランキングの写真 3 枚（1 位 → 3 位の代表）/ `ライブラリ`（白 8% + 内縁 1.5 白 30% + `icon_image` 18 + 「ライブラリ」9）。
  選択 = 白縁 2.5 + 右上に ink の丸 16 + 白 `icon_check` 9（白縁 1.5）。非選択 = 白 25% 縁 1.5。ライブラリから選ぶと末尾の枡がその画像に置き換わって選択状態（再タップで再選択）。
- **CTA**（下 safe+12・左右 16・高さ 56・ピル・白・ink 17 w700・`icon_share` 18 ink）: 「Instagram で開く」/ 未インストール = 「画像を共有」（OS 共有シートに **JPG ファイル**）+ その上に文字ボタン「画像を保存」44（13 w700 白）。
- 生成中 = CTA のラベルをスピナー 20 に。

### 4.3 画像（1080×1920 JPG・端末で合成）

確認モードと同じ語彙を 9:16 に組み直す。上下 250px（ストーリーズ UI）には何も置かない。**ロゴ・透かし・署名・CTA・宣伝文言は載せない**（Meta Developer Policy 2.6）。

- 背景 = 地図: MapLibre のスナップショット（3 地点が入るカメラ・pitch 0）。地点の印 28 + 白縁 8。スタックは 3.3 と同じ行配置を `SAFE = {x0 32, x1 1048, y0 250 + タイトル高, y1 1670}`・`SIZES = [[880,495],[720,405],[560,315]]`・`GAP 64`・`LAB_DROP 56` で解く。点線 6 dash 16。
- 背景 = 写真（ランキングの写真 / ライブラリ）: 9:16 に cover（切り抜き調整は v1 では無し）。上下に protection gradient `rgba(0,0,0,.35) → transparent`（上 30% / 下 30%）。**地点の印・点線は出さない**。スタックは 1 位 → 3 位を中央に縦に並べる（幅 800 / 680 / 560、行間 24）。
- タイトル: 上 264・中央・−3°。Noto 900 68px + `BEST N` Inter italic 900 84px・白・ink 輪郭 18。
- スタック: 白縁 16・r24・影。順位ステッカー 高さ 88・Inter 44 w800。名前の帯 高さ 84・15×4=60px w800・max 600。
- 合成 = `RepaintBoundary.toImage(pixelRatio)` で 1080×1920 → JPG 90%。ローカルの一時ファイルに書く。

### 4.4 受け渡し

- iOS: `Info.plist` `LSApplicationQueriesSchemes` に `instagram-stories` を追加。`UIPasteboard` に `com.instagram.sharedSticker.backgroundImage`（JPG data）+ `com.instagram.sharedSticker.appID`（Facebook App ID）、有効期限 5 分。`instagram-stories://share?source_application={APP_ID}` を open。
- Android: `FileProvider` で `content://` URI。Intent `com.instagram.share.ADD_TO_STORY`・`setDataAndType(uri, "image/jpeg")`・`putExtra("source_application", APP_ID)`・`FLAG_GRANT_READ_URI_PERMISSION`。
- **Facebook App ID が必須**（無いと Instagram 側で「対応していません」）。
- ステッカー（`interactive_asset_uri`）は使わない = 位置関係を崩さない。

### 4.5 戻ってきたとき

共有面は閉じて確認モードの上に白トースト 48（r12・影・`icon_check` 16 + 「Instagram に渡しました」13 w700・右に「もう一度」下線）3 秒。「もう一度」= 共有面を再度開く（背景の選択は保持）。失敗 = 同じトーストで「開けませんでした · 画像を共有」→ OS 共有シートへ。

---

## 5. モーション

- 先頭のセクションが入れ替わる: 先頭に来るセクションは高さ 0 → 実高へ 240ms ease-out、中身は 12px 下から fade。元の先頭は同じ 240ms で下へ押し下げ。シートの高さは変えない。
- 「作成」→ 確認モード: シートが 320ms standard で画面の下へ。同時に地図が重心へ 480ms（角度不変）。マーカーの白い順位はその場で白いピルへ形を変え（120ms）順位ステッカーになる。
- スタックの入場: 地図が止まってから 1 位 → 2 位 → 3 位を 60ms ずらし、各スタックは地点から行の位置へ 260ms ease-out（scale .9 → 1 + fade）。奥の 2 枚は 0° から扇状に開く（同 260ms）。点線は着いてから 120ms で伸びる。順位ステッカー pop（scale .6 → 1・120ms）、帯は 80ms 遅れて左から。
- 写真を追加: 枡に fade 200ms、ミニスタックに +7° で開く 180ms。
- 保存 → 共有の CTA: cross-fade 160ms。共有面: スクリム fade 200ms、プレビュー scale .96 → 1 + fade 240ms ease-out。背景の枡をタップ → プレビュー cross-fade 200ms。
- 押下は scale .97。hover は無い。

---

## 6. コピー（ja / en）

場所を検索 / Search places · この場所を検索 / Search this area · {ジャンル} 候補 / {genre} candidates · この範囲 / In view ·
候補にチェック / Check a candidate · 次の候補 / Next pick · 作成 / Create · 保存 / Save · 保存しました / Saved ·
私の ＿＿ ランキング / My ＿＿ ranking · 決定 / Done · 代表 / Cover · 写真を追加 / Add photo · 思い出の写真 / Memories ·
写真をタップで入れ替え / Tap a photo to replace · 入れ替え / Replace · 削除 / Remove · {店名} に写真を追加 / Add a photo to {place} ·
カメラで撮る / Take photo · ライブラリから選ぶ / Choose from library · キャンセル / Cancel · 営業中 / Open · {time} まで / until {time} ·
営業時間を確認中 / Checking hours · 地図を寄せると場所が出ます / Zoom in to see places here ·
この範囲に{ジャンル}の場所はまだありません / No {genre} places here yet · BEST {N} ·
ストーリーズに共有 / Share to Stories · 背景 / Background · 地図 / Map · ライブラリ / Library · Instagram で開く / Open Instagram ·
画像を共有 / Share image · 画像を保存 / Save image · Instagram に渡しました / Sent to Instagram · もう一度 / Again ·
開けませんでした / Couldn't open

---

## 7. データ / 状態

- `RankingDraft { title?, genre, entries[3..10]: { place, rank, media[≤3] }, area{center, radius} }`
- `entry.media` = `[cover] + myPosts(desc, ≤2)`。追加投稿の完了で `fetchEntryMedia` を再取得。
- Sheet の状態: `selectedPlace?`（詳細の表示）/ `sheetExtent`。確認モード: `saving` / `saved` / `shareOpen` / `shareBg: map | entry(i) | library(uri)` / `rendering`。
- 保存後 `saved = true` で CTA が共有に変わる。`instagramAvailable` は起動時に 1 回判定。

## 8. 資産

アイコン `assets/icons/`: back, search, close, check, edit, camera, image, pin_location, share。写真は `assets/sample/reel/`（specimen 用。実装は Place / 投稿の URL）。地図 = openfreemap liberty（`place-map.js` の style）。
