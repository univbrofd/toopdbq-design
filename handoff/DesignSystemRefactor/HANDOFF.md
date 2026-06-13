# HANDOFF — DesignSystemRefactor（責務分離: Foundation / Components / Screens の3層化）

- repo: `univbrofd/toopdbq-design`（branch `main`）
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引（全カード）: `DesignSystem/_ds_manifest.json`
- 美学・規約: `DesignSystem/taste.md` / `DesignSystem/USAGE_RULES.md` / `DesignSystem/colors_and_type.css`（色の単一の正）

## 狙い

design system が**画面まで抱えて肥大**している。foundation＋再利用部品だけを canonical な「システム」とし、画面は「システムを**消費する**合成物」として切り離す。種類を減らすのではなく、**いま 1 つの `preview/` に混ざっている 2 つの責務を分ける**。

## 3 層モデル

| 層 | 中身 | 性質 | lib/ 対応（参考・別 repo `univbrofd/toopdbq`） |
|---|---|---|---|
| **Foundation** | Colors / Type / Spacing / Brand（icons・imagery・logo） | 安定・全層が従う・トークンは canonical | `component/ui/resource` |
| **Components** | Wd* atoms ＋ **複数画面で実際に再利用される** molecule のみ | 安定・再利用される契約 | `component/ui/{widget,view}` |
| **Screens** | フル画面・シート・フロー合成 | 製品判断で頻繁に変わる・**システムではない** | `feature/` `userstory/` |

## 誤分類の是正（Components → Screens へ移す）

現状 `Components` グループに紛れている画面・シート・ビューの合成物を Screens へ移す:

- `comp-chat-list`（ChatListView inbox）→ **Screen**
- `comp-15-menu-sheet`（UniverseMenuSheet）→ **Screen**
- `comp-16-story-comment-sheet`（StoryCommentSheet）→ **Screen**
- `comp-terrestrial-stage`（ThreeDTerrestrialView）→ **Screen**
- `comp-universe-3d-overlay` / `comp-universe-flow` / `comp-universe-focus` / `comp-universe-screen` → **Screen** 確定（`comp-` 接頭辞をやめる）
- `comp-chat-row`（ChatList row）→ chat 専用なら ChatList screen に内包。汎用 row は `comp-09-rows` が持つ

**残す true components**（Wd* 再利用ウィジェット）: `comp-01-text-button` / `comp-02-icon-buttons` / `comp-03-action-buttons` / `comp-04-login-buttons` / `comp-05-text-field` / `comp-06-toggle` / `comp-07-stats` / `comp-08-avatar` / `comp-09-rows` / `comp-10-circle-bar` / `comp-11-cards` / `comp-12-header` / `comp-13-circle-footer` / `comp-14-story-side-tool`。

判定ルール: **Wd* で複数画面が使う = Component。単一画面/シート/ビューの合成物 = Screen。**

## Screen を純粋な consumer にする規律

1. 画面内で**色 / type / spacing / radius / shadow を再定義しない**。必ず `colors_and_type.css` のトークン・役割名を参照する。
2. button / avatar / row / header 等を**画面内で再実装しない**。Components 層のマークアップ／クラス（`components.css`）を再利用する。
3. **1 画面でしか使われない部品は Component に昇格させない**（その画面内に留める）。複数画面で再利用される実体があるものだけ Component。
4. ハードコードのグレー・Material アイコン直書き・場当たり値を洗い出し、**役割トークン**へ寄せる。

## manifest の出力要件

- 各 card に `tier: foundation | component | screen` を付与。
- 「システム索引」= foundation＋component の **lean な集合**（~25 枚）。screen は別 tier として列挙し、タスク時は索引から外せるようにする。
- `globalCssPaths` / `tokens` / `fonts` は現状維持。

## 成果物

1. 是正後の `_ds_manifest.json`（tier 付与・再分類反映）。
2. 各 Screen specimen を上記 consumer 規律に沿って refactor。
3. **違反箇所のリスト**（どの screen が何のトークン／部品を再定義・再実装していたか）と、**移動したカードの一覧**を返す。
4. Foundation / Components は既に canonical なので変更は最小限に留める。

## スマホ前提

Toopdbq はスマホアプリ（393×852 + SafeArea）。Screen specimen は `preview/card.css` の `.phone` 枠に実配置で描く前提を維持する。
