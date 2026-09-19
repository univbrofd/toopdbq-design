/* TimelinePlaceMode — マップ面。UniverseQuest / AppStorePromo と同じ実装を流用:
   MapLibre + openfreemap liberty（positron 風ラベル）＋ WdEriaWall の fill-extrusion。
   [data-map] のホストを data-lng / data-lat / data-radius / data-pitch で初期化する。 */
(function () {
  var LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';
  var WALL_N = 56;

  function dest(lng, lat, rM, a) {
    var dLat = rM / 111320, dLng = rM / (111320 * Math.cos(lat * Math.PI / 180));
    return [lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)];
  }
  function ringPts(c, rM, n) {
    var out = [];
    for (var i = 0; i <= n; i++) out.push(dest(c[0], c[1], rM, i / n * 2 * Math.PI));
    return out;
  }
  function disk(c, rM) {
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ringPts(c, rM, 128)] } };
  }
  function lift(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var L = (.2126 * r + .7152 * g + .0722 * b) / 255;
    if (L >= .38) return hex;
    var t = (.38 - L) / (1 - L) * .85;
    var m = function (v) { return Math.round(v + (255 - v) * t).toString(16).padStart(2, '0'); };
    return '#' + m(r) + m(g) + m(b);
  }
  var WALL_PAL = ['#fff0a6', '#bfcc96', '#80a787', '#40837f', '#005f67', '#60566f',
    '#804e78', '#bf4680', '#ff3e88', '#e86f6d', '#d0a052'].map(lift);
  function segColor(i) { return WALL_PAL[Math.min(WALL_PAL.length - 1, Math.round(i / WALL_N * (WALL_PAL.length - 1)))]; }
  function wallH(R) { return Math.max(120, R * 0.39); }

  var WALL_BANDS = (function () {
    var stop = function (f) {
      return f < .34 ? .66 + (.36 - .66) * (f / .34)
        : f < .70 ? .36 + (.14 - .36) * ((f - .34) / .36)
        : .14 * (1 - (f - .70) / .30);
    };
    var n = 10, out = [];
    for (var i = 0; i < n; i++) {
      var f0 = i / n, f1 = (i + 1) / n;
      out.push(['b' + i, f0, f1, +stop((f0 + f1) / 2).toFixed(3)]);
    }
    out.push(['rim', 0.99, 1.012, 1]);
    return out;
  })();
  function wallSegs(c, R) {
    var t = Math.max(4, R * 0.012), feats = [];
    for (var i = 0; i < WALL_N; i++) {
      var a0 = i / WALL_N * 2 * Math.PI, a1 = (i + 1) / WALL_N * 2 * Math.PI;
      var p = [dest(c[0], c[1], R + t, a0), dest(c[0], c[1], R + t, a1),
        dest(c[0], c[1], R - t, a1), dest(c[0], c[1], R - t, a0)];
      feats.push({ type: 'Feature', properties: { c: segColor(i) },
        geometry: { type: 'Polygon', coordinates: [p.concat([p[0]])] } });
    }
    return { type: 'FeatureCollection', features: feats };
  }
  function wallLines(c, R) {
    var feats = [];
    for (var i = 0; i < WALL_N; i++) {
      var a0 = i / WALL_N * 2 * Math.PI, a1 = (i + 1) / WALL_N * 2 * Math.PI;
      feats.push({ type: 'Feature', properties: { c: segColor(i) },
        geometry: { type: 'LineString', coordinates: [dest(c[0], c[1], R, a0), dest(c[0], c[1], R, a1)] } });
    }
    return { type: 'FeatureCollection', features: feats };
  }
  function wallRibs(c, R) {
    var t = Math.max(5, R * 0.015), feats = [], aw = (2 * Math.PI / WALL_N) * 0.09;
    for (var i = 0; i < WALL_N; i++) {
      var a = i / WALL_N * 2 * Math.PI;
      var p = [dest(c[0], c[1], R + t, a - aw), dest(c[0], c[1], R + t, a + aw),
        dest(c[0], c[1], R - t, a + aw), dest(c[0], c[1], R - t, a - aw)];
      feats.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [p.concat([p[0]])] } });
    }
    return { type: 'FeatureCollection', features: feats };
  }
  function areaAdd(map, C, R) {
    var firstSymbol = (map.getStyle().layers.find(function (l) { return l.type === 'symbol'; }) || {}).id;
    var H = wallH(R);
    map.addSource('area-disk', { type: 'geojson', data: disk(C, R) });
    map.addSource('area-line', { type: 'geojson', data: wallLines(C, R) });
    map.addSource('area-wall', { type: 'geojson', data: wallSegs(C, R) });
    map.addSource('area-rib', { type: 'geojson', data: wallRibs(C, R) });
    map.addLayer({ id: 'area-fill', type: 'fill', source: 'area-disk',
      paint: { 'fill-color': '#08080b', 'fill-opacity': 0.16 } }, firstSymbol);
    map.addLayer({ id: 'area-glow-wide', type: 'line', source: 'area-line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['get', 'c'], 'line-width': 24, 'line-blur': 26, 'line-opacity': 0.5 } });
    map.addLayer({ id: 'area-glow-mid', type: 'line', source: 'area-line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['get', 'c'], 'line-width': 7, 'line-blur': 5, 'line-opacity': 0.8 } });
    WALL_BANDS.forEach(function (b) {
      map.addLayer({ id: 'area-wall-' + b[0], type: 'fill-extrusion', source: 'area-wall',
        paint: { 'fill-extrusion-color': ['get', 'c'], 'fill-extrusion-base': H * b[1],
          'fill-extrusion-height': H * b[2], 'fill-extrusion-opacity': b[3],
          'fill-extrusion-vertical-gradient': false } });
    });
    [['lo', 0, 0.42, 0.16], ['hi', 0.42, 0.80, 0.07]].forEach(function (r) {
      map.addLayer({ id: 'area-rib-' + r[0], type: 'fill-extrusion', source: 'area-rib',
        paint: { 'fill-extrusion-color': '#ffffff', 'fill-extrusion-base': H * r[1],
          'fill-extrusion-height': H * r[2], 'fill-extrusion-opacity': r[3],
          'fill-extrusion-vertical-gradient': false } });
    });
  }
  /* positron 風ラベル — JP + romaji */
  function patchLabels(map) {
    var style = map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach(function (layer) {
      if (layer.type !== 'symbol') return;
      var id = layer.id;
      try {
        if (/place|poi|water_name|state|country/i.test(id)) {
          map.setLayoutProperty(id, 'text-field', ['format',
            ['coalesce', ['get', 'name:ja'], ['get', 'name_ja'], ['get', 'name']], { 'font-scale': 1.0 },
            '\n', {},
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
      } catch (e) { /* field not present */ }
    });
  }
  function zoomFor(lat, meters, w, frac) {
    var mpp = meters / (w * frac);
    return Math.log2(78271.51696 * Math.cos(lat * Math.PI / 180) / mpp);
  }

  // data-pitch="0" / data-bearing="0" を 0 のまま通す（|| だと既定値に化ける）
  function num(v, fallback) { var n = parseFloat(v); return isNaN(n) ? fallback : n; }

  function init(host) {
    if (host._map || !window.maplibregl) return;
    var d = host.dataset;
    var C = [parseFloat(d.lng), parseFloat(d.lat)];
    var R = parseFloat(d.radius) || 420;
    var w = host.clientWidth || 402;
    try {
      var map = new maplibregl.Map({
        container: host, style: LIBERTY, center: C,
        zoom: zoomFor(C[1], R * 2, w, parseFloat(d.frac) || 0.72),
        pitch: num(d.pitch, 60), bearing: num(d.bearing, -18),
        interactive: false, attributionControl: false, fadeDuration: 0,
        canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true }
      });
      host._map = map;
      map.on('style.load', function () {
        try {
          map.setSky({ 'sky-color': 'rgba(0,0,0,0)', 'horizon-color': 'rgba(0,0,0,0)',
            'fog-color': 'rgba(0,0,0,0)', 'sky-horizon-blend': 0, 'horizon-fog-blend': 0,
            'fog-ground-blend': 0, 'atmosphere-blend': 0 });
        } catch (e) {}
        patchLabels(map);
        try { areaAdd(map, C, R); } catch (e) { console.warn(e); }
        host.classList.add('ready');
      });
      map.on('error', function () { /* タイルが無ければフォールバック地を残す */ });
    } catch (e) { console.warn('map init failed', e); }
  }

  function boot() { document.querySelectorAll('[data-map]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.PlaceMap = { init: init, areaAdd: areaAdd };
})();
