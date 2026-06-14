# HANDOFF — SampleImagery（サンプル画像プール v2: background / reel / user / logo）

- repo: `univbrofd/toopdbq-design`（branch `main`）
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引: `DesignSystem/_ds_manifest.json`
- カタログ specimen: `DesignSystem/preview/brand-imagery.html`（全プールをラベル付きで一覧表示）

## 背景 / 何が変わったか

- プールを 3 フォルダ構成に再編: **background（フルスクリーン背景用 16）/ reel（投稿・リール用 15）/ user（アバター用 16）**。命名は `background001.jpg` 形式の 3 桁連番。
- 旧プール（`reel00001..12.jpg` / `user00001..08.jpg`・5 桁）と legacy の `sample_photo.png` / `sample_3d.png` は**廃止**。specimen 内の旧参照 163 箇所はテーマが近い新画像へ機械置換済み（文脈ごとの最適化は未実施 → 下の「要求」参照）。
- アプリロゴ `logo_toopdbq.png` を追加（透過 PNG）。`logo_apple.png` / `logo_google.png` と同列。

## プール一覧

`assets/sample/background/`（フルスクリーン背景 16 枚・816×1456・9:16）:

| file | 内容 | file | 内容 |
|---|---|---|---|
| background001 | 朝食スプレッド俯瞰 | background009 | ライブ群衆・カラフル照明 |
| background002 | 抹茶ラテ＋クロワッサン | background010 | 野外フェスステージ（夕暮れ） |
| background003 | 苺パンケーキ俯瞰 | background011 | 夏フェス3人セルフィー |
| background004 | PCに乱入する猫 | background012 | 夜の自販機（フラッシュ） |
| background005 | ゴールデンレトリバー | background013 | カフェ窓辺の女性 |
| background006 | 柴犬の昼寝 | background014 | ペンライトの海 |
| background007 | 桜と遊歩道 | background015 | 朝のヨガ |
| background008 | 初雪の住宅街 | background016 | 夕暮れの海辺を歩く人 |

`assets/sample/reel/`（投稿/リール写真 15 枚・816×1456・9:16）:

| file | 内容 | file | 内容 |
|---|---|---|---|
| reel001 | 苺パンケーキ俯瞰 | reel009 | 旧市街を歩く（旅行） |
| reel002 | PCに乱入する猫 | reel010 | 夕焼けの路地ポートレート |
| reel003 | ゴールデンレトリバー | reel011 | 黄葉とニット帽 |
| reel004 | 柴犬の昼寝 | reel012 | 線路を歩く（モノトーン） |
| reel005 | 川辺の花火 | reel013 | 車窓からの田園 |
| reel006 | ビーチ3人セルフィー | reel014 | 窓辺のラテ（手元） |
| reel007 | 路地裏居酒屋の友人達 | reel015 | ボルダリング |
| reel008 | 夜のフラッシュセルフィー | | |

※ reel001–004 は background003–006 と同一画像（両プールで使えるよう双方に配置）。

`assets/sample/user/`（アバター用 16 枚・480×480 正方形）:

| file | 内容 | file | 内容 |
|---|---|---|---|
| user001 | 壁の人影（匿名） | user009 | 赤ベレー帽・三つ編み |
| user002 | カフェの笑顔・ニット | user010 | 黒髪ロング |
| user003 | k-pop 系エッジ | user011 | ミラーセルフィー・海岸 |
| user004 | 三日月の夜空と | user012 | 渓谷を見下ろす後ろ姿 |
| user005 | 黒巻き髪・シアー | user013 | ピンクスウェット・海辺 |
| user006 | モノクロ・座る男性 | user014 | 観覧車と夕暮れシルエット |
| user007 | テラスに立つ | user015 | 黒トップ・逆光 |
| user008 | 空背景の自撮り | user016 | 山小屋カフェ |

ロゴ（`assets/images/` 直下・透過 PNG・再作成禁止）:

- `logo_toopdbq.png` — アプリロゴ（820×865）
- `logo_apple.png` / `logo_google.png` — 認証ボタン用

## 使い分けルール

- **フルスクリーン背景**（splash・ログイン裏・story full-bleed・hero）→ `background/`。816×1456 で 393×852 のフル表示に十分な解像度
- **投稿セル（9:16）・リール・ピン thumb・circle カバー** → `reel/`
- **アバター・チャット行・コメント行・メンバーリスト** → `user/`（円形 44–96px、顔が中心に来るよう `object-position` 調整）
- `auth_background.png`（ログイン背景のグラデ人物）は従来どおり固定
- `assets/sample/uv/` は Universe specimen 専用の**派生セット**: `story-01..10.png` = reel001..010、`circle-01..10.png` = reel015..006 の正方 crop、`obj-01..04.png` は 3D 透過 PNG で独立。新規デザインでは uv/ でなく background/reel/user プールを直接使う
- **外部 CDN（midjourney / unsplash 等）の画像参照・プレースホルダ生成は禁止**。必ず repo 内 `assets/sample/`（サンプル）・`assets/images/`（logo 等）から相対参照する（`DesignSystem/preview/*.html` → `../../assets/...`）

## スマホ配置文脈

Toopdbq はスマホアプリ（393×852 + SafeArea）。background / reel は 9:16 で `object-fit: cover`、user は円形 44–96px。full-bleed・Ken Burns・カバー用途は被写体に合わせ `object-position` を調整して使う。

## Claude Design への要求

1. 旧→新の機械置換のため、同一画面に同じ画像・同じアバターが並ぶ specimen がある。各 specimen（特に screen-04 universe / screen-05 story-viewer / comp-chat-list / comp-09-rows / comp-16 comment sheet / onboarding）で、プールから文脈に合う画像へ振り直す（隣接重複をなくす）。
2. フルスクリーン背景用途は `background/`、投稿セルは `reel/`、アバターは `user/` と**用途どおりのプールから**選ぶ（今回追加された background プールを活用する）。
3. `logo_toopdbq.png` をログイン／スプラッシュ系 specimen のロゴ表示に取り込む（ロゴの再描画・再生成は禁止、PNG をそのまま使う）。
4. full-bleed / Ken Burns / カバー用途は被写体に合わせ `object-position` を調整する。
5. `brand-imagery.html` をプールの単一カタログとして維持する（画像の追加・差し替え時はここも更新）。
