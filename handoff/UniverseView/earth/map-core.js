/* ============================================================================
   earth/map-core.js  —  the rendering engine (MapLibre positron + globe)
   Owns the map, the globe projection, the positron label/shield look, and the
   three camera presets (Globe / Region / Street+3D) + their continuity.
   ========================================================================== */
(function () {
  // user / circle center — 渋谷ハチ公像 (Hachikō statue, Shibuya Station)。
  // Flutter StagedeckCase.shibuya (lat 35.6592, lng 139.7006) と同一中心に揃える (web⇄flutter 初期表示一致)。
  const CENTER = [139.7006, 35.6592];

  // 実装(Flutter assets/web/earth/map-core.js)と同一の positron tiles を使う。
  // 旧 cartocdn positron はラベルが極端に少なく実機と乖離するため openfreemap に揃える。
  const POSITRON = 'https://tiles.openfreemap.org/styles/positron';

  const map = new maplibregl.Map({
    container: 'map',
    style: POSITRON,
    center: CENTER,
    zoom: 14, // Flutter defaultInitialZoom=14 に一致 (旧 16 は web だけ過拡大だった)
    pitch: 55,
    bearing: 0,
    attributionControl: false,
    canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
    dragRotate: true,
    fadeDuration: 120,
    maxPitch: 70,
  });
  map.scrollZoom.setWheelZoomRate(1 / 280);
  map.touchZoomRotate.enableRotation();

  let current = 'street';

  // -- camera presets (read live from EarthLook so sliders tune continuity) --
  function preset(name) {
    const L = window.EarthLook.get();
    switch (name) {
      case 'region':
        return { center: CENTER, zoom: L.regionZoom, pitch: 0,  bearing: 0, padding: { top: 0 } };
      case 'street':
        return { center: CENTER, zoom: L.streetZoom, pitch: L.streetPitch, bearing: 0,
                 padding: { top: L.streetPadTop, bottom: 0, left: 0, right: 0 } };
      case 'globe':
      default:
        return { center: CENTER, zoom: L.globeZoom, pitch: 0, bearing: 0, padding: { top: 0 } };
    }
  }

  function goPreset(name) {
    current = name;
    const t = preset(name);
    map.flyTo({
      center: t.center, zoom: t.zoom, pitch: t.pitch, bearing: t.bearing, padding: t.padding,
      duration: 1700, curve: 1.42, speed: 1.1, essential: true,
      easing: (k) => 1 - Math.pow(1 - k, 3), // easeOutCubic — calm, physical
    });
  }

  // re-apply current preset instantly (used by the continuity sliders)
  function reapplyPreset() {
    const t = preset(current);
    map.easeTo({ center: t.center, zoom: t.zoom, pitch: t.pitch, bearing: t.bearing,
                 padding: t.padding, duration: 220 });
  }

  // ==========================================================================
  // POSITRON LOOK — globe projection · transparent space · dual JP+romaji labels
  // ==========================================================================
  function styleGlobe() {
    // globe projection (the gentle curvature + the whole-earth sphere)
    try { map.setProjection({ type: 'globe' }); } catch (e) { console.warn('projection', e); }

    // transparent atmosphere/space so the DOM #bg-white gradient + #strato-shadow
    // halo carry the look (the engine draws the sphere; we own the surround).
    try {
      map.setSky({
        'sky-color': 'rgba(0,0,0,0)',
        'horizon-color': 'rgba(0,0,0,0)',
        'fog-color': 'rgba(0,0,0,0)',
        'sky-horizon-blend': 0,
        'horizon-fog-blend': 0,
        'fog-ground-blend': 0,
        'atmosphere-blend': 0,
      });
    } catch (e) { console.warn('sky', e); }

    patchLabels();
  }

  // 実装(Flutter)と同じラベル処理に揃える: place ラベルを 8px に縮小し、道路番号
  // shield を非表示にする (assets/web/earth: shrinkPlaceLabels(8) + hideRoadShields)。
  // Guarded per layer so an unknown field can't break.
  function patchLabels() {
    const style = map.getStyle();
    if (!style || !style.layers) return;
    const PLACE  = ['place', 'country', 'state', 'city', 'capital', 'town', 'continent'];
    const SHIELD = ['shield', 'route', 'highway_shield', 'highway-shield',
                    'road_shield', 'road-shield', 'roadname_shield'];
    style.layers.forEach(layer => {
      if (layer.type !== 'symbol') return;
      const id = layer.id.toLowerCase();
      try {
        if (PLACE.some(k => id.includes(k))) map.setLayoutProperty(layer.id, 'text-size', 8);
        if (SHIELD.some(k => id.includes(k))) map.setLayoutProperty(layer.id, 'visibility', 'none');
      } catch (e) { /* field/layer not present — leave default */ }
    });
  }

  map.on('style.load', () => {
    styleGlobe();
    if (window.EarthOverlay && window.EarthOverlay.attach) window.EarthOverlay.attach(map, CENTER);
    // settle on the Street+3D preset (initial view)
    goPreset('street');
    if (window.EarthBridge && window.EarthBridge.onReady) window.EarthBridge.onReady();
  });

  map.on('error', (e) => console.warn('maplibre error:', e && e.error && e.error.message));

  window.EarthMap = { map, goPreset, reapplyPreset, get current() { return current; }, CENTER };
})();
