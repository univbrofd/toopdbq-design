# HANDOFF — Toopdbq Studio / Headless Simulator（描画なしのデータフロー・インスペクタ）

`Toopdbq Studio`（Electron デスクトップ開発ツール）に足す **Headless Simulator** ページのデザインを起こす。
アプリを起動したときの **実データの流れ** を、**映像（描画）なしで** 確認するための画面。
「どの位置情報から → 何が取れて → どう変換して item になり → どんな widget になり → StoryViewer リスト / Universe にどうマッピングされ → タップでどう状態が変わるか」を、**全てデータ・ブループリント・模式図で**見せる。
これは実機（Flutter）の **実パイプラインの可視化**であり、下の値は実装から捕捉した正。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
> 実装の対応箇所は「別 repo `univbrofd/toopdbq`・参考」（Claude Design は読めない。値は本書に固定）。

## 最重要の配置文脈（スマホではない）

- **これはデスクトップアプリのウィンドウ**。`card.css` の `.phone`（393×852 / 402×874）枠は**使わない**。
- ウィンドウ = **1240×860**、ダーク。上部に macOS の hiddenInset タイトルバー（左に信号機3点ぶんの余白だけ確保、タイトル文字は出さない）。
- DS の**美学とトークンは流用**（ダーク地・カラフル放射グラデのアクセント1つ・liquid glass の chrome・Noto Sans JP / Inter）。**絵文字は使わない**（`taste.md`）。
- データ・コード・JSON は **等幅（Inter ではなく monospace。`ui-monospace, SFMono-Regular, Menlo`）** で見せる。これは開発ツールなので「コード美」を許容する。
- 成果物: `DesignSystem/preview/comp-studio-simulator.html`（先頭に `@dsCard`、`_ds_manifest.json` に登録）。デスクトップ枠なので viewport は `1240x860`。

## 描画なしの原則（この画面の核）

**一切「アプリの実画面」を描かない**。代わりに:
- widget は **ブループリント・カード**で表す（widget 名 ＋ 束縛プロップの表 ＋ タップ領域チップ）。ピクセルのストーリー写真は出さない。
- 地図/3D は **模式図**（lat/lng グリッド上のドット＋レーン分類）で表す。地球儀は描かない。
- リストは **入れ子のラベル付きボックス**（◯層 ▸ ◯層）で表す。スクロールするストーリーは描かない。
- データは **JSON/型付きオブジェクトのコードブロック**で。変換は **フィールド対応行**（rawKey → modelField、捨てるキーは淡色＋取り消し線）。

