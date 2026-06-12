# HANDOFF — SampleImagery（サンプル画像プールの全面リフレッシュ）

- repo: `univbrofd/toopdbq-design`（branch `main`）
- raw base: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
- DS 索引: `DesignSystem/_ds_manifest.json`
- カタログ specimen: `DesignSystem/preview/brand-imagery.html`（リフレッシュ済み・全プールを一覧表示）

## 背景 / 何が変わったか

- 旧状態: specimen 群が `cdn.midjourney.com` への外部リンク 7 種・102 箇所に依存。**全てリンク切れ**で壊れ画像表示だった。ほかに `sample_photo.png` 1 枚の使い回し。
- 新状態: repo 内サンプルプールに全面移行。旧 CDN 参照 102 箇所は repo 内アセットへ**機械置換済み**（URL→1 枚の固定マップ。文脈ごとの最適化は未実施 → 下の「要求」参照）。
- 枚数は「1 画面に同時に見える数（リールセル 6–8・アバター 4–6）＋ローテーションに足る最小」で選定: reel 12 / user 8。Midjourney 生成 64 枚から多様性基準で厳選し、長辺 800/480 の JPEG に最適化（repo 重量 124MB→1.3MB）。

## プール一覧

`assets/images/reel/`（投稿/リール写真 12 枚・縦長・長辺 800px）:

| file | 内容 |
|---|---|
| reel00001.jpg | 抹茶ラテ俯瞰 |
| reel00002.jpg | 柴犬の昼寝 |
| reel00003.jpg | 桜 |
| reel00004.jpg | 川辺の花火 |
| reel00005.jpg | フェスのステージ照明 |
| reel00006.jpg | フェスの群衆 |
| reel00007.jpg | ビーチ3人セルフィー |
| reel00008.jpg | 夏フェスセルフィー |
| reel00009.jpg | 夜の屋台（フラッシュ） |
| reel00010.jpg | 居酒屋の友人（フラッシュ） |
| reel00011.jpg | ライブのペンライト |
| reel00012.jpg | 夕暮れの海辺を歩く人 |

`assets/images/user/`（アバター用 8 枚・長辺 480px）:

| file | 内容 |
|---|---|
| user00001.jpg | 金髪・フェス会場セルフィー |
| user00002.jpg | 赤ベレー帽 |
| user00003.jpg | 黒髪ウェーブ・室内 |
| user00004.jpg | 窓辺・緑ジャケット |
| user00005.jpg | 犬を抱く |
| user00006.jpg | 白パーカー |
| user00007.jpg | カーリーヘア・笑顔 |
| user00008.jpg | 夜の居酒屋セルフィー |

## 使い分けルール

- 投稿セル（9:16）・リール・ピン thumb・story full-bleed・circle カバー → `assets/images/reel/`
- アバター・チャット行・コメント行・メンバーリスト → `assets/images/user/`
- `auth_background.png`（ログイン/スプラッシュ背景）・`sample_3d.png`（3D オブジェクトのレンダ。写真ではない）は従来どおり固定
- `assets/images/uv/` は Universe specimen 専用の**派生セット**: `story-01..10.png`・`circle-01..10.png` は reel プールからの再エクスポート（story-NN = reel000NN / circle-NN = reel000(13−NN)）、`obj-01..04.png` は 3D 透過 PNG で独立。新規デザインでは uv/ でなく reel/user プールを直接使う
- `sample_photo.png` は legacy。新規デザインでは reel プールを使う
- **外部 CDN（midjourney / unsplash 等）の画像参照は禁止**。必ず repo 内 `assets/images/` から相対参照する（`DesignSystem/preview/*.html` → `../../assets/...`）

## スマホ配置文脈

Toopdbq はスマホアプリ（393×852 + SafeArea）。reel は 9:16 セル・full-bleed 背景で `object-fit: cover`、user は円形 44–96px で顔が中心に来るよう `object-position` を調整して使う。

## Claude Design への要求

1. 機械置換のため、同一画面に同じ画像・同じアバターが隣接する specimen がある。各 specimen（特に screen-04 universe / screen-05 story-viewer / comp-chat-list / comp-09-rows / comp-16 comment sheet）で、プールから文脈に合う画像へ振り直す（隣接重複をなくす）。
2. full-bleed / Ken Burns / カバー用途は被写体に合わせ `object-position` を調整する。
3. 今後の新規デザイン・Remix でもこのプールだけを使う（プレースホルダや外部 URL を生成しない）。
4. `brand-imagery.html` をプールの単一カタログとして維持する（画像の追加・差し替え時はここも更新）。
