# Onboarding — 逆ハンドオフ（実装 → Claude Design）

初回起動オンボーディング（横スワイプ 6 シーン + 位置情報許可）は **Flutter 実装済み**。
この文書は Claude Design に「**実機 iPhone 17（iOS 最新）と同じ見え方の、画面ごとの preview**」を
作らせ、比較プレビューの完成度を上げるための指示。**実装が単一の正**。specimen は実装を写す鏡で、
実装に合わせて起こす（specimen に合わせて実装を変えない）。

## repo / raw base

- repo: `univbrofd/toopdbq-design`
- branch: `main`
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`

## 今回の主目的（ここが新規）

現状の比較プレビューは、**design specimen が `card.css` の `.phone`（393×852・notch 系）** で描かれ、
**実装は iPhone 17（402×874・Dynamic Island・iOS 26.5）** の実機スクショ。デバイス枠が違うため
厳密な重ね合わせができない。これを揃える:

1. **`.phone` フレームを iPhone 17 / iOS 最新に更新**（DS 全体に効く。`preview/card.css`）。
2. **画面（シーン）ごとに 1 枚の preview ファイル**を、その iPhone 17 枠で **full-bleed フル画面**に描く
   （カタログ的な縮小配置でなく、実機 1 画面 = 1 ファイル）。
3. 各 preview の**ステータスバーは Apple 標準の 9:41・フル電波/Wi-Fi/満充電**で固定（実機側も
   `simctl status_bar override` で 9:41 に正規化して撮るので、両者が一致する）。

### iPhone 17 / iOS 26.5 の枠仕様（実測値・厳守）

| 項目 | 値 |
|---|---|
| 論理解像度 | **402 × 874 pt**（@3x = 1206 × 2622 px） |
| 画面角丸 | **55 pt** |
| Dynamic Island | 幅 **約 125 pt** × 高 **約 36 pt**、上端から **約 11 pt**、水平中央の黒ピル |
| セーフエリア上（ステータスバー帯） | **約 62 pt**（Dynamic Island 込み） |
| セーフエリア下（ホームインジケータ） | **34 pt**（白バー 幅 140 / 高 5 / 下端 8） |
| ステータスバー時刻/アイコン | 時刻 9:41（左）/ セル・Wi-Fi・満充電（右）、中央は Dynamic Island |

`.phone`（現状 393×852・角丸44・safe-top 59）を上表へ。`.phone .safe-top` は 62pt、
Dynamic Island の黒ピルを `.phone` 内の status bar に追加する（中央・上端 11pt）。
旧 393×852 が必要な箇所が他にあれば `.phone-legacy` として温存し、Onboarding は iPhone 17 枠を使う。

## 作るもの（成果物の形式・保存先）

- `preview/card.css`: `.phone` を iPhone 17 化（上表）。Dynamic Island / 9:41 status bar を内蔵。
- `preview/comp-onboarding-01..06-*.html`: **シーンごとに 1 ファイル**、iPhone 17 `.phone` 枠で
  full-bleed フル画面。先頭に `<!-- @dsCard group="Onboarding" name="..." subtitle="..." -->`。
  既存 6 specimen（下記）を **iPhone 17 枠へ移植**し、レイアウトは実装に合わせて微調整
  （402 幅・874 高・safe-area 62/34 に追従。中身の図案・コピー・色は実装どおり）。
- `preview/onboarding.css`: 必要なら 402×874 / safe-area 62 に合わせて余白を更新。
- `_ds_manifest.json`: 上記 6 カードを `group="Onboarding"` で登録（superset）。
- 最終は **ダウンロード可能な bundle** で出力。

## design 上の正（specimen と トークン根拠）

specimen（写す対象。iPhone 17 枠へ作り直す移植元。**design 上はここが正**）:
- `handoff/Onboarding/comp-onboarding-01..06-*.html` と `onboarding.css` / `card.css` / `components.css`

トークン根拠（新規発明禁止・これを使う）:
- `DesignSystem/colors_and_type.css`（役割トークン・`--gradient-colorful` 等。canonical なトークン源。Flutter 側 `FigmaColors.dart` はこれの鏡写し）
- 索引: `DesignSystem/_ds_manifest.json`

現状の比較プレビュー（差分の確認用）:
- `preview/Onboarding-01..06.png`（左 design ｜ 右 Flutter 実機、両者 iPhone 17 枠）

実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF の値が design 上の正）:
- `lib/feature/Onboarding/OnboardingView.dart` — 6 シーン + 位置情報許可シート
- `lib/feature/Onboarding/OnboardingController.dart` — PageView / 許可ハンドラ
- `lib/feature/Onboarding/widgets/ObMapStage.dart` — 図案化した傾き地図（透視グリッド + glow、`showGrid`）
- `lib/feature/Onboarding/widgets/ObCircleRange.dart` — サークル範囲（楕円リング + 中心ピン + ハンドル）
- `lib/feature/Onboarding/widgets/ObMarker.dart` — billboarded マーカー（thumb / dot / hero）
- `lib/feature/Onboarding/widgets/ObFoot.dart` — eyebrow / glow タイトル / 本文 / dots / CTA
- `lib/component/ui/resource/FigmaColors/FigmaColors.dart` — `colorfulRadialGradient` / `colorfulLinearGradient`（上記 `colors_and_type.css` の鏡写し）

## 直すべき逸脱（実装との差。specimen 側を実装へ寄せる）

- **04 投稿のルール**: specimen は街グリッドを敷くが、実装はグリッド無し（暗地 + glow + 破線サークル + 「サークルの範囲」ラベル）。→ specimen も grid 無しに。
- デバイス枠が 393×852 → iPhone 17 402×874 + Dynamic Island（本ハンドオフの主目的）。
- ステータスバー時刻を 9:41 固定に（実機側も 9:41 に正規化）。

## 世界観（厳守）

ダーク（`--bg #08080b`）＋カラフル放射グラデ（`--gradient-colorful`）＋ガラス＋写真フルブリード。
Noto Sans JP（和文）/ Pacifico（wordmark）。呼称は必ず「投稿」（「ストーリー」禁止）。絵文字なし。
スマホ前提: full-bleed 背景 + 下部テキスト + 進捗ドット + CTA、タップ範囲 最小 44pt。
