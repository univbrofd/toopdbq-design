# HANDOFF — UniverseView：クラスタ ⇄ リール ⇄ メイン ⇄ フォーカス の連携リファクタ

`UniverseView` の live specimen（`Earth Globe.html` ＋ `earth/*.js`）を、**実機（Flutter）の連携モデルに合わせて
リファクタ**する逆ハンドオフ。現 specimen は 3D・下部リール・メイン選定・フォーカスが**バラバラのデータ**で動いて
おり、実機のように「1 つのクラスタを中心に全部が連動する」形になっていない。それを直す。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
> 実装の対応箇所は「別 repo `univbrofd/toopdbq`・参考」（Claude Design は読めない。値は本書に固定）。

## 現 specimen のズレ（直す対象）

| 箇所 | 現 specimen（誤り） | 実機（正・本書で固定） |
|---|---|---|
| **下部リール** | 固定 4 行（渋谷コミュニティ等）の**無関係なサンプル画像**列。3D とは別データ | **メインクラスタのメンバー列**。中心クラスタの `allPins` を circle でグルーピングして出す |
| **3D とサムネの同一性** | 3D = `real-NN.glb`（Firebase）、リール = `story-NN.png`。**別物で対応が無い** | **同一 story の二表現**。1 投稿 = `{id,lat,lng,circleId,glbUrl,thumbUrl}`。サンプルは `real-NN.glb`↔`real-NN.jpg`（**生成元の写真がサムネ**） |
| **クラスタリング** | 11 件を独立配置。クラスタ概念が無い | **タイル cell で bin** し、画面中心に最も近い cell を**メインクラスタ**にする |
| **メイン選定** | 画面中心最寄り 1 個を 2× にするだけ（孤立した値） | メイン = **メインクラスタの代表**。リールの白枠・地図の main・フォーカス対象と**同一 id で連動** |
| **リール↔地図↔フォーカス** | 一方通行（タップで地図 glide のみ）。リールと代表が無関係 | **双方向ループ**。リール cell タップ→代表ロック→地図再選定→リール白枠移動→（main かつ 3D なら）フォーカス |

## 目標の連携モデル（実機の値で固定）

### データモデル（最重要）
- **1 投稿 = 1 エンティティ**。`{ id, lat, lng, circleId, glbUrl, thumbUrl }`。**3D とサムネは同じ id**。
- サンプルの対応表（GLB＝現 POSTS の Firebase URL を継続使用、サムネ＝design repo 内のローカル写真）:

| post | story id | lat, lng | thumbUrl（生成元写真） | 見た目 |
|---|---|---|---|---|
| real-01 | 143a6501… | 35.6655, 139.7011 | `../../assets/sample/models/real-01.jpg` | しゃがむ人物 |
| real-02 | 1e12abf7… | 35.6741, 139.6811 | `…/real-02.jpg` | しゃがむ男性 |
| real-03 | 25eb1144… | 35.6754, 139.7051 | `…/real-03.jpg` | 飲み物を持つ男性 |
| real-04 | 353711cd… | 35.6653, 139.7010 | `…/real-04.jpg` | 犬のぬいぐるみ |
| real-05 | 7339918b… | 35.6753, 139.6970 | `…/real-05.jpg` | 男性バスト |
| real-06 | 7fa30005… | 35.6958, 139.7662 | `…/real-06.jpg` | 立つ人物（横向き） |
| real-07 | 97ef6494… | 35.6621, 139.7127 | `…/real-07.jpg` | 鉢／香炉状の器 |
| real-08 | bf56f848… | 35.6677, 139.6933 | `…/real-08.jpg` | 立つ女性 |
| real-09 | d91a62e2… | 35.6657, 139.6961 | `…/real-09.jpg` | 青髪の人物 |
| **real-10** | e40ad36b… | **35.6592, 139.7006** | `…/real-10.jpg` | **ハチ公像（map CENTER）** |
| real-11 | e42972fe… | 35.6657, 139.7010 | `…/real-11.jpg` | 顔／頭部 |

- GLB は現 specimen `POSTS[].url`（`firebasestorage.googleapis.com/.../story/{id}/{id}.glb`、CORS `*`）をそのまま使う。
  **ユーザー投稿の GLB/写真は design repo に複製しない**（GLB は公開 URL 参照、サムネは上記サンプル写真で代用）。
- circleId は全件 `seed_shibuya`（実機の渋谷シード）。デモ用に **2〜3 サークルに分けて**リールの複数行を見せてよい。

### クラスタリングと代表（実機の挙動）
1. **bucketing**: 全ピンを zoom/canvas 依存のタイル cell（`z/x/y`）で bin。各 cell の**既定代表＝id 最小**のピン。
2. **メインクラスタ**: cell のうち**画面中心に最も近い**ものを `role=main` にする。これが `mainTerrestrial`（リールの供給元）。
3. **代表選定（hysteresis）**: 毎フレ各クラスタの中心度 `repActiveT`(0–1, 中心=1) を見て、最大のピンを代表化。
   ただし**現代表より厳密に上回る時だけ**入れ替え（タイ無効＝ちらつき防止）。
4. **ユーザーロック**: リール cell タップで選んだ代表は **1500ms ロック**（自動選定より優先）。
5. メインクラスタの「巨大 main＋小さい sub」は role でサイズ激変。current specimen の「中心最寄りを 2×」はこの一部。

