/* PlaceRanking v2 — specimen 補助のみ: status bar の中身を流し込み、place-map.js が描くサークルの壁（area-*）を外して
   「真上の明るい地図」だけにする。地図の上の要素は HTML の絶対配置（Flutter は地点の投影 px に置く）。 */
(function () {
  var SB = '<span class="time">9:41</span><span class="sys"><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="1" width="20" height="10" rx="3" fill="none" stroke="currentColor" stroke-opacity=".45"/><rect x="2.5" y="3" width="16" height="6" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="2" height="4" rx="1" fill="currentColor" fill-opacity=".5"/></svg></span>';
  document.querySelectorAll('.statusbar').forEach(function (el) { el.innerHTML = SB; });

  function strip(map) {
    try {
      (map.getStyle().layers || []).forEach(function (l) { if (/^area-/.test(l.id)) map.removeLayer(l.id); });
      ['area-disk', 'area-line', 'area-wall', 'area-rib'].forEach(function (s) { if (map.getSource(s)) map.removeSource(s); });
    } catch (e) {}
  }
  var tries = 0, tm = setInterval(function () {
    var hosts = document.querySelectorAll('[data-map]'), done = 0;
    hosts.forEach(function (h) {
      if (h._stripped) { done++; return; }
      var m = h._map; if (!m) return;
      if (m.getLayer && m.getLayer('area-fill')) { strip(m); h._stripped = true; done++; }
    });
    if (done === hosts.length || ++tries > 200) clearInterval(tm);
  }, 120);
})();
