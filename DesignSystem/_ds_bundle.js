/* @ds-bundle: {"format":4,"namespace":"ToopdbqDesignSystem_af3394","components":[{"name":"WdCircleVoteList","sourcePath":"components/WdCircleVoteList/WdCircleVoteList.jsx"},{"name":"WdQuestPostBoardSpec","sourcePath":"components/WdQuestPostBoard/WdQuestPostBoard.jsx"},{"name":"WdQuestPostBoardPatterns","sourcePath":"components/WdQuestPostBoard/WdQuestPostBoard.jsx"},{"name":"WdQuestPostBoardLayout","sourcePath":"components/WdQuestPostBoard/WdQuestPostBoard.jsx"},{"name":"WdQuestPostBoard","sourcePath":"components/WdQuestPostBoard/WdQuestPostBoard.jsx"},{"name":"WdTimelinePost","sourcePath":"components/WdTimelinePost/WdTimelinePost.jsx"}],"sourceHashes":{"components/WdCircleVoteList/WdCircleVoteList.jsx":"722739e52c9c","components/WdQuestPostBoard/WdQuestPostBoard.jsx":"7698da215405","components/WdTimelinePost/WdTimelinePost.jsx":"85b5c7018d3f","preview/eria-wall.js":"f893403782c2"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ToopdbqDesignSystem_af3394 = window.ToopdbqDesignSystem_af3394 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/WdCircleVoteList/WdCircleVoteList.jsx
try { (() => {
const JP = "'Noto Sans JP','Hiragino Sans',sans-serif";
const LAT = "'Inter',system-ui,sans-serif";
const V = {
  scrim: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,.45)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  sheet: {
    width: '100%',
    boxSizing: 'border-box',
    maxHeight: '86%',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 -8px 40px rgba(0,0,0,.28)',
    fontFamily: JP,
    color: '#08080b'
  },
  grip: {
    width: 40,
    height: 4,
    borderRadius: 9999,
    background: 'rgba(8,8,11,.16)',
    margin: '10px auto 0'
  },
  head: {
    display: 'grid',
    gridTemplateColumns: '1fr 44px',
    alignItems: 'start',
    gap: 8,
    padding: '14px 20px 12px'
  },
  title: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.35
  },
  sub: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 1.6,
    color: 'rgba(8,8,11,.56)'
  },
  close: {
    width: 44,
    height: 44,
    margin: '-6px -10px 0 0',
    display: 'grid',
    placeItems: 'center',
    border: 0,
    background: 'none',
    padding: 0,
    cursor: 'pointer'
  },
  closeIcon: {
    width: 16,
    height: 16,
    display: 'block',
    filter: 'invert(1)',
    opacity: .5
  },
  list: {
    margin: 0,
    padding: '0 0 10px',
    listStyle: 'none',
    overflowY: 'auto'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '26px 1fr auto',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    borderTop: '1px solid rgba(8,8,11,.08)',
    willChange: 'transform'
  },
  rank: {
    fontFamily: LAT,
    fontWeight: 700,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    color: 'rgba(8,8,11,.4)',
    textAlign: 'right'
  },
  rank1: {
    fontFamily: LAT,
    fontWeight: 700,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    background: 'linear-gradient(135deg,#fff0a6,#005f67 38%,#ff3e88 70%,#d0a052)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  },
  name: {
    minWidth: 0,
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  meta: {
    marginTop: 3,
    fontFamily: LAT,
    fontSize: 12,
    color: 'rgba(8,8,11,.56)'
  },
  btn: {
    minWidth: 76,
    height: 44,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 9999,
    border: 0,
    cursor: 'pointer',
    background: 'rgba(8,8,11,.06)',
    boxShadow: 'inset 0 0 0 1px rgba(8,8,11,.08)',
    transition: 'background .16s ease,box-shadow .16s ease'
  },
  btnOn: {
    minWidth: 76,
    height: 44,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 9999,
    border: 0,
    cursor: 'pointer',
    background: '#08080b',
    boxShadow: 'none',
    transition: 'background .16s ease,box-shadow .16s ease'
  },
  icon: {
    width: 18,
    height: 18,
    display: 'block',
    filter: 'invert(1)',
    opacity: .5
  },
  iconOn: {
    width: 18,
    height: 18,
    display: 'block',
    opacity: 1
  },
  count: {
    fontFamily: LAT,
    fontWeight: 600,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    color: 'rgba(8,8,11,.56)'
  },
  countOn: {
    fontFamily: LAT,
    fontWeight: 600,
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
    color: '#fff'
  },
  foot: {
    padding: '12px 20px 18px',
    borderTop: '1px solid rgba(8,8,11,.08)',
    fontSize: 11,
    lineHeight: 1.6,
    color: 'rgba(8,8,11,.56)'
  }
};
function WdCircleVoteList({
  candidates,
  circles,
  title = 'サークル名を投票',
  subtitle,
  note,
  showRank = true,
  iconBase = 'assets/icons',
  onVote,
  onClose,
  inline = false,
  style
}) {
  const items = candidates || circles || [];
  const [votes, setVotes] = React.useState(() => {
    const m = {};
    items.forEach(c => {
      m[c.id] = {
        goods: c.goods || 0,
        voted: !!c.voted
      };
    });
    return m;
  });
  const listRef = React.useRef(null);
  const posRef = React.useRef(new Map());

  // FLIP: 並び替えを1フレームで滑らかに見せる
  const capture = () => {
    const el = listRef.current;
    if (!el) return;
    const m = new Map();
    el.querySelectorAll('[data-vote-row]').forEach(r => m.set(r.dataset.voteRow, r.getBoundingClientRect().top));
    posRef.current = m;
  };
  React.useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !posRef.current.size) return;
    el.querySelectorAll('[data-vote-row]').forEach(r => {
      const prev = posRef.current.get(r.dataset.voteRow);
      if (prev == null) return;
      const dy = prev - r.getBoundingClientRect().top;
      if (!dy) return;
      r.style.transition = 'none';
      r.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => {
        r.style.transition = 'transform .32s cubic-bezier(.2,.8,.2,1)';
        r.style.transform = 'translateY(0)';
      });
    });
    posRef.current = new Map();
  }, [votes]);
  const tap = c => {
    capture();
    setVotes(v => {
      const cur = v[c.id] || {
        goods: 0,
        voted: false
      };
      return {
        ...v,
        [c.id]: {
          goods: cur.goods + (cur.voted ? -1 : 1),
          voted: !cur.voted
        }
      };
    });
    onVote && onVote(c);
  };
  const ordered = [...items].sort((a, b) => {
    const d = (votes[b.id]?.goods || 0) - (votes[a.id]?.goods || 0);
    return d || String(a.name).localeCompare(String(b.name), 'ja');
  });
  const sheet = /*#__PURE__*/React.createElement("div", {
    style: {
      ...V.sheet,
      ...(inline ? {
        maxHeight: '100%',
        borderRadius: 24
      } : null),
      ...style
    }
  }, !inline && /*#__PURE__*/React.createElement("div", {
    style: V.grip
  }), /*#__PURE__*/React.createElement("div", {
    style: V.head
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: V.title
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: V.sub
  }, subtitle)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: V.close,
    onClick: onClose,
    "aria-label": "閉じる"
  }, /*#__PURE__*/React.createElement("img", {
    src: `${iconBase}/icon_close.png`,
    alt: "",
    style: V.closeIcon
  }))), /*#__PURE__*/React.createElement("ul", {
    style: V.list,
    ref: listRef
  }, ordered.map((c, i) => {
    const s = votes[c.id] || {
      goods: 0,
      voted: false
    };
    return /*#__PURE__*/React.createElement("li", {
      key: c.id,
      "data-vote-row": c.id,
      style: V.row
    }, showRank && /*#__PURE__*/React.createElement("span", {
      style: i === 0 ? V.rank1 : V.rank
    }, i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: V.name
    }, c.name), c.meta && /*#__PURE__*/React.createElement("div", {
      style: V.meta
    }, c.meta)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      style: s.voted ? V.btnOn : V.btn,
      onClick: () => tap(c),
      "aria-pressed": s.voted,
      "aria-label": `${c.name} にグッド`
    }, /*#__PURE__*/React.createElement("img", {
      src: `${iconBase}/icon_good.png`,
      alt: "",
      style: s.voted ? V.iconOn : V.icon
    }), /*#__PURE__*/React.createElement("span", {
      style: s.voted ? V.countOn : V.count
    }, s.goods)));
  })), note && /*#__PURE__*/React.createElement("div", {
    style: V.foot
  }, note));
  if (inline) return sheet;
  return /*#__PURE__*/React.createElement("div", {
    style: V.scrim,
    onClick: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    }
  }, sheet);
}
Object.assign(__ds_scope, { WdCircleVoteList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/WdCircleVoteList/WdCircleVoteList.jsx", error: String((e && e.message) || e) }); }

// components/WdQuestPostBoard/WdQuestPostBoard.jsx
try { (() => {
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

const P_R = 9 / 16; /* P（縦 9:16）: w = h·9/16  ⇔  h = w·16/9 */
const L_R = 16 / 9; /* L（横 16:9）: w = h·16/9  ⇔  h = w·9/16 */

const t = (x, y, w, h, kind) => ({
  x,
  y,
  w,
  h,
  kind
});

/* 再描画で配置が変わらないよう seed 固定の擬似乱数（eria-wall.js と同じ mulberry32） */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let x = Math.imul(a ^ a >>> 15, 1 | a);
    x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}

/* ---- 定数（仕様） --------------------------------------------------------- */
const WdQuestPostBoardSpec = {
  GAP: 7,
  /* タイル間・列間                                       */
  PAD: 10,
  /* ボード左端／下端                                     */
  PAD_TOP: 41,
  /* 上部ヘッダー分（ボードは描かない・場所だけ空ける）    */
  MAXW: 244,
  /* タイル最大幅                                         */
  RADIUS: 14,
  /* タイル角丸（DS の 5 段スケール外 — 下の注記参照）     */
  MAX_COL_RATIO: 0.9,
  /* 列幅がボード可視幅のこの比を超えたら列ごと縮小        */
  JITTER_GAPS: 1.6,
  /* ぴったり埋まった列の縦ジッター = 0〜GAP×この値        */
  /* 列の並び順（グリッド感を消すための固定シーケンス・循環使用） */
  SEQUENCE: ['B', 'F', 'C', 'D', 'H', 'G', 'C3', 'B', 'E', 'I', 'C', 'F']
};

/* ---- 列パターン（11種） ---------------------------------------------------
   solve(H, G) は列ローカル座標（左上 0,0）のタイル配列と列幅 w を返す。
   どのパターンも Σ(タイル高) + Σ(GAP) = H。式は formula にも文字列で持つ。   */
const WdQuestPostBoardPatterns = {
  /* A — 縦1枚（一枚絵）:  h = H,  w = H·9/16 */
  A: {
    need: 1,
    kinds: 'P',
    desc: '縦1枚（一枚絵・フォールバック）',
    formula: 'w = H·9/16 ,  h = H',
    solve: H => {
      const w = H * P_R;
      return {
        w,
        tiles: [t(0, 0, w, H, 'P')]
      };
    }
  },
  /* AL — 横1枚（一枚絵）: h = H,  w = H·16/9 （かなり横長 → 通常 MAXW/90% で縮小） */
  AL: {
    need: 1,
    kinds: 'L',
    desc: '横1枚（一枚絵・フォールバック）',
    formula: 'w = H·16/9 ,  h = H',
    solve: H => {
      const w = H * L_R;
      return {
        w,
        tiles: [t(0, 0, w, H, 'L')]
      };
    }
  },
  /* B — 縦2枚を縦積み:  2h + G = H,  h = w·16/9  →  w = (H−G)·9/32 */
  B: {
    need: 2,
    kinds: 'P+P',
    desc: '縦2枚を縦積み',
    formula: 'h = (H−G)/2 ,  w = h·9/16 = (H−G)·9/32',
    solve: (H, G) => {
      const h = (H - G) / 2,
        w = h * P_R;
      return {
        w,
        tiles: [t(0, 0, w, h, 'P'), t(0, h + G, w, h, 'P')]
      };
    }
  },
  /* C — 横2枚を縦積み:  2h + G = H,  h = w·9/16  →  w = (H−G)·8/9 */
  C: {
    need: 2,
    kinds: 'L+L',
    desc: '横2枚を縦積み',
    formula: 'h = (H−G)/2 ,  w = h·16/9 = (H−G)·8/9',
    solve: (H, G) => {
      const h = (H - G) / 2,
        w = h * L_R;
      return {
        w,
        tiles: [t(0, 0, w, h, 'L'), t(0, h + G, w, h, 'L')]
      };
    }
  },
  /* C3 — 横3枚を縦積み: 3h + 2G = H,  h = w·9/16  →  w = (H−2G)·16/27 */
  C3: {
    need: 3,
    kinds: 'L×3',
    desc: '横3枚を縦積み',
    formula: 'h = (H−2G)/3 ,  w = h·16/9 = (H−2G)·16/27',
    solve: (H, G) => {
      const h = (H - 2 * G) / 3,
        w = h * L_R;
      return {
        w,
        tiles: [t(0, 0, w, h, 'L'), t(0, h + G, w, h, 'L'), t(0, 2 * (h + G), w, h, 'L')]
      };
    }
  },
  /* D — 横1枚 の下に 縦2枚を横並び
     W·9/16 + G + ((W−G)/2)·16/9 = H
     W·(9/16 + 8/9) = H − G + 8G/9 = H − G/9
     →  W = (H − G/9)·144/209        [9/16 + 8/9 = 209/144] */
  D: {
    need: 3,
    kinds: 'L / P+P',
    desc: '横1枚 の下に 縦2枚を横並び',
    formula: 'W = (H − G/9)·144/209 ,  hL = W·9/16 ,  wP = (W−G)/2 ,  hP = wP·16/9',
    solve: (H, G) => {
      const W = (H - G / 9) * 144 / 209,
        hL = W * (9 / 16),
        wP = (W - G) / 2,
        hP = wP * (16 / 9);
      return {
        w: W,
        tiles: [t(0, 0, W, hL, 'L'), t(0, hL + G, wP, hP, 'P'), t(wP + G, hL + G, wP, hP, 'P')]
      };
    }
  },
  /* E — 縦2枚を横並び の下に 横1枚（D の上下反転・W の式は同一） */
  E: {
    need: 3,
    kinds: 'P+P / L',
    desc: '縦2枚を横並び の下に 横1枚',
    formula: 'W = (H − G/9)·144/209 ,  wP = (W−G)/2 ,  hP = wP·16/9 ,  hL = W·9/16',
    solve: (H, G) => {
      const W = (H - G / 9) * 144 / 209,
        hL = W * (9 / 16),
        wP = (W - G) / 2,
        hP = wP * (16 / 9);
      return {
        w: W,
        tiles: [t(0, 0, wP, hP, 'P'), t(wP + G, 0, wP, hP, 'P'), t(0, hP + G, W, hL, 'L')]
      };
    }
  },
  /* F — 縦1枚 の下に 横1枚（同じ幅 W）
     W·16/9 + G + W·9/16 = H
     W·(16/9 + 9/16) = H − G
     →  W = (H − G)·144/337          [16/9 + 9/16 = 337/144] */
  F: {
    need: 2,
    kinds: 'P / L',
    desc: '縦1枚 の下に 横1枚（同幅）',
    formula: 'W = (H−G)·144/337 ,  hP = W·16/9 ,  hL = W·9/16',
    solve: (H, G) => {
      const W = (H - G) * 144 / 337,
        hP = W * (16 / 9),
        hL = W * (9 / 16);
      return {
        w: W,
        tiles: [t(0, 0, W, hP, 'P'), t(0, hP + G, W, hL, 'L')]
      };
    }
  },
  /* G — 横1枚 の下に 縦1枚（F の上下反転・W の式は同一） */
  G: {
    need: 2,
    kinds: 'L / P',
    desc: '横1枚 の下に 縦1枚（同幅）',
    formula: 'W = (H−G)·144/337 ,  hL = W·9/16 ,  hP = W·16/9',
    solve: (H, G) => {
      const W = (H - G) * 144 / 337,
        hP = W * (16 / 9),
        hL = W * (9 / 16);
      return {
        w: W,
        tiles: [t(0, 0, W, hL, 'L'), t(0, hL + G, W, hP, 'P')]
      };
    }
  },
  /* H — 横1枚 の下に 縦3枚を横並び
     W·9/16 + G + ((W−2G)/3)·16/9 = H
     W·(9/16 + 16/27) = H − G + 32G/27 = H + 5G/27
     →  W = (H + 5G/27)·432/499      [9/16 + 16/27 = 499/432] */
  H: {
    need: 4,
    kinds: 'L / P×3',
    desc: '横1枚 の下に 縦3枚を横並び',
    formula: 'W = (H + 5G/27)·432/499 ,  hL = W·9/16 ,  wP = (W−2G)/3 ,  hP = wP·16/9',
    solve: (H, G) => {
      const W = (H + 5 * G / 27) * 432 / 499,
        hL = W * (9 / 16),
        wP = (W - 2 * G) / 3,
        hP = wP * (16 / 9);
      return {
        w: W,
        tiles: [t(0, 0, W, hL, 'L'), t(0, hL + G, wP, hP, 'P'), t(wP + G, hL + G, wP, hP, 'P'), t(2 * (wP + G), hL + G, wP, hP, 'P')]
      };
    }
  },
  /* I — 縦3枚を横並び の下に 横1枚（H の上下反転・W の式は同一） */
  I: {
    need: 4,
    kinds: 'P×3 / L',
    desc: '縦3枚を横並び の下に 横1枚',
    formula: 'W = (H + 5G/27)·432/499 ,  wP = (W−2G)/3 ,  hP = wP·16/9 ,  hL = W·9/16',
    solve: (H, G) => {
      const W = (H + 5 * G / 27) * 432 / 499,
        hL = W * (9 / 16),
        wP = (W - 2 * G) / 3,
        hP = wP * (16 / 9);
      return {
        w: W,
        tiles: [t(0, 0, wP, hP, 'P'), t(wP + G, 0, wP, hP, 'P'), t(2 * (wP + G), 0, wP, hP, 'P'), t(0, hP + G, W, hL, 'L')]
      };
    }
  }
};

/* 列全体を比率保持で縮小（GAP も一緒に縮む = 「比率を保ったまま全体を縮小」） */
const scaleCol = (col, s) => ({
  w: col.w * s,
  tiles: col.tiles.map(o => ({
    ...o,
    x: o.x * s,
    y: o.y * s,
    w: o.w * s,
    h: o.h * s
  }))
});

/* 次に使うパターンを決める。
   残り枚数が列の必要枚数に満たない場合はシーケンスの次のパターンへスキップ。
   1枚しか残っていない時だけ一枚絵 A / AL にフォールバック。 */
function pickPattern(seq, si, left, rnd, PT) {
  for (let k = 0; k < seq.length; k++) {
    const id = seq[(si + k) % seq.length];
    if (PT[id] && PT[id].need <= left) return {
      id,
      si: si + k + 1
    };
  }
  if (left === 1) return {
    id: rnd() < 0.5 ? 'A' : 'AL',
    si: si + 1
  };
  /* 稀: カスタム sequence が残り枚数を満たせない → 収まる中で最大のパターン */
  const fit = Object.keys(PT).filter(k => PT[k].need <= left).sort((a, b) => PT[b].need - PT[a].need)[0];
  return {
    id: fit || 'A',
    si: si + 1
  };
}

/* ---- 配置本体（純関数・React 非依存） ------------------------------------
   WdQuestPostBoardLayout({count, height, viewportWidth, seed}) →
     { tiles[], columns[], width, height, contentHeight, spec }
   tiles[i] = {x, y, w, h, kind:'P'|'L', col, pattern, i}  ← px 絶対座標
   タイル総数は count と必ず一致する（各パターンが need 枚ぴったり消費）。 */
function WdQuestPostBoardLayout(opts = {}) {
  const C = {
    ...WdQuestPostBoardSpec,
    ...(opts.spec || {})
  };
  const PT = opts.patterns || WdQuestPostBoardPatterns;
  const count = Math.max(0, Math.floor(opts.count || 0));
  const boardH = opts.height || 331;
  const vw = opts.viewportWidth || 0; /* 0 = 可視幅不明 → 90% ルールは適用しない */
  const seq = opts.sequence || C.SEQUENCE;
  const rnd = mulberry32(opts.seed == null ? 20260803 : opts.seed);
  const H = boardH - C.PAD_TOP - C.PAD; /* 列の有効高 */

  const tiles = [],
    columns = [];
  let x = C.PAD,
    left = count,
    si = 0,
    i = 0;
  while (left > 0 && H > 24) {
    const pick = pickPattern(seq, si, left, rnd, PT);
    const pat = PT[pick.id];
    si = pick.si;
    let col = pat.solve(H, C.GAP); /* まず高さぴったり H で解く */
    let s = 1;

    /* 1) タイル最大幅 MAXW — 最も広いタイルが MAXW を超えたら列ごと縮小 */
    const widest = col.tiles.reduce((m, o) => Math.max(m, o.w), 0);
    if (widest > C.MAXW) s = C.MAXW / widest;
    /* 2) 列幅がボード可視幅の 90% を超えたら、比率を保ったまま全体を縮小 */
    if (vw > 0 && col.w * s > vw * C.MAX_COL_RATIO) s = Math.min(s, vw * C.MAX_COL_RATIO / col.w);

    /* 3) 仕上げ: ぴったり埋まった列（s===1）だけ 0〜GAP×1.6px の縦ジッター。
          ジッター分だけ先に微縮小して確保するので、下端 PAD を割らない。
          H に満たない列（s<1）はジッターせず縦中央寄せ。 */
    let jitter = 0;
    if (s === 1) {
      jitter = rnd() * C.GAP * C.JITTER_GAPS;
      s = (H - jitter) / H;
    }
    if (s !== 1) col = scaleCol(col, s);
    const usedH = H * s;
    const yOff = jitter > 0 ? jitter : (H - usedH) / 2;
    const y0 = C.PAD_TOP + yOff;
    for (const o of col.tiles) {
      tiles.push({
        x: x + o.x,
        y: y0 + o.y,
        w: o.w,
        h: o.h,
        kind: o.kind,
        col: columns.length,
        pattern: pick.id,
        i: i++
      });
    }
    columns.push({
      pattern: pick.id,
      x,
      y: y0,
      w: col.w,
      h: usedH,
      scale: s,
      jitter,
      count: pat.need
    });
    left -= pat.need;
    x += col.w + C.GAP; /* 次の列の X = 現在の X + 列幅 + GAP */
  }
  return {
    tiles,
    columns,
    width: Math.round(x - (columns.length ? C.GAP : 0) + C.PAD),
    /* ボード総幅 */
    height: boardH,
    contentHeight: H,
    spec: C
  };
}

/* ---- プレビュー用コンポーネント（単色タイルのみ） ------------------------- */
const r2 = n => Math.round(n * 100) / 100;
function WdQuestPostBoard({
  count = 24,
  height = 331,
  seed = 20260803,
  sequence,
  spec,
  patterns,
  tileColor = '#333333',
  radius = 14,
  background = 'transparent',
  showPatternLabels = false,
  showTileKinds = false,
  showColumnGuides = false,
  renderTile,
  onTileClick,
  style,
  className
}) {
  const ref = React.useRef(null);
  const [vw, setVw] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setVw(el.clientWidth);
    read();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const L = WdQuestPostBoardLayout({
    count,
    height,
    viewportWidth: vw,
    seed,
    sequence,
    spec,
    patterns
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: className,
    style: {
      position: 'relative',
      height,
      overflowX: 'auto',
      overflowY: 'hidden',
      background,
      scrollbarWidth: 'thin',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: L.width,
      height: '100%'
    }
  }, showColumnGuides && L.columns.map((c, k) => /*#__PURE__*/React.createElement("div", {
    key: 'g' + k,
    style: {
      position: 'absolute',
      left: r2(c.x),
      top: L.spec.PAD_TOP,
      width: r2(c.w),
      height: L.contentHeight,
      border: '1px dashed rgba(255,255,255,.16)',
      borderRadius: 2,
      pointerEvents: 'none'
    }
  })), showPatternLabels && L.columns.map((c, k) => /*#__PURE__*/React.createElement("div", {
    key: 'l' + k,
    style: {
      position: 'absolute',
      left: r2(c.x),
      top: 14,
      width: r2(c.w),
      font: "600 10px/1 'Inter',system-ui,sans-serif",
      letterSpacing: '.1em',
      color: 'rgba(255,255,255,.5)',
      pointerEvents: 'none'
    }
  }, c.pattern)), L.tiles.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.i,
    onClick: onTileClick ? () => onTileClick(o) : undefined,
    style: {
      position: 'absolute',
      left: r2(o.x),
      top: r2(o.y),
      width: r2(o.w),
      height: r2(o.h),
      borderRadius: radius,
      background: tileColor,
      overflow: 'hidden',
      cursor: onTileClick ? 'pointer' : 'default',
      display: showTileKinds ? 'flex' : 'block',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, renderTile ? renderTile(o) : showTileKinds ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: "600 11px 'Inter',system-ui,sans-serif",
      color: 'rgba(255,255,255,.34)'
    }
  }, o.kind) : null))));
}
Object.assign(__ds_scope, { WdQuestPostBoardSpec, WdQuestPostBoardPatterns, WdQuestPostBoardLayout, WdQuestPostBoard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/WdQuestPostBoard/WdQuestPostBoard.jsx", error: String((e && e.message) || e) }); }

// components/WdTimelinePost/WdTimelinePost.jsx
try { (() => {
const S = {
  row: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr',
    gap: 12,
    padding: '20px 24px',
    borderBottom: '1px solid rgba(8,8,11,.08)',
    fontFamily: "'Noto Sans JP','Hiragino Sans',sans-serif",
    color: '#08080b',
    background: '#ffffff'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    objectFit: 'cover',
    display: 'block'
  },
  col: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  name: {
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.3
  },
  meta: {
    fontFamily: "'Inter',system-ui,sans-serif",
    fontSize: 13,
    color: 'rgba(8,8,11,.56)'
  },
  body: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.75,
    textWrap: 'pretty'
  },
  mediaOne: {
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(8,8,11,.08)'
  },
  mediaTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 4,
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(8,8,11,.08)'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    paddingTop: 2
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 0,
    padding: 0,
    cursor: 'pointer',
    minHeight: 44
  },
  actionIcon: {
    width: 18,
    height: 18,
    filter: 'invert(1)',
    opacity: .5,
    display: 'block'
  },
  likeIcon: {
    width: 18,
    height: 18,
    display: 'block',
    filter: 'invert(29%) sepia(93%) saturate(4000%) hue-rotate(320deg) brightness(102%)'
  },
  count: {
    fontFamily: "'Inter',system-ui,sans-serif",
    fontSize: 13,
    color: 'rgba(8,8,11,.56)'
  },
  countOn: {
    fontFamily: "'Inter',system-ui,sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: '#ff3e88'
  }
};
function WdTimelinePost({
  avatar,
  name,
  handle,
  time,
  body,
  media = [],
  comments = 0,
  likes = 0,
  liked = false,
  shareLabel = '共有',
  iconBase = 'assets/icons',
  onComment,
  onLike,
  onShare,
  style
}) {
  const ic = n => `${iconBase}/${n}.png`;
  const pics = (media || []).slice(0, 2);
  return /*#__PURE__*/React.createElement("article", {
    style: {
      ...S.row,
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: avatar,
    alt: "",
    style: S.avatar
  }), /*#__PURE__*/React.createElement("div", {
    style: S.col
  }, /*#__PURE__*/React.createElement("div", {
    style: S.head
  }, /*#__PURE__*/React.createElement("span", {
    style: S.name
  }, name), /*#__PURE__*/React.createElement("span", {
    style: S.meta
  }, [handle, time].filter(Boolean).join(' · '))), body && /*#__PURE__*/React.createElement("p", {
    style: S.body
  }, body), pics.length === 1 && /*#__PURE__*/React.createElement("div", {
    style: S.mediaOne
  }, /*#__PURE__*/React.createElement("img", {
    src: pics[0],
    alt: "",
    style: {
      width: '100%',
      height: 320,
      objectFit: 'cover',
      display: 'block'
    }
  })), pics.length === 2 && /*#__PURE__*/React.createElement("div", {
    style: S.mediaTwo
  }, pics.map((p, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: p,
    alt: "",
    style: {
      width: '100%',
      height: 220,
      objectFit: 'cover',
      display: 'block'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: S.actions
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: S.action,
    onClick: onComment
  }, /*#__PURE__*/React.createElement("img", {
    src: ic('icon_comment'),
    alt: "",
    style: S.actionIcon
  }), /*#__PURE__*/React.createElement("span", {
    style: S.count
  }, comments)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: S.action,
    onClick: onLike
  }, /*#__PURE__*/React.createElement("img", {
    src: ic('icon_like'),
    alt: "",
    style: liked ? S.likeIcon : S.actionIcon
  }), /*#__PURE__*/React.createElement("span", {
    style: liked ? S.countOn : S.count
  }, likes)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: S.action,
    onClick: onShare
  }, /*#__PURE__*/React.createElement("img", {
    src: ic('icon_share'),
    alt: "",
    style: S.actionIcon
  }), /*#__PURE__*/React.createElement("span", {
    style: S.count
  }, shareLabel)))));
}
Object.assign(__ds_scope, { WdTimelinePost });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/WdTimelinePost/WdTimelinePost.jsx", error: String((e && e.message) || e) }); }

// preview/eria-wall.js
try { (() => {
/* WdEriaWall — 領域境界の押し出しジオメトリ生成。
   window.EriaWall.build(el, {seed,n,r,h,blds,state}) で .ew-scene を組み立てる。
   壁色はブランドの --gradient-colorful の 11 stop を一周でサンプリングし、
   暗い stop だけ輝度下限までリフトして「一周つながって見える」ようにする。   */
(function () {
  const PAL = ['#fff0a6', '#bfcc96', '#80a787', '#40837f', '#005f67', '#60566f', '#804e78', '#bf4680', '#ff3e88', '#e86f6d', '#d0a052'];
  function lift(hex) {
    let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    const L = (.2126 * r + .7152 * g + .0722 * b) / 255;
    if (L >= .38) return hex;
    const t = (.38 - L) / (1 - L) * .85;
    const m = v => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0');
    return '#' + m(r) + m(g) + m(b);
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function build(el, o) {
    if (!el) return;
    const rnd = mulberry32(o.seed),
      N = o.n,
      R = o.r,
      H = o.h,
      S = Math.round(R * (o.ground || 3));
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = i / N * Math.PI * 2 - Math.PI / 2;
      pts.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    const uid = 'u' + o.seed,
      cleared = o.state === 'cleared';
    const edge = cleared ? '#4caf50' : 'url(#p' + uid + ')';
    let h = '<div class="ew-grd" style="width:' + S + 'px;height:' + S + 'px;margin:' + -S / 2 + 'px 0 0 ' + -S / 2 + 'px"></div>';
    h += '<svg class="ew-svg" width="' + S + '" height="' + S + '" viewBox="' + -S / 2 + ' ' + -S / 2 + ' ' + S + ' ' + S + '" style="margin:' + -S / 2 + 'px 0 0 ' + -S / 2 + 'px"><defs>' + '<filter id="b' + uid + '" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="' + (R / 26).toFixed(1) + '"/></filter>' + '<linearGradient id="p' + uid + '" x1="0" y1="0" x2="1" y2="1">' + PAL.map((c, i) => '<stop offset="' + (i / (PAL.length - 1) * 100).toFixed(0) + '%" stop-color="' + c + '"/>').join('') + '</linearGradient></defs>' + '<circle r="' + R + '" fill="' + (cleared ? 'rgba(76,175,80,.045)' : 'rgba(255,62,136,.05)') + '"/>' + '<circle r="' + R + '" fill="none" stroke="' + edge + '" stroke-width="' + (R / 22).toFixed(1) + '" opacity="' + (o.blds > 20 ? .30 : .18) + '" filter="url(#b' + uid + ')"/>' + '<circle r="' + R + '" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/></svg>';
    const placed = [];
    for (let t = 0; t < o.blds * 14 && placed.length < o.blds; t++) {
      const ang = rnd() * Math.PI * 2,
        rad = R * .22 + rnd() * (R * .66);
      const w = R * .045 + rnd() * R * .085,
        d = R * .045 + rnd() * R * .085;
      if (rad + Math.max(w, d) * .75 > R - R * .07) continue;
      const x = Math.cos(ang) * rad,
        y = Math.sin(ang) * rad;
      if (placed.some(p => Math.abs(p.x - x) < (p.w + w) / 2 + R * .02 && Math.abs(p.y - y) < (p.d + d) / 2 + R * .02)) continue;
      placed.push({
        x,
        y,
        w,
        d,
        hh: H * .08 + rnd() * rnd() * H * .55
      });
    }
    for (const b of placed) {
      h += '<div class="ew-bld" style="transform:translate3d(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px,0)">' + '<i class="t" style="width:' + b.w.toFixed(1) + 'px;height:' + b.d.toFixed(1) + 'px;margin:' + (-b.d / 2).toFixed(1) + 'px 0 0 ' + (-b.w / 2).toFixed(1) + 'px;transform:translateZ(' + b.hh.toFixed(1) + 'px)"></i>' + '<i class="s" style="width:' + b.w.toFixed(1) + 'px;height:' + b.hh.toFixed(1) + 'px;margin:' + (-b.hh / 2).toFixed(1) + 'px 0 0 ' + (-b.w / 2).toFixed(1) + 'px;transform:translate3d(0,' + (b.d / 2).toFixed(1) + 'px,' + (b.hh / 2).toFixed(1) + 'px) rotateX(-90deg)"></i>' + '<i class="s2" style="width:' + b.d.toFixed(1) + 'px;height:' + b.hh.toFixed(1) + 'px;margin:' + (-b.hh / 2).toFixed(1) + 'px 0 0 ' + (-b.d / 2).toFixed(1) + 'px;transform:translate3d(' + (b.w / 2).toFixed(1) + 'px,0,' + (b.hh / 2).toFixed(1) + 'px) rotateZ(90deg) rotateX(-90deg)"></i></div>';
    }
    for (let i = 0; i < N; i++) {
      const a = pts[i],
        b = pts[(i + 1) % N],
        dx = b[0] - a[0],
        dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) + 1,
        ang = Math.atan2(dy, dx) * 180 / Math.PI;
      const mx = (a[0] + b[0]) / 2,
        my = (a[1] + b[1]) / 2;
      const c = cleared ? '#7fd183' : lift(PAL[Math.min(PAL.length - 1, Math.round(i / N * (PAL.length - 1)))]);
      const hh = H * (cleared ? .6 : 1);
      const base = 'width:' + len.toFixed(1) + 'px;margin-left:' + (-len / 2).toFixed(1) + 'px;';
      h += '<div class="ew-seg" style="--c:' + c + ';' + base + 'height:' + hh.toFixed(1) + 'px;margin-top:' + (-hh / 2).toFixed(1) + 'px;transform:translate3d(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px,0) rotateZ(' + ang.toFixed(2) + 'deg) rotateX(-90deg) translateY(' + (-hh / 2).toFixed(1) + 'px)"></div>';
      h += '<div class="ew-cap" style="--c:' + c + ';' + base + 'height:3px;margin-top:-1.5px;transform:translate3d(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px,0) rotateZ(' + ang.toFixed(2) + 'deg) rotateX(-90deg) translateY(' + (-(hh - 1.5)).toFixed(1) + 'px)"></div>';
    }
    if (!cleared) h += '<div class="ew-core"></div><div class="ew-core r"></div>';
    el.querySelector('.ew-scene').innerHTML = h;
  }

  /* ポップアップの高さ合わせ — "Quest" の行が壁の頂点（天端リム最上部）と
     同じ高さに来るように mount の top を実測して決める。
     scale() された部分木では rect が縮尺後 px なのでローカル倍率で割る。 */
  function seatPopups() {
    document.querySelectorAll('.ew-popup').forEach(p => {
      const scope = p.parentElement;
      const stage = scope.classList.contains('ew') ? scope : scope.querySelector('.ew');
      if (!stage) return;
      const caps = stage.querySelectorAll('.ew-cap');
      if (!caps.length) return;
      let capTop = 1e9;
      caps.forEach(c => {
        const b = c.getBoundingClientRect();
        if (b.top < capTop) capTop = b.top;
      });
      const sr = stage.getBoundingClientRect(),
        k = sr.width / stage.offsetWidth || 1;
      const lab = p.querySelector('.qp-mount > .qp .qp-label') || p.querySelector('.qp-label') || p;
      const lr = lab.getBoundingClientRect(),
        pr = p.getBoundingClientRect();
      const centerY = (pr.top + pr.height / 2 - sr.top) / k;
      const delta = (lr.top + lr.height / 2 - capTop) / k;
      p.style.top = centerY - delta + 'px';
    });
  }
  function countdown() {
    const cds = [...document.querySelectorAll('[data-countdown]')].map(e => ({
      e,
      s: +e.dataset.countdown
    }));
    if (!cds.length) return;
    setInterval(() => {
      for (const c of cds) {
        c.s = c.s > 0 ? c.s - 1 : 0;
        const h = Math.floor(c.s / 3600),
          m = Math.floor(c.s % 3600 / 60),
          s = c.s % 60;
        c.e.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }
    }, 1000);
  }
  window.EriaWall = {
    build,
    seatPopups,
    countdown,
    PAL
  };
  addEventListener('resize', seatPopups);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "preview/eria-wall.js", error: String((e && e.message) || e) }); }

__ds_ns.WdCircleVoteList = __ds_scope.WdCircleVoteList;

__ds_ns.WdQuestPostBoardSpec = __ds_scope.WdQuestPostBoardSpec;

__ds_ns.WdQuestPostBoardPatterns = __ds_scope.WdQuestPostBoardPatterns;

__ds_ns.WdQuestPostBoardLayout = __ds_scope.WdQuestPostBoardLayout;

__ds_ns.WdQuestPostBoard = __ds_scope.WdQuestPostBoard;

__ds_ns.WdTimelinePost = __ds_scope.WdTimelinePost;

})();
