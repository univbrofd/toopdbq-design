/* ============================================================================
   earth/groups.js  —  現在地で入っているサークル（グループ）の一覧 + エリア表示
   Clusters the sample circles tightly around the user's current location
   (渋谷ハチ公). Each circle gets a metric "area" ring + an avatar pin.
   "Inside" = the current location falls within the circle's radius — computed,
   not hardcoded. The bottom panel lists every circle you're currently inside.
   ========================================================================== */
(function () {
  const AV = (n) => '../../assets/sample/user/' + n + '.jpg';

  // current location (= circle membership is decided by distance to this point)
  const HERE = [139.70064, 35.65905]; // 渋谷ハチ公前

  // circles. "inside" ones sit tightly around HERE so the current location is
  // near their center; "outside" ones are clearly farther away and don't reach.
  const GROUPS = [
    { name: '渋谷コミュニティ', desc: '渋谷駅周辺のコミュニティ', lng: 139.70064, lat: 35.65905, radius: 130, members: 248, avatar: AV('user002') },
    { name: 'ハチ公スナップ',   desc: 'ハチ公前で一枚',           lng: 139.70086, lat: 35.65914, radius: 110, members: 64,  avatar: AV('user004') },
    { name: 'センター街グルメ', desc: '食べ歩きクルー',           lng: 139.70044, lat: 35.65918, radius: 120, members: 132, avatar: AV('user006') },
    { name: '宮益坂フォト',     desc: '写真好きが集まる場所',     lng: 139.70270, lat: 35.65862, radius: 120, members: 88,  avatar: AV('user009') },
    { name: '道玄坂ナイト',     desc: '夜の道玄坂で集まろう',     lng: 139.69760, lat: 35.65788, radius: 150, members: 96,  avatar: AV('user012') },
    { name: '宮下パークの森',   desc: '公園でまったり',           lng: 139.70280, lat: 35.66070, radius: 150, members: 173, avatar: AV('user006') },
  ];

  // planar metric distance between two [lng,lat] points (fine at city scale)
  function distM(a, b) {
    const dLat = (a[1] - b[1]) * 110574;
    const dLng = (a[0] - b[0]) * 111320 * Math.cos(b[1] * Math.PI / 180);
    return Math.hypot(dLat, dLng);
  }

  // decorate each group with inside-flag + distance-to-its-center from HERE
  GROUPS.forEach((g) => {
    g.dist = Math.round(distM(HERE, [g.lng, g.lat]));
    g.inside = g.dist <= g.radius;
  });

  let map = null;
  let markers = [];
  let selected = GROUPS.findIndex((g) => g.inside);
  if (selected < 0) selected = 0;

  // approximate a metric circle as a lon/lat polygon ring
  function circleRing(lng, lat, radiusM, pts) {
    pts = pts || 72;
    const coords = [];
    const latR = lat * Math.PI / 180;
    const dLat = radiusM / 110574;
    const dLng = radiusM / (111320 * Math.cos(latR));
    for (let i = 0; i <= pts; i++) {
      const t = (i / pts) * 2 * Math.PI;
      coords.push([lng + dLng * Math.cos(t), lat + dLat * Math.sin(t)]);
    }
    return coords;
  }

  function areaFeatures() {
    return GROUPS.map((g, i) => ({
      type: 'Feature',
      id: i,
      properties: { inside: g.inside, name: g.name },
      geometry: { type: 'Polygon', coordinates: [circleRing(g.lng, g.lat, g.radius)] },
    }));
  }

  // features ordered so the selected circle is drawn LAST (= on top).
  // id stays = original index, so feature-state survives the reorder.
  function orderedData() {
    const feats = areaFeatures();
    feats.sort((a, b) => (a.id === selected ? 1 : 0) - (b.id === selected ? 1 : 0));
    return { type: 'FeatureCollection', features: feats };
  }

  function addAreaLayers() {
    if (map.getSource('groups-area')) return;
    map.addSource('groups-area', { type: 'geojson', data: orderedData() });

    map.addLayer({
      id: 'groups-area-fill', type: 'fill', source: 'groups-area',
      paint: {
        // monochrome: selected = white cover · inside = light gray · outside = dark gray
        'fill-color': [
          'case', ['boolean', ['feature-state', 'sel'], false], '#ffffff',
          ['case', ['get', 'inside'], '#dcdcdc', '#6b6b6b'],
        ],
        'fill-opacity': [
          'case', ['boolean', ['feature-state', 'sel'], false], 0.5,   // 白いカバー · 透過率50%
          ['case', ['get', 'inside'], 0.10, 0.05],
        ],
      },
    });
    // drop shadow under the selected ring (dark, offset, blurred — screen-space)
    map.addLayer({
      id: 'groups-area-shadow', type: 'line', source: 'groups-area',
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': 'rgba(0,0,0,.55)',
        'line-width': ['case', ['boolean', ['feature-state', 'sel'], false], 3, 0],
        'line-blur': 4,
        'line-translate': [0, 3],
        'line-translate-anchor': 'viewport',
        'line-opacity': ['case', ['boolean', ['feature-state', 'sel'], false], 0.6, 0],
      },
    });
    map.addLayer({
      id: 'groups-area-line', type: 'line', source: 'groups-area',
      layout: { 'line-join': 'round' },
      paint: {
        // selected = bright white · unselected = gray (thin)
        'line-color': [
          'case', ['boolean', ['feature-state', 'sel'], false], '#ffffff',
          'rgba(120,120,120,.6)',
        ],
        'line-width': ['case', ['boolean', ['feature-state', 'sel'], false], 1.8, 0.8],
        'line-dasharray': ['case', ['get', 'inside'], ['literal', [1, 0]], ['literal', [2.4, 2.4]]],
      },
    });
  }

  function buildPins() {
    markers.forEach((m) => m.remove());
    markers = [];
    GROUPS.forEach((g, i) => {
      const el = document.createElement('button');
      el.className = 'grp-pin' + (g.inside ? '' : ' out');
      el.setAttribute('aria-label', g.name);
      el.innerHTML =
        '<span class="grp-av" style="background-image:url(' + g.avatar + ')"></span>';
      el.onclick = () => select(i);
      const mk = new maplibregl.Marker({ element: el, anchor: 'center', pitchAlignment: 'map' })
        .setLngLat([g.lng, g.lat])
        .addTo(map);
      markers.push(mk);
    });
  }

  // ---- bottom panel: list of circles the current location is inside ----------
  function buildList() {
    const list = document.getElementById('ccList');
    const countEl = document.getElementById('ccCount');
    if (!list) return;
    const inside = GROUPS.map((g, i) => ({ g, i })).filter((o) => o.g.inside);
    if (countEl) countEl.textContent = inside.length;

    list.innerHTML = '';
    inside.forEach(({ g, i }) => {
      const row = document.createElement('button');
      row.className = 'cc-row' + (i === selected ? ' sel' : '');
      row.dataset.i = i;
      row.innerHTML =
        '<span class="cc-av" style="background-image:url(' + g.avatar + ')"></span>' +
        '<span class="cc-info">' +
          '<span class="cc-name">' + g.name + '<span class="cc-pill">エリア内</span></span>' +
          '<span class="cc-meta">半径' + g.radius + 'm · ' + g.members + '人 · 中心まで' + g.dist + 'm</span>' +
        '</span>' +
        '<span class="cc-chev"></span>';
      row.onclick = () => select(i);
      list.appendChild(row);
    });
  }

  function syncRows() {
    document.querySelectorAll('.cc-row').forEach((r) => {
      r.classList.toggle('sel', +r.dataset.i === selected);
    });
  }

  // show / hide the whole circle layer (areas + pins) — globe view hides them,
  // the post flow reveals them on the dive-in.
  function setVisible(on) {
    markers.forEach((m) => { m.getElement().style.display = on ? '' : 'none'; });
    ['groups-area-fill', 'groups-area-shadow', 'groups-area-line'].forEach((id) => {
      if (map && map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    });
  }

  function select(i) {
    if (map.getSource('groups-area')) {
      try { map.removeFeatureState({ source: 'groups-area', id: selected }, 'sel'); } catch (e) {}
    }
    selected = i;
    if (map.getSource('groups-area')) {
      map.setFeatureState({ source: 'groups-area', id: i }, { sel: true });
      map.getSource('groups-area').setData(orderedData());   // bring selected to front
    }
    markers.forEach((m, k) => m.getElement().classList.toggle('sel', k === i));
    syncRows();
    const g = GROUPS[i];
    map.easeTo({ center: [g.lng, g.lat], duration: 600 });
  }

  function attach(_map) {
    map = _map;
    addAreaLayers();
    buildPins();
    buildList();
    markers.forEach((m, k) => m.getElement().classList.toggle('sel', k === selected));
    map.setFeatureState({ source: 'groups-area', id: selected }, { sel: true });
    setVisible(false);   // start hidden — globe view; the post flow reveals them
  }

  window.EarthGroups = { attach, select, setVisible, get: () => ({ groups: GROUPS, selected }) };
})();
