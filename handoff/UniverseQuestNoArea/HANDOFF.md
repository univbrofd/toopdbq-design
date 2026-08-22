# Handoff: 未所属エリア時のサークル設立フロー（No-Circle Area / Circle Founding）

## Overview

Toopdbq（UniverseQuest 画面）に、**現在地がどのサークルのエリアにも属していない場合**の状態を追加した。
このアプリのルール上、

- サークルは中心点＋半径で定義され、**半径の上限は 1km**
- 各サークルには**クエストが 1 つ**あり、エリア内から投稿するとクリアになる
- **エリアの中にいないと投稿できない**
- どのエリアにも属していない時のみ、**その場所にサークルを新規作成できる**
- サークル名は**最初は設立者が命名**し、以降は**投票制**（誰でも名前を投稿でき、サークルにいる人のいいねで決まる／いいね最多の名前が現在のサークル名になる）
- **クエストをクリアすると投票権が 1 つ**もらえ、投票時に 1 つ消費する

この handoff は上記のうち「**未所属エリア時の表示 → 設立フロー → サークル名投票**」の実装仕様。

## About the Design Files

このバンドルに含まれる HTML は **HTML で作った design reference（デザイン参照用プロトタイプ）**であり、そのまま本番に載せるコードではない。
実装タスクは、この HTML が示す見た目・挙動を **ターゲットコードベースの既存環境（本プロダクトは Flutter 3.0+ / GetX / Firebase / Google Maps・`lib/component/ui/` の `Wd*` コンポーネント体系）で再現すること**。既存の `WdText` / `WdIconButton` / `WdTextField` / `WdCircleBar` / `FigmaColors` を使い、色や余白は下記トークンに合わせる。環境が未定の場合は最適なフレームワークを選定して実装する。

## Fidelity

**High-fidelity (hifi)。** 色・タイポ・余白・アニメーションは確定値としてそのまま使用してよい。マップ演出（3D 押し出しのエリア壁）は既存の area レイヤー実装を再利用する前提。

---

## Screens / Views

### 1. QuestFeed 最終セクション「サークルを設立する」（未所属状態）

縦スクロールのサークルリストの**一番最後**に置く 1 セクション。現在地がどのエリアにも属していない時のプレースホルダ。

**マップ（上部・全画面背景）**

| 項目 | 値 |
|---|---|
| エリア表示 | 他サークルと**同じ**エリア表示（disk / line / 3D wall / rib）を出す |
| 中心 | 現在地（prototype では `[139.70620, 35.65190]`） |
| 半径 | `400m`（既定値・設立フローのスライダー初期値と同じ） |
| 壁とグローの色 | **未設立を示すグレー `#9aa1ab`**（通常はサークルのテーマ色、クリア済みは `#7cc47f`） |
| 壁の高さ | 通常の **0.72 倍**（`wallH(radius) * 0.72`。クリア済みは 0.6 倍） |
| カメラ | `zoom: questZoom(center, radius)`, `pitch: 60`, `bearing: 0`, `duration: 900ms`, `padding.top: 70` |
| 現在地マーカー | エリア中心に、地図で一般的な**青丸ドット** |
| ポップアップ | エリア中心（現在地ドットに**重ねてよい**）に 2 行のテキスト |

**現在地ドット `.me-dot`**

- 18×18px、`background: #1a73e8`、`border: 2.5px solid #fff`、`border-radius: 50%`
- `box-shadow: 0 1px 4px rgba(0,0,0,.45)`
- 拡散ハロー: 同位置に 18×18px の `rgba(26,115,232,.28)` 円、`@keyframes meHalo` = `scale(1)/opacity .55` → 70% で `scale(3.4)/opacity 0`、`2.4s ease-out infinite`
- マーカー配置: `anchor: 'center'`、オフセットなし

**設立ポップアップ（クエストポップアップと同一意匠）**

- 1 行目（クエストタイトルと同じスタイル `.qp-title`）: **「サークルを作成！」**
  Noto Sans JP / `font-weight: 900` / `18px` / `line-height: 1.34` / `letter-spacing: .01em` / `#fff`
