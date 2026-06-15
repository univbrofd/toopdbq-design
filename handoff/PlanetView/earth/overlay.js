/* ============================================================================
   earth/overlay.js  —  globe-look overlays that track the sphere
   #strato-shadow (atmosphere halo) + #globe-frame (white limb line) are sized
   to the globe's apparent pixel radius and faded by zoom (only meaningful at
   globe scale). Plus the center marker (青ドット + グロー) as a MapLibre Marker.
   ========================================================================== */
(function () {
  // apparent globe radius ≈ worldSize / 2π, calibrated to MapLibre's globe.
  const R_FACTOR = 1.0;
  const TWO_PI = Math.PI * 2;

  let map = null, marker = null;
  const strato = document.getElementById('strato-shadow');
  const frame  = document.getElementById('globe-frame');

  function globeRadiusPx(zoom) {
    const worldSize = 512 * Math.pow(2, zoom);
    return (worldSize / TWO_PI) * R_FACTOR;
  }

  // fade the limb chrome out as we leave globe scale
  function fadeFor(zoom) {
    // full below ~2.6, gone by ~4.2
    return Math.max(0, Math.min(1, (4.2 - zoom) / 1.6));
  }

  function layout() {
    if (!map || !strato || !frame) return;
    const z = map.getZoom();
    const fade = fadeFor(z);
    const r = globeRadiusPx(z);
    const L = window.EarthLook ? window.EarthLook.get() : { atmoSpread: 30, atmoOpacity: 0.9 };

    // white limb line — diameter = 2r
    const d = Math.max(0, 2 * r);
    frame.style.width = d + 'px';
    frame.style.height = d + 'px';
    frame.style.opacity = fade;

    // atmosphere halo — element grown by spread so the band sits OUTSIDE the limb
    const ds = Math.max(0, 2 * (r + (L.atmoSpread || 0)));
    strato.style.width = ds + 'px';
    strato.style.height = ds + 'px';
    strato.style.opacity = fade * (L.atmoOpacity != null ? L.atmoOpacity : 0.9);
  }

  function attach(_map, center) {
    map = _map;

    // center marker — blue dot + soft glow + slow ping
    const el = document.createElement('div');
    el.className = 'center-marker';
    el.innerHTML = '<div class="glow"></div><div class="ping"></div><div class="dot"></div>';
    marker = new maplibregl.Marker({ element: el, anchor: 'center', pitchAlignment: 'map' })
      .setLngLat(center)
      .addTo(map);

    map.on('render', layout);
    map.on('move', layout);
    map.on('zoom', layout);
    layout();
  }

  window.EarthOverlay = { attach, refresh: layout };
})();
