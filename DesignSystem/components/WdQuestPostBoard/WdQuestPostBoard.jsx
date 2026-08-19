/* ============================================================================
   WdQuestPostBoard — クエスト投稿ボードの配置仕様（レイアウト・アルゴリズム）

   ボードは横スクロールの1本。高さ固定・幅は投稿数だけ右へ伸びる。
   ボードを「列（column）」単位で左から右へ埋める。列同士は X が重ならないので、
   列の中で縦に積むだけで全体の非重複が保証される ← この方式の肝。
   タイルは position:absolute の px 指定（CSS grid は使わない）。

   アスペクト比は2種類だけ:  P（縦）= 9:16  /  L（横）= 16:9
   各列パターンは「高さぴったり H」になるよう、比を保ったまま連立式を解く。
     H（列の有効高） = ボード高 − PAD_TOP − PAD

   設計点: MAXW=244 は H≈280（= ボード高 331）で 11 パターン全部が無クランプで
   ちょうど収まる値（H パターンの列幅が 243.6 ≒ MAXW）。H をこれより大きくすると
   L を含む列が MAXW に当たり、比を保ったまま縮小＝縦中央寄せになる（仕様どおり）。

   移植メモ: 寸法の導出はすべて下の solve() のコメント式が正。React も DOM も
   使っていないのは WdQuestPostBoardLayout() まで — 他言語へはそこだけ移植する。
   ============================================================================ */

const P_R = 9 / 16;   /* P（縦 9:16）: w = h·9/16  ⇔  h = w·16/9 */
const L_R = 16 / 9;   /* L（横 16:9）: w = h·16/9  ⇔  h = w·9/16 */

const t = (x, y, w, h, kind) => ({ x, y, w, h, kind });

/* 再描画で配置が変わらないよう seed 固定の擬似乱数（eria-wall.js と同じ mulberry32） */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}

/* ---- 定数（仕様） --------------------------------------------------------- */
export const WdQuestPostBoardSpec = {
  GAP: 7,               /* タイル間・列間                                       */
  PAD: 10,              /* ボード左端／下端                                     */
  PAD_TOP: 41,          /* 上部ヘッダー分（ボードは描かない・場所だけ空ける）    */
  MAXW: 244,            /* タイル最大幅                                         */
  RADIUS: 14,           /* タイル角丸（DS の 5 段スケール外 — 下の注記参照）     */
  MAX_COL_RATIO: 0.9,   /* 列幅がボード可視幅のこの比を超えたら列ごと縮小        */
  JITTER_GAPS: 1.6,     /* ぴったり埋まった列の縦ジッター = 0〜GAP×この値        */
  /* 列の並び順（グリッド感を消すための固定シーケンス・循環使用） */
  SEQUENCE: ['B', 'F', 'C', 'D', 'H', 'G', 'C3', 'B', 'E', 'I', 'C', 'F']
};

/* ---- 列パターン（11種） ---------------------------------------------------
   solve(H, G) は列ローカル座標（左上 0,0）のタイル配列と列幅 w を返す。
   どのパターンも Σ(タイル高) + Σ(GAP) = H。式は formula にも文字列で持つ。   */