- 2 行目（`.qp-sub`）: **「今いる場所で写真と撮って、サークルを作成できます。」**
  Noto Sans JP / `font-weight: 800` / `13.5px` / `line-height: 1.5` / `#fff`
- 二層構成（既存クエストポップアップと同じ）: 背面レイヤーは `-webkit-text-stroke: 3.4px transparent` + `paint-order: stroke fill` + カラフルグラデーションを `background-clip: text` して `blur(5px) saturate(1.35)` で発光縁に、前面は白抜き + `text-shadow: 0 1px 3px rgba(0,0,0,.55), 0 2px 14px rgba(0,0,0,.4)`
- 幅 `262px`、テキストは折り返し可（`white-space: normal`）
- マーカー配置: `anchor: 'center'`, `offset: [0, -28]`（固定ヘッダー 93px との重なり回避）

**リスト下部コンテンツ（投稿が 0 件なので、代わりに設立オンボーディングを 1 枚）**

- コンテナ `.ns-onb`: 白背景・`position: absolute; inset: 0`・`display: flex; column`・`justify-content: center`（**垂直中央**）・`padding: 46px 20px calc(footer-h - 20px)`・`gap: 26px`・左寄せ
- 見出し `.ns-lead`: **「サークルの作り方」** — Noto Sans JP `800 / 15.5px / 1.6` / `#0a0a0d`
- ステップ `.ns-steps`（`gap: 22px`）／各行 `.ns-step`（`flex-direction: row`, `gap: 13px`, `align-items: flex-start`）
  - 番号 `.ns-step .n`: 円やカラー背景なしの**プレーンな太字数字** — Inter `900 / 15px` / `#0a0a0d` / `font-variant-numeric: tabular-nums` / 26×26px のグリッドセンタリング
  - タイトル `b`: Noto Sans JP `700 / 14px / 1.35` / `#0a0a0d`
  - 説明 `span`: Noto Sans JP `500 / 12.5px / 1.6` / `rgba(10,10,13,.56)` / `text-wrap: pretty`
  - 内容（コピーはこの通り）:
    1. **撮影する** — 今いる場所でカメラを使って撮影。
    2. **クエストを考える** — サークルのお題を自由に考えてください。
    3. **サークルに名前をつける** — 最初の名前を自由に決めれる。（改行）＊ただし、サークルの名前は投票制なので、変わる可能性があります。
- セクションのタイトルバー（`.strip-title` 内のクエストナビ）は「**サークルを設立する**」
- CTA ボタンは**置かない**。設立は画面下部の既存カメラボタンから開始する。

### 2. サークル設立フロー（フルスクリーン、3 モード切替: `cam` / `form` / `done`）

`#csView` を `data-mode` で切り替える。背景 `#000`、`z-index: 90`。

**2-1. cam（撮影）**

- ビューファインダー: 写真を `object-fit: cover` で全面。上下に protection gradient（`rgba(0,0,0,.5)` → 透明 26% / 58% → `rgba(0,0,0,.72)`）
- 上部（top 56px, 左右 14px）: 40×40px のグラス丸ボタン（閉じる、`icon_close.png`、白ティント）＋ グラスピル「**どのサークルにも属していません**」（`icon_near.png` / Noto Sans JP `700 / 11.5px` / `#fff`、`--lg-tint` + `blur(--lg-blur) saturate(--lg-saturate)` + `inset 0 1px 0 --lg-specular-top`）
- 下部（bottom 46px）: ヒント「**写真を撮ると、この場所が / サークルの中心になります**」（Noto Sans JP `700 / 13px / 1.5`、`text-shadow: 0 2px 8px rgba(0,0,0,.7)`）＋ シャッター 74×74px 円（カラフルグラデ、`box-shadow: 0 0 0 5px rgba(255,255,255,.9), 0 10px 28px rgba(0,0,0,.5)`、押下 `scale(.94)`）
- シャッター → `form`（step 1）

