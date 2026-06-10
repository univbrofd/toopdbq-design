# Toopdbq Design System

Toopdbq（地理コミュニティ型ソーシャルアプリ）のデザインの**単一ソース**。純 HTML/CSS で、Flutter の概念は持たない。Claude Design が接続するのはこの repo のみ。アプリ実装（別 repo `univbrofd/toopdbq`）は `/design` スキルがこの repo を読んで具現化する。

- public repo・raw リンクで直接取得可（認証不要）
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`

## 索引（最初にこれを読む）

`DesignSystem/_ds_manifest.json` がフォルダ全体の索引（`cards` / `globalCssPaths` / `tokens` / `fonts`）。ここから芋づる式に全ファイルを raw 取得できる。

- raw: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json`

## トップ階層

- `DesignSystem/` — トークンと美学の一次情報。`colors_and_type.css`（役割トークン・**色の canonical**）/ `taste.md` / `USAGE_RULES.md` / `preview/`（コンポーネント specimen `comp-*.html` ＋カテゴリ束ね `batch*-*.html`）/ `ui_kits/app/`（画面組み上げ）/ `_ds_manifest.json`（索引）。
- `handoff/{View}/` — 1 View = 1 自己完結フォルダ。`HANDOFF.md`（デザイン要求＝この repo 内で完結する spec）＋ specimen HTML（`comp-*.html` / `clean.html`）＋ `card.css` / `components.css` / `assets/`。
- `preview/` — design↔flutter の比較合成 PNG（`{View}.png`）。アプリ側スキルが出力する成果物。

## 原則

- **specimen = この repo 内の正**。設計値（色・余白・角丸・タイポ・状態）は HANDOFF.md と specimen に値で固定する（外部 fetch リンクに依存しない）。
- 色は `DesignSystem/colors_and_type.css` の役割トークンを使う（Flutter 側 `FigmaColors.dart` がこれを鏡写しする）。新規発明・specimen に無い組み上げはしない。
- スマホ前提（モバイルファースト）: 393×852 + SafeArea。画面ものは `card.css` の `.phone` 枠に実配置で描く。
