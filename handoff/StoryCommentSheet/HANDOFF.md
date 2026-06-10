# HANDOFF — コメント/タイムライン シート族 ＋ ライト面の導入（Claude Design 用）

Claude Design に**作らせる**ための逆ハンドオフ。Claude Design のセッションにこの 1 枚（と raw 索引）を添付する。
StoryViewer から開く**コメントシート（ライト）**を新設し、既存の **CircleTimelineSheet（ダーク）**と
**相互に関係づく sheet 族**としてデザインシステムへ取り込む。あわせて両者が共有する
**composer / テキストフィールド / 位置投稿（CircleTimelinePost）**のライト/ダーク整合を取る。

**原則: 実装が単一の正。** specimen は実装を写す鏡。現状実装の値を出発点にし、改善は taste.md の引き算で。
**世界観は不変**（ダーク＋カラフル放射グラデ＋ガラス＋写真フルブリード／Noto Sans JP・Inter／絵文字なし／効果は 1 コンポーネント 1〜2 個）。
ライト面は USAGE_RULES §5 が認める**例外（ローダー/ダイアログ等）の拡張**であり、唯一のアクセント（colorful gradient）は据え置く。

## repo / branch / raw base

- repo: `univbrofd/toopdbq-design`、branch: **`main`**
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引: `DesignSystem/_ds_manifest.json`（cards / tokens / fonts の芋づる索引）

---

## A. デザインシステム現状監査（何があり・何が無いか）

**ある:**
- 役割トークン一式（**ダーク基調**）: `--surface` / `--surface-raised` / `--surface-input(#2B2B2B)` / `--text-1/2/3` / `--scrim*` / `--primary(=colorful)` 等（`DesignSystem/colors_and_type.css`）
- ダークの sheet specimen: `DesignSystem/preview/comp-circle-footer.html`（登録済）、`DesignSystem/preview/comp-menu-sheet.html`、`DesignSystem/preview/comp-story-side-tool.html`
- 入力: `DesignSystem/preview/comp-textfield.html`（地 `#7F7F7F`）

**足りていない / 乖離（=今回の対象）:**
1. **ライト面のロールトークンが無い。** ライト用は `--ink-1/2/3`（#000/#333/#999、用途「ローダー/ダイアログ」）の 3 色のみ。
   フロスト白 surface・薄ヘアライン・薄入力地・ink 本文階調が無く、ライトシートは**場当たり hex** になる。
2. **StoryCommentSheet の specimen が DS に無い**（実装は存在＝後述）。
3. **comp-circle-timeline.html が DS 本体に未登録。** `handoff/CircleFooterTimeline/` にはあるが `DesignSystem/preview/` ＋ `DesignSystem/_ds_manifest.json`
   に入っていない。さらに `ui_kits/app/CircleTimelineSheet.jsx` は**旧デザイン（地図プレビュー＋3列グリッド＋「ポストする」CTA）**で、
   現行の **feed＋composer** 実装と乖離（古い。正は HANDOFF が design 上の正）。
4. **テキストフィールドの AA 不合格。** 入力地 `#7F7F7F` は白文字 4.0:1 で USAGE_RULES 不合格（地は `#2B2B2B`）。**ライト variant も未定義。**
   さらに timeline/comment の composer は `WdTextField` を使わず**生 TextField** を pill 化しており二重実装（統一余地）。
5. **位置投稿（CircleTimelinePost）の specimen が無い。** text＋任意 1 画像＋ポスト CTA の compose 画面（footer の edit/camera 経路）。

---

## B. 作ってほしいもの（成果物）

すべて DS 語彙で。新規発明はせず、既存トークン＋下記の**新規ライトトークン提案**を使う。各 specimen 先頭に
`<!-- @dsCard group="..." name="..." subtitle="..." -->` を付け、`DesignSystem/_ds_manifest.json` の `cards` に登録。

### B-1. ライトロールトークンの提案（最優先・土台）
`colors_and_type.css` へ**追記する形**で、既存役割トークンの命名流儀に沿って提案する（値は AA を満たすこと）:
- `--surface-light` — フロスト白の面（**AA のため ~94% 白**。現行実装の 70%=`0xB3FFFFFF` はミルクく不可。taste batch B「地白94%」準拠）
- `--surface-light-elevated` / `--surface-input-light` — 入力地のライト版（黒文字 AA）
- `--border-light-hairline` — ライト面の 1px ヘアライン（薄黒）
- `--on-light-1/2/3` — ライト面の本文階調（#111 / 黒~72% / 黒~45%。`--ink-1/2/3` を本文用に整理 or 追加）
- `--scrim-light` 等、必要なら最小限
制約: ダーク世界観は不変／アクセントは colorful gradient のみ据え置き／命名は `--text-*` `--surface-*` に倣う。

