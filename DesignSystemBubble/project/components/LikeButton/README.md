ハートと数を泡の絵に載せたカプセル（`.pl-like`）で、プランの結果の時間帯の候補のお店に「いいね」する所に使い、いちばん数の多いお店がプランに入る。
渡すもの: いいねの数 n、自分がいいね済みか（`.on` / `aria-pressed`）、置き場所（候補のセル = 小 / 店の下端の欄 = `.big`）。プランに id があるときだけ出す。

- 形: inline-flex・gap 4・高さ 28・padding 0 10px 0 8px・角丸 999px・白・12px 800・数字は tabular-nums。皮 = 共通の伸ばした泡（`--bw` 14 / `.big` 20）、面 `rgba(0,0,0,.45)` + blur 6px、文字に影 `0 1px 2px rgba(0,0,0,.45)`。枠線は描かない。
- ハート = `HEART_D` の線の絵 14px（stroke 2・round）。中身は小 = 数だけ、`.big` = 「いいね · N」。
- `.on` = 面 `bubble-on`（白 .2）+ `shadow-halo`、ハートを塗る（fill currentColor）。切り替えは background / box-shadow の .2s、押すと `scale(.94)`。
- 小: 候補の 2 列のセル `.ts-pinw` に `--ar`（写真の高さ / 幅）を置き、写真の右下に重ねる（right 6・写真の下端から 34px 上）。セルのボタンの外に置く。
- `.big`: 高さ 40・padding 0 14px 0 10px・14px・文字の影なし・ハート 16px。店の下端の欄 `.dk-btns` の先頭（row-reverse なので右端）に、`.dk-btn` 40 の泡と並ぶ。
- 押すとその場で数が増減する（取り消しも同じボタン）。
- やらない: 赤やピンクのハート・色の塗りでいいね済みを示さない（泡の中の白 + `shadow-halo` だけ）。数を隠さない。
- web: `PlanView.tsx` · `.pl-like`
