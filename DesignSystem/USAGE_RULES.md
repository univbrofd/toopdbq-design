# Toopdbq デザイン使用ルール（実コンポーネント抽出）

このファイルは `univbrofd/toopdbq` の `lib/component/ui/` を直接読み取り、**新規デザインが必ず従うべき実トークン・実コンポーネント**を抽出したものです。世界観は「**地理的コミュニティ型ソーシャルメディア**」。暗い背景（フルブリードの写真・宇宙）の上に、ガラス質のコントロールとカラフルな放射グラデーションが乗ります。

> 原則: **既存にあるものを使う。発明しない。** Figma / コードに無いコンポーネント・色・フォントを新規に作らないこと。迷ったら省略するか、既存の `Wd*` を組み合わせる。

---

## 1. 命名規約（厳守）

- **ファイル名 = クラス名**、PascalCase。例: `WdLogin.dart` → `class WdLogin`。
- UI コンポーネントは **`Wd` プレフィックス**必須（`WdIconButton`, `WdTextButton`, `WdPostButton`, `WdCircleCard`, `WdUserBar` …）。
- `snake_case` 禁止。
- 配置: `lib/component/ui/{resource|widget|view}/Wd{Name}/Wd{Name}.dart`。複雑なものは同階層に `CLAUDE.md`。
- レスポンシブ: `Get.width` / `Get.height` を使用。基準フレーム **393 × 852**。固定サイズ直書き禁止、`SafeArea` 必須。

---

## 2. カラー & グラデーション（唯一の正）

**出典: `lib/component/ui/resource/FigmaColors/FigmaColors.dart`。色は必ず `Color(0xAARRGGBB)` 形式の自社定義で書く。`Colors.black` 等の Material 定数色は禁止。**

### 主要アクセント = カラフル放射グラデーション
ブランドの核。最重要アクションにのみ使う（post / 主要 CTA / アクティブな toggle / standartColor アイコン）。

- `FigmaColors.iconBackGradient` — 4 stop の楕円放射（`icon_back` style）。
  `#FFF0A6`(yellow) → `#005F67`(teal) → `#FF3E88`(pink) → `#D0A052`(golden)、stops `[0.0529, 0.4519, 0.7981, 1.0]`、center `Alignment(1.248, 1.142)`、radius `1.514`。
- `FigmaColors.colorfulRadialGradient` — 同 center/radius の **12 色展開版**（滑らかな遷移用）。
  CSS では `var(--gradient-colorful)`（`colors_and_type.css`）。
- 補間は **OkLAB**（Figma 準拠）。Flutter 実装は `WdTextButton._expandStopsOkLab()` 参照。勝手に sRGB 単純補間で色を作らない。

### ボーダー / 補助グラデーション
- `FigmaColors.gradientBorderDiagonal` — ガラス縁の 1px ヘアライン。`#211C1C` → `#FFFFFF @64%`（左上→右下）。**ほぼ全てのガラス面・カードの縁**に使う（フラットなグレー線は使わない）。
- `FigmaColors.iconTextButtonGradient` — `WdIconTextButton` 用 4 色リニア。
- `FigmaColors.rangeOnlineGradient` — `WdRange` online 用の緑系（`#4CAF50` → `#2E7D32`）。

### 面・ニュートラル
- ガラス面の既定 fill: `Color(0x82000000)`（黒 51%）+ `BackdropFilter(blur 2)`。
- スクリム: `0xA3000000`（64%, circle-bar）/ `0xCC000000`（80%, モーダル背景）。
- フィールド地: `#7F7F7F` / toggle OFF: `#7E7E7E` / トラック: `#444444` / アバター下地: `#333333`。
- 前景白の不透明度: `#FFF` 100% / 64%（縁・副次）/ 56%（プログレス）/ 40%（無効）。
- セマンティック: like `#FF3E88` / success `#4CAF50` / error `#FF6B6B`。アクセント purple `#8A38F5`。

全トークンの CSS 変数は `colors_and_type.css` を参照・import すること。

### Liquid Glass（DS の標準表面 — LiquidGlassRefresh で確定）

iOS 26 系の屈折リキッドガラスが「半透明黒＋blur2＋グラデ枠」の後継。実装は Flutter `liquid_glass_renderer`（**Impeller 専用** — Web は従来ガラス `rgba(0,0,0,.51)`+blur2 へ自動フォールバック。両状態で破綻しないこと）。

- **CSS 正本**: トークン `--lg-*`（`colors_and_type.css`）＋canonical レシピ `.lg`（`preview/components.css`）。**カード毎の再発明禁止** — 必ずこの2箇所を参照。
  `--lg-tint`(白6%) / `--lg-tint-strong`(シート面 白10%) / `--lg-blur`(14px) / `--lg-saturate`(160%) / `--lg-specular-top|bot`(上下縁スペキュラ) / `--lg-edge`(1px 屈折エッジ — `--gradient-border` の後継) / `--lg-shadow` / `--lg-fallback`。