**2-2. form（3 ステップ、白背景）**

ヘッダー: 戻る 38×38px 円（`rgba(10,10,13,.06)`）／タイトル「**サークルを設立**」（Noto Sans JP `700 / 16px`）／右にステップ表示「`1 / 3`」（Inter `700 / 11px`, `rgba(10,10,13,.42)`, tabular-nums）。`padding: 64px 14px 10px`。
フッター: 幅 100% × 52px のグラデ CTA（`--radius-pill`、Noto Sans JP `700 / 15px`、`box-shadow: 0 8px 24px rgba(255,62,136,.26)`、押下 `scale(.985)`、無効時 `rgba(10,10,13,.12)` / 文字 `rgba(10,10,13,.4)`）。ラベルは step1–2「次へ」、step3「サークルを設立する」。

| Step | 見出し / 説明 | 入力 |
|---|---|---|
| 1 エリア | 「エリアを決める」／「撮影した場所が中心です。半径は最大 1km。エリアの中にいる人だけが投稿できます。」 | プレビューマップ（高さ 214px, `--radius-md`, 写真を `grayscale(.7) brightness(.7) opacity .5`）＋ 半径リング（`radial-gradient(closest-side, rgba(255,62,136,.10), rgba(255,62,136,.03))`, `box-shadow: 0 0 0 1.5px rgba(255,255,255,.85), 0 0 40px rgba(255,62,136,.35)`、直径 `54 + (r/1000)*156` px）＋ 中心ピン 30px グラデ円＋ キャプション `YOUR LOCATION · CENTER`。数値表示は Inter `900 / 40px`（`m` / `km` は `700 / 14px`）。スライダー `min 100 / max 1000 / step 20 / 初期 400`（thumb 24px グラデ、track 4px `rgba(10,10,13,.12)`）。目盛「100m」「1km (MAX)」 |
| 2 クエスト | 「クエストを決める」／「サークルにはクエストが1つ。エリアの中で撮って投稿するとクリアになります。」 | `quest`（1 行、placeholder「例）路地裏の壁画を見つける」）、`description`（3 行 textarea「クリアの条件を書く」）＋ 注記「クリアすると**投票権が1つ**もらえます。投票権はサークル名の投票に使います。」 |
| 3 名前 | 「最初の名前をつける」／「設立者のあなたが好きな名前をつけられます。」 | `circle name`（placeholder「例）宇田川の壁」）＋ 注記「これ以降の名前は**投票で決まります**。誰でも名前を投稿でき、サークルにいる人がいいねを押して投票。**いいねが一番多い名前**がサークル名になります。」 |

入力欄共通: `padding: 13px 14px`, `border-radius: --radius-xs`, `background: rgba(10,10,13,.05)`, Noto Sans JP `600 / 14.5px / 1.55`, placeholder `rgba(10,10,13,.3) / 500`。
バリデーション: step2 は quest タイトル必須、step3 は名前必須（未入力なら CTA を disabled）。

**2-3. done（設立完了）**

- 撮影写真を全面、下方向に濃くなる protection gradient（`rgba(0,0,0,.35)` → `.2` 40% → `.86`）
- ラベル `CIRCLE FOUNDED`（Inter `900 / 12px`, `letter-spacing: .1em`、カラフルグラデを文字に clip）
- サークル名（Noto Sans JP `900 / 27px / 1.3`, `#fff`）／クエスト名（`700 / 14px`）／メタ「半径 400m · メンバー 1人」（Inter `600 / 11.5px`, `rgba(255,255,255,.7)`）
- グラスピル「**投稿でクリア — 投票権 ×1 を獲得**」（`icon_check.png`）
- CTA「サークルを見る」52px グラデピル → 閉じて最終セクションを「設立済み表示」に更新

### 3. 最終セクション（設立後）`.ns-founded`

