# 逆ハンドオフ — UniverseMenuSheet（コード → Claude Design）

実装済みの `UniverseMenuSheet`（サイドメニュー bottomSheet）を **デザインシステムの specimen** として
起こすための、コード→デザインのハンドオフ。Claude Design は git から各ファイルを直接取得できるため、
本書はファイル本文を埋め込まず **リポジトリ上のパス（branch 固定リンク）** を参照する。

## リポジトリ / 取得方法

- repo: `univbrofd/toopdbq-design`
- branch: `main`
- raw 取得: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/<path>`
- blob 閲覧: `https://github.com/univbrofd/toopdbq-design/blob/main/<path>`

## 成果物 / 保存先

- 形式: 既存 `DesignSystem/preview/comp-*.html` と同じ specimen カード（`../colors_and_type.css` を link）
- ファイル名: **`comp-menu-sheet.html`**
- 配置: `DesignSystem/preview/comp-menu-sheet.html`
- 登録: `DesignSystem/_ds_manifest.json` のカード一覧に 1 行追記

## 参照ファイル

### A. デザイン基盤（この repo から取得）

| 役割 | path |
|---|---|
| トークン（唯一の正） | `DesignSystem/colors_and_type.css` |
| MenuItem の Before/After 参照 | `DesignSystem/preview/batchF-misc.html` |
| specimen カードの雛形 | `DesignSystem/preview/comp-circle-bar.html` |
| アイコン PNG | `DesignSystem/assets/icons/icon_leave.png` / `icon_delete.png` |
| 使用ルール・美学・概要 | `USAGE_RULES.md` / `taste.md` / `README.md` |

### B. 実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF が design 上の正）

- 改善対象（現状実装）: `lib/feature/Universe/widgets/UniverseMenuSheet.dart`
- システム整合の正解形: `lib/component/ui/widget/WdMenuItem/WdMenuItem.dart`
- グラデ根拠: `DesignSystem/colors_and_type.css`

## 現状仕様の要点（`UniverseMenuSheet.dart` より）

- `Get.bottomSheet`、地 `#1A1A1A`、上部のみ `r16`。上端に `36×4` グラブハンドル（`#666`）
- 項目 2 つ（破壊的色 `#FF4444`）:
  - 「ログアウト」`Icons.logout` → 確認ダイアログ → `MainController.handleLogout()`
  - 「アカウントを削除」`Icons.delete_forever` → 確認ダイアログ → `FirebaseAuth.currentUser.delete()`
- 下部 `SafeArea.bottom + 16` の余白
- 確認ダイアログ: 地 `#1A1A1A` / title `#FFFFFF 18` / 本文 `#999999 14` / 破壊アクション `#FF4444`

## 直すべき逸脱（→ デザインで Before/After 提示）

- **Material アイコン直書き**（`Icons.logout` / `Icons.delete_forever`）はシステム外 →
  `IconImage` 白 PNG（logout=`leave` / delete=`delete` variant）へ置換
- **場当たりのグレー**（`#1A1A1A` / `#666` / `#999` / `#FF4444`）が散在 → 役割トークンへ:
  - シート地 `--surface-raised` (`#16131f`) / モーダル背景 `--scrim-strong` (`rgba(0,0,0,.80)`)
  - グラブハンドル `--gray-mid` (`#808080`) / 破壊的項目・破壊アクション `--state-error` (`#FF6B6B`)
  - ダイアログ本文 `--text-2` (`rgba(255,255,255,.78)`)
- **項目スタイルを `WdMenuItem` に統一**: 下線 `#333` ヘアライン / Noto Sans JP / 左 `IconImage` 28px + gap16

## Claude Design に貼るプロンプト

```
Universe の UniverseMenuSheet（自分プロフィール時に右上 menu から開く bottomSheet）の
デザインを、デザインシステムの specimen として作って。土台は USAGE_RULES.md と taste.md。
新規発明はせず、既存の Wd* とトークン（colors_and_type.css）を使うこと。

実コード（本 HANDOFF.md）と デザイン基盤（USAGE_RULES / taste / colors_and_type.css /
preview / icons）は repo univbrofd/toopdbq-design（branch: main）から取得して。
本書の「参照ファイル」と「直すべき逸脱」に従い、現状実装の改善案を Before/After で示すこと。

世界観は厳守: ダーク＋ガラス、Noto Sans JP、絵文字なし、効果は 1 コンポーネント 1〜2 個。

【仕様】
- bottomSheet（上部のみ r16）、上端に 36×4 のグラブハンドル
- 項目 2 つ: 「ログアウト」(leave icon) / 「アカウントを削除」(delete icon)、どちらも破壊的色
- 項目は WdMenuItem に揃える（下線 #333 / Noto Sans JP / IconImage 28px + gap16）
- 下部は SafeArea inset 分の余白
- タップで確認ダイアログ（ログアウト / アカウント削除）へ。ダイアログも同トーンで Before/After に含める

最終はダウンロード可能な HTML（既存 preview/comp-*.html と同じ specimen カード形式、
../colors_and_type.css を link）で出力。ファイル名は comp-menu-sheet.html。
```

## 取り込み（DL 後）

`/design {URL}` 取り込み → `DesignSystem/preview/` + `_ds_manifest.json` superset reconcile →
`univbrofd/toopdbq-design` `main` push

1. `comp-menu-sheet.html` を `DesignSystem/preview/` へ配置
2. `_ds_manifest.json` のカード一覧に `"preview/comp-menu-sheet.html"` を追記
3. specimen を確認後、`UniverseMenuSheet.dart` をデザインに合わせて実装更新（IconImage 化・トークン化）。検証は別 repo のアプリ側 skill が ephemeral に行う
