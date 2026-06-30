/* ============================================================================
   earth/overlay.js  —  the current-location marker
   The only overlay: the user's current position as a MapLibre Marker tracking
   the sphere (青ドット — blue dot with a white ring).
   ========================================================================== */
(function () {
  let map = null, marker = null;

  function attach(_map, center) {
    map = _map;

    const el = document.createElement('div');
    el.className = 'center-marker';
    el.innerHTML = '<div class="dot"></div>';
    marker = new maplibregl.Marker({ element: el, anchor: 'center', pitchAlignment: 'map' })
      .setLngLat(center)
      .addTo(map);
    el.style.display = 'none';   // hidden on the globe; shown on the dive-in
  }

  function setVisible(on) { if (marker) marker.getElement().style.display = on ? '' : 'none'; }

  window.EarthOverlay = { attach, setVisible, refresh: function () {} };
})();