export const WdQuestPostBoardPatterns = {
  /* A — 縦1枚（一枚絵）:  h = H,  w = H·9/16 */
  A: {
    need: 1, kinds: 'P', desc: '縦1枚（一枚絵・フォールバック）',
    formula: 'w = H·9/16 ,  h = H',
    solve: (H) => { const w = H * P_R; return { w, tiles: [t(0, 0, w, H, 'P')] }; }
  },
  /* AL — 横1枚（一枚絵）: h = H,  w = H·16/9 （かなり横長 → 通常 MAXW/90% で縮小） */
  AL: {
    need: 1, kinds: 'L', desc: '横1枚（一枚絵・フォールバック）',
    formula: 'w = H·16/9 ,  h = H',
    solve: (H) => { const w = H * L_R; return { w, tiles: [t(0, 0, w, H, 'L')] }; }
  },
  /* B — 縦2枚を縦積み:  2h + G = H,  h = w·16/9  →  w = (H−G)·9/32 */
  B: {
    need: 2, kinds: 'P+P', desc: '縦2枚を縦積み',
    formula: 'h = (H−G)/2 ,  w = h·9/16 = (H−G)·9/32',
    solve: (H, G) => {
      const h = (H - G) / 2, w = h * P_R;
      return { w, tiles: [t(0, 0, w, h, 'P'), t(0, h + G, w, h, 'P')] };
    }
  },
  /* C — 横2枚を縦積み:  2h + G = H,  h = w·9/16  →  w = (H−G)·8/9 */
  C: {
    need: 2, kinds: 'L+L', desc: '横2枚を縦積み',
    formula: 'h = (H−G)/2 ,  w = h·16/9 = (H−G)·8/9',
    solve: (H, G) => {
      const h = (H - G) / 2, w = h * L_R;
      return { w, tiles: [t(0, 0, w, h, 'L'), t(0, h + G, w, h, 'L')] };
    }
  },
  /* C3 — 横3枚を縦積み: 3h + 2G = H,  h = w·9/16  →  w = (H−2G)·16/27 */
  C3: {
    need: 3, kinds: 'L×3', desc: '横3枚を縦積み',
    formula: 'h = (H−2G)/3 ,  w = h·16/9 = (H−2G)·16/27',
    solve: (H, G) => {
      const h = (H - 2 * G) / 3, w = h * L_R;
      return { w, tiles: [t(0, 0, w, h, 'L'), t(0, h + G, w, h, 'L'), t(0, 2 * (h + G), w, h, 'L')] };
    }
  },
  /* D — 横1枚 の下に 縦2枚を横並び
     W·9/16 + G + ((W−G)/2)·16/9 = H
     W·(9/16 + 8/9) = H − G + 8G/9 = H − G/9
     →  W = (H − G/9)·144/209        [9/16 + 8/9 = 209/144] */
  D: {
    need: 3, kinds: 'L / P+P', desc: '横1枚 の下に 縦2枚を横並び',
    formula: 'W = (H − G/9)·144/209 ,  hL = W·9/16 ,  wP = (W−G)/2 ,  hP = wP·16/9',
    solve: (H, G) => {
      const W = (H - G / 9) * 144 / 209, hL = W * (9 / 16), wP = (W - G) / 2, hP = wP * (16 / 9);
      return { w: W, tiles: [t(0, 0, W, hL, 'L'), t(0, hL + G, wP, hP, 'P'), t(wP + G, hL + G, wP, hP, 'P')] };
    }
  },
  /* E — 縦2枚を横並び の下に 横1枚（D の上下反転・W の式は同一） */
  E: {
    need: 3, kinds: 'P+P / L', desc: '縦2枚を横並び の下に 横1枚',
    formula: 'W = (H − G/9)·144/209 ,  wP = (W−G)/2 ,  hP = wP·16/9 ,  hL = W·9/16',
    solve: (H, G) => {
      const W = (H - G / 9) * 144 / 209, hL = W * (9 / 16), wP = (W - G) / 2, hP = wP * (16 / 9);
      return { w: W, tiles: [t(0, 0, wP, hP, 'P'), t(wP + G, 0, wP, hP, 'P'), t(0, hP + G, W, hL, 'L')] };
    }
  },
  /* F — 縦1枚 の下に 横1枚（同じ幅 W）
     W·16/9 + G + W·9/16 = H
     W·(16/9 + 9/16) = H − G
     →  W = (H − G)·144/337          [16/9 + 9/16 = 337/144] */
  F: {
    need: 2, kinds: 'P / L', desc: '縦1枚 の下に 横1枚（同幅）',
    formula: 'W = (H−G)·144/337 ,  hP = W·16/9 ,  hL = W·9/16',
    solve: (H, G) => {
      const W = (H - G) * 144 / 337, hP = W * (16 / 9), hL = W * (9 / 16);
      return { w: W, tiles: [t(0, 0, W, hP, 'P'), t(0, hP + G, W, hL, 'L')] };
    }
  },
  /* G — 横1枚 の下に 縦1枚（F の上下反転・W の式は同一） */
  G: {
    need: 2, kinds: 'L / P', desc: '横1枚 の下に 縦1枚（同幅）',
    formula: 'W = (H−G)·144/337 ,  hL = W·9/16 ,  hP = W·16/9',
    solve: (H, G) => {
      const W = (H - G) * 144 / 337, hP = W * (16 / 9), hL = W * (9 / 16);
      return { w: W, tiles: [t(0, 0, W, hL, 'L'), t(0, hL + G, W, hP, 'P')] };
    }
  },
  /* H — 横1枚 の下に 縦3枚を横並び
     W·9/16 + G + ((W−2G)/3)·16/9 = H
     W·(9/16 + 16/27) = H − G + 32G/27 = H + 5G/27
     →  W = (H + 5G/27)·432/499      [9/16 + 16/27 = 499/432] */
  H: {
    need: 4, kinds: 'L / P×3', desc: '横1枚 の下に 縦3枚を横並び',
    formula: 'W = (H + 5G/27)·432/499 ,  hL = W·9/16 ,  wP = (W−2G)/3 ,  hP = wP·16/9',
    solve: (H, G) => {
      const W = (H + 5 * G / 27) * 432 / 499, hL = W * (9 / 16), wP = (W - 2 * G) / 3, hP = wP * (16 / 9);
      return {
        w: W, tiles: [t(0, 0, W, hL, 'L'),
          t(0, hL + G, wP, hP, 'P'), t(wP + G, hL + G, wP, hP, 'P'), t(2 * (wP + G), hL + G, wP, hP, 'P')]
      };
    }
  },
  /* I — 縦3枚を横並び の下に 横1枚（H の上下反転・W の式は同一） */
  I: {
    need: 4, kinds: 'P×3 / L', desc: '縦3枚を横並び の下に 横1枚',
    formula: 'W = (H + 5G/27)·432/499 ,  wP = (W−2G)/3 ,  hP = wP·16/9 ,  hL = W·9/16',
    solve: (H, G) => {
      const W = (H + 5 * G / 27) * 432 / 499, hL = W * (9 / 16), wP = (W - 2 * G) / 3, hP = wP * (16 / 9);
      return {
        w: W, tiles: [t(0, 0, wP, hP, 'P'), t(wP + G, 0, wP, hP, 'P'), t(2 * (wP + G), 0, wP, hP, 'P'),
          t(0, hP + G, W, hL, 'L')]
      };
    }
  }
};

