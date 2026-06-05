# 逆ハンドオフ — UniverseMenuSheet（コード → Claude Design）

実装済みの `UniverseMenuSheet`（サイドメニュー bottomSheet）を **デザインシステムの specimen** として
起こすための、コード→デザインのハンドオフ。Claude Design は git から各ファイルを直接取得できるため、
本書はファイル本文を埋め込まず **リポジトリ上のパス（branch 固定リンク）** を参照する。

## リポジトリ / 取得方法

- repo: `https://github.com/univbrofd/toopdbq`
- branch: `design/menusheet-handoff`
- raw 取得: `https://raw.githubusercontent.com/univbrofd/toopdbq/design/menusheet-handoff/<path>`
- blob 閲覧: `https://github.com/univbrofd/toopdbq/blob/design/menusheet-handoff/<path>`

## 成果物 / 保存先

- 形式: 既存 `lib-design/DesignSystem/preview/comp-*.html` と同じ specimen カード（`../colors_and_type.css` を link）
- ファイル名: **`comp-menu-sheet.html`**
- 配置: `lib-design/DesignSystem/preview/comp-menu-sheet.html`
- 登録: `lib-design/DesignSystem/_ds_manifest.json` のカード一覧に 1 行追記

## 参照ファイル

### A. git から取得（tracked、branch 固定リンク）

| 役割 | path |
|---|---|
| 改善対象（現状実装） | `lib/feature/Universe/widgets/UniverseMenuSheet.dart` |
| システム整合の正解形 | `lib/component/ui/widget/WdMenuItem/WdMenuItem.dart` |
| グラデ根拠 | `lib/component/ui/resource/FigmaColors/FigmaColors.dart` |
| この逆ハンドオフ | `lib-design/Universe/UniverseMenuSheet/HANDOFF.md`（force-add 済み） |

### B. Claude Design 側スキルに既存（git には無い = `lib-design/` は .gitignore）

`toopdbq-design` スキルが保有。git fetch 不要、スキル内のファイルをそのまま使う:

- `USAGE_RULES.md` / `taste.md` / `README.md` — 使用ルール・美学・概要
- `colors_and_type.css` — トークン（唯一の正）
- `preview/batchF-misc.html` — MenuItem の Before/After 参照
- `preview/comp-circle-bar.html` — specimen カードの雛形
- `assets/icons/icon_leave.png` / `icon_delete.png` — アイコン PNG

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

実コード（lib/ 配下と本 HANDOFF.md）は git から取得して（branch: design/menusheet-handoff）。
デザイン基盤（USAGE_RULES / taste / colors_and_type.css / preview / icons）は git に無いので
toopdbq-design スキル自身のファイルを使う。本書の「参照ファイル」と「直すべき逸脱」に従い、
現状実装の改善案を Before/After で示すこと。

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

1. `comp-menu-sheet.html` を `lib-design/DesignSystem/preview/` へ配置
2. `_ds_manifest.json` のカード一覧に `"preview/comp-menu-sheet.html"` を追記
3. specimen を確認後、`UniverseMenuSheet.dart` をデザインに合わせて実装更新（IconImage 化・トークン化）
