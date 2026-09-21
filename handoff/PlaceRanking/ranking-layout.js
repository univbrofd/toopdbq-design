/* PlaceRanking — 確認モードの配置検証（v3・16:9 の横長 + 順位ごとの行）。
   402×874 に任意の位置関係の Best 3 が収まるかを乱数で総当たりする。
   A = 地点に置くだけ（16:9・as-built のずらし + clamp。重なりは解かない）
   B = 上位優先の行配置: 写真は 16:9（1 位 352 / 2 位 280 / 3 位 216）。同じ高さに他の順位を置かない =
       画面を「行」で使う。1 位を地点の高さに置き、2 位・3 位は重ならない側（上 or 下）へ縦にずらす。
       6 通りの上下順を試し、1 位のずれ × 10 + 2 位 × 3 + 3 位 × 1 が最小の並びを採る。 */
(function () {
  var W = 402, H = 874, CX = 201, CY = 437;
  var SAFE = { x0: 8, x1: 394, y0: 200, y1: 760 };     // 上 = 縁取りタイトルの下端 / 下 = 保存ピルの上端
  var SIZES = [[352, 198], [280, 158], [216, 122]];    // 16:9 (幅, 高さ) — 1 位 / 2 位 / 3 位
  var LAB_DROP = 14, GAP = 16, LEADER = 24, WEIGHT = [10, 3, 1];

  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function norm(v) { var l = Math.hypot(v[0], v[1]); return l < 1e-6 ? [0, -1] : [v[0] / l, v[1] / l]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* 1 ケース = 三角形の形（単位円内）+ 広がり（フロア 120m の zoom で見た最遠 px・近い側に偏らせる）+ 順位 + 名前の長さ */
  function genCase(r, margin) {
    var raw = [], i;
    for (i = 0; i < 3; i++) { var a = r() * Math.PI * 2, d = Math.sqrt(r()); raw.push([d * Math.cos(a), d * Math.sin(a)]); }
    var cx = (raw[0][0] + raw[1][0] + raw[2][0]) / 3, cy = (raw[0][1] + raw[1][1] + raw[2][1]) / 3, md = 0;
    raw = raw.map(function (p) { var q = [p[0] - cx, p[1] - cy]; md = Math.max(md, Math.hypot(q[0], q[1])); return q; });
    if (md < 1e-6) md = 1;
    var s = Math.min(6 + r() * r() * 260, 145 / margin);
    var ranks = [0, 1, 2]; for (i = 2; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = ranks[i]; ranks[i] = ranks[j]; ranks[j] = t; }
    var lw = []; for (i = 0; i < 3; i++) lw.push(Math.min(190, 40 + Math.floor(r() * 12) * 9) + 32);
    return { pts: raw.map(function (p) { return [CX + p[0] / md * s, CY + p[1] / md * s]; }), ranks: ranks, lw: lw, spread: s };
  }

  function box(st) { return { x0: st.c[0] - st.w / 2, x1: st.c[0] + st.w / 2, y0: st.c[1] - st.h / 2, y1: st.c[1] + st.h / 2 + LAB_DROP }; }
  function hit(a, b) { return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1; }
  function inside(b) { return b.x0 >= SAFE.x0 - .5 && b.x1 <= SAFE.x1 + .5 && b.y0 >= SAFE.y0 - .5 && b.y1 <= SAFE.y1 + .5; }
  function rowHit(a, b) { return a.y0 < b.y1 && b.y0 < a.y1; }   // 同じ高さの帯を共有しているか

  /* A: 地点 + 他の重心と反対へ 高さ × 0.4、安全域へ clamp。重なりはそのまま */
  function placeA(cs) {
    return cs.pts.map(function (p, i) {
      var o = [0, 1, 2].filter(function (k) { return k !== i; });
      var g = [(cs.pts[o[0]][0] + cs.pts[o[1]][0]) / 2, (cs.pts[o[0]][1] + cs.pts[o[1]][1]) / 2];
      var d = norm([p[0] - g[0], p[1] - g[1]]), sz = SIZES[cs.ranks[i]], w = sz[0], h = sz[1];
      var c = [p[0] + d[0] * h * .4, p[1] + d[1] * h * .4];
      c[0] = clamp(c[0], SAFE.x0 + w / 2, SAFE.x1 - w / 2); c[1] = clamp(c[1], SAFE.y0 + h / 2, SAFE.y1 - h / 2 - LAB_DROP);
      return { c: c, w: w, h: h, lw: cs.lw[i] };
    });
  }

  /* B: 行配置。order = 上から下への index の並び */
  function packOrder(cs, order) {
    var rows = order.map(function (i) { var sz = SIZES[cs.ranks[i]]; return { i: i, h: sz[1] + LAB_DROP, w: sz[0], t: cs.pts[i][1] - sz[1] / 2 }; });
    var k, y = [];
    for (k = 0; k < 3; k++) y[k] = Math.max(rows[k].t, k ? y[k - 1] + rows[k - 1].h + GAP : SAFE.y0);      // 目標へ → 下へ押す
    for (k = 2; k >= 0; k--) y[k] = Math.min(y[k], (k < 2 ? y[k + 1] - GAP : SAFE.y1) - rows[k].h);          // 下端からはみ出しを引き上げる
    for (k = 0; k < 3; k++) y[k] = Math.max(y[k], k ? y[k - 1] + rows[k - 1].h + GAP : SAFE.y0);            // 上端を守る（合計 552 ≤ 560 なので必ず入る）
    var st = [], cost = 0;
    rows.forEach(function (r, k) {
      var sz = SIZES[cs.ranks[r.i]], cy = y[k] + sz[1] / 2, cx = clamp(cs.pts[r.i][0], SAFE.x0 + sz[0] / 2, SAFE.x1 - sz[0] / 2);
      st[r.i] = { c: [cx, cy], w: sz[0], h: sz[1], lw: cs.lw[r.i] };
      cost += WEIGHT[cs.ranks[r.i]] * Math.abs(cy - cs.pts[r.i][1]);
    });
    return { st: st, cost: cost };
  }
  var ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  function placeB(cs) {
    var best = null;
    ORDERS.forEach(function (o) { var r = packOrder(cs, o); if (!best || r.cost < best.cost) best = r; });
    return best.st;
  }

  function evaluate(cs, st) {
    var boxes = st.map(box), overlap = false, sameRow = false, out = false, i, j;
    for (i = 0; i < 3; i++) { if (!inside(boxes[i])) out = true; for (j = i + 1; j < 3; j++) { if (hit(boxes[i], boxes[j])) overlap = true; if (rowHit(boxes[i], boxes[j])) sameRow = true; } }
    return { ok: !overlap && !out && !sameRow, overlap: overlap, out: out, sameRow: sameRow };
  }
  function leader(st, p) { return Math.abs(st.c[1] - p[1]) > st.h / 2 + LEADER || Math.abs(st.c[0] - p[0]) > st.w / 2 + LEADER; }
  function solve(cs, fn) { var st = fn(cs); return { st: st, ev: evaluate(cs, st) }; }

  /* ---- 描画（mini phone・SVG） ---- */
  var K = 0.3;
  function mini(cs, sol, who) {
    var s = '<svg width="' + (W * K) + '" height="' + (H * K) + '" viewBox="0 0 ' + W + ' ' + H + '" style="background:#e9e5d9">';
    s += '<rect x="0" y="0" width="' + W + '" height="' + SAFE.y0 + '" fill="rgba(8,8,11,.06)"/>';
    s += '<rect x="0" y="' + SAFE.y1 + '" width="' + W + '" height="' + (H - SAFE.y1) + '" fill="rgba(8,8,11,.06)"/>';
    s += '<rect x="' + SAFE.x0 + '" y="' + SAFE.y0 + '" width="' + (SAFE.x1 - SAFE.x0) + '" height="' + (SAFE.y1 - SAFE.y0) + '" fill="none" stroke="rgba(8,8,11,.25)" stroke-dasharray="6 6" stroke-width="2"/>';
    s += '<rect x="40" y="76" width="322" height="100" rx="10" fill="rgba(8,8,11,.14)"/><rect x="90" y="774" width="222" height="56" rx="28" fill="#08080b"/>';
    var order = [0, 1, 2].sort(function (a, b) { return cs.ranks[b] - cs.ranks[a]; });
    order.forEach(function (i) {
      var st = sol.st[i], p = cs.pts[i], rk = cs.ranks[i], x = st.c[0] - st.w / 2, y = st.c[1] - st.h / 2;
      if (leader(st, p)) {
        var ex = clamp(p[0], x + 12, x + st.w - 12), ey = p[1] < st.c[1] ? y : y + st.h + LAB_DROP;
        s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + ex + '" y2="' + ey + '" stroke="#08080b" stroke-width="3" stroke-dasharray="8 8" opacity=".55"/>';
      }
      var fill = ['#ff3e88', '#005f67', '#d0a052'][rk];
      s += '<rect x="' + (x + 8) + '" y="' + (y - 6) + '" width="' + st.w + '" height="' + st.h + '" rx="6" fill="#fff" transform="rotate(2.5 ' + st.c[0] + ' ' + st.c[1] + ')" opacity=".9"/>';
      s += '<rect x="' + x + '" y="' + y + '" width="' + st.w + '" height="' + st.h + '" rx="6" fill="#fff"/>';
      s += '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="' + (st.w - 12) + '" height="' + (st.h - 12) + '" rx="3" fill="' + fill + '" opacity=".85"/>';
      var lx = st.c[0] - st.lw / 2, ly = y + st.h + LAB_DROP - 26;
      s += '<rect x="' + lx + '" y="' + ly + '" width="' + st.lw + '" height="26" rx="4" fill="#fff" stroke="rgba(8,8,11,.25)"/>';
      s += '<rect x="' + lx + '" y="' + ly + '" width="34" height="26" rx="13" fill="#fff" stroke="#08080b" stroke-width="2"/>';
      s += '<text x="' + (lx + 17) + '" y="' + (ly + 19) + '" text-anchor="middle" font-family="Inter,sans-serif" font-size="15" font-weight="800" fill="#08080b">' + (rk + 1) + '</text>';
    });
    cs.pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#08080b" stroke="#fff" stroke-width="3"/>'; });
    if (!sol.ev.ok) s += '<rect x="3" y="3" width="' + (W - 6) + '" height="' + (H - 6) + '" fill="none" stroke="#ff6b6b" stroke-width="8"/>';
    s += '</svg>';
    var tag = who + (sol.ev.ok ? '' : (sol.ev.overlap ? ' · 重なり' : sol.ev.sameRow ? ' · 同じ行' : ' · はみ出し'));
    return '<div><div>' + s + '</div><div class="who ' + (sol.ev.ok ? '' : 'ng') + '">' + tag + '</div></div>';
  }

  /* ---- 統計 ---- */
  function stats(margin, n, seed) {
    var r = rng(seed), okA = 0, okB = 0, buckets = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], leaders = [0, 0, 0], firstStay = 0, firstMove = 0;
    for (var i = 0; i < n; i++) {
      var cs = genCase(r, margin), a = solve(cs, placeA), b = solve(cs, placeB);
      if (a.ev.ok) okA++; if (b.ev.ok) okB++;
      var bk = cs.spread < 40 ? 0 : cs.spread < 90 ? 1 : 2; buckets[bk][0]++; if (a.ev.ok) buckets[bk][1]++; if (b.ev.ok) buckets[bk][2]++;
      b.st.forEach(function (s, k) { if (leader(s, cs.pts[k])) leaders[cs.ranks[k]]++; });
      var f = cs.ranks.indexOf(0), dy = Math.abs(b.st[f].c[1] - cs.pts[f][1]);
      if (dy <= 12) firstStay++; firstMove += dy;
    }
    return { okA: okA, okB: okB, buckets: buckets, leaders: leaders, n: n, firstStay: firstStay, firstMove: firstMove / n };
  }

  /* ---- UI ---- */
  var grid = document.getElementById('simGrid'), statHost = document.getElementById('simStats');
  var state = { margin: 1.8, seed: 7, only: false };
  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
  function render() {
    var r = rng(state.seed), html = '', shown = 0, tries = 0;
    while (shown < 18 && tries < 400) {
      tries++;
      var cs = genCase(r, state.margin), a = solve(cs, placeA), b = solve(cs, placeB);
      if (state.only && a.ev.ok && b.ev.ok) continue;
      html += '<div class="pk-sim-pair">' + mini(cs, a, 'A') + mini(cs, b, 'B') + '</div>'; shown++;
    }
    grid.innerHTML = html;
    var st = stats(state.margin, 3000, state.seed + 1);
    var bl = ['近い（最遠 &lt; 40px）', '中（40–90px）', '広い（&gt; 90px）'];
    statHost.innerHTML =
      '<div class="pk-sim-stat"><div class="h">A — 地点に置くだけ（16:9・余裕 ×' + state.margin.toFixed(1) + '）</div>収まる <b class="' + (pct(st.okA, st.n) > 90 ? 'ok' : 'ng') + '">' + pct(st.okA, st.n) + '%</b> / ' + st.n + ' ケース<div class="bar"><i style="width:' + pct(st.okA, st.n) + '%"></i></div>' +
        bl.map(function (l, i) { return l + ' <b>' + pct(st.buckets[i][1], st.buckets[i][0]) + '%</b>（' + st.buckets[i][0] + '）'; }).join('<br>') + '</div>' +
      '<div class="pk-sim-stat"><div class="h">B — 上位優先の行配置（同じ高さに他の順位を置かない）</div>収まる <b class="' + (pct(st.okB, st.n) > 90 ? 'ok' : 'ng') + '">' + pct(st.okB, st.n) + '%</b> / ' + st.n + ' ケース<div class="bar"><i style="width:' + pct(st.okB, st.n) + '%"></i></div>' +
        bl.map(function (l, i) { return l + ' <b>' + pct(st.buckets[i][2], st.buckets[i][0]) + '%</b>'; }).join('<br>') + '</div>' +
      '<div class="pk-sim-stat"><div class="h">B の内訳</div>1 位が地点の高さ（±12px）に留まる <b>' + pct(st.firstStay, st.n) + '%</b> · 1 位の縦ずれ 平均 <b>' + Math.round(st.firstMove) + 'px</b><br>引き出し線が出る 1 位 <b>' + pct(st.leaders[0], st.n) + '%</b> · 2 位 <b>' + pct(st.leaders[1], st.n) + '%</b> · 3 位 <b>' + pct(st.leaders[2], st.n) + '%</b></div>';
    document.getElementById('mv').textContent = state.margin.toFixed(1);
    document.getElementById('spreadv').textContent = Math.round(145 / state.margin);
  }
  document.getElementById('margin').addEventListener('input', function (e) { state.margin = parseFloat(e.target.value); render(); });
  document.getElementById('reseed').addEventListener('click', function () { state.seed = (state.seed * 7 + 13) % 100000; render(); });
  document.getElementById('only').addEventListener('click', function (e) { state.only = !state.only; e.target.classList.toggle('on', state.only); render(); });
  document.querySelectorAll('[data-margin]').forEach(function (b) { b.addEventListener('click', function () { state.margin = parseFloat(b.dataset.margin); document.getElementById('margin').value = state.margin; render(); }); });
  render();
  window.PkRows = { place: placeB, SIZES: SIZES, SAFE: SAFE };
})();