- **適用可（chrome 限定）**: ナビヘッダー／フッターバー／サイドレール／シート面（全面で1枚）／単発ボタン／composer ピル。**明るいコンテンツ（地図・明写真）の上の chrome は `--lg-tint-dark`**（ダーク glassColor）で白文字 AA を確保。
- **適用禁止（性能予算）**: リスト・グリッドの**セル単位**（チャット行・コメント行・フィード・グリッド・リールのセル）、**毎フレーム動く層**（Ken Burns ズーム層・PageView ページ内部・3D 連動ピン群）。セルは従来の面（`--surface-raised` / scrim）で設計。
- **1 画面のガラス形状 ≤ 6**（ブレンド上限 16）。シートのような大面積も1枚と数える。
- **効果予算**: liquid glass は **1 効果**と数える（taste.md の「1コンポーネント 1〜2 効果」を維持）。glass＋エッジで 1 群、足して良いのはあと1つまで。
- **各 specimen カードに `glass: yes / no(perf)` を明記**（eyebrow 脇の `.glass-tag` chip）。例: comp-09 rows = no(perf)、comp-13 circle-footer = yes。
- 調整パラメータ（Flutter 側）: thickness / blur / glassColor / refractiveIndex / lightIntensity / saturation — CSS の `--lg-*` と鏡写し。

---

