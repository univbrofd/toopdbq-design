/* PlaceRanking — 真上（pitch 0）の地図に、サークルの数だけエリアの円を描く。
   handoff/TimelinePlaceMode/place-map.js の流用: LIBERTY スタイル・positron 風ラベル・disk() のジオメトリは同じ。
   place-map.js の areaAdd() はソース id が固定（'area-disk' 等）で 1 枚しか描けず、光壁（fill-extrusion）は真上では
   色付きの輪になるため、ここでは同じ disk() を **id 付き**で足し、active / 選択中は「白い光のリング」（line-blur）で描く。
   [data-rmap] ホスト: data-lng / data-lat / data-zoom / data-sel（選択中 id）/ data-dim（選択以外を落とす）/
   data-pins（このホストに置くピン群のキー）。 */
(function () {
  var LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';

  /* mock 相当の 7 サークル（半径 500〜600m・重なりあり） */
  var CIRCLES = [
    { id: 'shibuya',    name: 'サークル渋谷',   c: [139.7016, 35.6585], r: 500, home: true },
    { id: 'dogenzaka',  name: 'サークル道玄坂', c: [139.6950, 35.6572], r: 500 },
    { id: 'yoyogi',     name: 'サークル代々木', c: [139.6985, 35.6745], r: 550 },
    { id: 'jingumae',   name: 'サークル神宮前', c: [139.7100, 35.6660], r: 500 },
    { id: 'harajuku',   name: 'サークル原宿',   c: [139.7045, 35.6725], r: 500 },
    { id: 'ebisu',      name: 'サークル恵比寿', c: [139.7105, 35.6470], r: 550 },
    { id: 'nakameguro', name: 'サークル中目黒', c: [139.6985, 35.6440], r: 500 }
  ];
  var ME = [139.7005, 35.6600];
  var IC = '../../assets/icons/', RL = '../../assets/sample/reel/';
  /* S2 以降の場所ピン（サークル渋谷）。mine = 自分が投稿した場所、rank = 選んだ順位 */
  var PINS = {
    shibuya: [
      { nm: 'WOMB',              c: [139.6975, 35.6573], ph: RL + 'reel012.jpg', cnt: 6, mine: true },
      { nm: 'TK NIGHTCLUB',      c: [139.6992, 35.6598], ph: RL + 'reel055.jpg', cnt: 4, mine: true },
      { nm: 'ABOUT LIFE COFFEE', c: [139.6988, 35.6560], ph: RL + 'reel004.jpg', cnt: 1, mine: true },
      { nm: '渋谷横丁',          c: [139.7030, 35.6600], ph: RL + 'reel021.jpg', cnt: 8 },
      { nm: '一蘭 渋谷店',       c: [139.7005, 35.6570], ph: RL + 'reel030.jpg', cnt: 5 },
      { nm: '名もない路地の屋台', c: [139.7035, 35.6565], ph: null, cnt: 2 }
    ]
  };

  function dest(lng, lat, rM, a) {
    var dLat = rM / 111320, dLng = rM / (111320 * Math.cos(lat * Math.PI / 180));
    return [lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)];
  }
  function ring(c, rM, n) { var o = []; for (var i = 0; i <= n; i++) o.push(dest(c[0], c[1], rM, i / n * 2 * Math.PI)); return o; }
  function disk(cc) {
    return { type: 'Feature', properties: { id: cc.id }, geometry: { type: 'Polygon', coordinates: [ring(cc.c, cc.r, 128)] } };
  }
  function patchLabels(map) {
    var style = map.getStyle(); if (!style || !style.layers) return;
    style.layers.forEach(function (layer) {
      if (layer.type !== 'symbol') return;
      var id = layer.id;
      try {
        if (/place|poi|water_name|state|country/i.test(id)) {
          map.setLayoutProperty(id, 'text-field', ['format',
            ['coalesce', ['get', 'name:ja'], ['get', 'name_ja'], ['get', 'name']], { 'font-scale': 1.0 }, '\n', {},
            ['coalesce', ['get', 'name:latin'], ['get', 'name:en'], ['get', 'name_int'], ['get', 'name']],
            { 'font-scale': 0.72, 'text-color': '#9a9aa0' }]);
          map.setLayoutProperty(id, 'text-line-height', 1.15);
          map.setPaintProperty(id, 'text-color', '#3c3c42');
          map.setPaintProperty(id, 'text-halo-color', 'rgba(255,255,255,0.92)');
          map.setPaintProperty(id, 'text-halo-width', 1.1);
        } else if (/road.*(label|name|shield)|highway.*label/i.test(id)) {
          map.setPaintProperty(id, 'text-color', '#7d7d84');
          map.setPaintProperty(id, 'text-halo-color', 'rgba(255,255,255,0.85)');
        }
      } catch (e) {}
    });
  }

  /* エリアの円: #08080b 16% 塗り + 線 90%（既存値）。dim のときは選択以外を 8% / 40% に落とす */
  function circlesAdd(map, sel, dim) {
    var firstSymbol = (map.getStyle().layers.find(function (l) { return l.type === 'symbol'; }) || {}).id;
    map.addSource('circles', { type: 'geojson', data: { type: 'FeatureCollection', features: CIRCLES.map(disk) } });
    var isSel = ['==', ['get', 'id'], sel || '__none__'];
    map.addLayer({ id: 'circles-fill', type: 'fill', source: 'circles',
      paint: { 'fill-color': '#08080b', 'fill-opacity': dim ? ['case', isSel, 0.16, 0.08] : 0.16 } }, firstSymbol);
    map.addLayer({ id: 'circles-line', type: 'line', source: 'circles',
      paint: { 'line-color': '#08080b', 'line-width': 1.4, 'line-opacity': dim ? ['case', isSel, 0.9, 0.4] : 0.9 } }, firstSymbol);
    if (sel) {
      var cc = CIRCLES.find(function (x) { return x.id === sel; });
      map.addSource('ring', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ring(cc.c, cc.r, 160) } } });
      /* active / 選択中 = 白い光のリング（真上から見た光壁） */
      map.addLayer({ id: 'ring-glow', type: 'line', source: 'ring', layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 18, 'line-blur': 14, 'line-opacity': 0.75 } });
      map.addLayer({ id: 'ring-core', type: 'line', source: 'ring', layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 3, 'line-opacity': 1 } });
    }
  }

  /* 名前 = DOM マーカー。64px 以内の名前は 1 群にまとめ「代表名 +N」 */
  function labelsAdd(map, sel, dim) {
    var marks = CIRCLES.map(function (cc) {
      var el = document.createElement('div');
      el.className = 'pr-cname' + (dim && cc.id !== sel ? ' dim' : '');
      el.innerHTML = '<span class="nm">' + cc.name + '</span><span class="pl"></span>';
      return { cc: cc, el: el, m: new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(cc.c).addTo(map) };
    });
    function cluster() {
      var order = marks.slice().sort(function (a, b) { return (b.cc.id === sel) - (a.cc.id === sel) || b.cc.r - a.cc.r; });
      var leaders = [];
      order.forEach(function (mk) {
        var p = map.project(mk.cc.c), hit = null;
        for (var i = 0; i < leaders.length; i++) {
          var q = leaders[i].p; if (Math.hypot(p.x - q.x, p.y - q.y) < 64) { hit = leaders[i]; break; }
        }
        if (hit) { hit.n++; mk.el.style.display = 'none'; }
        else { leaders.push({ mk: mk, p: p, n: 0 }); mk.el.style.display = ''; }
      });
      leaders.forEach(function (L) { L.mk.el.querySelector('.pl').textContent = L.n ? '+' + L.n : ''; });
    }
    map.on('move', cluster); cluster();
  }

  function pinsAdd(map, key, ranks) {
    (PINS[key] || []).forEach(function (p, i) {
      var el = document.createElement('div'), rk = ranks ? ranks[i] : 0;
      el.className = 'pr-pin' + (rk ? ' sel' : '') + (!p.mine && !rk ? ' other' : '');
      el.innerHTML = '<span>' + (p.ph ? '<span class="tile"><img src="' + p.ph + '" alt=""></span>'
        : '<span class="tile none"><img src="' + IC + 'icon_pin_location.png" alt=""></span>')
        + (rk ? '<span class="rank">' + rk + '</span>' : (p.cnt > 1 ? '<span class="cnt">' + p.cnt + '</span>' : ''))
        + '<span class="leg"></span></span>';
      new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(p.c).addTo(map);
    });
  }

  function init(host) {
    if (host._map || !window.maplibregl) return;
    var d = host.dataset, sel = d.sel || null, dim = 'dim' in d;
    try {
      var map = new maplibregl.Map({
        container: host, style: LIBERTY, center: [parseFloat(d.lng), parseFloat(d.lat)], zoom: parseFloat(d.zoom) || 13.6,
        pitch: 0, bearing: 0, attributionControl: false, fadeDuration: 0, scrollZoom: false, dragRotate: false, touchPitch: false,
        canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true }
      });
      host._map = map;
      map.on('style.load', function () {
        patchLabels(map);
        try { circlesAdd(map, sel, dim); } catch (e) { console.warn(e); }
        if (!('nolabels' in d)) labelsAdd(map, sel, dim);
        if (!('nome' in d)) { var me = document.createElement('div'); me.className = 'pr-me';
          new maplibregl.Marker({ element: me, anchor: 'center' }).setLngLat(ME).addTo(map); }
        if (d.pins) pinsAdd(map, d.pins, d.ranks ? d.ranks.split(',').map(Number) : null);
        host.classList.add('ready');
      });
      map.on('error', function () {});
    } catch (e) { console.warn('map init failed', e); }
  }
  function boot() { document.querySelectorAll('[data-rmap]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.RankingMap = { init: init, CIRCLES: CIRCLES, PINS: PINS };
})();
