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

  // Toopdbq Studio「Universe マッピング」の schematic mapViewPoint からカメラ(中心+zoom)を
  // 受けて実地図を追従させる(片方向: sim → design map)。本筋では誰も送らない no-op。
  window.addEventListener('message', (e) => {
    if (typeof e.data !== 'string') return;
    let msg; try { msg = JSON.parse(e.data); } catch (_) { return; }
    if (!msg || msg.source !== 'toopdbq-sim') return;
    if (msg.type === 'carouselActive') {   // Studio カルーセルモック → 代表だけ切替（glide:false で地図カメラは動かさない）
      if (msg.id && window.Objects3D && window.Objects3D.selectRepresentative) window.Objects3D.selectRepresentative(msg.id, { glide: false });
      return;
    }
    if (msg.type !== 'setCamera') return;
    const map = window.EarthMap && window.EarthMap.map; if (!map) return;
    const t = {};
    if (typeof msg.lat === 'number' && typeof msg.lng === 'number') t.center = [msg.lng, msg.lat];
    if (typeof msg.zoom === 'number') t.zoom = msg.zoom;
    if (typeof msg.pitch === 'number') {
      t.pitch = msg.pitch;   // schematic 角度トグル → 実地図も傾ける (Flutter と一致)
      // padding も Flutter app earth と同式に: paddingTopForPitch = h * 0.4 * (pitch/85)。
      // これを当てないと design 既定の streetPadTop(300) が残り、地理中心が画面下へ押されて web だけ北寄りにズレる。
      const h = (map.getCanvas() && map.getCanvas().clientHeight) || 0;
      t.padding = { top: h * 0.4 * Math.max(0, Math.min(1, msg.pitch / 85)), bottom: 0, left: 0, right: 0 };
    }
    if (Object.keys(t).length) { try { map.easeTo({ ...t, duration: 320 }); } catch (_) {} }
  });
})();
