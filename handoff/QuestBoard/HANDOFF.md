# HANDOFF — QuestBoard（クエスト看板）を DS コンポーネント化

repo: `univbrofd/toopdbq-design`（branch `main`）
raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
DS 索引: `DesignSystem/_ds_manifest.json` → foundation は `DesignSystem/colors_and_type.css` / `DesignSystem/styles.css` / `DesignSystem/USAGE_RULES.md` / `DesignSystem/taste.md` / `DesignSystem/preview/components.css` / `DesignSystem/preview/card.css`

## 何を作るか

**クエスト看板（QuestBoard）を DS の正式コンポーネントとして起こす。**

- 成果物: `DesignSystem/preview/comp-quest-board.html`（1 ファイル・全状態を並べた specimen）
- `_ds_manifest.json` の `cards` に登録（`group: "Components"` / `name: "QuestBoard"` / `viewport: "440x1180"` / `subtitle` に glass 判定を明記）
- 参照は design repo 内のみ（アイコンは共有 `assets/icons/`、写真は `assets/sample/`）。per-View に asset を複製しない
- 既存の画面 specimen `handoff/UniverseQuest/UniverseQuest.html` の `.strip-board` が as-built。**この HANDOFF は as-built を DS 品質へ引き上げるのが目的**なので、comp カードを正とし、UniverseQuest 側は後追い同期でよい

## これは何か（プロダクト文脈）

サークルが 1 件だけ「お題（クエスト）」を出す。ユーザーはサークルのエリア内で投稿して提出し、達成するまで他人の投稿はロック（blur）されたまま。看板はそのお題の掲示物であり、**未達成のときは「提出フローを起動する主 CTA」そのもの**（看板全面がタップ領域）。

## 配置文脈（スマホ・必須）

- 画面 402×874（iPhone 17・`preview/card.css` の `.phone`）。看板は単体では存在せず **QuestFeedSheet の中**にある
- シート: 画面下端に固定・**白ベタ・角丸なし・grip なし**、高さ = 画面高 × 548/874（= 548px）
- シート内は縦スナップでサークル切替。1 セクション = シート高 × 0.8（= 438px）、セクション間 8px の白ギャップ、次サークルが 20% peek
- セクション内は横スワイプの投稿レール（**9:16 の写真/動画セル**、セル幅 = セクション高 × 9/16）。**看板はこのレールの上に重なる**
- 看板の枠: `left: 14 / right: 14`（= 幅 374）
  - **未クリア** → セクションの**縦中央**（写真の真ん中に被る）
  - **クリア済み** → 下端 `bottom: 12` に tuck（350ms `ease-out-cubic` で移動）
- タップ範囲: 看板全面（未クリア＝提出フロー起動 / クリア済み＝タップ無効）。オーナーのみ右上寄りに編集アイコン

## as-built の実値（これを起点に。値は実装から捕捉済み）

面・枠
- radius 20 / padding `12px 16px 11px`
- 背景: `linear-gradient(120deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.38) 70%)` + `var(--lg-tint)` + backdrop `blur(var(--lg-blur)) saturate(var(--lg-saturate))`、内縁スペキュラ上下 + `var(--lg-shadow)`
- 縁 1.5px グラデ: 未クリア `var(--gradient-colorful-linear)`（135deg） / クリア済み `linear-gradient(135deg,#4be3b0,#3fd0e0)`
- 未クリアのみパルス: 2.2s `var(--ease-out)` 無限、外側リング `0 0 0 0 rgba(255,62,136,.42)` → `0 0 0 16px rgba(255,62,136,0)`
- 押下: `scale(.97)`

行 1（eyebrow）
- ドット 5px `#ff3e88` + `0 0 7px` グロー、opacity 1 → .3(60%) → 1 の 2.2s パルス（クリア済みは `#4be3b0`・パルス無し）
- ラベル: Inter 700 / 9px / `letter-spacing .14em` / `rgba(255,255,255,.66)`、文言 `QUEST` → クリア済み `QUEST CLEARED`
- 編集アイコン（オーナーのみ）: `assets/icons/icon_edit.png` 12px・opacity .8
- 日時 pill（右寄せ・`start` があるときだけ）: bg `rgba(255,255,255,.09)` / padding `3px 10px` / `--radius-pill` / `assets/icons/icon_pin_location.png` 10px opacity .8 / Inter 600 10px `.04em` `rgba(255,255,255,.85)`。文言例 `8/2 (土) 18:00–22:00`

本文
- タイトル: Noto Sans JP 700 / 15px / `#fff` / `text-shadow 0 0 8px #000` / **1 行省略**（margin-top 6）。例「とぅーぷどぅっくバーで乾杯」
- 説明: Noto Sans JP 500 / **10.5px** / line-height 1.5 / `var(--text-2)` / **2 行 clamp**（margin-top 2）。例「乾杯している動画をアップロードするとクリア」
- クリア済みの説明は固定文言「クリア済み · このクエストの投稿が解錠されています」
- 未クリアは右下のカメラアイコンぶん右に 26px 空ける

