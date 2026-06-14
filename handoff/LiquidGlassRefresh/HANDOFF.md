# HANDOFF — LiquidGlassRefresh（DS 全面リキッドグラス化＋大型デザインリファクタ）

- repo: `univbrofd/toopdbq-design`（main）/ raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引: `DesignSystem/_ds_manifest.json`（cards / tokens / fonts。ここから全 specimen を辿れる）
- foundation: `DesignSystem/USAGE_RULES.md` / `taste.md` / `colors_and_type.css` / `preview/card.css` / `preview/components.css`
- 共有アセット: `assets/icons/` `assets/sample/` `assets/images/`（per-View 複製禁止・相対参照）

## 目的

1. **Liquid Glass を DS の標準表面に**: iOS 26 系の屈折ガラス（実装は Flutter `liquid_glass_renderer`）を、これまでの「半透明黒＋blur2＋グラデ枠」ガラスの後継として全面採用する。
2. **脱・素人臭さの大型リファクタ**: トークン外グレー・不揃い角丸・散在 TextStyle・分散グラデ定義を一掃し、全カード・全画面を 1 つの洗練された質感に揃える。
3. comp-01〜16 全コンポーネントカード ＋ 主要 8 画面の specimen を刷新・新設する。

## Liquid Glass — 実装側の制約（デザインが守る性能予算）

実装は `liquid_glass_renderer 0.2.0-dev`（MIT・Impeller 専用 = iOS/Android/macOS。**Web では動かない**ので Web は従来ガラス fill `rgba(0,0,0,.51)` + blur 2px に自動フォールバック。デザインは両状態で破綻しないこと）。
調整可能パラメータ: thickness（屈折量）/ blur / glassColor / refractiveIndex / lightIntensity / saturation。

**性能予算（厳守）** — ガラス1層ごとに背景テクスチャ生成が走るため:

- glass は**再描画の少ない chrome 限定**: ナビヘッダー / フッターバー / サイドレール / シート面 / 単発ボタン。
- **リスト・グリッドのセル単位には適用禁止**: チャット行・コメント行・タイムラインフィード・サークルグリッド・リール/プレイリストのセル。セルは従来の面（--surface-raised / scrim）で設計する。
- **毎フレーム動く層にも禁止**: StoryViewer の Ken Burns ズーム層・PageView のページ内部・3D 地球に連動して動くピン群。
- 1 画面のガラス形状は目安 **≤6**（シェイプのブレンドは技術上限 16）。シート面のような大面積は 1 枚で数える。
- 効果予算は taste.md の「1 コンポーネント 1〜2 効果」を維持。liquid glass は 1 効果として数える。

**specimen 用の近似 CSS（出発点。磨いて `--lg-*` トークンとして確定すること）**:

```css
.lg {
  background: rgba(255,255,255,.06);
  backdrop-filter: blur(14px) saturate(160%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.28),   /* 上縁スペキュラ */
              inset 0 -1px 0 rgba(255,255,255,.08),  /* 下縁の弱い反射 */
              0 8px 24px rgba(0,0,0,.45);
}
/* 縁の屈折は 1px の内側グラデ（既存 --gradient-border の後継）で近似 */
```

CSS レシピは 1 箇所（components.css）で canonical 化し、全カードがクラス参照する。カード毎の再発明はしない。

## 現行の表面イディオム（実装から捕捉した値）

- 旧ガラス: fill `rgba(0,0,0,.51)`（--glass-fill）+ backdrop-blur 2px（--blur-glass）+ 1px 斜めグラデ枠 `#211C1C → rgba(255,255,255,.64)`（--gradient-border）。WdIconButton（47/55px 円）・circle bar pill・CTA が使用。
- アクセント: --gradient-colorful（radial 135% 135% at 112% 108%・12色）。送信/投稿/CTA/未読の唯一のアクセント。
- 面: --bg `#08080b` / --surface-raised `#16131f` / --surface-input `#2b2b2b` / scrim `.45/.64/.80`。
- 進捗バー（StoryViewer ヘッダー）: 高さ 4px・track `rgba(255,255,255,.25)`・done `rgba(255,255,255,.64)`・pill。
- テキスト: 名前=hero（--text-1）/ 本文 --text-2 / 時刻 --text-3。Noto Sans JP + Inter + Pacifico（wordmark）。
- ナビヘッダー: 面なし・上から `rgba(0,0,0,.50)→0` の decay グラデのみ。

## 対象画面（8）と glass 適用マップ

各画面は iPhone 17 `.phone`（402×874・SafeArea 上62/下34）に**実配置の full-bleed specimen** として起こす。

