# HANDOFF — StoryViewerView（全画面ストーリー閲覧・3層 PageView）

- repo: `univbrofd/toopdbq-design`（branch `main`）
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引: `DesignSystem/_ds_manifest.json`
- 既存 happy-path specimen: `DesignSystem/preview/screen-05-story-viewer.html`（card `StoryViewerView`）

## ゴール

`screen-05`（投稿写真 full-bleed＋進捗ヘッダー＋右サイドレール＋circle footer の通常表示）は**現状維持**。本ハンドオフは screen-05 が描いていない **StoryViewer 固有の状態オーバーレイ**を specimen 化し、実装の場当たり値を役割トークンへ寄せることが目的。新コンポーネントは作らず、既存 `Wd*`・トークンを使う。

## スマホ配置文脈（必須）

- 画面 393×852（specimen は `card.css` の `.phone` 枠 = iPhone17 402×874・Dynamic Island・statusbar 9:41・home-ind）。全状態を `.phone` 内に実配置で描く。
- 背景は常に投稿写真の full-bleed（`assets/sample/reel/`）。状態オーバーレイはその上に乗る。
- タップ域は最小 44pt。

## 既存部品（再設計しない・参照のみ）

| 要素 | DS カード |
|---|---|
| 進捗ヘッダー | `comp-12-header`（WdStoryHeader progress 同居）|
| 右サイドレール（like/comment/map＋投稿者アバター）| `comp-14-story-side-tool` |
| circle footer | `comp-13-circle-footer` |
| コメントシート | `comp-16-story-comment-sheet` |
| 共通 chrome（footer/menu）| `handoff/StoryOverlay/` |

進捗バー実値（WdStoryHeader）: セグメント高 4・gap 4・radius 9999、track = 白25%（`rgba(255,255,255,.25)`）、fill = 白64%（`#A3FFFFFF`）。current セグメントは Ken Burns ズームに連動して幅アニメ、past=満タン/future=空。

## 捕捉する状態（screen-05 に無い・新規 specimen 化）

実装値で固定。すべて写真 full-bleed の上のオーバーレイ。**glass は使わない**（happy-path のレール3＋circle bar=4 形状を超えない。状態系は transient/cell 扱い → scrim 面）。

1. **空（コンテンツなし）** — 画面中央に縦組み: `WdIconButton`（camera・color 円・80px）＋ 16gap ＋ テキスト「コンテンツがありません」（`--text-3` 相当=白60% `#99FFFFFF`・14px）。
2. **ローディング** — 中央に細いスピナー（strokeWidth 1）。現状色 `rgba(90,90,90,.357)` は**場当たり** → `--text-3` か `--gray-mid` へ寄せる。
3. **位置拒否（.deniedLocation）** — ヘッダー直下・左寄せに `WdIconTextButton`（near アイコン＋「近くの投稿を探す」）。位置 top≈119/852・left≈8/393。
4. **アップロード進捗（ヘッダー帯のスナックバー）** — top≈50/852・left/right 16/393 に積み重ね。1枚 = padding 12×8・radius 8・面 `#CC000000`（**場当たり** → `--scrim-strong` rgba(0,0,0,.80)）。3状態:
   - 進行中: 小スピナー 14（白）＋「Uploading... 62%」（白・12px・w500）＋ 細い線形バー（高さ3・radius2・track `#444444`→`--gray-700`・fill 白）。
   - 完了: チェック 14（`--state-success` #4caf50）＋「投稿完了」（白）。
   - 失敗: エラー 14（`--state-error` #ff6b6b）＋「投稿に失敗しました」（`--state-error`）。
5. **drag-to-dismiss** — リスト端（縦最上 / 横最左）でさらに引くと画面全体が縮小（最大 ×0.6）＋指方向へ平行移動。閾値（画面寸 22% 超 or 強フリック）で Universe のピンサムネへ逆 Hero で吸い込まれて閉じる。縮小中の 1 コマを描くと意図が伝わる。

## 3層ナビの操作モデル（アノテーション用）

- **Circle 層**: 縦スワイプでサークル切替（端でスナップ）。
- **User 層**: 横スワイプで同一サークル内のユーザー切替。
- **Content 層**: 画面右半タップ=次 / 左半タップ=前（スワイプ不可）。ダブルタップ=いいね。進捗ヘッダーは「ユーザー内のコンテンツ位置」を表す。

## 直すべき逸脱（→ 役割トークン）

- アップロード snackbar の `Icons.check_circle` / `Icons.error`（Material アイコン直書き）→ ブランド glyph（`assets/icons/icon_check.png` 等）＋ `--state-success` / `--state-error`。
- snackbar 面 `#CC000000` → `--scrim-strong`。進捗バー track `#444444` → `--gray-700`。
- ローディング `rgba(90,90,90,.357)` → `--text-3` / `--gray-mid`。
- 空状態の文言色 `#99FFFFFF` → `--text-3`。

## 成果物

- `screen-05` はそのまま残し、状態を**1 つの specimen** にまとめる（例 `DesignSystem/preview/screen-05b-story-viewer-states.html`）。`.phone` 枠を状態ごと（空 / 位置拒否 / アップロード進行・完了・失敗 / drag-dismiss 縮小）に並べ、各先頭に `@dsCard` を付与し `_ds_manifest.json` に登録。
- 写真は `assets/sample/reel/`、アバターは `assets/sample/user/`、logo 等は `assets/images/`。外部 CDN 禁止。

実装の対応箇所（別 repo `univbrofd/toopdbq`・参考）: `lib/feature/StoryViewer/StoryViewerView.dart`（状態描画）/ `WdStorySideTool.dart`（レール）/ `lib/component/ui/view/WdStoryHeader/`（進捗）。
