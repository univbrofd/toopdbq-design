# WdStorySideTool — handoff

StoryViewer 右端の縦アクションレール（like / comment / share）。

## 中身

- `comp-story-side-tool.html` — specimen カード（Claude Design 由来）。css / アイコンは複製せず共有 `../../DesignSystem/` を参照する。

正本の DS カードは `../../DesignSystem/preview/comp-story-side-tool.html`（manifest 登録済み・Claude Design が pull する対象）。本フォルダのコピーは由来記録と比較用。

## 由来

Claude Design project `toopdbq-design-system`（bundle `7k9lf9-o9ELIRlHov4m4_g`）。
逆ハンドオフ `design/story-side-tool` ブランチの HANDOFF.md を起点に Claude Design が作成。

## 実装の着地

- StoryViewer 右端レール → `lib/feature/StoryViewer/WdStorySideTool.dart`
- 比較画像 → `../../preview/WdStorySideTool.png`
