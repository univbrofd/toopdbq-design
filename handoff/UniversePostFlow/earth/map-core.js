/* ============================================================================
   earth/map-core.js  —  the rendering engine (MapLibre positron + globe)
   Owns the map, the globe projection, the positron look, and the current
   camera (zoom / pitch / bearing). Controlled live by the right-side panel.
   ========================================================================== */
(function () {
  // user / circle center — 渋谷ハチ公像 (Hachikō statue, Shibuya Station)
  const CENTER = [139.70064, 35.65905];

  const POSITRON = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  // initial camera — whole-earth GLOBE. The post flow dives in to the サークル
  // city view (zoom 16) on demand, then flies back out here when done.
  const INIT = { zoom: 2.6, pitch: 0, bearing: 0 };

  const map = new maplibregl.Map({
    container: 'map',
    style: POSITRON,
    center: CENTER,
    zoom: INIT.zoom,
    pitch: INIT.pitch,
    bearing: INIT.bearing,
    attributionControl: false,
    canvasContextAttributes: { preserveDrawingBuffer: true, antialias: true },
    dragRotate: true,
    fadeDuration: 120,
    maxPitch: 70,
  });
  map.scrollZoom.setWheelZoomRate(1 / 280);
  map.touchZoomRotate.enableRotation();

  // -- direct camera setters (driven live by the panel sliders) --------------
  function setZoom(z)    { map.easeTo({ zoom: z,    duration: 120 }); }
  function setPitch(p)   { map.easeTo({ pitch: p,   duration: 120 }); }
  function setBearing(b) { map.easeTo({ bearing: b, duration: 120 }); }

  // set the whole camera at once (+ recenter) — used by panel apply / reset
  function setCamera(c) {
    map.easeTo({ center: CENTER, zoom: c.zoom, pitch: c.pitch, bearing: c.bearing, duration: 500 });
  }

  function getCamera() {
    return { zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() };
  }

  // ==========================================================================
  // POSITRON LOOK — globe projection · transparent space · dual JP+romaji labels
  // ==========================================================================
  function styleGlobe() {
    // globe projection (the gentle curvature + the whole-earth sphere)
    try { map.setProjection({ type: 'globe' }); } catch (e) { console.warn('projection', e); }

    // transparent atmosphere/space so the DOM background carries the surround
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

  // dual-language place labels (JP primary, romaji secondary) + softer shields.
  function patchLabels() {
    const style = map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach(layer => {
      if (layer.type !== 'symbol') return;
      const id = layer.id;
      const isPlace = /place|poi|water_name|state|country/i.test(id);
      const isRoad  = /road.*(label|name|shield)|highway.*label/i.test(id);
      try {
        if (isPlace) {
          map.setLayoutProperty(id, 'text-field', [
            'format',
            ['coalesce', ['get', 'name:ja'], ['get', 'name_ja'], ['get', 'name']],
            { 'font-scale': 1.0 },
            '\n', {},
            ['coalesce', ['get', 'name:latin'], ['get', 'name:en'], ['get', 'name_int'], ['get', 'name']],
            { 'font-scale': 0.72, 'text-color': '#9a9aa0' },
          ]);
          map.setLayoutProperty(id, 'text-line-height', 1.15);
          map.setPaintProperty(id, 'text-color', '#3c3c42');
          map.setPaintProperty(id, 'text-halo-color', 'rgba(255,255,255,0.92)');
          map.setPaintProperty(id, 'text-halo-width', 1.1);
        } else if (isRoad) {
          map.setPaintProperty(id, 'text-color', '#7d7d84');
          map.setPaintProperty(id, 'text-halo-color', 'rgba(255,255,255,0.85)');
        }
      } catch (e) { /* field/layer not present — leave default */ }
    });
  }

  map.on('style.load', () => {
    styleGlobe();
    if (window.EarthGroups && window.EarthGroups.attach) window.EarthGroups.attach(map);
    if (window.EarthOverlay && window.EarthOverlay.attach) window.EarthOverlay.attach(map, CENTER);
    if (window.EarthBridge && window.EarthBridge.onReady) window.EarthBridge.onReady();
  });

  map.on('error', (e) => console.warn('maplibre error:', e && e.error && e.error.message));

  window.EarthMap = { map, setZoom, setPitch, setBearing, setCamera, getCamera, INIT, CENTER };
})();
