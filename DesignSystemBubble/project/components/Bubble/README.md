画面のどこにでも出る丸いシャボン玉のボタン（泡の絵 `bubble.webp` を円に敷き、その上にアイコン・言葉・写真を置く）で、FAB はすべてこれ。戻る・閉じる・共有・決定、写真の小さな泡、店の下端の欄のアイコン、アプリバーに使う。
渡すもの: 線の絵 1 つ（24 四方・stroke currentColor 1.8・round）か写真 1 枚、決定は言葉、`.pl-bub` は `.on`（選んだ / 送れる）の有無。

- 皮: 泡の絵 = `::before`（または背景）に `img/bubble.webp`（100%）、新しい丸いボタンは `.bub` を付ければ同じ皮。地は `rgba(0,0,0,.18)` + `backdrop-filter: blur(6px)`、角丸 50%。`.pl-bub` だけ輪が `::after`（inset -3%）で地は `rgba(0,0,0,.35)`（blur なし）。
- `.tm-bub` 48（font-size 20・line-height 1）。`.tm-bub.pl-x` 40 = 戻る（左上 left 16 / top safe+7）、`.pl-x.tm-quit` = 閉じる（右上 right 16）。`.tm-bub.tm-share` 44 = 共有（右上 right 12 / top safe+8）。絵は 20px・色 `fg`。
- `.tm-bub.tm-done` 104 = 時間 / 予算のダイアログの決定（下端の中央・19px 700・字間 .06em）。`.nudge` = 裏を押すと縦横に揺れる .55s、`.pop` = 1.42 倍へ広がって消える .3s。
- 押すと縮む: 共有・アプリバー `scale(.92)`、決定 `.94`（戻る / 閉じる・`.pl-bub`・`.dk-btn` は縮まない）。
- `.pl-bub` 40: 写真は 98% の丸で切り抜き、輪が上に乗る。`.on` = 面 `bubble-on`（白 .2）+ `shadow-halo`（白い枠線・放射の照りは描かない）。button で置くときは置き場所（`.pl-field` / `.pl-link`）が border 0 / padding 0 を足す。
- `.dk-btn` 40: 店の下端の欄 `.dk-btns`（row-reverse = 先頭が右端・間 7px・横スクロール）。絵 20px・白。
- `.tn button` 52: アプリバー。絵 24px・`rgba(255,255,255,.62)`、`aria-current` で白（.34s で縮んで戻る）。裏に -10px の暗いにじみ（radial 黒 .42 → .24 → 0）。
- 行の中のアイコンも同じ丸い泡: 下書きの × `.dr-x` 36・投稿の … `.fd-more` 36・店の欄の三角 `.dk-more` 32（開くと絵だけ 90° 回る）・共有 `.tm-hs-share` 40。
- 絵は白の線の絵だけ。言葉は白の太字。
- やらない: 色の塗り・色の枠で強調しない（強調は `.on` の泡の中の白 + `shadow-halo` だけ）。図形（放射・conic・白い枠線）で泡を描かない。赤・黄・青の丸ボタンを作らない。上端に fixed で貼るのは共有の `.tm-share.fixed`（街を画面に固定した場面）だけ。
- web: `Brand.tsx` · `Mood.tsx` · `PlanView.tsx` · `ShopDock.tsx` · `NavBar.tsx` · `.tm-bub`
