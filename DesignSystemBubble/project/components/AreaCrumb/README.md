選んだ地域の名前を「親 › 子」でつなぐパンくずで、最初の画面の左上（地域を選んだ後・ロゴの代わり）と、プラン作成の上端の題（中央）に使う。
渡すもの: 地域の鎖（例: 東京 › 渋谷区 › 道玄坂・最後が選んだ地域）、最初の画面では親を押したときの移動。

- 書体: 明朝（`font-serif`）700・字間 .04em・白。地図の上で読ませる影 `0 1px 3px rgba(0,0,0,.9), 0 0 10px rgba(0,0,0,.65)`。
- 親 = 16px・`rgba(255,255,255,.72)`・padding 0 4px、区切り `›` = 15px・`rgba(255,255,255,.5)`、最後 = `b` 22px（白・はみ出しは省略記号）。間 2px・1 行。
- `.tm-ring-name`（最初の画面・場面）: `p`・absolute・left 12・top safe+8・高さ 44・最大幅 `calc(100% - 84px)`。親は button（高さ 44・押すとその区画へ移る・押している間は白）。右上に共有の泡 `.tm-bub.tm-share` 44（right 12 / top safe+8）。
- `.tm-ring-name.tm-crumb`（AreaCrumb）: relative・中央寄せ・高さ 40。ロゴの場所では margin 7px 60px -3px、題 `h1.tm-ask-h`（24px 800・行 40）の中では margin 0 60px。親は `em`（押せない = プランの途中で地域は変えない）。左右に戻る / 閉じるの `.tm-bub.pl-x` 40（top 7）。地域が無ければ題は「プラン作成」。
- やらない: パンくずをカプセル・色の地・下線のリンクにしない。上端に fixed / sticky で貼らない。
- web: `Mood.tsx` · `Brand.tsx`（AreaCrumb）· `.tm-ring-name`
