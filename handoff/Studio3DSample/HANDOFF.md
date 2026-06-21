# HANDOFF — Studio 3D サンプル素材（全セッション・カタログ）

Toopdbq Studio が実生成した **3D セッション**（投稿 → サムネイル → 3D モデル GLB）一式を、
Claude Design が **fetch して使える素材**として渡す。これは**素材の受け渡しだけ**が目的（どの画面を作るかは別途指定）。
動画・画像は Claude Design に直接添付もできるが、**GLB はバイナリで添付できない**ため design repo に置いて raw 取得させる。

> repo: `univbrofd/toopdbq-design` / branch `main` / raw base:
> `https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/`（以下 `{raw}` と表記）
> DS 索引: `DesignSystem/_ds_manifest.json`（色トークンの canonical は `DesignSystem/colors_and_type.css`）
> 実装の対応箇所は「別 repo `univbrofd/toopdbq`・参考」（Claude Design は読めない。値は本書に固定）。

## 素材の場所（規則 — 個別リンクは列挙しない）

各セッションは `{raw}/assets/sample/3d/{id}/` 配下に固定構成で並ぶ:

- `model.glb` … 必ずある（3D モデル。texture 同梱の単一ファイル）
- `thumbnail.jpg` … 必ずある（動画の先頭フレーム / 画像投稿は元画像そのもの）
- `video.mp4` … **`isVideo=true` のときだけ**ある（画像投稿には無い）
- `meta.json` … **このセッションの真のリンク源**。`files.{thumbnail,video,model}` に上記の raw URL が入っている

→ Claude Design は「下表の `id` → `{raw}/assets/sample/3d/{id}/meta.json` を fetch → `files` の URL を取得」で全アセットに到達できる。

## セッション一覧（15 件 / 14=動画・1=画像、`mqmaxkwz_tkvb` のみ画像）

| # | id | 投稿 | quality | GLB |
|---|---|---|---|---|
| 1 | `mqmav1c7_wnam` | 動画 | standard | 0.85 MB |
| 2 | `mqmaxkwz_tkvb` | 画像 | standard | 0.71 MB |
| 3 | `mqmay0ya_pk9f` | 動画 | detailed | 4.85 MB |
| 4 | `mqmb21ww_8yqs` | 動画 | standard | 0.63 MB |
| 5 | `mqmbpeas_f3co` | 動画 | detailed | 3.16 MB |
| 6 | `mqmbpk42_d6sz` | 動画 | detailed | 2.64 MB |
| 7 | `mqmbpn15_v9lg` | 動画 | detailed | 3.20 MB |
| 8 | `mqmcjxrf_jsvq` | 動画 | detailed | 2.67 MB |
| 9 | `mqmcqqwa_wa2w` | 動画 | detailed | 3.56 MB |
| 10 | `mqmcqvk9_82tm` | 動画 | detailed | 3.00 MB |
| 11 | `mqmcslrd_nb9u` | 動画 | detailed | 3.18 MB |
| 12 | `mqmcygak_b0id` | 動画 | detailed | 3.07 MB |
| 13 | `mqmcyl7q_ts1m` | 動画 | detailed | 4.64 MB |
| 14 | `mqmcyoah_ssvh` | 動画 | detailed | 2.86 MB |
| 15 | `mqmcyrxm_wpic` | 動画 | detailed | 4.74 MB |

`quality`: `standard`（軽量）/ `detailed`（高精細・GLB 大）。各セッションの `taskId` / `name` / `time`(ms) は `meta.json` 参照。

## 使い方（Claude Design 側）

- **GLB** は `<model-viewer src="{raw}/assets/sample/3d/{id}/model.glb" camera-controls auto-rotate>` で描画（`model-viewer` の script を `<head>` に読む）。
- **動画**は `<video src="…/video.mp4" muted loop playsinline>`、**サムネ/画像**は `<img src="…/thumbnail.jpg">`。
- 1 セッション = 「1 投稿 + そのサムネ + そこから起こした 3D」の対応（studio の 3D Pipeline 成果物）。並べる時はこの因果が分かる順序で。
- **画像投稿（`mqmaxkwz_tkvb`）は動画が無い**。動画スロットは出さず、画像 → 3D の 2 段で見せる。
- `detailed` の GLB は重い（最大 ≈4.85 MB）。グリッドに多数並べるなら遅延ロード / プレースホルダ（サムネ）→ タップで GLB 差し替えが無難。

## 注意

- これは**素材カタログ**。具体的な画面・レイアウトの指定は含めない（後続の HANDOFF で指定する）。
- 追加セッションは `assets/sample/3d/{別id}/` に同構成で足し、上の一覧表に行を 1 行足すだけ（個別リンクは規則で導出）。
- 実装の対応箇所（参考・別 repo `univbrofd/toopdbq`）: 生成は `lib-studio/`（Electron Studio）、出力先は本体 `assets/sample/3d/{id}/`。表示は `lib/feature/.../ThreeDTerrestrialView`（per-GLB WebView）。

## Claude Design に貼るプロンプト（全 15 セッション）

```
to claude
------------------------------------------------------
Toopdbq Studio が実生成した 3D セッション 15 件（投稿→サムネ→GLB の素材）をまとめて渡す。
まずこれらを fetch して使える状態にして（GLB はバイナリ添付できないので raw から取得）。

索引: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/DesignSystem/_ds_manifest.json
素材カタログ HANDOFF: https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/handoff/Studio3DSample/HANDOFF.md

素材は規則的: 各セッションは
  https://raw.githubusercontent.com/univbrofd/toopdbq-design/main/assets/sample/3d/{id}/
の下に model.glb（必ず）/ thumbnail.jpg（必ず）/ video.mp4（動画投稿のみ）/ meta.json。
id 一覧と種別・quality は HANDOFF の表にある。各 id の meta.json を fetch すれば
files に thumbnail/video/model の raw URL が入っている（これが真のリンク源）。

GLB は <model-viewer>、動画は <video>、サムネは <img> で扱える。1 投稿 = 動画(or画像) +
サムネ + そこから起こした 3D の対応。mqmaxkwz_tkvb だけ画像投稿で動画は無い。
今は素材を取り込むところまででよく、具体的に作る画面は次の指示で渡す。
土台は USAGE_RULES.md と taste.md、新規発明はしない。
--------------------------------------------------
```

## 取り込み

Claude Design が bundle を export したら `/import-design-bundle {URL}` で取り込む。