フッタ
- 投稿 dots（margin-top 8・中央）: 5px 円 `rgba(255,255,255,.28)`、アクティブは 14×5 の pill `#fff`、250ms `ease-in-out`。**0 件 or 12 件超では非表示**（無限レールで溢れるため）
- カメラアイコン（未クリアのみ・装飾扱い / `pointer-events: none`）: `assets/icons/icon_camera.png` 16px・opacity .85・`drop-shadow(0 1px 2px rgba(0,0,0,.6))`、右下

兄弟状態（同じ枠に出る別物）
- **クエスト未設定 + オーナー** → 看板ではなく作成 pill を `bottom: 12` に中央表示: padding `9px 16px` / `--radius-pill` / bg `rgba(255,255,255,.09)` / border 1px `rgba(255,255,255,.16)` / Noto Sans JP 700 12.5px `#fff` / 文言「＋ クエストを出題」
- クエスト未設定 + 非オーナー → 看板なし。レール空文言「このサークルにはまだクエストがありません」（Noto Sans JP 500 12px 白 55%）

## specimen に必ず並べる状態

1. active（未クリア・日時あり・投稿 5 件・中央 index）
2. active + owner（編集アイコンあり）
3. cleared（下端 tuck・teal 縁・カメラ無し）
4. 日時 pill なし（`start` が null）
5. タイトル 1 行省略 / 説明 2 行 clamp の限界ケース（長文）
6. 投稿 0 件（dots 無し）/ 13 件（dots 打ち切り）
7. クエスト未設定 + オーナー（作成 pill）
8. **no-blur 版**（下記の実装制約。blur なしでも同じ見えになるフォールバック面）

さらに **実配置プレビュー 1 枚**: `.phone` 枠に「白シート + 9:16 の写真レール（`assets/sample/reel/` を使用）+ 看板」を、未クリア＝中央 / クリア済み＝下端 tuck の 2 パターンで描く。

## 直してほしい DS 逸脱（as-built の課題）

- **本文 10.5px が DS 下限 11px 割れ**（`USAGE_RULES.md` §2「本文最小 11px」）。説明文の情報量（2 行）を保ったまま 11px 以上へ。看板高が伸びるならレールとの被り量も併せて設計
- **eyebrow ラベル 66%** は `--text-2`(78%) 未満。トラッキング付き 9px なので可読性の再設計が要る（サイズ / 不透明度 / 役割トークン）
- **生 hex 直書き**: `#ff3e88` は `--state-like` と同値だが役割が違う（ここは「未達成のアクティブ告知」）。`#4be3b0 → #3fd0e0` の cleared teal は **DS にトークンが無い**。役割トークン（例 `--state-quest-active` / `--state-quest-cleared`）を新設するか、既存 `--state-success` へ寄せるかを判断して `colors_and_type.css` へ提案として書き足してほしい
- **編集アイコンのタップ範囲が 12px** で最小 44pt を大きく割る。看板全面が別アクション（提出）なので、誤タップしない置き方ごと再設計
- **カメラアイコンの意味が曖昧**（装飾に見えるが実際は「撮って提出」の唯一の示唆）。未クリア看板が CTA であることが一目で分かる形に
- **明るい写真の上に乗る chrome** なのに `--lg-tint`（白 6%）。`USAGE_RULES.md` の「明るいコンテンツ上の chrome は `--lg-tint-dark`」と `--scrim-min`（黒 45%）に照らして、白背景シート＋明るい写真の両方でコントラストが立つ面を決めてほしい
- **ガラス形状の予算**: このシートは白ベタ面（非ガラス）+ 看板 1 枚。看板をガラスとして数えるかを `glass: yes/no(perf)` chip で明記

## 実装制約（デザインの前提として必ず織り込む）

- 看板は **WebView（platform view）の上**に重なる。この上では **backdrop blur が使えない**ため、実装は不透明近似に落ちている（`120deg` の `rgba(27,27,32,.96) → rgba(18,18,22,.96)`）。**blur あり / なしの両方で破綻しない**面を設計し、no-blur 版も specimen に出すこと
- 説明・タイトルは可変長（ユーザー入力）。日時・投稿数・オーナー権限は有無が変わる。**どの組み合わせでも高さが破綻しない**こと
- 実装は Flutter（別 repo `univbrofd/toopdbq`・参考: `lib/component/ui/view/CircleFocus/QuestBoard.dart`）。CSS 固有の効果に寄りすぎず、単色 / グラデ / 影 / 不透明度で表現できる範囲に収める

## 参照（design repo 内）

- `DesignSystem/USAGE_RULES.md` — 役割トークン・コントラスト・Liquid Glass 予算
- `DesignSystem/taste.md` — 効果予算・世界観
- `DesignSystem/preview/components.css` の `.lg` — ガラス面の canonical レシピ（再発明禁止）
- `handoff/UniverseQuest/UniverseQuest.html` — as-built の画面 specimen（`.strip-board`）
- `assets/icons/icon_camera.png` / `icon_edit.png` / `icon_pin_location.png`、`assets/sample/reel/`