### 役割(role)トークン & コントラスト（監査で追加）
説明的トークンの上に**役割の一段**を新設。コンポーネントは原則こちらを使う:
`--bg` / `--surface`(ガラス) / `--surface-raised`(シート・ダイアログ) / `--surface-input`(#2B2B2B) / `--surface-toggle-off`(#555) / `--border` / `--primary`(カラフルグラデ) / `--on-primary` / `--text-1`(白100%) / `--text-2`(白78%) / `--text-3`(白60%・確実に暗い面のみ) / `--text-disabled`(白40%・**無効時のみ**) / `--scrim-min`(黒45%) / `--state-success|error|like|focus`。

**コントラスト必須事項（WCAG AA / 本文4.5:1・大字3:1）:**
- 写真の上の文字は `text-shadow` 頼みにせず、**黒45%以上のスクリム or 保護グラデを必ず敷く**（`--scrim-min`）。
- 入力地は **#2B2B2B**（旧 #7F7F7F は白文字4.0:1で不合格）。
- 本文最小 **11px**（8px 禁止）、本文色は **`--text-2`(78%) 以上**。**白40%(`--text-disabled`)を本文に使わない**。
- 中間グレー #7F7F7F/#7E7E7E/#838383 は統合済み（`--gray-mid` は装飾専用＝文字を載せない）。

---

## 3. タイポグラフィ

**出典: `WdText`（`lib/component/ui/widget/WdText/WdText.dart`）。既定 `fontFamily = "Noto Sans JP"`、`fontSize = 14`、`color = Color(0xFF000000)`（暗背景上では白指定）。**

- **本文・UI テキストの既定フォントは必ず Noto Sans JP。** テキスト描画は原則 `WdText` を通す。
- ボタンラベル: Noto Sans JP **700**（`WdTextButton` 18px / `WdIconTextButton` 12px）。
- ワードマーク「Toopdbq」: **Pacifico** のみ（UI ラベルには使わない）。
- Inter は **既存の Latin/数値箇所のみ（`WdTextField`, `WdCircleBar`, `WdNavigationHeader` タイトル, `WdCircleCard` タイトル）** に限定して残存。新規では拡大せず、原則 Noto Sans JP。
- 写真の上のテキストは必ず影を持たせる（`0 4 4` または `0 0 8` の黒）。

サイズ目安: 32(ワードマーク) / 22(JP 見出し) / 20(nav) / 18(ボタン) / 16(タイトル) / 14(本文) / 12(キャプション) / 11(ラベル) / 8(微小)。

---

## 4. コンポーネント目録（これらを使う。新規発明しない）

### resource — `lib/component/ui/resource/`
| 名前 | 役割 |
|---|---|
| `FigmaColors` | 全グラデーション定義（§2） |
| `IconImage` | アイコン描画。30 variant の白 PNG（`assets/images/icon_*.png`）。`grid/shuffle` のみ Material rounded。色は `color` で白に着色 |
| `ImageLogo` | `google` / `apple` ロゴ |
| `WdGoogleMap` / `CameraPreview` | 地図 / カメラプレビュー |

### widget — `lib/component/ui/widget/`
| 名前 | 役割（要点） |
|---|---|
| `WdText` | 全テキストの基底。既定 Noto Sans JP 14 |
| `WdIconButton` | 円形アイコンボタン 8 variant（simple / standart / standartColor / more / smart / badge / badgeText / badgeColor）。旧 post は badgeColor に改名。ガラス or カラフル円（standartColor=中心から透過グラデ）。バッジは常にガラス＋ホスト円をノッチでくり抜く |
| `WdIconTextButton` | アイコン+テキスト 3 variant（fat / specialFat / specialNormal）。楕円グラデ+行列変換 |
| `WdTextButton` | カラフルグラデ背景の主要 CTA（280×64, r8）。既定「このサークルを選択」 |
| `WdPostButton` | 投稿ボタン 64px。カラフル円(中心透過)+add バッジ。`out` は距離表示 |
| `WdLoginButton` | Google / Apple。グラデボーダー+暗/明インテリア |
| `WdNavigationHeader` | 上部ヘッダー 7 variant。上下保護グラデ |
| `WdTextField` | 入力 4 variant（midum / standart / rounded / roundedWithButton）。pill 地 `#7F7F7F` |
| `WdToggl` | ON/OFF。ON はカラフルグラデ、200ms easeInOut |
| `WdUserBar` | アバター(47)+名前 12px の横並び |
| `WdMenuItem` | サイドメニュー項目 icon / network。下線 `#333` |
| `WdStatusBar` | 距離表示（spot アイコン + 値15 + 単位7） |
| `WdRange` | online/offline レンジ（online=緑グラデ） |
| `WdSpesialIcon` | 円形プロフィール+装飾リング（circle アイコン） |
| `WdMemberStatus` | 重なりアバター+「＋N人が参加中」 |
| `WdDistanceSlider` | サークル範囲スライダー（track にカラフルグラデ） |
| `WdTakeButton` | カメラ撮影の白二重円 |
| `WdCircleMoon` / `WdMapMoon` | サークル/地図の月アイコン |
| `WdCircleStoryList` | サークルプロフィール + ストーリー 3 列グリッド |
| `WdEarthPin` / `WdGoogleMapShort` | 地球ピン / 地図プレビュー |
| `StoryViewerStatus` | ストーリー閲覧ステータス |

### view — `lib/component/ui/view/`
| 名前 | 役割 |
|---|---|
| `WdAuthCard` | ログインカード（auth 背景 + ワードマーク + ログインボタン） |
| `WdCircleBar` / `WdCircleBarBig` / `WdCircleBarSmall` | サークル識別バー（pill, グラデ縁） |
| `WdCircleCard` | 360×360 サークルカード（写真 + 下部グラデ + 情報）。**唯一の主要カード型** |
| `WdCircleMiniCard` / `WdCircleMiniCardList` | ミニカード / その横並び |
| `WdCircleFooter` | ストーリー下部フッター 5 variant（circle bar + 検索/カメラ） |
| `WdCircleTimeline` / `WdStorySearching` | サークルタイムライン / 検索バナー |
| `WdCircle` / `WdCircleEditFooter` | サークル本体 / 編集フッター |
| `WdStoryHeader` | プログレスバー（投稿数で分割, 4px, 白56%） |
| `WdStorySideTool` / `WdStoryPostSideTool` / `WdStoryPostRight` | like/comment/share 縦ツール群 |
| `WdStoryComment` / `WdUserComment` | コメント表示 |
| `WdCameraFooter` / `WdStoryPostFooter` | 撮影/投稿フッター |
| `WdMainMenu` / `WdSettingRow` / `WdLoactionOff` | メニュー / 設定行 / 位置情報オフ |
| `Earth/` `CelestialSky/` | 3D 地球儀・星空レンダリングエンジン（Universe） |

---

## 5. 避けること（ネガティブ指定 — AI 臭さの除去）

- ❌ **Inter / DM Sans / Roboto など汎用フォントを本文に使う** → 必ず **Noto Sans JP**（`WdText` 既定）。Pacifico はワードマーク専用。
- ❌ **カード多用のフラットな量産 SaaS 風レイアウト**（白背景・等間隔カードグリッド・左ボーダー強調カード）→ Toopdbq は**フルブリード写真 + ガラスのオーバーレイ**が基本。カードは `WdCircleCard` 系のみ。
- ❌ **`Colors.black` / `Colors.white` 等の Material 定数色** → `Color(0xAARRGGBB)` 形式の自社色（`FigmaColors` 由来）のみ。
- ❌ **既存にないコンポーネントの新規発明** → `Wd*` 群から選ぶ／組み合わせる。無ければ省略。
- ❌ 青紫グラデの常套句、絵文字、ユニコード擬似アイコン、手描き SVG アイコン → アイコンは `IconImage`(白 PNG) のみ。**絵文字は一切使わない。**
- ❌ フラットなグレー 1px ボーダー → 縁は `gradientBorderDiagonal` のヘアライン。
- ❌ ライト基調・明るい余白だらけの画面 → 暗背景が既定。明色面はローダー/ダイアログ等の例外のみ。
- ❌ カラフルグラデの濫用 → アクセントは最重要アクション1〜2箇所に限定。多用すると安っぽくなる。
- ❌ **コントラスト違反**: `#7F7F7F` 地に白文字 / 8px 本文 / 白40% を本文に使用 / 写真上の文字をスクリム無しで置く → 上記「役割トークン & コントラスト」を厳守。

---

## 6. 参照

- トークン CSS: `colors_and_type.css`（このルールの色・型を変数化）
- 仕様まとめ: `README.md`（CONTENT / VISUAL FOUNDATIONS / ICONOGRAPHY）
- 実装サンプル: `ui_kits/app/`（`Wd*` を模した HTML/JSX 再現）
- 原典: `univbrofd/toopdbq` `lib/component/ui/` および各 `CLAUDE.md`、`.claude/rules/`