| 画面 | 背景 | glass 化する chrome | 適用除外（理由） |
|---|---|---|---|
| 1. Splash | 写真 full-bleed（blur 32 + teal `rgba(25,134,121,.2)` overlay）＋ Pacifico ロゴ | （最小。ロゴプレートを glass にするか判断はデザイン側） | — |
| 2. Onboarding | 地図ステージ演出＋下部シーン解説パネル | 下部パネル（現状はグラデ scrim のみ→glass 面候補）・CTA・スキップ chip | bloom/pulse 等の常時アニメするマーカー群 |
| 3. Login(Auth) | 写真 full-bleed | ログインボタン 2 種（284×54・r8。現 gradient枠+ベイク面→glass 面+グラデ縁へ） | — |
| 4. UniverseView | 3D 地球（WebView） | 下端 circle footer バー・カメラ/編集ボタン・上部アイコンボタン・menu sheet 面 | サークル別プレイリストのセル（リール行）・3D 連動ピン |
| 5. StoryViewerView | 投稿写真 full-bleed | 進捗ヘッダーの面（任意）・右サイドレール（47px 円×3）・circle footer | 3層 PageView のページ内部・Ken Burns 層・コメント/いいね数の頻繁更新部はガラス内テキストのみ更新 |
| 6. StoryPostView | カメラ/編集画像 | ナビヘッダー・右サイドツール・カメラフッター・確認フッター | — |
| 7. CircleTimeline（sheet） | 下から 74% 高・r24 のシート | **シート面そのものを glass 1 枚**＋composer pill | フィードの行・画像セル（従来面のまま） |
| 8. StoryComment（sheet） | 同上 | シート面 glass 1 枚＋composer pill | コメント行 |

関連: CircleSelect / CircleEdit（グリッドセルは非 glass・編集フッターは glass 候補）、ChatList / ChatRoom（行は非 glass・入力バー pill `#2b2b2b` → glass 候補）。これらは comp カード（comp-09 / comp-16 / chat 系カード）の刷新で表現が決まれば screen specimen は必須ではない。

## 直すべき逸脱（実装監査より。リファクタの主対象）

1. **トークン外グレーの散在**: placeholder `#333333`・textfield `#7f7f7f`・avatar `#dddddd` 等が画面ごとにバラバラ → gray 系トークンへ集約し役割名を与える。
2. **角丸の混在**: pill が 99/100/9999 の3通り、カードが 8/12/14/16/18/22 → radius スケールを確定し全カードに適用。
3. **StoryComment シートだけライト面**（`#f6f7f9`・ink 系テキスト）で、DS のダークガラス（comp-16 = CircleTimelineSheet と同イディオム）と乖離 → Liquid Glass 刷新でどちらかに統一する決定を出す（DS 側はダーク前提）。
4. **Material アイコン直書き**が数カ所（image_outlined / close / check_circle）→ `assets/icons/` の実 PNG に統一。
5. **TextStyle の直書き散在** → type-headings / type-body の役割定義に紐づけ直す。
6. **colorful グラデの再発明**（toggle / circle bar が微妙に異なる実装）→ --gradient-colorful 系トークンの参照に一本化。

## 成果物（この順で）

1. **foundation**: `colors_and_type.css` に `--lg-*` トークン群（面・縁・blur・saturation・スペキュラ）を追加。`USAGE_RULES.md` / `taste.md` に「Liquid Glass の効果予算と適用可否基準（chrome のみ・リストセル禁止・≤6/画面）」を追記。
2. **components**: comp-01〜16 の全カードを liquid glass 仕様で刷新。各カードの eyebrow か注記に **`glass: yes / no(perf)`** を明記（例: comp-09 rows = no(perf)、comp-13 circle-footer = yes）。
3. **screens**: 上表 8 画面を `preview/screen-{name}.html`（group="Screens"）として full-bleed specimen で新設。Before/After が有効な画面（Onboarding 下部パネル・コメントシート）は Before/After 構成。
4. 全 specimen 先頭に `@dsCard`、`_ds_manifest.json` へ登録。最終はダウンロード可能な bundle で出力。

## スマホ前提（必須）

- iPhone 17 canonical: `.phone` 402×874・角丸55・Dynamic Island・statusbar 62 / home-indicator 34（`preview/card.css` 既定）。
- タップ範囲は最小 44pt。サイドレール 47px 円・フッターボタン 55px はこれを満たす現値を維持。
- 旧 393×852 が要る場合のみ `.phone-legacy`。

> 実装対応箇所（参考・別 repo `univbrofd/toopdbq`）: FigmaColors.dart（トークン鏡写し）/ WdIconButton / WdCircleFooter / WdStorySideTool / WdNavigationHeader / 各 feature View。Flutter 側の反映は /design スキルが本 HANDOFF と bundle から行う。
