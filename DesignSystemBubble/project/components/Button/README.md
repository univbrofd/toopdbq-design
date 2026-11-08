言葉で押すカプセルの泡（`.pl-pill`）で、プランの終わり・共有のシート・下書きの確認・作れなかったときの選び直し・全部の段を選んだ後の決定に使う。泡の絵 `bubble.webp` を横に伸ばし、その上に言葉（と頭の線の絵）を置いたもの。
渡すもの: 言葉（`app_ja.arb` の言葉そのまま）、必要なら頭に線の絵 18px、`disabled` の有無。

- 皮: 共通の伸ばした泡（`::before` = `border-image: url(img/bubble.webp) 49% fill / var(--bw) / 0 stretch`）。`--bw` = 高さの半分（素 25 / `.sm` 17 / 高さ 44 の `.fd-join` 22 / 48 の下端の欄 24）。新しい文字のボタンは `.bubx` を付ければ同じ皮になる。
- 形: `min-height: 50px`・padding 0 26px・角丸 999px・16px 700・`fg`・中身は中央（gap 8px）。button でも a でも同じ見た目。頭の svg は `position: relative`（輪の上に出す）。
- 主（素の `.pl-pill`）: 面 = 黒 .18 + `blur(6px)`。照り・虹の縁・内側の影は描かない。
- `.wide` = 幅いっぱい。`.quiet` = 面なし・輪を不透明度 .55 に薄める・600。主 1 つ + 静か 1〜2 つを縦に（間 10px）か、2 つを横に半分ずつ並べる。
- `.sm` = 高さ 34・padding 0 16px・13px。使うのは `.quiet.sm.pl-more`（候補の「もっと見る」・中央寄せ）。
- `:disabled` = 不透明度 .4。`:active` = `scale(.97)`（.12s）。
- `.fl-go` = 幅いっぱい・margin-top 12・800（全部の段を選んだ後の「決定」）。`.fd-pub` = アプリバーの上の右下に浮かぶ「みんなに公開」（高さ 46・fixed）。
- 選んだ / 強調したいとき: 面を `bubble-on`（白 .2）にして `shadow-halo` をまとう（確認のシートの「開く」`.ask-go` と同じ）。
- やらない: 色の塗り（黄・赤・青）や色の枠で主を作らない。図形（放射の照り・conic の虹の縁・白い枠線）で泡を描かない。角の四角いボタンにしない。上端に fixed / sticky で置かない。
- web: `PlanView.tsx` · `PlanFlow.tsx` · `PlanBuild.tsx` · `Everyone.tsx` · `Mood.tsx` · `.pl-pill`