## レイアウト（多ペイン）

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar(glass): "Toopdbq Studio" / tab[Headless Simulator] /   │
│   シナリオ▾(渋谷・60件) / [▶ 実行] [⏭ ステップ] / geohash:xn76 │
├───────────┬───────────────────────────────────┬──────────────┤
│ LEFT       │ CENTER  stage detail              │ RIGHT         │
│ pipeline   │ (Input → Transform → Output の3連) │ state +       │
│ stepper    │                                   │ interaction   │
│ (8 stage)  │                                   │               │
├───────────┴───────────────────────────────────┴──────────────┤
│ Console(glass): 時系列ログ(RTDB クエリ・件数・各 stage の ms)   │
└──────────────────────────────────────────────────────────────┘
```

### TopBar（chrome・liquid glass 1枚）
ワードマーク「Toopdbq Studio」＋ タブ（`Headless Simulator` をアクティブ、`3D Pipeline` を非アクティブで併置可）＋ **シナリオ選択**（どの位置・seed を流すか。例「渋谷 / 60件」）＋ **▶ 実行**（パイプライン全走）/ **⏭ ステップ**（1 stage 進める）＋ 右に現在の geohash・件数バッジ。

### LEFT — パイプライン・ステッパー（縦 8 ノード）
実機の起動〜操作の段を上から並べる。各ノード = 連番 ＋ 名前 ＋ ステータスドット（idle=`--text-3` / 実行中=カラフルグラデ / 完了=`--state-success`）＋ マイクロ統計。選択中はカラフルのエッジ（`--lg-edge` か `--gradient-border`）でハイライト。

| # | ノード名 | マイクロ統計（実値の例） |
|---|---|---|
| 1 | 起動・DI | `getIt 15 + permanent 14` |
| 2 | 位置情報 | `35.6592,139.7006 / geohash xn76` |
| 3 | 近傍フェッチ | `story / prec 6→3 / 60件` |
| 4 | データ変換 | `Map → StoryData → Terrestrial` |
| 5 | アイテム生成 | `WdStorySideTool ほか` |
| 6 | Universe マッピング | `pins 47 / 3D 11` |
| 7 | StoryViewer リスト | `3層 PageView` |
| 8 | インタラクション | `tap / doubletap / pin` |

### CENTER — ステージ詳細（Input → Transform → Output の3カラム）
選択ノードの中身を左から **入力 → 変換 → 出力** で見せる。各 stage の中身（実装から固定した値）:

- **#2 位置情報**: 入力=`Geolocator.getCurrentPosition(accuracy:high, 8s)`（失敗時フォールバック渋谷駅）→ 変換=`glEncodeGeohash(lat,lng,prec:4)` → 出力=`GlobalLocationController{ currentLocation: LatLng(35.6592,139.7006), currentGeohash: "xn76" }`。
- **#3 近傍フェッチ**: 入力=center LatLng → 変換=geohash を **prec 6→3 で段階拡大**（`xn76gg`→`xn76g`→`xn76`→`xn7`）→ クエリ `Rdb.query(path:"story", orderByChild:"geohash", startAt:prefix, endAt:prefix+"", limitToFirst:60)` → 出力=`List<Map>`（最大60、距離昇順）。
- **#4 データ変換（この画面の主役の1つ）**: 入力= RTDB の生 JSON（下の real-10 を使う）→ 変換= **フィールド対応表**（拾うキー → モデルのフィールド。`likeNum→likeCount` `commentNum→commentCount` `time→createdAt` `threeDPath/modelUrl→threeDPath`。**UI で捨てるキー = `embedding` / `comments` / `storyHistory` を淡色＋取り消し線**）→ 出力= 型付き `StoryData`、さらに `Terrestrial.of(data)` で `Terrestrial{ lat, lng, data }`。
- **#5 アイテム生成（主役）**: 入力= `StoryData`（一部フィールドだけ）→ 出力= **widget ブループリント・カード**。描画せず、widget 名 ＋ 束縛プロップ表 ＋ タップ領域チップで表す:
  - `WdStorySideTool`: `isLiked ← story.likedByMe(false)` / `likeCount ← 42` / `commentCount ← 5` / `showMap ← hasLocation(true)` / `userImageUrl ← owner.iconUrl` / `userName ← owner.name`。タップ領域: `onLikeTap` `onCommentTap` `onMapTap` `onUserTap` `onUserBadgeTap`。
  - `WdCircleFooter`: `circleName ← circle.name` / `circleImageUrl ← circle.imageUrl`。
  - `WdStoryHeader`: `currentPageIndex` / `totalCount`（進捗ピル）。
- **#6 Universe マッピング**: 出力= **模式図**。lat/lng グリッドにピンのドットを散布し、クラスタのレーンを色分け（`main`=巨大ドット＋白枠 / `sub` / `thumbnail` / `3D`=カラフル縁）。横に JS ペイロード `window.setPins({"pins":[[35.6592,139.7006],[35.6657,139.7010],…]})` と 3D 経路 `threeDPath → is3dLane → ThreeDTerrestrialView(per-pin WebView)`。
- **#7 StoryViewer リスト**: 出力= **入れ子ボックス**。`Circle層 (circleStoryList: RxList<CircleStoryData>, PageView.custom)` ▸ `User層 (circleData.stories, PageView.custom)` ▸ `Content層 (userStories, PageView.builder → image/video)`。各層に「1 item = 1 widget」の対応を注記。入口 `loadFromSeed(seedStoryId, seedCircleId, seedLat, seedLng)`。

### RIGHT — 状態 ＋ インタラクション（縦2段）
- **上: Live 状態インスペクタ** — 現在の Rx 状態を name : value の表で。`currentLocation`/`currentGeohash`/`circleStoryList.length`/`activeStory.id`/`focus3dPin`/`likedByMe`/`likeCount`。値が変わった行はカラフルグラデで一瞬フラッシュ（静止画では「changed」チップで表現）。
- **下: インタラクション・シミュレータ** — 描画せずイベントだけ発火するボタン列（`ピンをタップ` `ダブルタップ=いいね` `右半分タップ=次へ` `コメント` `プロフィール`）＋ **状態 diff ログ**。1 発火 = 1 行で before→after:
  - `onLikeTap → likedByMe: false→true ・ likeCount: 42→43`
  - `onTapStory(right) → currentPageIndex: 0→1 ・ currentStory.id 更新`
  - `pin tap(main+3D) → enter3dFocus ・ focus3dExpanded: false→true`

### Console（chrome・下端）
時系列ログを等幅で。`12:00:01.204  Rdb.query story orderByChild=geohash startAt=xn76 → 47 hit (182ms)` / `12:00:01.4  StoryData.fromMap ×47` / `12:00:01.5  setPins ×47 (3D 11)` のような行。stage ごとの所要 ms を右寄せ。

## 画面に流す実データ（#4 入力 JSON に使う・サンプルは共有プール）

実機の story レコード形（`StoryData.fromMap` が読むキー）。UniverseView specimen と同じ real-10（ハチ公・map center）を使う:

```json
{ "id": "e40ad36b…", "uid": "user_xyz", "userName": "Alice",
  "userIconUrl": "…", "imageUrl": "…", "videoUrl": null,
  "caption": "Shibuya crossing", "lat": 35.6592, "lng": 139.7006,
  "geohash": "xn76gg", "likeNum": 42, "commentNum": 5,
  "time": 1718937600, "circleId": "seed_shibuya", "circleName": "Shibuya",
  "circleImageUrl": "…", "threeDPath": "…/e40ad36b….glb",
  "embedding": [0.1,0.2,…], "comments": { "…": {} }, "storyHistory": [] }
