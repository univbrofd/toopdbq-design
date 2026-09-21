/* PlaceRanking — 行配置の実描画検証。ranking-layout.js の PkRows.place（同じアルゴリズム）を、実物のスタック
   （16:9 の写真・帯・順位・点線）で描く。(1) 3 点をドラッグして見る phone、(2) 形 × 回転 × 広がり × 順位の総当たりボード。 */
(function () {
  var W = 402, H = 874, CX = 201, CY = 437, R = '../../assets/sample/reel/';
  var PLACES = [
    { name: 'CLUB CAMELOT', lat: true, ph: ['reel012', 'reel013', 'reel036'] },
    { name: 'TK NIGHTCLUB', lat: true, ph: ['reel055', 'reel041'] },
    { name: 'WOMB', lat: true, ph: ['reel058'] }
  ];
  var ALT = [
    { name: '名もない路地の屋台', lat: false, ph: [] },
    { name: 'Contact Tokyo Dogenzaka Underground', lat: true, ph: ['reel021', 'reel027'] },
    { name: '終電後にだけ開く地下のバー', lat: false, ph: ['reel025', 'reel030', 'reel033'] }
  ];
  function lw(p) { var n = p.name; var w = 0; for (var i = 0; i < n.length; i++) w += n.charCodeAt(i) > 255 ? 15 : 8.6; return Math.min(190, w + 24); }
  function suf(n) { return ['st', 'nd', 'rd'][n]; }

  /* 実物のスタックを DOM で描く */
  function draw(host, pts, ranks, places, small) {
    var IMG = small ? '../../assets/reel-sm/' : R;
    var cs = { pts: pts, ranks: ranks, lw: places.map(lw) };
    var st = PkRows.place(cs), html = '', svg = '', i;
    var order = [0, 1, 2].sort(function (a, b) { return ranks[b] - ranks[a]; });
    order.forEach(function (i) {
      var s = st[i], p = pts[i], pl = places[i], rk = ranks[i];
      var x = s.c[0] - s.w / 2, y = s.c[1] - s.h / 2;
      var far = Math.abs(s.c[1] - p[1]) > s.h / 2 + 24 || Math.abs(s.c[0] - p[0]) > s.w / 2 + 24;
      if (far) {
        var ex = Math.max(x + 12, Math.min(x + s.w - 12, p[0])), ey = p[1] < s.c[1] ? y : y + s.h + 14;
        svg += '<path d="M' + p[0] + ' ' + p[1] + ' L' + ex + ' ' + ey + '" stroke="#08080b" stroke-width="1.5" stroke-dasharray="4 4" opacity=".6"/>';
      }
      var phs = pl.ph.length ? pl.ph : [null];
      var inner = '';
      for (var k = Math.min(3, phs.length) - 1; k >= 0; k--) {
        var cls = k === 0 ? 'ph' : 'ph b' + (k + 1);
        inner += phs[k] ? '<div class="' + cls + '"><img loading="lazy" src="' + IMG + phs[k] + '.jpg" alt=""></div>' : '<div class="ph none"><img src="../../assets/icons/icon_pin_location.png" alt=""></div>';
      }
      html += '<div class="pk-stack wide" style="--x:' + s.c[0] + 'px; --y:' + s.c[1] + 'px; --w:' + s.w + 'px; --h:' + s.h + 'px">' + inner +
        '<span class="rs">' + (rk + 1) + '<small>' + suf(rk) + '</small></span><div class="pk-lab"><span class="nm' + (pl.lat ? ' lat' : '') + '">' + pl.name + '</span></div></div>';
    });
    pts.forEach(function (p) { html += '<div class="pk-pt" style="--x:' + p[0] + 'px; --y:' + p[1] + 'px"></div>'; });
    host.querySelector('.stage').innerHTML = '<svg class="pk-leader" aria-hidden="true">' + svg + '</svg>' + html;
    /* 判定: 重なり / 同じ行 / はみ出し */
    var bx = st.map(function (s) { return { x0: s.c[0] - s.w / 2, x1: s.c[0] + s.w / 2, y0: s.c[1] - s.h / 2, y1: s.c[1] + s.h / 2 + 14 }; }), bad = false;
    for (i = 0; i < 3; i++) { if (bx[i].x0 < 7 || bx[i].x1 > 395 || bx[i].y0 < 199 || bx[i].y1 > 761) bad = true; for (var j = i + 1; j < 3; j++) if (bx[i].y0 < bx[j].y1 && bx[j].y0 < bx[i].y1) bad = true; }
    host.classList.toggle('ng', bad);
    return bad;
  }

  /* ---- (1) ドラッグ ---- */
  var live = document.getElementById('live');
  if (live) {
    var pts = [[150, 545], [285, 395], [168, 372]], ranks = [0, 1, 2], places = PLACES.slice();
    var handles = live.querySelector('.handles');
    function redraw() {
      draw(live, pts, ranks, places);
      handles.innerHTML = pts.map(function (p, i) { return '<div class="pk-handle" data-i="' + i + '" style="left:' + (p[0] - 22) + 'px; top:' + (p[1] - 22) + 'px"><span>' + (ranks[i] + 1) + '</span></div>'; }).join('');
    }
    var drag = null;
    handles.addEventListener('pointerdown', function (e) { var h = e.target.closest('.pk-handle'); if (!h) return; drag = +h.dataset.i; h.setPointerCapture(e.pointerId); });
    handles.addEventListener('pointermove', function (e) {
      if (drag === null) return;
      var r = live.getBoundingClientRect(), k = r.width / W;
      pts[drag] = [Math.max(0, Math.min(W, (e.clientX - r.left) / k)), Math.max(62, Math.min(H - 34, (e.clientY - r.top) / k))];
      redraw();
    });
    handles.addEventListener('pointerup', function () { drag = null; }); handles.addEventListener('pointercancel', function () { drag = null; });
    document.getElementById('liveRot').addEventListener('click', function () { ranks = ranks.map(function (r) { return (r + 1) % 3; }); redraw(); });
    document.getElementById('liveAlt').addEventListener('click', function () { places = places === PLACES ? ALT : PLACES; redraw(); });
    document.getElementById('liveRnd').addEventListener('click', function () {
      var a = Math.random() * Math.PI * 2, s = 10 + Math.random() * 130;
      pts = [0, 1, 2].map(function (k) { var t = a + k * 2.1 + (Math.random() - .5); var d = s * (0.4 + Math.random() * 0.6); return [CX + Math.cos(t) * d, CY + Math.sin(t) * d]; });
      redraw();
    });
    document.querySelectorAll('[data-preset]').forEach(function (b) {
      b.addEventListener('click', function () { pts = JSON.parse(b.dataset.preset).map(function (p) { return [CX + p[0], CY + p[1]]; }); redraw(); });
    });
    redraw();
  }

  /* ---- (2) 総当たり ---- */
  var board = document.getElementById('board');
  if (board) {
    var SHAPES = { '正三角形': [[0, -1], [.87, .5], [-.87, .5]], '平たい三角形': [[-1, .3], [1, .3], [0, -.2]], '一直線': [[-1, 0], [0, 0], [1, 0]], '直角': [[-.7, -.7], [.7, -.7], [-.7, .7]] };
    var ROT = [0, 60, 120], SPREAD = [{ n: '近い', s: 22 }, { n: '中', s: 80 }, { n: '広い', s: 140 }], PERM = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    var html = '', total = 0, ng = 0, list = [];
    Object.keys(SHAPES).forEach(function (sn) {
      html += '<div class="pk-board-h">' + sn + '</div><div class="pk-board-row">';
      ROT.forEach(function (rot) { SPREAD.forEach(function (sp) { PERM.forEach(function (pm) {
        var t = rot * Math.PI / 180, base = SHAPES[sn];
        var cx = (base[0][0] + base[1][0] + base[2][0]) / 3, cy = (base[0][1] + base[1][1] + base[2][1]) / 3;
        var pts = base.map(function (p) { var x = p[0] - cx, y = p[1] - cy; return [CX + (x * Math.cos(t) - y * Math.sin(t)) * sp.s, CY + (x * Math.sin(t) + y * Math.cos(t)) * sp.s]; });
        var id = 'b' + total++;
        html += '<div class="pk-tile-wrap"><div class="pk-tile pk-flat" id="' + id + '" style="--gc: var(--gc-night)"><div class="stage"></div></div><div class="who">' + rot + '° · ' + sp.n + ' · ' + pm.map(function (r) { return r + 1; }).join('') + '</div></div>';
        list.push({ id: id, pts: pts, ranks: pm });
      }); }); });
      html += '</div>';
    });
    board.innerHTML = html;
    var SMALL = [{ name: 'CLUB CAMELOT', lat: true, ph: ['reel012', 'reel013', 'reel006'] }, { name: 'TK NIGHTCLUB', lat: true, ph: ['reel011', 'reel003'] }, { name: 'WOMB', lat: true, ph: ['reel008'] }];
    list.forEach(function (c) { if (draw(document.getElementById(c.id), c.pts, c.ranks, SMALL, true)) ng++; });
    document.getElementById('boardSum').innerHTML = '<b>' + total + '</b> ケース（形 4 × 回転 3 × 広がり 3 × 順位 3）· 収まらない <b class="' + (ng ? 'ng' : 'ok') + '">' + ng + '</b>';
  }
})();