- 上部に投稿写真（`flex: 1`, `object-fit: cover`）＋ 左上バッジ `CLEARED · 1 / 1`（グラデ、Inter `800 / 10.5px`, `letter-spacing: .08em`）
- 下段: サークル名（Noto Sans JP `700 / 15px`、1 行省略）＋ 右にボタン「名前を投票で決める」（高さ 36px, `rgba(10,10,13,.06)`, `icon_like.png`）
- メタ行: 「半径 400m · メンバー 1人 · 投票権 N個」（Noto Sans JP `500 / 11.5px / 1.6`, `rgba(10,10,13,.55)`）
- マップはグレー壁からサークルのテーマ色エリアに切り替わり、クエストポップアップ（タイトル＋カウントダウン）が出る

### 4. サークル名の投票 `#nvView`（白背景、`z-index: 91`）

- ヘッダー: 戻る 38px 円／「**サークル名の投票**」（`700 / 16px`）
- 現在名ブロック: ラベル `current name`（Inter `700 / 10.5px`, `letter-spacing: .1em`, uppercase, `rgba(10,10,13,.42)`）／名前（Noto Sans JP `900 / 24px / 1.35`）／サブ「N件の候補 · いいねが一番多い名前がサークル名になります。」
- 投票権バー: `icon_check.png` ＋「投票権 — **クエストをクリアすると1つ**もらえます」＋ 右に残数（Inter `900 / 20px`, tabular-nums）。背景 `rgba(10,10,13,.05)`、**残 0 で投票しようとした時のみ** `rgba(255,62,136,.10)` に変化
- 候補リスト（いいね数の降順）: 順位（Inter `900 / 14px`、1 位は `#ff3e88`）／名前（Noto Sans JP `700 / 15px`）／`CURRENT NAME` チップ（1 位のみ、グラデ）／投稿者 `@name`（`· founder` 付与）／いいねボタン（36px ピル、未投票 `rgba(10,10,13,.06)`、投票済 `rgba(255,62,136,.12)` / 文字 `#ff2f74`、押下 `scale(.95)`）。行区切りは `1px solid rgba(10,10,13,.07)`
- 投稿バー（下端固定）: 入力（ピル、placeholder「サークル名を投稿する」）＋「投稿」ボタン（46px グラデピル、空文字で disabled）

---

## Interactions & Behavior

1. **未所属判定**: フィードのスクロール位置が最終セクション（`index >= circles.length`）に入ったら未所属モードへ。エリアレイヤーはグレーに、クエストポップアップは設立ポップアップに差し替える。
2. **カメラボタン**: 未所属モードでは投稿ではなく**設立フロー**を開く（設立後は通常の投稿クリア動作）。
3. **設立フロー**: 撮影 → step1 半径（最大 1000m） → step2 クエスト → step3 名前 → 完了。戻るは step0 で撮影に戻る。
4. **設立完了時**: サークルを生成（中心＝撮影地、半径＝スライダー値、クエスト 1 件、候補名リストに設立者の名前を likes=1 で登録）し、**投票権 +1**。
5. **サークル名投票**: いいね押下で `likes +1` / 投票権 `-1`、取り消しで戻す。投票権 0 で押した場合は投票させず、行を 4px 横に揺らして（`transform: translateX(4px)`, 400ms）投票権バーを警告色に。
6. **名前の確定**: 並べ替え後の 1 位の名前が**そのままサークル名**になり、ヘッダー・リスト・完了画面の表示が更新される。
7. **名前の投稿**: 誰でも追加できる（likes 0 で末尾に追加、その後ソート）。
8. **ヘッダーのサークル名タップ**で投票画面を開く（未所属かつ未設立の間は無効）。
9. **クエストクリア**: 既存のクリア処理で投票権 +1、投票画面が開いていれば即時反映。
10. アニメーション: マップ移動 `900ms ease`、押下は `scale` 0.94–0.985（`.12s`）、ハロー 2.4s ループ。hover 状態は持たない（タッチ前提）。

## State Management

