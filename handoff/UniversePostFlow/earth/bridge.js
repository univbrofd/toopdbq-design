/* ============================================================================
   earth/bridge.js  —  wiring (panel ⇄ map, init, veil)
   ========================================================================== */
(function () {
  if (window.EarthLook) window.EarthLook.buildPanel();

  function init() {
    if (!window.EarthMap) return;
    // apply persisted camera once the map is ready
    if (window.EarthLook) window.EarthLook.apply();
    // keep the sliders in sync when the user drags / scrolls the map directly
    const m = window.EarthMap.map;
    const sync = () => { if (window.EarthLook) window.EarthLook.syncFromMap(); };
    m.on('moveend', sync);
  }

  function hideVeil() {
    const veil = document.getElementById('veil');
    if (!veil || veil.dataset.hidden) return;
    veil.dataset.hidden = '1';
    veil.classList.add('gone');
    setTimeout(() => { veil.style.display = 'none'; }, 900);
  }

  if (window.EarthMap && window.EarthMap.map) {
    window.EarthMap.map.once('load', () => { hideVeil(); init(); });
  }
  setTimeout(hideVeil, 2600);

  window.EarthBridge = { onReady: hideVeil };
})();
