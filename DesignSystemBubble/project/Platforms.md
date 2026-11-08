# Web と Flutter の対応

同じ世界観を 2 つの実装で作る。web（`site/`・React + 素の CSS）が正で、Flutter はこの表の右側へ寄せる。

| この系の部品 | web のクラス | Flutter の部品 |
| --- | --- | --- |
| Bubble | `.tm-bub` `.pl-x` `.tm-share` `.pl-bub` `.dk-btn` `.tn button`（`img/bubble.webp` の `::before` / `::after`） | `WdBubble(size:, child:, spin:, fill:)` |
| BubbleField / Pop | `bubbles.ts`（canvas）+ `.tm-field` | `GenreBubbleOverlay` の泡（WebView の上では不透明度で出し入れ） |
| NavBubbles | `.tn`（下端中央の泡 3 つ） | 下端中央に `WdBubble` 52 を 3 つ横に |
| AreaCrumb | `.tm-ring-name` / `.tm-crumb` | 明朝の Text（親 › 子） |
| Button / Chip / InputBar / LikeButton | `.pl-pill` `.pl-chip2` `.pl-field` `.pl-like` | 同じ値で描く。カプセルの縁は `SweepGradient` の pastel-* を 1.5px の stroke |
| DayLine / AskCard / TimeBand | `.al` / `.tm-ask-card` `.fl-card` / `.tm-when` `.tb-*` | 帯は写真 + 幕、カードは写真 + 1px の白 .5 の縁 |
| GenreCell / BudgetTiers / PlanRow | `.tm-gd-r` `.fl-it` / `.fl-pn` `.fl-cost` / `.tm-planlist` | 同じ構成のリスト |
| ShopCell / ShopHead / DockBar | `.ts-pin` / `.td-bar` `.td-board` / `.dk` | 一覧のセル（黒い面 + 白 1px のグラデーション枠）・頭の写真・下端の欄 + `WdBubble` 40 のアイコン列 |
| Sheet | `.ts-sheet` `.ts-panel` / `.pl-sheet` | `Get.bottomSheet` の板（上だけ角丸 24・つまみ） |
| MapPin / RegionPick | `.tm-pin` `.tm-ring` / 地域選択の区画 | 地図 WebView の中に同じ DOM |
| Showtimes | `.cm-*` | 横の時間割 |

## WdBubble の描き方（Flutter）

web は泡を画像（`bubble.webp`）で敷くが、Flutter は `CustomPainter` で描く。値はこの系の `film-*` と `film-rim`。

1. `fill` があれば中を塗る（選択中など状態を面で見せるときだけ。普段は透明）。
2. 内側の薄い白: `radial(0, .55 → 0, .85 → #0FFFFFFF, 1 → #2EFFFFFF)`。
3. 膜の虹: `SweepGradient(film-lilac, film-blue, film-cyan, film-mint, film-violet, film-pink, film-peach, film-lilac; stops 0 .15 .3 .45 .58 .72 .85 1; rotation = spin)` を、縁へ向かって濃くなる放射（`.68 → .83 #40 → .94 #D9 → .985 #FF → 1 #99`）で `dstIn`、さらに上 `.6` → 下 `1.0` の縦で `dstIn`（膜が下へ流れる）。
4. 銀の縁: 太さ `max(1, r × .045)`、上 `.7` → 中 `.3` → 下 `.5` の白。
5. 反射: 縁に沿って `.62 → .8 #40 → .93 #B3 → 1 #40` の放射を、左上から右下への斜め（`1 → .45 で 0 → .72 で 0 → 1 で .3`）で `dstIn`。
6. 左上（`-r×.56, -r×.56`）に光の点（半径 `r×.18`・中心 `#F2` → `#66` → 0）と細い十字。
7. 並んだ泡が同じ模様にならないよう `spin = index × .9`。

守ること: 膜は通常合成で描く（screen 合成は白地で消える）。ぼかしは使わない（WebView の上で矩形のゴミ・iOS で黒画面）。動かさない（地図の上の常時アニメは発熱）。明るい写真の上のグリフは `WdBubble.lift` で黒い影を敷く。

## 画面の作り（共通）

- 文書スクロールの 1 列（最大 640）。上端に固定するものを置かない（開いたプランの上端だけ例外）。固定は下端の欄・シート・下端中央のアプリバー。
- 一覧は下から出るシートが文書のスクロールでせり上がる（段階は short / middle 64% / full の 3 つ・どのシートも同じ）。余白と枠は押し操作を裏の地図へ通し、板だけが受ける。
- 下端の欄は `nav`（58）+ `safe-area-inset-bottom` だけ上に置く。文字入力中はアプリバーを畳む。
- 配色はダークだけ。`prefers-color-scheme` を読まない。
- 強調は光で（`bubble-on` + `shadow-halo`）。赤・青の塗りや枠は使わない。金（`accent`）は評価の ★ だけ。