| State | 用途 |
|---|---|
| `noAreaMode: bool` | 現在地がどのエリアにも属していない |
| `createdCircle: Circle?` | この場所で設立したサークル（未設立なら null） |
| `tickets: int` | 投票権の残数（初期 1、クエストクリアで +1、投票で -1） |
| `founding.mode: cam \| form \| done` | 設立フローの表示状態 |
| `founding.step: 0..2` | フォームのステップ |
| `founding.radius: int (100–1000)` | 半径（m） |
| `founding.questTitle / questDesc / name: String` | 入力値 |
| `circle.votes: [{name, by, likes, liked, founder}]` | 名前候補と投票状態 |

データ要件: 現在地（Geolocation）／中心と半径による内外判定（半径上限 1000m）／サークル・クエスト・名前候補と likes の永続化（Firestore）／1 ユーザー 1 候補につきいいね 1 回、投票権の増減はサーバ側で検証。

## Design Tokens

- 色: `#0a0a0d`（前景）, `#fff`, `rgba(10,10,13,.56/.42/.3/.12/.07/.06/.05)`（本文〜面）, `#1a73e8` + `rgba(26,115,232,.28)`（現在地）, **`#9aa1ab`（未設立エリア壁）**, `#7cc47f`（クリア済み壁）, `#ff3e88` / `#ff2f74` / `rgba(255,62,136,.10–.35)`（アクセント）, カラフルグラデ `#FFF0A6 → #005F67 → #FF3E88 → #D0A052`
- スペーシング: 5 / 6 / 9 / 10 / 13 / 14 / 16 / 18 / 20 / 22 / 26 / 46 / 64 px
- タイポ: Noto Sans JP（JP・ボタン）11.5 / 12.5 / 13.5 / 14 / 15 / 15.5 / 16 / 18 / 19 / 24 / 27px、Inter（Latin・数値）10.5 / 11 / 11.5 / 12 / 14 / 15 / 20 / 40px、weight 500–900
- 角丸: `--radius-xs 8` / `--radius-sm 12` / `--radius-md 16` / `--radius-lg 24` / `--radius-pill 9999`、円形（アイコンボタン・ドット）
- シャドウ: `0 1px 4px rgba(0,0,0,.45)`, `0 4px 14px rgba(0,0,0,.55)`, `0 8px 24px rgba(255,62,136,.26–.28)`, `0 10px 28px rgba(0,0,0,.5)`、テキスト `0 1px 3px rgba(0,0,0,.55)` / `0 2px 14px rgba(0,0,0,.4)` / `0 2px 8px rgba(0,0,0,.7)`
- グラス: `--lg-tint` + `backdrop-filter: blur(--lg-blur) saturate(--lg-saturate)` + `inset 0 1px 0 --lg-specular-top`
- イージング: `--ease-out ≒ cubic-bezier(.4,0,.2,1)`

## Assets

- アイコン（既存の白 PNG セット `assets/icons/`）: `icon_close`, `icon_near`, `icon_camera`, `icon_check`, `icon_like`, `icon_pin_location`
- 写真: サンプルプール `assets/reel/`（設立フローの撮影写真は `reel006.jpg`）
- 現在地ドット・半径リングは CSS のみ（画像なし）
- マップは既存の MapLibre / Google Maps レイヤー実装（disk / line / 3D wall / rib）を再利用

## Files

- `Universe-Quest.html` — この機能を含む QuestFeed 画面のプロトタイプ全体（design reference）
  - 未所属モード: `NEW SPOT` セクション（CSS `.ns-*`, `.me-dot`、JS `setNewSpot()` / `nsRenderEmpty()` / `nsRenderFounded()`）
  - 設立フロー: `#csView`（CSS `.cs-*`、JS `csOpen()` / `csPaneSync()` / `csFound()`）
  - 名前投票: `#nvView`（CSS `.nv-*`、JS `nvOpen()` / `nvRender()`）
  - エリア壁のグレー化: `applyWallState()` の `unclaimed` 分岐と `WALL_UNCLAIMED = '#9aa1ab'`
