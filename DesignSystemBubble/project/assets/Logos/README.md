泡のロゴ。「Toopdbq」の文字を泡の質感で描き、o・o・p・d・b・q の丸を「泡の中に泡」の二重輪にしたもの。黒地用の 1 組だけで、明るい地ではほぼ見えない。

- `logo_toopdbq_bubble.png`（1445×845・透明）: 開いた直後の画面の中央に `min(82vw, 460px)` で。裏の街から泡が昇る（`BubbleField` の Launch）。
- `logo_toopdbq_bubble_word.png`（1337×360・透明）: 各画面の上端のヘッダーに高さ 34px で、文書の流れの中に置く（fixed にしない）。
- `logo_toopdbq_bubble_dark.png`（1536×1024・黒地）: 描き直すときの参照元。画面には置かない。
- `logo_web.webp` / `logo_word_web.webp`: web が配信している同じ絵の軽量版（`site/public/trip/`）。

直すときは黒地版を参照に gpt-image で描き直し、黒地の輝度から alpha を起こして透明化する。旧ロゴ（バラ）は使わない。
