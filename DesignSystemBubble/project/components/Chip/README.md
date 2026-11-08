泡の絵を横に伸ばした小さなカプセル（`.pl-chip2`）で、プランの結果の日の切り替え（2 日以上）と、終わりの「変えたいところは？」の直したいところの選択肢に使う。
渡すもの: 言葉（日 =「{n} 日目 · 日付」/ 直したいところ = プランの中身から選んだ arb の言葉 6 つまで）、`aria-pressed`、直している間の `disabled`。

- 形: padding 8px 15px・角丸 999px・14px・`fg`。皮 = 共通の伸ばした泡（`--bw` 17 = 高さの半分）・面なし。枠線は描かない。
- `aria-pressed="true"` = 600・面 `bubble-on`（白 .2）+ `shadow-halo`。切り替えは box-shadow / background の .2s。同じ作りのチップ: 都市 `.tp-chip`（`.on`）・上映日 `.sw-days button`（`.on`）・地域選択の駅 `.tm-region-picks button`（`aria-pressed`）・時間の札 `.pl-chip2.dt-chip`。
- `:disabled`（押していないもの）= 不透明度 .45。直している間は全部 disabled になり、押した 1 つだけ pressed のまま明るく残る。
- 並べ方: 日 = `.pl-days`（中央寄せ・折り返し・間 8・上 12）、直したいところ = `.pl-tunes`（左寄せ・折り返し・間 8・見出しの下 12）。直したいところは押すとその言葉のまま AI へ送り、直し終わると pressed は外れる。
- やらない: 色（黄・赤・青）の塗りや白い枠線で選択を示さない（選択 = 泡の中の白 + にじみだけ）。アイコンや × を入れない。
- web: `PlanView.tsx` · `.pl-chip2`
