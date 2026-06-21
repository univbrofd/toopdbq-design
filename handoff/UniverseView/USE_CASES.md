# UniverseView 操作ユースケース カタログ

Earth Globe specimen（`Earth Globe.html` ＋ `earth/objects3d.js` ＋ reel controller）から抽出した
**ユーザー操作のユースケース**。デザイン側ハーネス（screen-only / iPhone 17）と Flutter 実装の
**UC 別スナップショット比較**の基盤。specimen 制御（tuning panel / preset-rail / 説明文 / 端末フレーム）は
アプリ挙動でないので**除外**。

検証済み公開 API（`window.Objects3D`）: `init / onChange / onThumb / selectRepresentative(id,{glide,lock}) /
focus(id) / exitFocus() / switchFocus(id) / rep / debug()`。reel/story-fs は `Earth Globe.html` の
`buildReel / highlightRep / openStory / closeStory`、DOM は `.playlist .cell[data-id] / #storyFs / .o3d-dock / .o3d-edge`。

## A. map/main 状態（地図主体・フォーカスなし）

| ID | 前提 | 操作 | 期待変化 | 実装 |
|---|---|---|---|---|
| A01 | メインクラスタ決定済み | メイン(代表)3D をタップ | フォーカスへ遷移（中央へ 320ms easeOutCubic 拡大・背景 scrim 暗転・360°回覧可） | `focus(repId)` |
| A02 | 複数クラスタ表示 | 非メインクラスタの 3D をタップ | メイン切替。地図が新クラスタへ glide・再選定・白枠移動 | `selectRepresentative(id,{glide:true})` |
| A03 | リール表示・複数メンバー | リール cell（非代表）をタップ | 白枠が即移動、地図が新代表へ glide | `selectRepresentative(id,{glide:false,lock:1500})` |
| A04 | リール表示・複数メンバー | リール cell（代表）をタップ | フォーカスへ遷移 | `focus(repId)` |
| A05 | メイン 3D 上 | 長押し（≈420ms） | フォーカスへ遷移（タップと同じ） | press → `focus` |
| A06 | 非メイン 3D 上 | 長押し | その 3D へ glide＋新メイン化してフォーカス | `selectRepresentative` ＋ `focus` |
| A07 | 非メイン 3D 上 | 短タップ | 新メインへ glide のみ（フォーカスしない） | `selectRepresentative({glide:true})` |
| A08 | リール表示 | リールを横ドラッグスクロール | 中央に来たオブジェクトが代表化・白枠移動・地図/動画カード追従 | carousel snap → `selectRepresentative` |
| A09 | リール複数 circle | （現 specimen は常時展開。行折畳みは将来） | — | — |
| A10 | 画面外に近隣オブジェクト | edge indicator chip をタップ | 地図がその位置へパン・新メイン化 | edge → `selectRepresentative` |
| A11 | map-main | 地図をドラッグ（回転/ズーム/パン） | MapLibre 標準。毎フレ メイン/代表 再計算 | map gesture → update |
| A12 | メイン代表の動画カード表示 | 動画カードをタップ | story fullscreen を開く（Hero 拡大） | `openStory(id)` |

## B. 3D focus 状態（全画面 360°回覧）

| ID | 前提 | 操作 | 期待変化 | 実装 |
|---|---|---|---|---|
| B01 | フォーカス中 | 対象を上下左右ドラッグ | 360°回転（慣性つき・X 軸クランプ） | orbit drag |
| B02 | dock 表示中 | dock item（隠れメンバー）をタップ | フォーカス対象を切替＋代表も同期（縮小→再拡大の入替感） | `switchFocus(id)` ＋ `selectRepresentative` |
| B03 | dock 表示中 | dock を横ドラッグ | 弧カルーセルが横スライド・自動スナップ | dock drag snap |
| B04 | dock 表示中 | wheel/トラックパッドスクロール | 弧カルーセルが ±1 index | dock wheel |
| B05 | フォーカス中 | 下部の再生ボタンをタップ | フォーカス中オブジェクトの動画を fullscreen 再生 | play → `openStory(focusId)` |
| B06 | フォーカス中 | 閉じる×（右上角）をタップ | フォーカス終了。320ms で縮小・地図操作復帰 | `exitFocus()` |
| B07 | フォーカス中・リール可視 | 別 pin の cell をタップ | フォーカス対象を切替（拡大維持・地図 glide なし） | `switchFocus(id)` ＋ `selectRepresentative({glide:false})` |
| B08 | フォーカス中・chrome 可視 | 投稿/like/side-tool をタップ | フォーカス維持・app イベントだけ発火（chrome は前面 z59） | event propagation |

## C. story fullscreen 状態（2D スワイプ・ストーリーフィード）

開くと tap した投稿を起点に **2D グリッドのストーリーフィード**へ展開する（横 = 同じサークルの他投稿 /
縦 = 近傍サークル〔重心距離順〕）。Instagram ストーリー型のセグメント進捗（横アイテム数ぶんのミシン目）・
スワイプヒント・近傍ウィンドウだけ実体化する遅延セル生成。

| ID | 前提 | 操作 | 期待変化 | 実装 |
|---|---|---|---|---|
| C01 | リール/動画 cell から | 開く | tap 投稿を起点に media を 440ms 展開。クラスタ ≥2 件なら 2D フィードへ。元 cell opacity0・circle が footer へ FLIP | `openStory` / `buildFeed` / `footFlyIn` |
| C02 | フィード表示中 | 横スワイプ →/← | 同サークルの前後投稿へ移動。セグメント進捗が該当列へ・フッター差替・近傍セル実体化 | `setActive(r,c)` / `rowCurrentCol` |
| C03 | フィード表示中 | 縦スワイプ ↓/↑ | 近傍サークル（重心距離順）の行へ移動・フッターのサークル差替 | `setActive` / `clusterCentroid` / `geoDist` |
| C04 | 起点セル | スワイプヒント | 原点でのみ →（同サークル）/ ↓（別サークル）の chevron を bob 表示 | `updateHint` |
| C05 | 画像セグメント | 進捗 100%（≈6s） | 次の横アイテムへ自動送り（無ければ縦/終了） | `onProgress` / `updateBar` |
| C06 | 動画セグメント | 再生 | 動画再生（セグメントは尺に追従） | video play |
| C07 | フィード表示中 | 閉じ（タップ/下スワイプ） | 縮小・フィード teardown・借用ノード返納・セグメント破棄 | `closeStory` / `teardownFeed` / returnMedia |
| C08 | 縮小アニメ中 | （凍結） | 縮小中はフィードスクロール凍結 | scroll freeze |

## 内訳

28 UC（A: map/main 12 / B: 3D focus 8 / C: story fullscreen feed 8）。
gesture 駆動が大半、A11/地図・B01 orbit・A08/B03/C02/C03 swipe は連続操作（after-action 状態を 1 枚で記録）。
C05 は programmatic。
