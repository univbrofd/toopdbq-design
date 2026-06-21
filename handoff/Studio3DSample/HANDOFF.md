# HANDOFF — Studio 3D サンプル素材（mqmav1c7_wnam）

Toopdbq Studio が実生成した 1 セッション分の **3 点セット**（投稿動画 → サムネイル → 3D モデル GLB）を、
Claude Design が **fetch して使える素材**として渡す。これは**素材の受け渡しだけ**が目的（どの画面を作るかは別途指定）。
動画・画像は Claude Design に直接添付もできるが、**GLB はバイナリで添付できない**ため design repo に置いて raw 取得させる。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
> 実装の対応箇所は「別 repo `univbrofd/toopdbq`・参考」（Claude Design は読めない。値は本書に固定）。

## 素材（raw リンク — public・認証不要）

3 点セット ＋ meta は共有プール `assets/sample/3d/{id}/` に置く（per-handoff に複製しない）。

| 種別 | raw リンク |
|---|---|
| 3D モデル (GLB) | `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/model.glb` |
| 投稿動画 (mp4) | `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/video.mp4` |
| サムネ (jpg) | `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/thumbnail.jpg` |
| meta (json) | `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/meta.json` |

## このセッションの実値（meta から捕捉）

| key | value | 備考 |
|---|---|---|
| `id` | `mqmav1c7_wnam` | セッション = 1 バンドル |
| `isVideo` | `true` | 動画投稿（先頭フレームをサムネ化） |
| `quality` | `standard` | Tripo image_to_model standard |
| `taskId` | `29e73014-85e2-45fe-844d-9fa1f2c6dab5` | Tripo タスク |
| `glbBytes` | `894008` | ≈ 873 KB |
| `time` | `1781956532202` | **ms**（studio 生成時刻。秒ではない） |
| `name` | `social_coou_93826_…_0.mp4` | 元動画ファイル名（midjourney 由来） |

サムネ実寸 283 KB / 動画 10.3 MB / GLB 873 KB。GLB は texture 同梱の単一ファイル（外部 .bin/.png 依存なし）。

## 使い方（Claude Design 側）

- **GLB** は `<model-viewer src="…/model.glb" camera-controls auto-rotate>` で描画。WebGL なので `--use-gl=angle` 系のヘッドレス制約は実機ビューア側の話。Claude Design の preview では `model-viewer` の script を `<head>` に読む。
- **動画**は `<video src="…/video.mp4" muted loop playsinline>`、**サムネ**は `<img src="…/thumbnail.jpg">`。
- 3 点は「**1 投稿 = 動画 + その先頭フレーム + そこから起こした 3D**」という対応関係（studio の 3D Pipeline の成果物）。並べる時はこの 3 段の因果が分かる順序で。
- 他のサンプル 3D が要れば同プール `assets/sample/models/`（`model-01..04.glb` / `real-01..11.jpg`）も使える。

## 注意

- これは**素材カタログ**。具体的な画面・レイアウトの指定は含めない（後続の HANDOFF で指定する）。
- 追加セッションを渡すときは `assets/sample/3d/{別id}/` に同じ 4 ファイル構成で足し、本表に行を足す。
- 実装の対応箇所（参考・別 repo `univbrofd/toopdbq`）: 生成は `lib-studio/`（Electron Studio）、出力先は本体 `assets/sample/3d/{id}/`。表示は `lib/feature/.../ThreeDTerrestrialView`（per-GLB WebView）。

## Claude Design に貼るプロンプト

```
to claude
------------------------------------------------------
Toopdbq Studio が実生成した 3D の 3 点セット（投稿動画→サムネ→GLB）を素材として渡す。
まずこれらを fetch して使える状態にして（GLB はバイナリ添付できないので raw から取得）。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
素材カタログ HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/Studio3DSample/HANDOFF.md

素材（public raw）:
- GLB:   https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/model.glb
- 動画:  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/video.mp4
- サムネ: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/thumbnail.jpg

GLB は <model-viewer> で、動画は <video>、サムネは <img> で扱える。3 点は「1 投稿 = 動画 +
その先頭フレーム + そこから起こした 3D」という対応。今は素材を取り込むところまででよく、
具体的に作る画面は次の指示で渡す。土台は USAGE_RULES.md と taste.md、新規発明はしない。
--------------------------------------------------
```

## 取り込み

Claude Design が bundle を export したら `/import-design-bundle {URL}` で取り込む。
