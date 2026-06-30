# HANDOFF — CircleFlow（サークル作成・選択フローの再設計）

投稿フローから開く「サークルを選ぶ / 新しく作る」一連の画面を**現状実装を単一の正**として捕捉した
逆ハンドオフ。狙いは **(1) 遷移・手数の簡素化** と **(2) 全体トーンの刷新**。現状スクショ（`shots/`）に
写る通り、ステップが重く・footer 高さが乱高下し・トーンがベタ塗りで素。Before/After で改善案を出してほしい。
**現状の挙動仕様は再発明しない**（specimen は実装を写す鏡。値は下に固定）。

## repo / raw リンク

- repo: `univbrofd/toopdbq-design`、branch: **`main`**（public・raw 直取得可）
- raw 形式: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/{path}`
- DS 索引: `DesignSystem/_ds_manifest.json`（ここから tokens / preview / assets を芋づるで辿る）
- foundation: `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css`（色の単一の正）

## スマホ配置文脈（必須）

- 画面は `preview/card.css` の `.phone` 枠（iPhone 17 / 402×874・Dynamic Island・角丸55）に**実配置**で描く。
- SafeArea（status bar 62 / home indicator 34）を考慮。タップ範囲は最小 44pt。
- 3 画面とも**フルスクリーン**（地図 full-bleed / 黒地）。下部に操作 footer・確認 overlay が乗る。

## 現状フロー（UC は `USE_CASES.md` に対応）

```
投稿(StoryPost) → [サークルを選択] →
  CircleSelect（近傍サークル 2列グリッド / 位置なしは空 / 右下に「+撮影」追加ボタン）
    ├ カードtap → CircleSelectConfirm（全画面オーバーレイの確認カード → 「このサークルを選択」）→ 確定で 2 画面閉じて返す
    └ 追加ボタン → CircleEdit（地図全画面 + 下部 footer）
         camera（画像+名前/説明 入力, footer empty 466px）
         → 画像/名前 入り（footer imageSet 402px）
         → 地図tapで中心選択 → range（円+ピン, スライダー, footer rangeMode 164px）
         → [サークルを作成]（名前+位置が揃えば保存して返す）
```

## 現状の設計値（実装が正・値で固定）

**CircleSelect**（`shots/select-grid.png` / `select-empty.png`）
- 背景 `#000000`。ヘッダー = closeless（戻る `<` + 中央タイトル「サークル」）。
- グリッド: 2 列、上 padding 93・左右 8/393・下 80、行間 8・列間 8/393、カード比 180:170。
- カード（`WdCircleMiniCard` 180×170）: 写真 180×140・角丸16・枠 `rgba(255,255,255,.53)`、上→下グラデ
  `transparent→#000(0x8F)`。本文 左5/上80・幅170: 名前 Inter w600 12 / 説明 Inter w600 8(3行) / 行末に
  メンバー数 + 距離。
- 追加ボタン: 右下（`+` に camera バッジ）。**位置情報なしのときは本文が完全な黒画面**（案内・CTA 無し）。

**CircleSelectConfirm**（`shots/select-confirm.png`・全画面 dialog）
- 暗幕 `#000(0xA3≈64%)`（tap で dismiss）+ 下端グラデ h125 `transparent→#000`。
- 中央に正方形カード（幅 = 画面×360/402・角丸8・枠 `#221C1C`）: 写真+グラデ(stops 0–0.745 `→#000`)、
  左15/下15 に 名前 Inter w600 **24** / メンバー+距離 / 説明 Inter w600 12。
- 確定ボタン `WdTextButton`「このサークルを選択」を下端（safe+8）中央。→ **確定すると overlay とグリッドの 2 画面を閉じて返す**。

**CircleEdit**（`shots/edit-camera.png` / `edit-editing.png` / `edit-maptap.png` / `edit-range.png`）
- 地図 full-bleed（dark style・自分の位置ドット）。ヘッダー = titleless（`<` と `×`）。
- footer は 3 variant で**高さが乱高下**（角丸上16・上から重なる）:
  - `empty` **h466**（≒画面の半分超）`#1A1A1A`: 中央に 1:1 画像プレースホルダ（画面幅50%・tap で選択・素の `image` アイコン）、下に「サークル名を入力…」「サークルの説明を入力…」。
  - `imageSet` **h402** `#000(0xE5)`: 丸アバ 164×164 + 差替ボタン / 名前 / 説明 / 右上に「✓ サークルを作成」ピル。
  - `rangeMode` **h164** `#1A1A1A`: 距離スライダー（100–2000m）+ 左上 `×`。地図に円+赤ピン、スライダーで地図 zoom 自動追従。
- 保存は名前+地図中心が揃ったときだけ有効（**揃わなくても「作成」ボタンは出るが押すと無反応**＝フィードバック無し）。

## 直すべき逸脱（＝改善依頼の核）

1. **手数過多**: グリッドの 1 タップ「選択」に**全画面オーバーレイ確認**が挟まり、確定で 2 画面閉じる。軽い確認（inline ハイライト / 小さい確定バー / そのまま選択）に。
2. **footer 高さの乱高下（466 / 402 / 164）**で地図が隠れ、切替が唐突。高さを揃える or シート化し、地図を主役に保つ。
3. **作成ステップの分断**: 画像→基本情報→地図中心→範囲 が縦長 footer × 地図操作で混在。**段階（例: ①写真＋名前 → ②場所＋範囲）を明示**し、現在ステップ・次アクションを分かるように。
4. **空・無効状態が不親切**: 位置なし＝黒画面、保存不可でも作成ボタンが無反応。空状態に CTA（「近くにまだサークルがありません → 作る」）、保存不可は理由を出す。
5. **トーンが素**: ベタ塗り（`#1A1A1A` / `#000 0xE5`）と Material 風プレースホルダ。DS のカラフル放射グラデ＋ガラス＋写真フルブリード世界観へ。絵文字なし、効果は 1 コンポーネント 1〜2 個。

## 成果物（Claude Design が作るもの）

`DesignSystem/preview/` に specimen を起こし、各先頭に `@dsCard` を付け `_ds_manifest.json` の `cards` に登録。
既存の `Wd*` 語彙・役割トークン（`colors_and_type.css`）を再利用し、新規発明はしない。

1. **`screen-circle-select.html`** — グリッド + 空状態。Before/After（重い確認 → 軽い選択）を 1 枚に。
2. **`screen-circle-confirm.html`** — 選択確認の新しい形（overlay を軽量化 or 廃止）。
3. **`screen-circle-edit.html`** — 作成フローを段階化した specimen（①写真＋名前 → ②場所＋範囲）。footer/シートの高さ方針と地図主役の両立を見せる。

UC 名は `USE_CASES.md` と**同名**にする（後で Flutter 実機と横並び比較するため）。

## 現状スクショ（before・raw リンク）

代表 4 枚（残りは `shots/` に全 8 UC）:
- 手数: `…/handoff/CircleFlow/shots/select-confirm.png`
- 空状態: `…/handoff/CircleFlow/shots/select-empty.png`
- footer 巨大: `…/handoff/CircleFlow/shots/edit-camera.png`
- 範囲設定: `…/handoff/CircleFlow/shots/edit-maptap.png`

（raw base = `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main`）

実装の対応箇所（別 repo `univbrofd/toopdbq`・参考）: `lib/feature/CircleSelect/` `lib/feature/CircleEdit/`
`lib/component/ui/view/WdCircleEditFooter/` `WdCircleMiniCard/` `lib/component/ui/modal/CircleSelectConfirm/`。