/* 列全体を比率保持で縮小（GAP も一緒に縮む = 「比率を保ったまま全体を縮小」） */
const scaleCol = (col, s) => ({
  w: col.w * s,
  tiles: col.tiles.map(o => ({ ...o, x: o.x * s, y: o.y * s, w: o.w * s, h: o.h * s }))
});

/* 次に使うパターンを決める。
   残り枚数が列の必要枚数に満たない場合はシーケンスの次のパターンへスキップ。
   1枚しか残っていない時だけ一枚絵 A / AL にフォールバック。 */
function pickPattern(seq, si, left, rnd, PT) {
  for (let k = 0; k < seq.length; k++) {
    const id = seq[(si + k) % seq.length];
    if (PT[id] && PT[id].need <= left) return { id, si: si + k + 1 };
  }
  if (left === 1) return { id: rnd() < 0.5 ? 'A' : 'AL', si: si + 1 };
  /* 稀: カスタム sequence が残り枚数を満たせない → 収まる中で最大のパターン */
  const fit = Object.keys(PT).filter(k => PT[k].need <= left).sort((a, b) => PT[b].need - PT[a].need)[0];
  return { id: fit || 'A', si: si + 1 };
}

/* ---- 配置本体（純関数・React 非依存） ------------------------------------
   WdQuestPostBoardLayout({count, height, viewportWidth, seed}) →
     { tiles[], columns[], width, height, contentHeight, spec }
   tiles[i] = {x, y, w, h, kind:'P'|'L', col, pattern, i}  ← px 絶対座標
   タイル総数は count と必ず一致する（各パターンが need 枚ぴったり消費）。 */