### リール（= メインクラスタのメンバー列）
- 供給元 = `mainTerrestrial.allPins`（メインクラスタの**全メンバー**。branches だけでなく隠れメンバーも含む）。
- circleId でグルーピング → **1 サークル 1 行**（代表のサークルを先頭）。各行 = サークル名＋カバー＋メンバー横スクロール。
- **cell の中身は画像（thumbUrl）のみ**。代表 = 白枠 **2.5px** / 他 = `rgba(255,255,255,0.2)` 1px。アバター/名前/出典は描かない。
- cell タップ → **代表化**（`selectRepresentative`）。long press → story を開く。

### タップ挙動の出し分け（地図上の 3D）
- **メイン（代表）3D タップ → フォーカス**（全画面 Hero 拡大・**320ms easeOutCubic**・背景の地図のみ scrim 暗転・360°回覧）。
- **非メイン タップ → 地図がその位置へ glide**（約 800ms）して**その投稿が新しいメイン**になる（フォーカスしない）。
- リール cell タップでフォーカス中に別 3D 投稿を選ぶと、**フォーカス対象を差し替え**（拡大は維持）。3D 無し投稿を選んだらフォーカスを閉じる。
- フォーカス中の ✕ ボタンは**対象の左上角**に追従、scrim は地図だけを暗転、リール/サイドツール/投稿ボタンは前面で操作可（押してもフォーカス維持）。

### 連携の状態（同一 id で貫通）
`代表 id` が、(a) リールの白枠 (b) 地図上の巨大 main (c) フォーカス対象 を**1 つの id**で結ぶ。現 specimen の
`_mainId`（中心最寄り）を**この代表 id に統一**し、リール選択・地図 glide・フォーカスがすべて同じ id を更新するようにする。

## スマホ配置文脈

画面 **402×874 + SafeArea**（iPhone 17 / iOS 最新・`DesignSystem/preview/card.css` `.phone`）。globe は full-bleed 背景。
リール `left:0 right:0` 下端、投稿ボタン右下 55×55、WdSideTool 右端中央。タップ範囲 ≥44pt。

## 直すべき逸脱

- リールのデータを「固定サンプル」から「メインクラスタ `allPins`」に。3D とサムネを**同一 id のペア**に束ねる。
- `_mainId`（中心最寄り）を**クラスタ代表**へ統一し、リール／地図／フォーカスが同じ id を相互更新する双方向ループにする。
- サムネは `assets/sample/models/real-NN.jpg`（per-View に複製しない・共有プール参照）。色は役割トークン（`colors_and_type.css`）。

## 実装の対応箇所（別 repo `univbrofd/toopdbq`・参考。本書の値が design 上の正）

- `lib/component/ui/view/Earth/EarthClusterEngine.dart` / `EarthClusterModels.dart` — bucketing・cell 代表・`EarthClusterLayout{allPins, branches, role, main}`
- `lib/component/ui/view/Earth/EarthRepresentativeElector.dart` — 代表選定（`repActiveT` 最大・hysteresis・ユーザーロック 1500ms）
- `lib/component/ui/view/Planet/PlanetViewController.dart` — `mainTerrestrial`（Rxn）/ `selectRepresentative` / `enter3dFocus` / `exit3dFocus` / `focus3dPin` / `focus3dExpanded`
- `lib/feature/Main/StoryOverlayView.dart` — `_buildClusterReel`（`mainTerrestrial.allPins` を読む）/ `_CirclePlaylist`（circle 別行・代表白枠）
- `lib/component/ui/view/Earth/ThreeDTerrestrialView.dart` — フォーカスの AnimatedPositioned（320ms・main 判定）
- `lib/model/Terrestrial.dart` — `id / lat / lng / has3D / threeDPath / thumbnailUrl / circleId`（3D とサムネは同一エンティティ）

## Claude Design に貼るプロンプト

```
to claude
------------------------------------------------------
UniverseView の Earth Globe specimen を「実機の連携モデル」に合わせてリファクタして。
現状は 3D・下部リール・メイン・フォーカスがバラバラのデータで、連動していない。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/UniverseView/HANDOFF.md
（specimen: handoff/UniverseView/Earth Globe.html ＋ earth/*.js を直接リファクタしてよい）

直す核（HANDOFF の表と「目標の連携モデル」のとおり）:
1. データを 1 投稿 = 1 エンティティ {id,lat,lng,circleId,glbUrl,thumbUrl} に統一。
   3D(glbUrl=現 POSTS の Firebase URL)とサムネ(thumbUrl=assets/sample/models/real-NN.jpg)を
   同じ id のペアにする(real-NN.glb ↔ real-NN.jpg。生成元写真がサムネ)。
2. クラスタリングを入れる: ピンをタイル cell で bin、画面中心に最も近い cell をメインクラスタに。
3. 下部リール = メインクラスタの allPins を circle 別行で表示(代表=白2.5px枠/他=rgba(255,255,255,.2)1px、
   cell は thumbUrl のみ)。固定4行サンプルはやめる。
4. 代表 id を 1 本に統一して連動: リール白枠 / 地図の巨大 main / フォーカス対象 を同じ id に。
   リール cell タップ→代表化(1500msロック)→地図再選定→白枠移動。
   メイン 3D タップ→フォーカス(320ms easeOutCubic 全画面・360°)。非メイン タップ→地図がそこへ glide して新メイン。

土台は USAGE_RULES.md と taste.md。色は colors_and_type.css の役割トークン、
サムネは共有プール assets/sample/models/real-NN.jpg を参照(per-View に複製しない)。
新規発明はしない。最終はダウンロード可能な bundle で出力して。
--------------------------------------------------
```

## 取り込み

Claude Design が bundle を export したら `/import-design-bundle {URL}` で取り込む（`handoff/UniverseView/` を更新・push）。