### B-2. `comp-story-comment.html` — StoryCommentSheet（**ライト**・新規）
- 状態: `default`（コメント時系列）/ `empty` / `入力中(KB)` を 1 枚で。
- **コメント＝テキスト専用**: 画像投稿フレームを描かない・composer に画像添付ボタンを置かない。
- 構文は CircleTimeline と同じ（grab handle → header → feed → 下端 composer）だが面が**ライト**。
- 出発点スケッチ: `handoff/StoryCommentSheet/comp-story-comment.html`（**トークン未使用の hex 直書き＝要トークン化**）。これを B-1 のトークンへ置換して仕上げる。

### B-3. `comp-circle-timeline.html` — CircleTimelineSheet（**ダーク**・DS へ登録）
- 既存 `handoff/CircleFooterTimeline/comp-circle-timeline.html`（feed＋composer・3 段スナップ）を**正**として `preview/` へ取り込み、manifest 登録。
- 旧 `ui_kits/app/CircleTimelineSheet.jsx`（地図＋グリッド＋CTA）は破棄方向。**現行実装が正**。

### B-4. `comp-composer.html` — 共有 composer（**relationship の背骨**）
- 下端 composer（返信先チップ＋自分アバター 34＋丸入力欄 42＋送信 42）を **dark / light の 2 面**で並べる。
- 送信: 活性＝`--gradient-colorful`＋glow、非活性＝面なグレー。dark↔light で**同一ジオメトリ・同一アクセント**を示す。
- これが「StoryCommentSheet ↔ CircleTimelineSheet」の共有点。