export function WdQuestPostBoardLayout(opts = {}) {
  const C = { ...WdQuestPostBoardSpec, ...(opts.spec || {}) };
  const PT = opts.patterns || WdQuestPostBoardPatterns;
  const count = Math.max(0, Math.floor(opts.count || 0));
  const boardH = opts.height || 331;
  const vw = opts.viewportWidth || 0;      /* 0 = 可視幅不明 → 90% ルールは適用しない */
  const seq = opts.sequence || C.SEQUENCE;
  const rnd = mulberry32(opts.seed == null ? 20260803 : opts.seed);
  const H = boardH - C.PAD_TOP - C.PAD;    /* 列の有効高 */

  const tiles = [], columns = [];
  let x = C.PAD, left = count, si = 0, i = 0;

  while (left > 0 && H > 24) {
    const pick = pickPattern(seq, si, left, rnd, PT);
    const pat = PT[pick.id];
    si = pick.si;

    let col = pat.solve(H, C.GAP);         /* まず高さぴったり H で解く */
    let s = 1;

    /* 1) タイル最大幅 MAXW — 最も広いタイルが MAXW を超えたら列ごと縮小 */
    const widest = col.tiles.reduce((m, o) => Math.max(m, o.w), 0);
    if (widest > C.MAXW) s = C.MAXW / widest;
    /* 2) 列幅がボード可視幅の 90% を超えたら、比率を保ったまま全体を縮小 */
    if (vw > 0 && col.w * s > vw * C.MAX_COL_RATIO) s = Math.min(s, (vw * C.MAX_COL_RATIO) / col.w);

    /* 3) 仕上げ: ぴったり埋まった列（s===1）だけ 0〜GAP×1.6px の縦ジッター。
          ジッター分だけ先に微縮小して確保するので、下端 PAD を割らない。
          H に満たない列（s<1）はジッターせず縦中央寄せ。 */
    let jitter = 0;
    if (s === 1) { jitter = rnd() * C.GAP * C.JITTER_GAPS; s = (H - jitter) / H; }
    if (s !== 1) col = scaleCol(col, s);

    const usedH = H * s;
    const yOff = jitter > 0 ? jitter : (H - usedH) / 2;
    const y0 = C.PAD_TOP + yOff;

    for (const o of col.tiles) {
      tiles.push({ x: x + o.x, y: y0 + o.y, w: o.w, h: o.h, kind: o.kind, col: columns.length, pattern: pick.id, i: i++ });
    }
    columns.push({ pattern: pick.id, x, y: y0, w: col.w, h: usedH, scale: s, jitter, count: pat.need });

    left -= pat.need;
    x += col.w + C.GAP;                    /* 次の列の X = 現在の X + 列幅 + GAP */
  }

  return {
    tiles, columns,
    width: Math.round(x - (columns.length ? C.GAP : 0) + C.PAD),   /* ボード総幅 */
    height: boardH, contentHeight: H, spec: C
  };
}

/* ---- プレビュー用コンポーネント（単色タイルのみ） ------------------------- */
const r2 = n => Math.round(n * 100) / 100;

export function WdQuestPostBoard({
  count = 24, height = 331, seed = 20260803, sequence, spec, patterns,
  tileColor = '#333333', radius = 14, background = 'transparent',
  showPatternLabels = false, showTileKinds = false, showColumnGuides = false,
  renderTile, onTileClick, style, className
}) {
  const ref = React.useRef(null);
  const [vw, setVw] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setVw(el.clientWidth);
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = WdQuestPostBoardLayout({ count, height, viewportWidth: vw, seed, sequence, spec, patterns });

  return (
    <div ref={ref} className={className}
      style={{ position: 'relative', height, overflowX: 'auto', overflowY: 'hidden', background, scrollbarWidth: 'thin', ...style }}>
      <div style={{ position: 'relative', width: L.width, height: '100%' }}>
        {showColumnGuides && L.columns.map((c, k) => (
          <div key={'g' + k} style={{
            position: 'absolute', left: r2(c.x), top: L.spec.PAD_TOP, width: r2(c.w), height: L.contentHeight,
            border: '1px dashed rgba(255,255,255,.16)', borderRadius: 2, pointerEvents: 'none'
          }}></div>
        ))}
        {showPatternLabels && L.columns.map((c, k) => (
          <div key={'l' + k} style={{
            position: 'absolute', left: r2(c.x), top: 14, width: r2(c.w),
            font: "600 10px/1 'Inter',system-ui,sans-serif", letterSpacing: '.1em',
            color: 'rgba(255,255,255,.5)', pointerEvents: 'none'
          }}>{c.pattern}</div>
        ))}
        {L.tiles.map(o => (
          <div key={o.i} onClick={onTileClick ? () => onTileClick(o) : undefined}
            style={{
              position: 'absolute', left: r2(o.x), top: r2(o.y), width: r2(o.w), height: r2(o.h),
              borderRadius: radius, background: tileColor, overflow: 'hidden',
              cursor: onTileClick ? 'pointer' : 'default',
              display: showTileKinds ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center'
            }}>
            {renderTile ? renderTile(o) : (showTileKinds
              ? <span style={{ font: "600 11px 'Inter',system-ui,sans-serif", color: 'rgba(255,255,255,.34)' }}>{o.kind}</span>
              : null)}
          </div>
        ))}
      </div>
    </div>
  );
}
