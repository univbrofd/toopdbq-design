/* ============================================================================
   earth/bridge.js  —  wiring (presets ⇄ map, panel, init, veil)
   The thin glue the Flutter side replaces with platform channels. Here it just
   connects the specimen's controls to map-core + look.
   ========================================================================== */
(function () {
  // apply the persisted look immediately (before the map settles)
  if (window.EarthLook) { window.EarthLook.apply(); window.EarthLook.buildPanel(); }

  // preset rail --------------------------------------------------------------
  const rail = document.getElementById('presetRail');
  if (rail) {
    rail.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-preset]');
      if (!btn) return;
      rail.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (window.EarthMap) window.EarthMap.goPreset(btn.dataset.preset);
    });
  }

  function hideVeil() {
    const veil = document.getElementById('veil');
    if (!veil || veil.dataset.hidden) return;
    veil.dataset.hidden = '1';
    veil.classList.add('gone');
    setTimeout(() => { veil.style.display = 'none'; }, 900);
  }

  // Hide the veil as soon as the map's first frame is up — with a safety
  // fallback (the globe keeps streaming tiles, so 'idle' may never fire).
  if (window.EarthMap && window.EarthMap.map) {
    window.EarthMap.map.once('load', hideVeil);
  }
  setTimeout(hideVeil, 2600);

  window.EarthBridge = { onReady: hideVeil };
})();