```

- サムネ等の画像が要る箇所は共有プール `assets/sample/`（user アバター・reel）を参照。**per-View に複製しない**。
- ⚠ `time` は **秒**（×1000 で ms 正規化）。`embedding`/`comments`/`storyHistory` は **UI に出ない（変換で捨てる）** ことを #4 で明示。

## トークン / 体裁

- 地 `--bg`、ペインの面 `--surface-raised`、chrome は liquid glass（TopBar/Console の2枚のみ。`taste.md` の glass 予算＝chrome 限定・セル禁止・≤6 形状を厳守。**多数のステージ行/状態行/ログ行＝セルなので glass を置かない**、`--surface-raised`＋ヘアラインで）。
- アクセントのカラフルグラデ（`--gradient-colorful`）は **選択中ノードのエッジ・実行中ドット・diff の changed 強調の3用途だけ**。濫用しない。
- 文字: 見出し Noto Sans JP（`--text-1`）、副次 `--text-2`/`--text-3`、コード/JSON/ログは monospace。タップ域 ≥ 28px（デスクトップなので 44 は不要だがクリック域は十分に）。
- 角丸は `--radius-sm/md`、影は `--shadow-card` のみ。

## 直すべき逸脱（避ける）

- スマホ枠（`.phone`）に押し込めない。これはデスクトップツール。
- 実ストーリー画像・地球儀・スクロールリストを**描画しない**（このページの目的を壊す）。
- 役割トークンを使う（場当たりグレー・Material 直書き・絵文字を入れない）。

## 実装の対応箇所（別 repo `univbrofd/toopdbq`・参考。本書の値が design 上の正）

- `lib/app/AppInitializer.dart`（DI・permanent 登録）/ `lib/feature/Splash/SplashController.dart`（auth→位置→cache→ready）
- `lib/core/provider/location/LocationProvider.dart`（`glFetchLatestLocation`）/ `lib/feature/Main/GlobalLocationController.dart`（`currentLocation`/`currentGeohash`）
- `lib/component/ui/view/Planet/StoryUsecase.dart`（`fetchNearest` geohash 段階拡大）/ `StoryRepository.fetchStoriesByGeohashPrefix`
- `lib/model/StoryData.dart`（`fromMap` フィールド対応）/ `lib/model/Terrestrial.dart`（`Terrestrial.of`）
- `lib/feature/StoryViewer/*`（3層 PageView・`circleStoryList`・`loadFromSeed`）/ `lib/feature/Main/StoryOverlayView.dart`（`WdStorySideTool` 束縛）
- `lib/component/ui/view/Earth/TerrestrialSync.dart`（`[[lat,lng]]` 化）/ `EarthControllerMobile.dart`（`window.setPins`）/ `ThreeDTerrestrialView.dart`（per-pin 3D）

## Claude Design に貼るプロンプト

```
to claude
------------------------------------------------------
Toopdbq Studio に「Headless Simulator」というデスクトップ開発ツールのページを新規デザインして。
アプリ起動時の実データの流れを、映像（描画）なしで・データとブループリントと模式図だけで確認する画面。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/StudioSimulator/HANDOFF.md

これは「スマホ画面ではなくデスクトップアプリのウィンドウ」（1240×860, ダーク, macOS hiddenInset
タイトルバー）。card.css の .phone 枠は使わない。DS の美学とトークン（colors_and_type.css の役割
トークン・カラフル放射グラデのアクセント1つ・liquid glass の chrome・Noto Sans JP/Inter）は流用。
絵文字は使わない。データ/JSON/ログは monospace で見せる（開発ツールなのでコード美を許容）。

レイアウト（HANDOFF のとおり）:
- TopBar(glass): "Toopdbq Studio" / tab[Headless Simulator] / シナリオ選択 / [▶ 実行][⏭ ステップ] / geohash バッジ
- LEFT: 8 stage の縦ステッパー（起動・DI / 位置情報 / 近傍フェッチ / データ変換 / アイテム生成 /
  Universe マッピング / StoryViewer リスト / インタラクション）。各行に status ドット＋マイクロ統計、選択行はカラフル縁
- CENTER: 選択 stage を「入力 → 変換 → 出力」の3カラムで。値は HANDOFF に固定（#4 はフィールド対応表＝
  拾うキー→モデルfield、捨てる embedding/comments を淡色取り消し線。#5 は widget ブループリント・カード＝
  WdStorySideTool 等の束縛プロップ表＋タップ領域チップ。#6 は lat/lng グリッドにピンを散布した模式図＋
  window.setPins ペイロード。#7 は Circle層▸User層▸Content層 の入れ子ボックス）
- RIGHT: 上=Live 状態インスペクタ（Rx の name:value、変わった行を強調）、下=インタラクション・シミュレータ
  （描画せずイベント発火するボタン列＋ before→after の diff ログ）
- 下端 Console(glass): 時系列ログ（RTDB クエリ・件数・stage ごとの ms）を monospace で

重要: 一切「アプリの実画面」を描かない。widget は名前＋束縛プロップ＋タップ領域チップのブループリント、
地図/3D は lat/lng グリッド＋レーンの模式図、リストは入れ子ラベルボックスで表す（実写真・地球儀・
スクロールリストを描かない）。glass は TopBar/Console の2枚だけ（taste.md の glass 予算＝セル禁止・≤6 形状）、
多数のステージ行/状態行/ログ行は --surface-raised＋ヘアラインで。サンプル画像は共有プール assets/sample/ 参照。

土台は USAGE_RULES.md と taste.md。新規発明はしない。先頭に @dsCard、_ds_manifest.json に登録、
viewport は 1240x860。最終はダウンロード可能な bundle で出力して。
--------------------------------------------------
```

## 取り込み

Claude Design が bundle を export したら `/import-design-bundle {URL}` で取り込む（`handoff/StudioSimulator/` を更新・push）。
