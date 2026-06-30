# BusinessCard — 株式会社Toopdbq 名刺 (HANDOFF)

## 目的
株式会社Toopdbq の両面名刺を Toopdbq の DS で起こす。**表＝アイデンティティ＋連絡先 / 裏＝4 SNS の QR**。テーマは **ライトミニマル**（白地・インク文字・署名グラデを accent 1点）。

## 規格（印刷前提）
- 日本標準名刺 **91 × 55 mm（横）**。塗り足し 3mm（artboard 97×61mm）、安全余白は trim から 5mm。
- 小さい文字は K100 純黒（リッチブラック禁止＝小文字が滲まない）。
- 出力: `handoff/BusinessCard/BusinessCard.html`。表・裏を 2 面並べる。card 要素は 91:55。
- ※これは app 画面でないので device frame（`.phone`）は使わない。

## Foundation（コピーせず参照）
- 色・タイポは `../../DesignSystem/colors_and_type.css` を `@import`。
- 美学は `../../DesignSystem/taste.md` 厳守（1効果・主役1つ・8pt padding・左揃え・端数寸法禁止）。
- **ライト面**なので ink トークンを使う: 本文=`--ink-1`(#000) / 副=`--ink-2`(#333) / 補=`--ink-3`(#999)。地=#fff。
- 署名 accent = `--gradient-colorful`（金→緑→青緑→紫→ピンク→珊瑚の放射）。**1面につき colorful は 1 点だけ**。

## ブランドマーク（重要）
ロゴ `../../assets/images/logo_toopdbq.png` は **白い薔薇シルエット**。白地では見えないので、**alpha マスクとして使い `--gradient-colorful` を流し込む**（gradient-masked rose）＝表のヒーロー accent。
- 実装: rose png を `mask-image`/`-webkit-mask-image` にしてグラデ div を抜く（`taste.md` / mask ルール準拠）。
- 代替: 単色 `--ink-1` の黒薔薇でも可。**どちらか一方**。グラデ薔薇を採るなら他の colorful（グラデ罫線等）は併用しない。
- 文字ワードマーク "Toopdbq" は **Pacifico（`--font-display`）** のみ。

## タイポ割当
- 和文（氏名/役職/キャッチ/ラベル）: Noto Sans JP（`--font-jp`）
- 欧文（email/tel/romaji/handle）: Inter（`--font-latin`）
- ワードマーク: Pacifico

## 表（FRONT）— 左揃え・主役は氏名
- ブランドロックアップ: gradient-masked rose ＋ "Toopdbq" wordmark
- 氏名: **浅香 紘**（ヒーロー, `--font-jp`, `--ink-1`） / ふりがな「あさか こう」(`--ink-3`) / Kou Asaka (`--ink-2`, Inter)
- 所属: 株式会社Toopdbq ／ 代表
- ヘアライン 1px `rgba(0,0,0,0.12)`
- 連絡先ブロック（小・`--ink-2/3`）:
  - 事業内容：SNS開発
  - kou@toopdbq.com
  - 070-9301-0705
  - 〒340-0028 埼玉県草加市谷塚2-16-42-2

## 裏（BACK）— 4 SNS QR
- ヒーロー（キャッチコピー, `--font-jp`）: **地域密着型SNS** / ソーシャルサークルサービス
- QR 4 連（等間隔・8pt グリッド・**実寸 ≥ 18mm**・dark on white・周囲の白 quiet zone を潰さない）:

  | 並び | 画像 | ラベル(`--ink-2/3`) |
  |---|---|---|
  | 1 | `./qr/app_store.svg` | App Store |
  | 2 | `./qr/x.svg` | X ＠toopdbq |
  | 3 | `./qr/instagram.svg` | Instagram ＠asakarifa |
  | 4 | `./qr/facebook.svg` | Facebook |

- 小フッターに rose ＋ "Toopdbq" wordmark 可。**website テキストは入れない**。

### QR 実リンク（焼込済・改変不可）
- App Store: `https://apps.apple.com/jp/app/id6443588243`
- X: `https://x.com/toopdbq`
- Instagram: `https://www.instagram.com/asakarifa/`
- Facebook: `https://www.facebook.com/profile.php?id=100004786159480`

QR は dark `#08080b` on white・ECL Q/H で生成済（svg はベクター, png も同梱）。**再生成・色反転・縮小しすぎ禁止**（読取保証のため）。

## Smell test（出す前）
- [ ] colorful accent は各面 1 点だけか
- [ ] 文字は左揃え・主役（氏名）が 1 つに定まっているか
- [ ] padding は 8pt（16/20/24）で上下左右揃っているか
- [ ] QR は実寸 ≥18mm・周囲の白 quiet zone を確保しているか
- [ ] 小さい文字は純黒（K100）か
