# HANDOFF — Studio 3D サンプル素材（複数セッション）

Toopdbq Studio が実生成した **3D セッション**（投稿 → サムネイル → 3D モデル GLB）を、
Claude Design が **fetch して使える素材**として渡す。これは**素材の受け渡しだけ**が目的（どの画面を作るかは別途指定）。
動画・画像は Claude Design に直接添付もできるが、**GLB はバイナリで添付できない**ため design repo に置いて raw 取得させる。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
> 実装の対応箇所は「別 repo `univbrofd/toopdbq`・参考」（Claude Design は読めない。値は本書に固定）。

## セッション一覧（素材プール `assets/sample/3d/{id}/` — per-handoff に複製しない）

| id | 投稿種別 | 構成 | quality | GLB | meta(raw) |
|---|---|---|---|---|---|
| `mqmav1c7_wnam` | 動画 | 動画 + サムネ + GLB | standard | 873 KB | `…/assets/sample/3d/mqmav1c7_wnam/meta.json` |
| `mqmaxkwz_tkvb` | 画像 | サムネ(=元画像) + GLB（動画なし） | standard | 728 KB | `…/assets/sample/3d/mqmaxkwz_tkvb/meta.json` |
| `mqmay0ya_pk9f` | 動画 | 動画 + サムネ + GLB | **detailed** | 4.85 MB | `…/assets/sample/3d/mqmay0ya_pk9f/meta.json` |

`…` = `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main`

### 素材 raw リンク（public・認証不要）

**mqmav1c7_wnam**（動画投稿・standard）
- GLB:   `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/model.glb`
- 動画:  `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/video.mp4`
- サムネ: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmav1c7_wnam/thumbnail.jpg`

**mqmaxkwz_tkvb**（画像投稿・動画なし・standard）
- GLB:   `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmaxkwz_tkvb/model.glb`
- サムネ: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmaxkwz_tkvb/thumbnail.jpg`（= 元画像そのもの）

**mqmay0ya_pk9f**（動画投稿・detailed = 高精細 GLB）
- GLB:   `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmay0ya_pk9f/model.glb`
- 動画:  `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmay0ya_pk9f/video.mp4`
- サムネ: `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmay0ya_pk9f/thumbnail.jpg`

## 各セッションの実値（meta から捕捉）

| key | mqmav1c7_wnam | mqmaxkwz_tkvb | mqmay0ya_pk9f |
|---|---|---|---|
| `isVideo` | `true` | `false` | `true` |
| `quality` | `standard` | `standard` | `detailed` |
| `taskId` | `29e73014-…-f9a1f2c6dab5` | `c9da877d-…-51b53b2ef639` | `6fa2994c-…-42b44e6c0673` |
| `glbBytes` | `894008`（≈873 KB） | `745372`（≈728 KB） | `5085260`（≈4.85 MB） |
| `time` | `1781956532202`（ms） | `1781956666425`（ms） | `1781956742071`（ms） |
| `name` | midjourney 動画 `.mp4` | midjourney 画像 `.png` | midjourney 動画 `.mp4` |

`time` は **ms**（studio 生成時刻。秒ではない）。GLB は texture 同梱の単一ファイル（外部 .bin/.png 依存なし）。
`detailed` は standard より高精細でファイルが大きい（mqmay0ya_pk9f の GLB は他の約 6 倍）。

## 使い方（Claude Design 側）

- **GLB** は `<model-viewer src="…/model.glb" camera-controls auto-rotate>` で描画（`model-viewer` の script を `<head>` に読む）。
- **動画**は `<video src="…/video.mp4" muted loop playsinline>`、**サムネ/画像**は `<img src="…/thumbnail.jpg">`。
- 1 セッション = 「1 投稿 + そのサムネ + そこから起こした 3D」の対応（studio の 3D Pipeline 成果物）。並べる時はこの因果が分かる順序で。
- **画像投稿（mqmaxkwz_tkvb）は動画が無い**。動画スロットは出さず、画像 → 3D の 2 段で見せる。
- 他のサンプル 3D が要れば同プール `assets/sample/models/`（`model-01..04.glb` / `real-01..11.jpg`）も使える。

## 注意

- これは**素材カタログ**。具体的な画面・レイアウトの指定は含めない（後続の HANDOFF で指定する）。
- 追加セッションを渡すときは `assets/sample/3d/{別id}/` に同構成（動画ありは4ファイル / 画像は thumbnail+model+meta の3ファイル）で足し、上の「セッション一覧」「素材 raw リンク」「実値」に行を足す。
- 実装の対応箇所（参考・別 repo `univbrofd/toopdbq`）: 生成は `lib-studio/`（Electron Studio）、出力先は本体 `assets/sample/3d/{id}/`。表示は `lib/feature/.../ThreeDTerrestrialView`（per-GLB WebView）。

## Claude Design に貼るプロンプト（今回追加分: mqmay0ya_pk9f）

```
to claude
------------------------------------------------------
Toopdbq Studio が実生成した 3D セッション「mqmay0ya_pk9f」（動画投稿 → そこから起こした GLB。
quality=detailed の高精細モデル）を素材として渡す。まずこれらを fetch して使える状態にして
（GLB はバイナリ添付できないので raw から取得）。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
素材カタログ HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/Studio3DSample/HANDOFF.md

素材（public raw）:
- GLB:   https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmay0ya_pk9f/model.glb
- 動画:  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmay0ya_pk9f/video.mp4
- サムネ: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/mqmay0ya_pk9f/thumbnail.jpg

GLB は <model-viewer> で、動画は <video>、サムネは <img> で扱える。1 投稿 = 動画 + その先頭フレーム +
そこから起こした 3D の対応。カタログには別セッション(mqmav1c7_wnam 動画 / mqmaxkwz_tkvb 画像)も載っている。
今は素材を取り込むところまででよく、具体的に作る画面は次の指示で渡す。
土台は USAGE_RULES.md と taste.md、新規発明はしない。
--------------------------------------------------
```

## 取り込み

Claude Design が bundle を export したら `/import-design-bundle {URL}` で取り込む。