### B-5. `comp-textfield.html` — 更新（AA 修正 ＋ ライト variant）
- ダーク入力地を `#7F7F7F` → **`--surface-input`(#2B2B2B)** へ是正（AA）。
- **ライト variant** を追加（`--surface-input-light`／黒文字 AA）。`roundedWithButton`（near 送信ボタン付き）の dark/light を両方。

### B-6. `comp-circle-timeline-post.html` — 位置投稿 / CircleTimelinePost（**ダーク**・新規）
- compose 画面: ナビヘッダ「ポストする」＋本文 textfield ＋**任意 1 画像**サムネ＋削除。`canPost`（本文非空 or 画像あり）で CTA 活性。
- composer/textfield の文法を流用していることを示す（族の compose 親玉）。**コメントとの差**＝こちらは画像 1 枚可。

---

## C. 相互関係（sheet family マップ）

```
            ┌─ feed ─────────────┬─ composer ───┬─ surface ─┐
CircleTimelineSheet  text+image 混在   下端固定        DARK glass
StoryCommentSheet    text のみ          下端固定        LIGHT frost   ← 新規
            └────────────────────┴──────────────┴───────────┘
shared parts: composer / WdTextField / 返信先チップ / 送信(gradient) / WdUserComment 行 / grab handle / close(WdIconButton)
compose 親玉: CircleTimelinePost（位置投稿: text + 任意1画像）
```
- **同一構文・面色だけ反転**が設計の肝（dark↔light）。共有 part は `comp-composer` / `comp-textfield` に集約し、両シートから参照する関係にする。
- specimen 同士は subtitle で相互言及（例: light 側に「dark 姉妹=CircleTimelineSheet」）。

---

## D. 逸脱表（design 上の値が正）

実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF が design 上の正）:

| コンポーネント | 実装ファイル | 現状 | 直し |
|---|---|---|---|
| StoryCommentSheet | `lib/component/ui/modal/StoryComment/StoryCommentSheetView.dart` | 高さ311固定・`0xB3FFFFFF`(白70%)・handle/件数ヘッダ無し | 白~94%(AA)・handle＋header(件数/close)・composer 化 |
| 〃 body | `lib/component/ui/view/WdStoryComment/WdStoryComment.dart` | list＋`WdTextField(roundedWithButton)` | 行タイポ(名前太字/本文`--on-light-2`/time)・composer 分離 |
| comment 行 | `lib/component/ui/view/WdUserComment/WdUserComment.dart` | `small4lineBlack`（ライト行・既存） | 名前=主役・本文=2階調・time=3階調 |
| 入力 | `lib/component/ui/widget/WdTextField/WdTextField.dart` | 地 `#7F7F7F`(AA不可)・ライト無し | `#2B2B2B`＋ライト variant |
| Timeline sheet | `lib/component/ui/modal/CircleTimeline/CircleTimelineSheetView.dart` / `WdCircleTimeline.dart` | feed＋下端composer（生TextField pill） | 正。composer を共有 part 化 |
| 位置投稿 | `lib/feature/CircleTimelinePost/CircleTimelinePostView.dart` ＋ `Controller` | text＋任意1画像＋「ポストする」 | 正。specimen 起こし |

---

## E. 参照ファイル（全て raw base からの相対パス）

デザイン基盤:
- `DesignSystem/_ds_manifest.json` / `colors_and_type.css` / `USAGE_RULES.md` / `taste.md`
- `DesignSystem/preview/components.css` / `comp-circle-footer.html` / `comp-textfield.html`

ダーク姉妹（feed＋composer・正）:
- `handoff/CircleFooterTimeline/comp-circle-timeline.html` / `comp-circle-timeline-motion.html` / `sheet-render.js` / `HANDOFF.md`

ライト出発点スケッチ（要トークン化）:
- `handoff/StoryCommentSheet/comp-story-comment.html`

実装側の対応箇所（別 repo `univbrofd/toopdbq`・参考。HANDOFF が design 上の正）:
- StoryComment: `lib/component/ui/modal/StoryComment/StoryCommentSheetView.dart` / `StoryCommentController.dart` / `lib/component/ui/view/WdStoryComment/WdStoryComment.dart` / `WdUserComment/WdUserComment.dart`
- 入力: `lib/component/ui/widget/WdTextField/WdTextField.dart`
- Timeline: `lib/component/ui/modal/CircleTimeline/CircleTimelineSheetView.dart` / `lib/component/ui/view/WdCircleTimeline/WdCircleTimeline.dart`
- 位置投稿: `lib/feature/CircleTimelinePost/CircleTimelinePostView.dart` / `CircleTimelinePostController.dart`

---

## F. Claude Design に貼るプロンプト

```
Toopdbq DS を正として、コメント/タイムラインの sheet 族を整える。
索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/StoryCommentSheet/HANDOFF.md

土台は USAGE_RULES.md → taste.md → colors_and_type.css。新規発明せず既存 Wd*/トークンを使う。
世界観厳守（ダーク＋カラフル放射グラデ＋ガラス＋写真／Noto Sans JP・Inter／絵文字なし／効果1〜2個）。

作るもの:
1. ライトロールトークン提案（colors_and_type.css 追記形）: --surface-light(~94% AA) /
   --surface-input-light / --border-light-hairline / --on-light-1/2/3 等。アクセントは colorful gradient 据え置き。
2. comp-story-comment.html（StoryCommentSheet・ライト）: default/empty/入力中(KB)。コメント=テキスト専用
   （画像投稿/表示なし、composer に画像添付なし）。出発点= handoff/StoryCommentSheet/comp-story-comment.html をトークン化。
3. comp-circle-timeline.html（ダーク）: handoff/CircleFooterTimeline 版を正に DS 登録。旧 jsx は破棄方向。
4. comp-composer.html: 下端 composer を dark/light 2面（avatar34/field42/send42、送信=gradient）。族の共有点。
5. comp-textfield.html 更新: 地 #7F7F7F→#2B2B2B(AA) ＋ ライト variant。
6. comp-circle-timeline-post.html（位置投稿・ダーク）: text＋任意1画像＋ポストCTA。composer/textfield 文法を流用。

dark↔light は「同一構文・面だけ反転」。共有 part(composer/textfield)を両シートから参照する関係にし、
各 specimen 先頭に @dsCard を付け _ds_manifest.json に登録。最終はダウンロード可能な bundle で出力。
```

---

## G. 取り込み（Claude Design が出した後）

`/design {URL}` 取り込み → `DesignSystem/preview/` + `_ds_manifest.json` superset reconcile
（Claude 側の新規カードを `DesignSystem/preview/` へ、`_ds_manifest.json` を superset マージ、
提案ライトトークンを `DesignSystem/colors_and_type.css` へ取り込み）
→ `univbrofd/toopdbq-design` `main` push。以後コードは実装が正として specimen を保守。
