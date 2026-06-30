# BusinessCard — 株式会社Toopdbq 名刺 (HANDOFF)

## 目的
ミニマルな両面名刺（参照 = Tiasoft 風）。**表＝ブランド面（全面グラデ＋大ロゴ）/ 裏＝人物面（near-black＋連絡先＋IG/FB QR）**。情報は最小、効果はマークとグラデ地のみ。

## 規格（印刷前提）
- 日本標準名刺 **91 × 55 mm（横）**・両面。塗り足し 3mm（artboard 97×61mm）、安全余白 trim から 5mm。
- 出力: `handoff/BusinessCard/BusinessCard.html`。表・裏の 2 面を並べる。card 要素は 91:55。
- app 画面でないので device frame（`.phone`）は使わない。小さい文字は K100 純黒系。

## Foundation（コピーせず参照）
- 色・タイポ: `../../DesignSystem/colors_and_type.css` を `@import`。
- 美学: `../../DesignSystem/taste.md` 厳守（主役1つ・8pt・左揃え・端数寸法禁止・効果は引き算）。
- 署名グラデ: `--gradient-colorful`（放射）/ `--gradient-colorful-linear`（対角）。

## 表（ブランド面）
- **全面**: `--gradient-colorful-linear`（対角）を card 全面に。上に **film grain / noise overlay**（参照画像のザラつき）を薄く重ねる。
- **左上**: ワードマーク "**Toopdbq**"（白）。既定は Pacifico（`--font-display`）。参照のクリーンな印象に寄せるなら Inter medium も可。
- **右下**: **白い薔薇マークを大きく**（`../../assets/images/logo_toopdbq.png` を**そのまま＝白**で使用）。card の右端・下端から少しはみ出す **bleed** 配置。微妙な emboss/陰影で紙の質感。
- **左下**: `TOOPDBQ.COM`（白・大文字・字間広め・Inter・小）。
- 文字装飾なし。accent は「グラデ地＋白マーク」で完結。

## 裏（人物面）
- **全面**: near-black `#0c0c10`（`--bg` 近傍）＋ subtle grain。
- **左上**: **浅香 紘**（白・`--font-jp`・主役） ／ その下「代表 ・ Founder」（`--text-2`・小）。
- **右上**: 小さい薔薇マーク（**gradient-masked** = ロゴ png の alpha で `--gradient-colorful` を抜く。小サイズ）。
- **左下**: `kou@toopdbq.com` ／ `070-9301-0705`（白〜`--text-2`・Inter・字間広め）。
- **右下**: **QR 2連**（白の角丸チップ上・dark on white・実寸 **≥ 16mm**・quiet zone を潰さない）。
  - Instagram `./qr/instagram.svg`（ラベル小 ＠asakarifa）
  - Facebook `./qr/facebook.svg`（ラベル小 Facebook）
- **載せない**: 住所・事業内容ラベル・キャッチコピー・App Store / X の QR。

### QR 実リンク（焼込済・改変不可）
- Instagram: `https://www.instagram.com/asakarifa/`
- Facebook: `https://www.facebook.com/profile.php?id=100004786159480`

QR は dark `#08080b` on white・ECL Q で生成済（svg ベクター, png 同梱）。**再生成・色反転・縮小しすぎ禁止**。`qr/app_store.svg` `qr/x.svg` も repo にあるが**今回は不使用**。

## Smell test（出す前）
- [ ] 表 = グラデ地 ＋ 白マーク ＋ 最小文字だけになっているか（盛っていないか）
- [ ] 裏 = near-black で主役（氏名）が 1 つ、QR は 2 個だけか
- [ ] マークは右下/右上で bleed・配置が端数でなくグリッド上か
- [ ] QR は実寸 ≥16mm・周囲の白 quiet zone を確保しているか
- [ ] 文字は左揃え・字間は統一されているか
