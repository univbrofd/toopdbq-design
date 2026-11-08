泡とセルの顔。gpt-image で描いた 512px の絵で、ジャンル（`lunch.ramen` / `dinner.yakiniku` / `bar.beer` / `snack.coffee` / `sauna` / `culture.art`）と場面（`hyakumeiten` = 金メダル / `plan` = 地図とコーヒー / `talk`）に 1 枚ずつ。ここにあるのは 80 枚のうちの代表で、全体は `site/public/trip/tiles` と `moods`（画面では 192px の縮小版 `s/` を使う。プレビュー用の写しは `components/img/faces/`）。

気分の泡・ジャンルのセル（`.tm-gd-i`）・帯の段の顔に使う。泡の中では内側 98% に丸く切り抜き、言葉を載せる中央を `.5 → .28 → .08` で暗くする。絵の無いジャンルは絵文字（`tiles.mjs` の EMOJI）。
